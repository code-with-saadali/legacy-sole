begin;
alter table public.products add column one_size boolean not null default false;
alter table public.products add column complete_the_look text[] not null default '{}';
alter table public.products add constraint complete_the_look_limit check(cardinality(complete_the_look)<=4 and not(slug=any(complete_the_look)));
alter table public.products add constraint one_size_shared_stock check(not one_size or size_stock is null);

create or replace function public.place_order_inventory(request_id uuid, customer jsonb, items jsonb)
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
       or i.size not in ('UK 6','UK 7','UK 8','UK 9','UK 10','One size')
  ) then raise exception 'Invalid cart item'; end if;

  -- Stable lock order prevents deadlocks; aggregate stock across all sizes.
  for line in
    select i.slug, sum(i.quantity)::integer quantity
    from jsonb_to_recordset(items) as i(slug text, size text, quantity integer)
    group by i.slug order by i.slug
  loop
    select * into product from public.products p where p.slug = line.slug for update;
    if not found then raise exception 'A product is no longer available'; end if;
    if exists(select 1 from jsonb_to_recordset(items) as i(slug text,size text) where i.slug=product.slug and ((product.one_size and i.size<>'One size') or (not product.one_size and i.size='One size'))) then raise exception 'Invalid size for %',product.name; end if;
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

create or replace function public.checkout_quote(cart_items jsonb, delivery_city text, promo_code text default '')
returns jsonb language plpgsql security definer set search_path='' as $$
declare item record; product public.products%rowtype; subtotal bigint:=0; shipping integer; discount integer:=0; settings public.store_settings%rowtype; coupon public.coupons%rowtype; code text:=upper(trim(coalesce(promo_code,'')));
begin
  if jsonb_typeof(cart_items) is distinct from 'array' then raise exception 'Invalid cart'; end if;
  if jsonb_array_length(cart_items) not between 1 and 100 then raise exception 'Cart must contain 1 to 100 lines'; end if;
  for item in select * from jsonb_to_recordset(cart_items) as i(slug text,size text,quantity numeric) loop
    if item.slug is null or item.size is null or item.size not in ('UK 6','UK 7','UK 8','UK 9','UK 10','One size') or item.quantity is null or item.quantity not between 1 and 100 or item.quantity <> trunc(item.quantity) then raise exception 'Invalid cart item'; end if;
    select * into product from public.products where slug=item.slug;
    if not found then raise exception 'A product is no longer available'; end if;
    if (product.one_size and item.size<>'One size') or (not product.one_size and item.size='One size') then raise exception 'Invalid product size'; end if;
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


commit;
