begin;

create table if not exists public.store_settings (
  id boolean primary key default true check (id),
  whatsapp text not null default '923023898785',
  default_shipping integer not null default 250 check (default_shipping >= 0),
  free_shipping_minimum integer not null default 10000 check (free_shipping_minimum >= 0),
  city_rates jsonb not null default '{}'::jsonb check (jsonb_typeof(city_rates) = 'object')
);
insert into public.store_settings(id) values(true) on conflict do nothing;
alter table public.store_settings enable row level security;
create policy "Read store settings" on public.store_settings for select using(true);
create policy "Admin store settings" on public.store_settings for all to authenticated using(public.is_store_admin()) with check(public.is_store_admin());
grant select on public.store_settings to anon,authenticated;
grant update on public.store_settings to authenticated;

create or replace function public.validate_store_settings() returns trigger language plpgsql set search_path='' as $$
declare entry record;
begin
  if new.whatsapp !~ '^[1-9][0-9]{7,14}$' then raise exception 'Enter a valid international WhatsApp number'; end if;
  for entry in select key,value from jsonb_each(new.city_rates) loop
    if length(trim(entry.key)) not between 2 and 80 or jsonb_typeof(entry.value)<>'number' then raise exception 'Invalid city rate'; end if;
    if (entry.value::text)::numeric < 0 or (entry.value::text)::numeric > 100000 or (entry.value::text)::numeric <> trunc((entry.value::text)::numeric) then raise exception 'Delivery charges must be whole numbers from 0 to 100000'; end if;
  end loop;
  return new;
end; $$;
create trigger validate_store_settings before insert or update on public.store_settings for each row execute function public.validate_store_settings();

create table if not exists public.coupons (
  code text primary key check (code = upper(trim(code)) and code ~ '^[A-Z0-9_-]{3,30}$'),
  kind text not null check(kind in ('percent','fixed')),
  amount integer not null check(amount > 0),
  minimum integer not null default 0 check(minimum >= 0),
  max_uses integer check(max_uses > 0),
  used_count integer not null default 0 check(used_count >= 0),
  expires_at timestamptz,
  active boolean not null default true,
  check(kind <> 'percent' or amount <= 100)
);
alter table public.coupons enable row level security;
create policy "Admins manage coupons" on public.coupons for all to authenticated using(public.is_store_admin()) with check(public.is_store_admin());
grant select,insert,update,delete on public.coupons to authenticated;
alter table public.orders add column if not exists subtotal integer;
alter table public.orders add column if not exists shipping integer;
alter table public.orders add column if not exists discount integer not null default 0;
alter table public.orders add column if not exists coupon_code text not null default '';
alter table public.orders add column if not exists delivered_at timestamptz;

create or replace function public.checkout_quote(cart_items jsonb, delivery_city text, promo_code text default '')
returns jsonb language plpgsql security definer set search_path='' as $$
declare item record; product public.products%rowtype; subtotal bigint:=0; shipping integer; discount integer:=0; settings public.store_settings%rowtype; coupon public.coupons%rowtype; code text:=upper(trim(coalesce(promo_code,'')));
begin
  if jsonb_typeof(cart_items) is distinct from 'array' then raise exception 'Invalid cart'; end if;
  if jsonb_array_length(cart_items) not between 1 and 100 then raise exception 'Cart must contain 1 to 100 lines'; end if;
  for item in select * from jsonb_to_recordset(cart_items) as i(slug text,size text,quantity numeric) loop
    if item.slug is null or item.size is null or item.size not in ('UK 6','UK 7','UK 8','UK 9','UK 10') or item.quantity is null or item.quantity not between 1 and 100 or item.quantity <> trunc(item.quantity) then raise exception 'Invalid cart item'; end if;
    select * into product from public.products where slug=item.slug;
    if not found then raise exception 'A product is no longer available'; end if;
    subtotal:=subtotal+product.price::bigint*item.quantity;
  end loop;
  select * into settings from public.store_settings where id=true;
  select value::integer into shipping from jsonb_each_text(settings.city_rates) where lower(trim(key))=lower(trim(delivery_city)) limit 1;
  shipping:=coalesce(shipping,settings.default_shipping,250);
  if subtotal>=coalesce(settings.free_shipping_minimum,10000) then shipping:=0; end if;
  if code<>'' then
    select * into coupon from public.coupons where coupons.code=checkout_quote.code;
    if not found or not coupon.active or (coupon.expires_at is not null and coupon.expires_at<=now()) or (coupon.max_uses is not null and coupon.used_count>=coupon.max_uses) then raise exception 'This coupon is invalid or has expired'; end if;
    if subtotal<coupon.minimum then raise exception 'This coupon requires a minimum subtotal of Rs. %',coupon.minimum; end if;
    discount:=least(subtotal,case when coupon.kind='percent' then floor(subtotal*coupon.amount/100.0)::bigint else coupon.amount end)::integer;
  end if;
  return jsonb_build_object('subtotal',subtotal,'shipping',shipping,'discount',discount,'coupon_code',code,'total',subtotal+shipping-discount);
