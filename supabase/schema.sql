create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category text not null default 'Everyday',
  color text not null default '',
  price integer not null default 0 check (price >= 0),
  discount_percent integer not null default 0 check (discount_percent between 0 and 90),
  sale_price integer check (sale_price is null or (sale_price > 0 and sale_price < price)),
  image text not null default '',
  tag text not null default '',
  description text not null default '',
  details jsonb not null default '[]'::jsonb,
  stock integer not null default 0 check (stock >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products
  add column if not exists discount_percent integer not null default 0
  check (discount_percent between 0 and 90);
alter table public.products
  add column if not exists sale_price integer
  check (sale_price is null or (sale_price > 0 and sale_price < price));

create table if not exists public.product_slug_aliases (
  old_slug text primary key,
  new_slug text not null,
  created_at timestamptz not null default now()
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
  storefront_visible boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.categories
  add column if not exists storefront_visible boolean not null default false;

update public.categories
set storefront_visible = true
where storefront_visible = false
and name not in (
  'Everyday',
  'Runners',
  'Shoes',
  'Running',
  'Boots',
  'Sneakers',
  'Gym',
  'Formal',
  'Golf',
  'Padel Shoes',
  'Loafers',
  'Sandals',
  'Slippers',
  'Hiking',
  'Football',
  'Basketball'
);

alter table public.products add column if not exists gallery jsonb not null default '[]'::jsonb;
alter table public.products add column if not exists size_guide jsonb not null default '[]'::jsonb;
alter table public.products add column if not exists featured boolean not null default false;

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null references public.products(slug) on update cascade on delete cascade,
  customer_name text not null,
  rating integer not null check (rating between 1 and 5),
  body text not null,
  approved boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.categories enable row level security;
alter table public.product_slug_aliases enable row level security;

drop policy if exists "Anyone can read products" on public.products;
drop policy if exists "Anyone can read categories" on public.categories;
create policy "Anyone can read products" on public.products for select using (true);
create policy "Anyone can read categories" on public.categories for select using (true);
drop policy if exists "Anyone can read product slug aliases" on public.product_slug_aliases;
create policy "Anyone can read product slug aliases"
  on public.product_slug_aliases for select using (true);
grant select on public.product_slug_aliases to anon, authenticated;

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

create or replace function public.product_sale_price(
  base_price integer,
  percent_off integer,
  manual_sale_price integer
)
returns integer
language sql
immutable
set search_path = ''
as $$
  select greatest(0, round(base_price::numeric * (100 - least(90, greatest(0, percent_off))) / 100)::integer);
$$;

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
  sale_price integer;
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
  ) then raise exception 'Invalid cart item'; end if;

  -- Stable lock order prevents deadlocks; aggregate stock across all sizes.
  for line in
    select i.slug, sum(i.quantity)::integer quantity
    from jsonb_to_recordset(items) as i(slug text, size text, quantity integer)
    group by i.slug order by i.slug
  loop
    select * into product from public.products p where p.slug = line.slug for update;
    if not found then raise exception 'A product is no longer available'; end if;
    if exists (
      select 1 from jsonb_to_recordset(items) as i(slug text, size text)
      where i.slug = product.slug
        and (
          (product.one_size and i.size <> 'One size')
          or (not product.one_size and not (i.size = any(product.sizes)))
        )
    ) then raise exception 'Invalid size for %', product.name; end if;
    if product.stock < line.quantity then raise exception 'Insufficient stock for %', product.name; end if;
    sale_price := public.product_sale_price(product.price, product.discount_percent, product.sale_price);
    subtotal := subtotal + sale_price::bigint * line.quantity;
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
      'image',product.image,'price',public.product_sale_price(product.price,product.discount_percent,product.sale_price),
      'original_price',product.price,'discount_percent',case when product.sale_price is not null and product.sale_price < product.price then round((product.price-product.sale_price)*100.0/product.price)::integer else product.discount_percent end,
      'size',line.size,'quantity',line.quantity
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

-- Courier tracking and dispatch status.
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

-- Storefront bestsellers ranking.
begin;

-- Public ranking exposes only product slugs, never customer or order data.
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

commit;

-- Size inventory and linked colour variants
begin;
alter table public.products add column if not exists size_stock jsonb default null;
alter table public.products add column if not exists sizes text[] not null default array['UK 6','UK 7','UK 8','UK 9','UK 10'];
alter table public.products add column if not exists variant_group text not null default '';
create index if not exists products_variant_group_idx on public.products(variant_group) where variant_group <> '';

create or replace function public.validate_size_inventory()
returns trigger language plpgsql set search_path = '' as $$
declare entry record;
begin
  new.variant_group := lower(trim(new.variant_group));
  if new.sizes is null or cardinality(new.sizes) < 1
     or exists (
       select 1 from unnest(new.sizes) as listed(size_name)
       where size_name is null or length(trim(size_name)) not between 1 and 40
     )
     or (select count(*) from unnest(new.sizes) as listed(size_name)) <>
        (select count(distinct lower(trim(size_name)))
         from unnest(new.sizes) as listed(size_name))
  then raise exception 'Invalid product sizes'; end if;
  if new.size_stock is null then return new; end if;
  if jsonb_typeof(new.size_stock) <> 'object' then raise exception 'Invalid size stock'; end if;
  for entry in select key, value from jsonb_each(new.size_stock) loop
    if length(trim(entry.key)) not between 1 and 40 or jsonb_typeof(entry.value) <> 'number' then
      raise exception 'Invalid size stock';
    end if;
    if (entry.value::text)::numeric < 0 or (entry.value::text)::numeric <> trunc((entry.value::text)::numeric) then
      raise exception 'Size stock must be a non-negative integer';
    end if;
  end loop;
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
  sale_price integer;
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
  ) then raise exception 'Invalid cart item'; end if;

  -- Stable lock order prevents deadlocks; aggregate stock across all sizes.
  for line in
    select i.slug, sum(i.quantity)::integer quantity
    from jsonb_to_recordset(items) as i(slug text, size text, quantity integer)
    group by i.slug order by i.slug
  loop
    select * into product from public.products p where p.slug = line.slug for update;
    if not found then raise exception 'A product is no longer available'; end if;
    if exists (
      select 1 from jsonb_to_recordset(items) as i(slug text, size text)
      where i.slug = product.slug
        and (
          (product.one_size and i.size <> 'One size')
          or (not product.one_size and not (i.size = any(product.sizes)))
        )
    ) then raise exception 'Invalid size for %', product.name; end if;
    if product.stock < line.quantity then raise exception 'Insufficient stock for %', product.name; end if;
    sale_price := public.product_sale_price(product.price, product.discount_percent, product.sale_price);
    subtotal := subtotal + sale_price::bigint * line.quantity;
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
      'image',product.image,'price',public.product_sale_price(product.price,product.discount_percent,product.sale_price),
      'original_price',product.price,'discount_percent',case when product.sale_price is not null and product.sale_price < product.price then round((product.price-product.sale_price)*100.0/product.price)::integer else product.discount_percent end,
      'size',line.size,'quantity',line.quantity
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

begin;
alter table public.orders add column if not exists closure_reason text not null default '';
alter table public.orders add column if not exists stock_restored boolean not null default false;
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check check (status in ('Pending','Confirmed','Dispatched','Delivered','Cancelled','Returned'));

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
