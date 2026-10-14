begin;

alter table public.products
  add column if not exists sizes text[] not null
  default array['UK 6','UK 7','UK 8','UK 9','UK 10'];

create or replace function public.validate_size_inventory()
returns trigger
language plpgsql
set search_path = ''
as $$
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
  if jsonb_typeof(new.size_stock) <> 'object' then
    raise exception 'Invalid size stock';
  end if;
  for entry in select key, value from jsonb_each(new.size_stock) loop
    if length(trim(entry.key)) not between 1 and 40
       or jsonb_typeof(entry.value) <> 'number' then
      raise exception 'Invalid size stock';
    end if;
    if (entry.value::text)::numeric < 0
       or (entry.value::text)::numeric <> trunc((entry.value::text)::numeric) then
      raise exception 'Size stock must be a non-negative integer';
    end if;
  end loop;
  return new;
end;
$$;

create or replace function public.checkout_quote(
  cart_items jsonb,
  delivery_city text,
  promo_code text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  item record;
  product public.products%rowtype;
  subtotal bigint := 0;
  shipping integer;
  discount integer := 0;
  settings public.store_settings%rowtype;
  coupon public.coupons%rowtype;
  v_code text := upper(trim(coalesce(promo_code, '')));
begin
  if jsonb_typeof(cart_items) is distinct from 'array' then raise exception 'Invalid cart'; end if;
  if jsonb_array_length(cart_items) not between 1 and 100 then raise exception 'Invalid cart'; end if;
  for item in
    select * from jsonb_to_recordset(cart_items) as i(slug text, size text, quantity numeric)
  loop
    if item.slug is null or item.size is null or length(trim(item.size)) not between 1 and 40
       or item.quantity is null or item.quantity not between 1 and 100
       or item.quantity <> trunc(item.quantity) then
      raise exception 'Invalid cart item';
    end if;
    select * into product from public.products where slug = item.slug;
    if not found then raise exception 'A product is no longer available'; end if;
    if (product.one_size and item.size <> 'One size')
       or (not product.one_size and not (item.size = any(product.sizes))) then
      raise exception 'Invalid product size';
    end if;
    subtotal := subtotal
      + public.product_sale_price(
        product.price, product.discount_percent, product.sale_price
      )::bigint * item.quantity;
  end loop;
  select * into settings from public.store_settings where id = true;
  select value::integer into shipping from jsonb_each_text(settings.city_rates)
    where lower(trim(key)) = lower(trim(delivery_city)) limit 1;
  shipping := coalesce(shipping, settings.default_shipping, 250);
  if subtotal >= coalesce(settings.free_shipping_minimum, 10000) then shipping := 0; end if;
  if v_code <> '' then
    select * into coupon from public.coupons where coupons.code = v_code;
    if not found or not coupon.active
       or (coupon.expires_at is not null and coupon.expires_at <= now())
       or (coupon.max_uses is not null and coupon.used_count >= coupon.max_uses) then
      raise exception 'This coupon is invalid or has expired';
    end if;
    if subtotal < coupon.minimum then
      raise exception 'This coupon requires a minimum subtotal of Rs. %', coupon.minimum;
    end if;
    discount := least(
      subtotal,
      case when coupon.kind = 'percent'
        then floor(subtotal * coupon.amount / 100.0)::bigint
        else coupon.amount
      end
    )::integer;
  end if;
  return jsonb_build_object(
    'subtotal', subtotal, 'shipping', shipping, 'discount', discount,
    'coupon_code', v_code, 'total', subtotal + shipping - discount
  );
end;
$$;

create or replace function public.place_order_inventory(
  request_id uuid,
  customer jsonb,
  items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
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
  perform pg_advisory_xact_lock(hashtextextended(order_id, 0));
  select o.total into existing_total from public.orders o where o.id = order_id;
  if found then return jsonb_build_object('id', order_id, 'total', existing_total); end if;
  if jsonb_typeof(customer) is distinct from 'object' then raise exception 'Invalid customer'; end if;
  foreach required_field in array array['name','email','phone','address','area','city','postalCode'] loop
    if coalesce(length(trim(customer->>required_field)), 0) = 0
       or length(customer->>required_field) > 500 then
      raise exception 'Missing or invalid customer %', required_field;
    end if;
  end loop;
  if jsonb_typeof(items) is distinct from 'array' then raise exception 'Invalid cart'; end if;
  if jsonb_array_length(items) < 1 or jsonb_array_length(items) > 100 then
    raise exception 'Cart must contain 1 to 100 lines';
  end if;
  if exists (
    select 1 from jsonb_to_recordset(items) as i(slug text, size text, quantity numeric)
    where i.slug is null or i.size is null or length(trim(i.size)) not between 1 and 40
       or i.quantity is null or i.quantity < 1 or i.quantity > 100
       or i.quantity <> trunc(i.quantity)
  ) then raise exception 'Invalid cart item'; end if;

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
    if product.stock < line.quantity then
      raise exception 'Insufficient stock for %', product.name;
    end if;
    sale_price := public.product_sale_price(
      product.price, product.discount_percent, product.sale_price
    );
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
        remaining := jsonb_set(
          remaining, array[size_line.size],
          to_jsonb((remaining->>size_line.size)::integer - size_line.quantity)
        );
      end loop;
    end if;
    update public.products
      set stock = stock - line.quantity, size_stock = remaining, updated_at = now()
      where id = product.id;
  end loop;

  for line in
    select i.slug, i.size, sum(i.quantity)::integer quantity
    from jsonb_to_recordset(items) as i(slug text, size text, quantity integer)
    group by i.slug, i.size order by i.slug, i.size
  loop
    select * into product from public.products p where p.slug = line.slug;
    sale_price := public.product_sale_price(
      product.price, product.discount_percent, product.sale_price
    );
    snapshot := snapshot || jsonb_build_array(jsonb_build_object(
      'slug', product.slug, 'name', product.name, 'color', product.color,
      'category', product.category, 'image', product.image, 'price', sale_price,
      'original_price', product.price, 'discount_percent', product.discount_percent,
      'size', line.size, 'quantity', line.quantity
    ));
  end loop;
  shipping := case when subtotal >= 10000 then 0 else 250 end;
  insert into public.orders(id, status, customer, items, total)
    values (order_id, 'Pending', customer, snapshot, (subtotal + shipping)::integer);
  return jsonb_build_object('id', order_id, 'total', subtotal + shipping);
end;
$$;

create or replace function public.resolve_order_inventory()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  line record;
  product public.products%rowtype;
  remaining jsonb;
  current_slug text;
begin
  if tg_op = 'INSERT' then
    if new.status in ('Cancelled','Returned') or new.stock_restored
       or new.closure_reason <> '' then
      raise exception 'New orders cannot be closed';
    end if;
    return new;
  end if;
  if old.status in ('Cancelled','Returned') then
    if new.status <> old.status or new.stock_restored <> old.stock_restored
       or new.closure_reason <> old.closure_reason or new.items <> old.items then
      raise exception 'Closed orders cannot be reopened or restocked again';
    end if;
    return new;
  end if;
  if new.status not in ('Cancelled','Returned') then
    if new.stock_restored or new.closure_reason <> '' then
      raise exception 'Use cancellation or return to restore stock';
    end if;
    return new;
  end if;
  if not public.is_store_admin() then raise exception 'Admin access required'; end if;
  if new.status = 'Cancelled' and old.status not in ('Pending','Confirmed') then
    raise exception 'Dispatched orders must be returned, not cancelled';
  end if;
  if new.status = 'Returned' and old.status not in ('Dispatched','Delivered') then
    raise exception 'Only dispatched or delivered orders can be returned';
  end if;
  if length(trim(new.closure_reason)) not between 1 and 500 then
    raise exception 'Provide a reason of 1 to 500 characters';
  end if;
  if new.items <> old.items then
    raise exception 'Ordered items cannot change during cancellation or return';
  end if;
  new.closure_reason := trim(new.closure_reason);
  if new.stock_restored then
    for line in
      select i.slug, i.size, sum(i.quantity)::integer quantity
      from jsonb_to_recordset(old.items) as i(slug text, size text, quantity integer)
      group by i.slug, i.size order by i.slug, i.size
    loop
      select coalesce(
        (select a.new_slug from public.product_slug_aliases a where a.old_slug = line.slug),
        line.slug
      ) into current_slug;
      select * into product from public.products p where p.slug = current_slug for update;
      if not found then
        raise exception 'Product % no longer exists. Close without restocking and reconcile manually.',
          line.slug;
      end if;
      if line.quantity is null or line.quantity < 1 then
        raise exception 'Invalid ordered quantity';
      end if;
      remaining := product.size_stock;
      if remaining is not null then
        remaining := jsonb_set(
          remaining, array[line.size],
          to_jsonb(coalesce((remaining->>line.size)::integer, 0) + line.quantity)
        );
      end if;
      update public.products
        set stock = stock + line.quantity, size_stock = remaining, updated_at = now()
        where id = product.id;
    end loop;
  end if;
  return new;
end;
$$;

notify pgrst, 'reload schema';
commit;
