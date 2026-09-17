create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category text not null default 'Everyday',
  color text not null default '',
  price integer not null default 0 check (price >= 0),
  image text not null default '',
  tag text not null default '',
  description text not null default '',
  details jsonb not null default '[]'::jsonb,
  stock integer not null default 0 check (stock >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id text primary key,
  created_at timestamptz not null default now(),
  status text not null default 'Pending' check (status in ('Pending', 'Confirmed', 'Delivered')),
  customer jsonb not null,
  items jsonb not null,
  total integer not null default 0 check (total >= 0)
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz not null default now()
);

alter table public.products add column if not exists gallery jsonb not null default '[]'::jsonb;
alter table public.products add column if not exists size_guide jsonb not null default '[]'::jsonb;
alter table public.products add column if not exists featured boolean not null default false;

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null references public.products(slug) on delete cascade,
  customer_name text not null,
  rating integer not null check (rating between 1 and 5),
  body text not null,
  approved boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.categories enable row level security;

drop policy if exists "Anyone can read products" on public.products;
drop policy if exists "Anyone can read categories" on public.categories;
create policy "Anyone can read products" on public.products for select using (true);
create policy "Anyone can read categories" on public.categories for select using (true);

begin;

create table if not exists public.store_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.store_admins enable row level security;
revoke all on public.store_admins from anon, authenticated;

-- Create this user in Authentication > Users first; never put passwords in SQL.
insert into public.store_admins(user_id)
select id from auth.users where lower(email) = 'technicalfuture27@gmail.com'
on conflict do nothing;

create or replace function public.is_store_admin()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.store_admins a
    join auth.users u on u.id = a.user_id
    where a.user_id = auth.uid() and u.email_confirmed_at is not null
  );
$$;
revoke all on function public.is_store_admin() from public;
grant execute on function public.is_store_admin() to anon, authenticated;

-- Remove the original permissive policies. This migration can be rerun.
drop policy if exists "Anyone can create orders" on public.orders;
drop policy if exists "Anyone can create categories" on public.categories;
drop policy if exists "Anyone can delete categories" on public.categories;
drop policy if exists "Anyone can read orders for dashboard" on public.orders;
drop policy if exists "Anyone can update orders for dashboard" on public.orders;
drop policy if exists "Anyone can update products for admin" on public.products;
drop policy if exists "Anyone can delete products for admin" on public.products;
drop policy if exists "Anyone can create products for admin" on public.products;
drop policy if exists "Store admins manage products" on public.products;
drop policy if exists "Store admins manage categories" on public.categories;
drop policy if exists "Store admins read orders" on public.orders;
drop policy if exists "Store admins update orders" on public.orders;
create policy "Store admins manage products" on public.products for all to authenticated
  using (public.is_store_admin()) with check (public.is_store_admin());
create policy "Store admins manage categories" on public.categories for all to authenticated
  using (public.is_store_admin()) with check (public.is_store_admin());
create policy "Store admins read orders" on public.orders for select to authenticated
  using (public.is_store_admin());
create policy "Store admins update orders" on public.orders for update to authenticated
  using (public.is_store_admin()) with check (public.is_store_admin());

create or replace function public.place_order(request_id uuid, customer jsonb, items jsonb)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  order_id text := 'LS-' || request_id::text;
  existing_total integer;
  line record;
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
    update public.products set stock = stock - line.quantity, updated_at = now() where id = product.id;
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

create or replace function public.prevent_used_category_delete()
returns trigger language plpgsql set search_path = '' as $$
begin
  if exists (select 1 from public.products where category = old.name) then
    raise exception 'Move products to another category before deleting this category';
  end if;
  return old;
end;
$$;
drop trigger if exists protect_used_category on public.categories;
create trigger protect_used_category before delete on public.categories
for each row execute function public.prevent_used_category_delete();

do $$
declare table_name text;
begin
  foreach table_name in array array['products','orders','categories'] loop
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = table_name) then
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    end if;
  end loop;
end;
$$;
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists "Store admins upload images" on storage.objects;
drop policy if exists "Store admins manage images" on storage.objects;
create policy "Store admins upload images" on storage.objects for insert to authenticated
with check (bucket_id = 'product-images' and public.is_store_admin());
create policy "Store admins manage images" on storage.objects for all to authenticated
using (bucket_id = 'product-images' and public.is_store_admin())
with check (bucket_id = 'product-images' and public.is_store_admin());
commit;
