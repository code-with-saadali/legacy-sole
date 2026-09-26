begin;
-- Install missing checkout dependencies without unrelated review or marketing changes.
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
  foreach required_field in array array['name','email','phone','address','area','city','postalCode'] loop
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
declare item record; product public.products%rowtype; subtotal bigint:=0; shipping integer; discount integer:=0; settings public.store_settings%rowtype; coupon public.coupons%rowtype; v_code text:=upper(trim(coalesce(promo_code,'')));
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
  if v_code<>'' then
    select * into coupon from public.coupons where coupons.code=v_code;
    if not found or not coupon.active or (coupon.expires_at is not null and coupon.expires_at<=now()) or (coupon.max_uses is not null and coupon.used_count>=coupon.max_uses) then raise exception 'This coupon is invalid or has expired'; end if;
    if subtotal<coupon.minimum then raise exception 'This coupon requires a minimum subtotal of Rs. %',coupon.minimum; end if;
    discount:=least(subtotal,case when coupon.kind='percent' then floor(subtotal*coupon.amount/100.0)::bigint else coupon.amount end)::integer;
  end if;
  return jsonb_build_object('subtotal',subtotal,'shipping',shipping,'discount',discount,'coupon_code',v_code,'total',subtotal+shipping-discount);
end; $$;



revoke all on function public.place_order_inventory(uuid,jsonb,jsonb) from public,anon,authenticated;
revoke all on function public.checkout_quote(jsonb,text,text) from public;
grant execute on function public.checkout_quote(jsonb,text,text) to anon,authenticated;
create or replace function public.place_order(request_id uuid, customer jsonb, items jsonb, coupon_code text default '')
returns jsonb language plpgsql security definer set search_path='' as $$
declare existing public.orders%rowtype; result jsonb; quote jsonb; v_code text:=upper(trim(coalesce(coupon_code,''))); item record;
begin
  if request_id is null then raise exception 'Missing order reference'; end if;
  perform pg_advisory_xact_lock(hashtextextended('LS-'||request_id::text,0));
  select * into existing from public.orders where id='LS-'||request_id::text;
  if found then return jsonb_build_object('id',existing.id,'total',existing.total); end if;
  if v_code<>'' then perform 1 from public.coupons where coupons.code=v_code for update; end if;
  if jsonb_typeof(items) is distinct from 'array' then raise exception 'Invalid cart'; end if;
  for item in select distinct i.slug from jsonb_to_recordset(items) as i(slug text) order by i.slug loop
    perform 1 from public.products where slug=item.slug for update;
  end loop;
  quote:=public.checkout_quote(items,customer->>'city',v_code);
  result:=public.place_order_inventory(request_id,customer,items);
  update public.orders set subtotal=(quote->>'subtotal')::integer,shipping=(quote->>'shipping')::integer,discount=(quote->>'discount')::integer,coupon_code=v_code,total=(quote->>'total')::integer where id=result->>'id';
  if v_code<>'' then update public.coupons set used_count=used_count+1 where coupons.code=v_code; end if;
  return jsonb_build_object('id',result->>'id','total',(quote->>'total')::integer);
end; $$;
revoke all on function public.place_order(uuid,jsonb,jsonb,text) from public;
grant execute on function public.place_order(uuid,jsonb,jsonb,text) to anon,authenticated;

-- Costs are private: never store them on publicly readable product/order items.
create table public.product_costs (
  product_slug text primary key references public.products(slug) on delete cascade on update cascade,
  unit_cost integer not null check(unit_cost between 0 and 100000000)
);
create table public.order_financials (
  order_id text primary key references public.orders(id) on delete cascade,
  product_cost integer check(product_cost between 0 and 1000000000),
  delivery_cost integer check(delivery_cost between 0 and 1000000000),
  other_cost integer not null default 0 check(other_cost between 0 and 1000000000)
);
alter table public.product_costs enable row level security;
alter table public.order_financials enable row level security;
create policy "Admin product costs" on public.product_costs for all to authenticated using(public.is_store_admin()) with check(public.is_store_admin());
create policy "Admin order financials" on public.order_financials for all to authenticated using(public.is_store_admin()) with check(public.is_store_admin());
revoke all on public.product_costs,public.order_financials from anon,authenticated;
grant select,insert,update on public.product_costs,public.order_financials to authenticated;

create function public.snapshot_order_costs() returns trigger language plpgsql security definer set search_path='' as $$
declare cost bigint;
begin
  select case when count(*)=count(c.unit_cost) then sum(c.unit_cost::bigint*i.quantity) else null end into cost
  from jsonb_to_recordset(new.items) as i(slug text,quantity integer)
  left join public.product_costs c on c.product_slug=i.slug;
  insert into public.order_financials(order_id,product_cost) values(new.id,cost);
  return new;
end; $$;
create trigger snapshot_order_costs after insert on public.orders for each row execute function public.snapshot_order_costs();
-- Historical costs are unknown; do not substitute today's purchase price.
insert into public.order_financials(order_id) select id from public.orders;

create table public.loyalty_wallets (
  email text primary key,
  balance integer not null default 0
);
create table public.loyalty_ledger (
  id bigint generated always as identity primary key,
  email text not null references public.loyalty_wallets(email),
  order_id text not null references public.orders(id),
  points integer not null,
  created_at timestamptz not null default now()
);
create index loyalty_ledger_order_idx on public.loyalty_ledger(order_id);
alter table public.loyalty_wallets enable row level security;
alter table public.loyalty_ledger enable row level security;
create policy "Admin loyalty wallets" on public.loyalty_wallets for select to authenticated using(public.is_store_admin());
create policy "Admin loyalty ledger" on public.loyalty_ledger for select to authenticated using(public.is_store_admin());
revoke all on public.loyalty_wallets,public.loyalty_ledger from anon,authenticated;
grant select on public.loyalty_wallets,public.loyalty_ledger to authenticated;
alter table public.orders add column loyalty_eligible boolean not null default false;
alter table public.orders alter column loyalty_eligible set default true;
alter table public.orders add column loyalty_spent integer not null default 0 check(loyalty_spent>=0);

