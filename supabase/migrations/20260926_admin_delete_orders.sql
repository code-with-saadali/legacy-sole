begin;
-- Retain checkout references, stock history and loyalty accounting on removal.
alter table public.orders add column if not exists deleted_at timestamptz;
create or replace function public.admin_delete_order(order_reference text)
returns void language plpgsql security definer set search_path='' as $$
begin
  if not public.is_store_admin() then raise exception 'Admin access required'; end if;
  update public.orders set deleted_at=now() where id=order_reference and deleted_at is null;
  if not found then raise exception 'Order not found or already deleted'; end if;
end;
$$;
revoke all on function public.admin_delete_order(text) from public,anon;
grant execute on function public.admin_delete_order(text) to authenticated;
notify pgrst, 'reload schema';
commit;
