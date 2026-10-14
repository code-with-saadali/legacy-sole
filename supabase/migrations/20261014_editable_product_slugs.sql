begin;

create table if not exists public.product_slug_aliases (
  old_slug text primary key,
  new_slug text not null,
  created_at timestamptz not null default now()
);

alter table public.product_slug_aliases
  drop constraint if exists product_slug_aliases_new_slug_fkey;
alter table public.product_slug_aliases
  drop constraint if exists product_slug_aliases_check;

alter table public.product_slug_aliases enable row level security;
drop policy if exists "Anyone can read product slug aliases" on public.product_slug_aliases;
create policy "Anyone can read product slug aliases"
  on public.product_slug_aliases for select using (true);
grant select on public.product_slug_aliases to anon, authenticated;

alter table public.reviews drop constraint if exists reviews_product_slug_fkey;
alter table public.reviews
  add constraint reviews_product_slug_fkey
  foreign key (product_slug) references public.products(slug)
  on update cascade on delete cascade;

create or replace function public.replace_slug_in_json(value jsonb, old_slug text, new_slug text)
returns jsonb
language plpgsql
immutable
strict
set search_path = ''
as $$
begin
  case jsonb_typeof(value)
    when 'string' then
      if value #>> '{}' = old_slug then return to_jsonb(new_slug); end if;
      return value;
    when 'array' then
      return (
        select coalesce(jsonb_agg(public.replace_slug_in_json(item, old_slug, new_slug)), '[]'::jsonb)
        from jsonb_array_elements(value) as entries(item)
      );
    when 'object' then
      return (
        select coalesce(
          jsonb_object_agg(key, public.replace_slug_in_json(item, old_slug, new_slug)),
          '{}'::jsonb
        )
        from jsonb_each(value) as entries(key, item)
      );
    else
      return value;
  end case;
end;
$$;

create or replace function public.record_product_slug_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.slug = new.slug then return new; end if;

  update public.product_slug_aliases
  set new_slug = new.slug
  where new_slug = old.slug;

  delete from public.product_slug_aliases where old_slug = new.slug;

  insert into public.product_slug_aliases(old_slug, new_slug)
  values (old.slug, new.slug)
  on conflict (old_slug) do update set new_slug = excluded.new_slug;

  update public.products
  set complete_the_look = array_replace(complete_the_look, old.slug, new.slug)
  where old.slug = any(complete_the_look);

  update public.store_settings
  set classic_feature = public.replace_slug_in_json(classic_feature, old.slug, new.slug),
      new_arrivals = public.replace_slug_in_json(new_arrivals, old.slug, new.slug),
      style_guide = public.replace_slug_in_json(style_guide, old.slug, new.slug)
  where classic_feature @> to_jsonb(old.slug)
     or new_arrivals @> to_jsonb(old.slug)
     or style_guide @> to_jsonb(old.slug);

  return new;
end;
$$;

drop trigger if exists record_product_slug_change on public.products;
create trigger record_product_slug_change
  after update of slug on public.products
  for each row execute function public.record_product_slug_change();

create or replace function public.cleanup_product_slug_aliases()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.product_slug_aliases where new_slug = old.slug;
  return old;
end;
$$;

drop trigger if exists cleanup_product_slug_aliases on public.products;
create trigger cleanup_product_slug_aliases
  after delete on public.products
  for each row execute function public.cleanup_product_slug_aliases();

create or replace function public.resolve_order_inventory()
returns trigger language plpgsql security definer set search_path = '' as $$
declare line record; product public.products%rowtype; remaining jsonb; current_slug text;
begin
  if tg_op = 'INSERT' then
    if new.status in ('Cancelled','Returned') or new.stock_restored or new.closure_reason <> '' then raise exception 'New orders cannot be closed'; end if;
    return new;
  end if;
  if old.status in ('Cancelled','Returned') then
    if new.status <> old.status or new.stock_restored <> old.stock_restored or new.closure_reason <> old.closure_reason or new.items <> old.items then
      raise exception 'Closed orders cannot be reopened or restocked again';
    end if;
    return new;
  end if;
  if new.status not in ('Cancelled','Returned') then
    if new.stock_restored or new.closure_reason <> '' then raise exception 'Use cancellation or return to restore stock'; end if;
    return new;
  end if;
  if not public.is_store_admin() then raise exception 'Admin access required'; end if;
  if new.status = 'Cancelled' and old.status not in ('Pending','Confirmed') then raise exception 'Dispatched orders must be returned, not cancelled'; end if;
  if new.status = 'Returned' and old.status not in ('Dispatched','Delivered') then raise exception 'Only dispatched or delivered orders can be returned'; end if;
  if length(trim(new.closure_reason)) not between 1 and 500 then raise exception 'Provide a reason of 1 to 500 characters'; end if;
  if new.items <> old.items then raise exception 'Ordered items cannot change during cancellation or return'; end if;
  new.closure_reason := trim(new.closure_reason);
  if new.stock_restored then
    for line in select i.slug,i.size,sum(i.quantity)::integer quantity
      from jsonb_to_recordset(old.items) as i(slug text,size text,quantity integer)
      group by i.slug,i.size order by i.slug,i.size
    loop
      select coalesce((select a.new_slug from public.product_slug_aliases a where a.old_slug=line.slug),line.slug)
      into current_slug;
      select * into product from public.products p where p.slug=current_slug for update;
      if not found then raise exception 'Product % no longer exists. Close without restocking and reconcile manually.',line.slug; end if;
      if line.quantity is null or line.quantity < 1 then raise exception 'Invalid ordered quantity'; end if;
      remaining := product.size_stock;
      if remaining is not null then
        if line.size not in ('UK 6','UK 7','UK 8','UK 9','UK 10') then raise exception 'Invalid ordered size'; end if;
        remaining := jsonb_set(remaining,array[line.size],to_jsonb(coalesce((remaining->>line.size)::integer,0)+line.quantity));
      end if;
      update public.products set stock=stock+line.quantity,size_stock=remaining,updated_at=now() where id=product.id;
    end loop;
  end if;
  return new;
end;
$$;

create or replace function public.store_bestsellers()
returns table(slug text)
language sql stable security definer set search_path = ''
as $$
  select p.slug
  from public.orders o
  cross join lateral jsonb_array_elements(o.items) item
  left join public.product_slug_aliases a on a.old_slug = item->>'slug'
  join public.products p on p.slug = coalesce(a.new_slug, item->>'slug')
  where o.status in ('Confirmed', 'Dispatched', 'Delivered')
    and p.stock > 0
    and (item->>'quantity') ~ '^[1-9][0-9]{0,8}$'
  group by p.slug
  order by sum((item->>'quantity')::bigint) desc, p.slug
  limit 12;
$$;
revoke all on function public.store_bestsellers() from public;
grant execute on function public.store_bestsellers() to anon, authenticated;

notify pgrst, 'reload schema';

commit;
