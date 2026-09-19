-- Run after the store security and store features migrations.
begin;

alter table public.orders add column if not exists courier_name text not null default '';
alter table public.orders add column if not exists tracking_number text not null default '';
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('Pending', 'Confirmed', 'Dispatched', 'Delivered'));
alter table public.orders drop constraint if exists orders_shipping_check;
alter table public.orders add constraint orders_shipping_check check (
  length(trim(courier_name)) <= 80 and length(trim(tracking_number)) <= 100
  and ((trim(courier_name) = '') = (trim(tracking_number) = ''))
  and (status <> 'Dispatched' or (trim(courier_name) <> '' and trim(tracking_number) <> ''))
);

-- Keep customer lookup scoped to the order reference AND checkout email.
create or replace function public.track_order(order_reference text, customer_email text)
returns jsonb language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'id', o.id, 'status', o.status, 'created_at', o.created_at,
    'total', o.total, 'items', o.items,
    'courier_name', o.courier_name, 'tracking_number', o.tracking_number
  ) from public.orders o
  where upper(o.id) = upper(trim(order_reference))
    and lower(o.customer->>'email') = lower(trim(customer_email));
$$;
revoke all on function public.track_order(text,text) from public;
grant execute on function public.track_order(text,text) to anon, authenticated;

commit;
