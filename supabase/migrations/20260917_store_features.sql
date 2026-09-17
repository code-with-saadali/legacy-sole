alter table public.products add column if not exists gallery jsonb not null default '[]'::jsonb;
alter table public.products add column if not exists size_guide jsonb not null default '[]'::jsonb;
alter table public.products add column if not exists featured boolean not null default false;

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null references public.products(slug) on delete cascade,
  customer_name text not null check (length(trim(customer_name)) between 2 and 80),
  rating integer not null check (rating between 1 and 5),
  body text not null check (length(trim(body)) between 5 and 1000),
  approved boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;
drop policy if exists "Public read approved reviews" on public.reviews;
drop policy if exists "Public create reviews" on public.reviews;
drop policy if exists "Admins manage reviews" on public.reviews;
create policy "Public read approved reviews" on public.reviews for select using (approved = true or public.is_store_admin());
create policy "Public create reviews" on public.reviews for insert with check (true);
create policy "Admins manage reviews" on public.reviews for all to authenticated using (public.is_store_admin()) with check (public.is_store_admin());

create or replace function public.track_order(order_reference text, customer_email text)
returns jsonb language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'id', o.id,
    'status', o.status,
    'created_at', o.created_at,
    'total', o.total,
    'items', o.items
  )
  from public.orders o
  where upper(o.id) = upper(trim(order_reference))
    and lower(o.customer->>'email') = lower(trim(customer_email));
$$;
revoke all on function public.track_order(text,text) from public;
grant execute on function public.track_order(text,text) to anon, authenticated;

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'reviews') then
    alter publication supabase_realtime add table public.reviews;
  end if;
end;
$$;
