begin;
alter table public.products add column if not exists size_stock jsonb default null;
alter table public.products add column if not exists variant_group text not null default '';
create index if not exists products_variant_group_idx on public.products(variant_group) where variant_group <> '';

create or replace function public.validate_size_inventory()
returns trigger language plpgsql set search_path = '' as $$
declare entry record; total bigint := 0;
begin
  new.variant_group := lower(trim(new.variant_group));
  if new.size_stock is null then return new; end if;
  if jsonb_typeof(new.size_stock) <> 'object' then raise exception 'Invalid size stock'; end if;
  for entry in select key, value from jsonb_each(new.size_stock) loop
    if entry.key not in ('UK 6','UK 7','UK 8','UK 9','UK 10') or jsonb_typeof(entry.value) <> 'number' then
      raise exception 'Invalid size stock';
    end if;
    if (entry.value::text)::numeric < 0 or (entry.value::text)::numeric <> trunc((entry.value::text)::numeric) then
      raise exception 'Size stock must be a non-negative integer';
    end if;
    total := total + (entry.value::text)::bigint;
  end loop;
  new.stock := total::integer;
  return new;
end;
$$;
drop trigger if exists validate_size_inventory on public.products;
create trigger validate_size_inventory before insert or update on public.products
for each row execute function public.validate_size_inventory();

create or replace function public.place_order(request_id uuid, customer jsonb, items jsonb)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  order_id text := 'LS-' || request_id::text;
  existing_total integer;
  line record;
  size_line record;
  remaining jsonb;
  product public.products%rowtype;
  snapshot jsonb := '[]'::jsonb;
  subtotal bigint := 0;
  shipping integer;
  required_field text;
begin
  if request_id is null then raise exception 'Missing order reference'; end if;
  -- Serialize retries with the same request id, including concurrent submissions.
  perform pg_advisory_xact_lock(hashtextextended(order_id, 0));
  select o.total into existing_total from public.orders o where o.id = order_id;
  if found then return jsonb_build_object('id', order_id, 'total', existing_total); end if;

  if jsonb_typeof(customer) is distinct from 'object' then raise exception 'Invalid customer'; end if;
  foreach required_field in array array['name','email','phone','address','city','postalCode'] loop
    if coalesce(length(trim(customer->>required_field)), 0) = 0 or length(customer->>required_field) > 500 then
      raise exception 'Missing or invalid customer %', required_field;
    end if;
  end loop;
  if jsonb_typeof(items) is distinct from 'array' then raise exception 'Invalid cart'; end if;
  if jsonb_array_length(items) < 1 or jsonb_array_length(items) > 100 then raise exception 'Cart must contain 1 to 100 lines'; end if;
  if exists (
    select 1 from jsonb_to_recordset(items) as i(slug text, size text, quantity numeric)
    where i.slug is null or i.size is null or i.quantity is null
       or i.quantity < 1 or i.quantity > 100 or i.quantity <> trunc(i.quantity)
       or i.size not in ('UK 6','UK 7','UK 8','UK 9','UK 10')
  ) then raise exception 'Invalid cart item'; end if;

  -- Stable lock order prevents deadlocks; aggregate stock across all sizes.
  for line in
    select i.slug, sum(i.quantity)::integer quantity
    from jsonb_to_recordset(items) as i(slug text, size text, quantity integer)
    group by i.slug order by i.slug
  loop
    select * into product from public.products p where p.slug = line.slug for update;
    if not found then raise exception 'A product is no longer available'; end if;
    if product.stock < line.quantity then raise exception 'Insufficient stock for %', product.name; end if;
    subtotal := subtotal + product.price::bigint * line.quantity;
    remaining := product.size_stock;
    if remaining is not null then
      for size_line in
        select i.size, sum(i.quantity)::integer quantity
        from jsonb_to_recordset(items) as i(slug text, size text, quantity integer)
        where i.slug = product.slug group by i.size order by i.size
      loop
        if coalesce((remaining->>size_line.size)::integer, 0) < size_line.quantity then
          raise exception 'Insufficient stock for % in size %', product.name, size_line.size;
        end if;
        remaining := jsonb_set(remaining, array[size_line.size], to_jsonb((remaining->>size_line.size)::integer - size_line.quantity));
      end loop;
    end if;
    update public.products set stock = stock - line.quantity, size_stock = remaining, updated_at = now() where id = product.id;
  end loop;

  for line in
    select i.slug, i.size, sum(i.quantity)::integer quantity
    from jsonb_to_recordset(items) as i(slug text, size text, quantity integer)
    group by i.slug, i.size order by i.slug, i.size
  loop
    select * into product from public.products p where p.slug = line.slug;
    snapshot := snapshot || jsonb_build_array(jsonb_build_object(
      'slug',product.slug,'name',product.name,'color',product.color,'category',product.category,
      'image',product.image,'price',product.price,'size',line.size,'quantity',line.quantity
    ));
  end loop;
  shipping := case when subtotal >= 10000 then 0 else 250 end;
  insert into public.orders(id, status, customer, items, total)
  values(order_id, 'Pending', customer, snapshot, (subtotal + shipping)::integer);
  return jsonb_build_object('id',order_id,'total',subtotal + shipping);
end;
$$;
revoke all on function public.place_order(uuid,jsonb,jsonb) from public;
grant execute on function public.place_order(uuid,jsonb,jsonb) to anon, authenticated;


commit;
