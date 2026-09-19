begin;
alter table public.orders add column if not exists closure_reason text not null default '';
alter table public.orders add column if not exists stock_restored boolean not null default false;
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check check (status in ('Pending','Confirmed','Dispatched','Delivered','Cancelled','Returned'));

create or replace function public.resolve_order_inventory()
returns trigger language plpgsql security definer set search_path = '' as $$
declare line record; product public.products%rowtype; remaining jsonb;
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
      select * into product from public.products p where p.slug=line.slug for update;
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
drop trigger if exists resolve_order_inventory on public.orders;
create trigger resolve_order_inventory before insert or update on public.orders for each row execute function public.resolve_order_inventory();
commit;