end; $$;
revoke all on function public.checkout_quote(jsonb,text,text) from public;
grant execute on function public.checkout_quote(jsonb,text,text) to anon,authenticated;

alter function public.place_order(uuid,jsonb,jsonb) rename to place_order_inventory;
revoke all on function public.place_order_inventory(uuid,jsonb,jsonb) from public,anon,authenticated;
create or replace function public.place_order(request_id uuid, customer jsonb, items jsonb, coupon_code text default '')
returns jsonb language plpgsql security definer set search_path='' as $$
declare existing public.orders%rowtype; result jsonb; quote jsonb; code text:=upper(trim(coalesce(coupon_code,''))); item record;
begin
  if request_id is null then raise exception 'Missing order reference'; end if;
  perform pg_advisory_xact_lock(hashtextextended('LS-'||request_id::text,0));
  select * into existing from public.orders where id='LS-'||request_id::text;
  if found then return jsonb_build_object('id',existing.id,'total',existing.total); end if;
  if code<>'' then perform 1 from public.coupons where coupons.code=place_order.code for update; end if;
  if jsonb_typeof(items) is distinct from 'array' then raise exception 'Invalid cart'; end if;
  for item in select distinct i.slug from jsonb_to_recordset(items) as i(slug text) order by i.slug loop
    perform 1 from public.products where slug=item.slug for update;
  end loop;
  quote:=public.checkout_quote(items,customer->>'city',code);
  result:=public.place_order_inventory(request_id,customer,items);
  update public.orders set subtotal=(quote->>'subtotal')::integer,shipping=(quote->>'shipping')::integer,discount=(quote->>'discount')::integer,coupon_code=code,total=(quote->>'total')::integer where id=result->>'id';
  if code<>'' then update public.coupons set used_count=used_count+1 where coupons.code=place_order.code; end if;
  return jsonb_build_object('id',result->>'id','total',(quote->>'total')::integer);
end; $$;
revoke all on function public.place_order(uuid,jsonb,jsonb,text) from public;
grant execute on function public.place_order(uuid,jsonb,jsonb,text) to anon,authenticated;

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

alter table public.reviews add column if not exists photos text[] not null default '{}';
alter table public.reviews alter column approved set default false;
alter table public.reviews add constraint reviews_photo_count check(cardinality(photos)<=3);
drop policy if exists "Public create reviews" on public.reviews;
revoke insert on public.reviews from anon;
create or replace function public.submit_product_review(product_slug text, reviewer text, stars integer, review_body text, photo_urls text[] default '{}')
returns void language plpgsql security definer set search_path='' as $$
declare photo text;
begin
  if cardinality(photo_urls)>3 then raise exception 'Maximum 3 photos'; end if;
  foreach photo in array photo_urls loop
    if photo !~ '^https://[a-z0-9]+\.supabase\.co/storage/v1/object/public/review-images/' or length(photo)>500 then raise exception 'Invalid review photo'; end if;
  end loop;
  if exists(select 1 from public.reviews r where r.product_slug=submit_product_review.product_slug and lower(r.customer_name)=lower(trim(reviewer)) and r.created_at>now()-interval '5 minutes') then raise exception 'Please wait before submitting another review'; end if;
  insert into public.reviews(product_slug,customer_name,rating,body,photos,approved) values(product_slug,trim(reviewer),stars,trim(review_body),photo_urls,false);
end; $$;
revoke all on function public.submit_product_review(text,text,integer,text,text[]) from public;
grant execute on function public.submit_product_review(text,text,integer,text,text[]) to anon,authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('review-images','review-images',true,3145728,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
create policy "Upload review photos" on storage.objects for insert to anon,authenticated with check(bucket_id='review-images' and array_length(storage.foldername(name),1)=1 and exists(select 1 from public.products where slug=(storage.foldername(name))[1]));
create policy "Admin review photos" on storage.objects for delete to authenticated using(bucket_id='review-images' and public.is_store_admin());

create or replace function public.bulk_update_products(product_slugs text[], action text, amount integer)
returns integer language plpgsql security definer set search_path='' as $$
declare affected integer;
begin
  if not public.is_store_admin() then raise exception 'Admin access required'; end if;
  if cardinality(product_slugs) not between 1 and 500 then raise exception 'Choose 1 to 500 products'; end if;
  if action='featured' and amount in (0,1) then update public.products set featured=(amount=1),updated_at=now() where slug=any(product_slugs);
  elsif action='price' and amount between -90 and 100 then update public.products set price=greatest(0,round(price::numeric*(100+amount)/100))::integer,updated_at=now() where slug=any(product_slugs);
  elsif action='stock' and amount between 0 and 100000 then
    if exists(select 1 from public.products where slug=any(product_slugs) and size_stock is not null) then raise exception 'Edit size-tracked stock per size in the product editor'; end if;
    update public.products set stock=amount,updated_at=now() where slug=any(product_slugs);
  else raise exception 'Invalid bulk update'; end if;
  get diagnostics affected=row_count; return affected;
end; $$;
revoke all on function public.bulk_update_products(text[],text,integer) from public;
grant execute on function public.bulk_update_products(text[],text,integer) to authenticated;
commit;
