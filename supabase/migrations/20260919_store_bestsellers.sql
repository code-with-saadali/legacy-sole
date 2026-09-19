begin;

-- Public ranking exposes only product slugs, never customer or order data.
create or replace function public.store_bestsellers()
returns table(slug text)
language sql stable security definer set search_path = ''
as $$
  select p.slug
  from public.orders o
  cross join lateral jsonb_array_elements(o.items) item
  join public.products p on p.slug = item->>'slug'
  where o.status in ('Confirmed', 'Dispatched', 'Delivered')
    and p.stock > 0
    and (item->>'quantity') ~ '^[1-9][0-9]{0,8}$'
  group by p.slug
  order by sum((item->>'quantity')::bigint) desc, p.slug
  limit 12;
$$;
revoke all on function public.store_bestsellers() from public;
grant execute on function public.store_bestsellers() to anon, authenticated;

commit;
