begin;
create table if not exists public.order_requests (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders(id),
  kind text not null check(kind in ('Cancellation','Return','Exchange')),
  reason text not null check(length(trim(reason)) between 5 and 1000),
  requested_size text not null default '',
  status text not null default 'Pending' check(status in ('Pending','Approved','Rejected','Completed')),
  admin_note text not null default '' check(length(admin_note)<=1000),
  created_at timestamptz not null default now()
);
create unique index order_requests_open_idx on public.order_requests(order_id) where status in ('Pending','Approved');
alter table public.order_requests enable row level security;
create policy "Admins manage order requests" on public.order_requests for all to authenticated using(public.is_store_admin()) with check(public.is_store_admin());
revoke all on public.order_requests from anon,authenticated;
grant select,update on public.order_requests to authenticated;
create or replace function public.record_delivery_time() returns trigger language plpgsql set search_path='' as $$
begin
  if new.status='Delivered' and old.status<>'Delivered' and old.delivered_at is null then new.delivered_at:=now(); else new.delivered_at:=old.delivered_at; end if;
  return new;
end; $$;
create trigger record_delivery_time before update on public.orders for each row execute function public.record_delivery_time();

create or replace function public.request_order_help(order_reference text, customer_email text, request_kind text, request_reason text, exchange_size text default '')
returns uuid language plpgsql security definer set search_path='' as $$
declare target public.orders%rowtype; request_id uuid;
begin
  select * into target from public.orders where upper(id)=upper(trim(order_reference)) and lower(customer->>'email')=lower(trim(customer_email)) for update;
  if not found then raise exception 'Order not found. Check your reference and email.'; end if;
  if request_kind='Cancellation' then
    if target.status not in ('Pending','Confirmed') then raise exception 'Only orders awaiting dispatch can be cancelled'; end if;
  elsif request_kind in ('Return','Exchange') then
    if target.status<>'Delivered' then raise exception 'Returns and exchanges are available after delivery'; end if;
    if coalesce(target.delivered_at,target.created_at)<now()-interval '7 days' then raise exception 'The 7-day request window has ended. Please contact support.'; end if;
    if request_kind='Exchange' and exchange_size not in ('UK 6','UK 7','UK 8','UK 9','UK 10') then raise exception 'Choose the replacement size'; end if;
  else raise exception 'Invalid request type'; end if;
  if exists(select 1 from public.order_requests where order_id=target.id and status in ('Pending','Approved')) then raise exception 'This order already has an open request'; end if;
  insert into public.order_requests(order_id,kind,reason,requested_size) values(target.id,request_kind,trim(request_reason),case when request_kind='Exchange' then exchange_size else '' end) returning id into request_id;
  return request_id;
end; $$;
revoke all on function public.request_order_help(text,text,text,text,text) from public;
grant execute on function public.request_order_help(text,text,text,text,text) to anon,authenticated;
create or replace function public.track_order(order_reference text, customer_email text)
returns jsonb language sql stable security definer set search_path='' as $$
  select jsonb_build_object('id',o.id,'status',o.status,'created_at',o.created_at,'delivered_at',o.delivered_at,'total',o.total,'subtotal',o.subtotal,'shipping',o.shipping,'discount',o.discount,'items',o.items,'courier_name',o.courier_name,'tracking_number',o.tracking_number,
    'requests',coalesce((select jsonb_agg(jsonb_build_object('id',r.id,'kind',r.kind,'reason',r.reason,'requested_size',r.requested_size,'status',r.status,'admin_note',r.admin_note,'created_at',r.created_at) order by r.created_at desc) from public.order_requests r where r.order_id=o.id),'[]'::jsonb))
  from public.orders o where upper(o.id)=upper(trim(order_reference)) and lower(o.customer->>'email')=lower(trim(customer_email));
$$;


notify pgrst, 'reload schema';
commit;