create function public.sync_loyalty_points() returns trigger language plpgsql security definer set search_path='' as $$
declare mail text:=lower(trim(new.customer->>'email')); desired integer:=0; previous integer; delta integer;
begin
  if tg_op='UPDATE' and lower(trim(old.customer->>'email')) is distinct from mail then
    raise exception 'The email on a placed order cannot be changed';
  end if;
  if not new.loyalty_eligible then return new; end if;
  if new.status not in ('Cancelled','Returned') then
    desired:=-new.loyalty_spent;
    if new.status='Delivered' then desired:=desired+floor(greatest(0,coalesce(new.subtotal,new.total-coalesce(new.shipping,0))-new.discount-new.loyalty_spent)/100.0)::integer; end if;
  end if;
  insert into public.loyalty_wallets(email) values(mail) on conflict do nothing;
  perform 1 from public.loyalty_wallets where email=mail for update;
  select coalesce(sum(points),0)::integer into previous from public.loyalty_ledger where order_id=new.id;
  delta:=desired-previous;
  if delta<>0 then
    insert into public.loyalty_ledger(email,order_id,points) values(mail,new.id,delta);
    update public.loyalty_wallets set balance=balance+delta where email=mail;
  end if;
  return new;
end; $$;
create trigger sync_loyalty_points after insert or update on public.orders for each row execute function public.sync_loyalty_points();

-- A private, unguessable order reference plus its checkout email proves ownership.
create function public.loyalty_balance(order_reference text,customer_email text) returns integer
language plpgsql security definer set search_path='' as $$
begin
  if not exists(select 1 from public.orders where upper(id)=upper(trim(order_reference)) and lower(trim(customer->>'email'))=lower(trim(customer_email))) then
    raise exception 'Check your previous order reference and checkout email';
  end if;
  return greatest(0,coalesce((select balance from public.loyalty_wallets where email=lower(trim(customer_email))),0));
end; $$;

create function public.checkout_rewards_quote(cart_items jsonb,delivery_city text,promo_code text default '',reward_reference text default '',customer_email text default '',reward_points integer default 0)
returns jsonb language plpgsql security definer set search_path='' as $$
declare quote jsonb; balance integer:=0;
begin
  if reward_points is null or reward_points<0 then raise exception 'Invalid reward points'; end if;
  quote:=public.checkout_quote(cart_items,delivery_city,promo_code);
  if reward_points>0 then
    balance:=public.loyalty_balance(reward_reference,customer_email);
    if reward_points>balance then raise exception 'Not enough loyalty points'; end if;
    if reward_points>(quote->>'subtotal')::integer-(quote->>'discount')::integer then raise exception 'Points cannot exceed the merchandise total after coupons'; end if;
  end if;
  return quote||jsonb_build_object('loyalty_discount',reward_points,'total',(quote->>'total')::integer-reward_points);
end; $$;

create function public.place_rewards_order(request_id uuid,customer jsonb,items jsonb,coupon_code text default '',reward_reference text default '',reward_points integer default 0)
returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb; quote jsonb; existing public.orders%rowtype; line record; mail text:=lower(trim(customer->>'email'));
begin
  if request_id is null then raise exception 'Missing order reference'; end if;
  perform pg_advisory_xact_lock(hashtextextended('LS-'||request_id::text,0));
  select * into existing from public.orders where id='LS-'||request_id::text;
  if found then return jsonb_build_object('id',existing.id,'total',existing.total); end if;
  if mail is null or length(mail) not between 3 and 500 then raise exception 'Enter a checkout email'; end if;
  -- Serialize redemptions before checking balance. Failed orders roll back all changes.
  insert into public.loyalty_wallets(email) values(mail) on conflict do nothing;
  perform 1 from public.loyalty_wallets where email=mail for update;
  if jsonb_typeof(items) is distinct from 'array' then raise exception 'Invalid cart'; end if;
  if coalesce(trim(coupon_code),'')<>'' then perform 1 from public.coupons where code=upper(trim(coupon_code)) for update; end if;
  for line in select distinct i.slug from jsonb_to_recordset(items) as i(slug text) order by i.slug loop
    perform 1 from public.products where slug=line.slug for update;
  end loop;
  -- Quote before consuming the last coupon use, while holding its lock.
  quote:=public.checkout_rewards_quote(items,customer->>'city',coupon_code,reward_reference,mail,reward_points);
  result:=public.place_order(request_id,customer,items,coupon_code);
  update public.orders set loyalty_spent=reward_points,total=(quote->>'total')::integer where id=result->>'id';
  return jsonb_build_object('id',result->>'id','total',(quote->>'total')::integer);
end; $$;
revoke all on function public.loyalty_balance(text,text),public.checkout_rewards_quote(jsonb,text,text,text,text,integer),public.place_rewards_order(uuid,jsonb,jsonb,text,text,integer) from public;
grant execute on function public.loyalty_balance(text,text),public.checkout_rewards_quote(jsonb,text,text,text,text,integer),public.place_rewards_order(uuid,jsonb,jsonb,text,text,integer) to anon,authenticated;
revoke all on function public.place_order(uuid,jsonb,jsonb,text) from anon,authenticated;
revoke all on function public.snapshot_order_costs(),public.sync_loyalty_points() from public;


revoke all on function public.place_order(uuid,jsonb,jsonb) from public,anon,authenticated;
notify pgrst, 'reload schema';
commit;
