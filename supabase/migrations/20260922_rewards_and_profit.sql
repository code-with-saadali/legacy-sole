begin;

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

-- Photo reviews can carry a verified-purchase badge without exposing an order reference.
alter table public.reviews add column verified_purchase boolean not null default false;
create table public.review_purchases (
  order_id text not null references public.orders(id),
  product_slug text not null,
  primary key(order_id,product_slug)
);
alter table public.review_purchases enable row level security;
revoke all on public.review_purchases from anon,authenticated;
create function public.submit_purchase_review(product_slug text,reviewer text,stars integer,review_body text,photo_urls text[] default '{}',order_reference text default '',customer_email text default '')
returns void language plpgsql security definer set search_path='' as $$
declare target public.orders%rowtype; photo text; verified boolean:=false;
begin
  if cardinality(photo_urls)>3 or photo_urls is null then raise exception 'Maximum 3 photos'; end if;
  if coalesce(length(trim(reviewer)),0) not between 2 and 80 or coalesce(length(trim(review_body)),0) not between 5 and 1000 or stars is null or stars not between 1 and 5 then raise exception 'Enter a valid name, rating and review'; end if;
  foreach photo in array photo_urls loop
    if photo is null or photo !~ '^https://[a-z0-9]+\.supabase\.co/storage/v1/object/public/review-images/' or length(photo)>500 then raise exception 'Invalid review photo'; end if;
  end loop;
  if coalesce(trim(order_reference),'')<>'' or cardinality(photo_urls)>0 then
    select * into target from public.orders o where upper(o.id)=upper(trim(order_reference)) and lower(trim(o.customer->>'email'))=lower(trim(customer_email)) and o.status='Delivered' for update;
    if not found or not exists(select 1 from jsonb_array_elements(target.items) i where i->>'slug'=product_slug) then raise exception 'Photo reviews need a delivered order containing this product. Check your reference and email.'; end if;
    insert into public.review_purchases(order_id,product_slug) values(target.id,product_slug);
    verified:=true;
  end if;
  if exists(select 1 from public.reviews r where r.product_slug=submit_purchase_review.product_slug and lower(r.customer_name)=lower(trim(reviewer)) and r.created_at>now()-interval '5 minutes') then raise exception 'Please wait before submitting another review'; end if;
  insert into public.reviews(product_slug,customer_name,rating,body,photos,approved,verified_purchase) values(product_slug,trim(reviewer),stars,trim(review_body),photo_urls,false,verified);
end; $$;
revoke all on function public.submit_product_review(text,text,integer,text,text[]) from public,anon,authenticated;
revoke insert on public.reviews from anon,authenticated;
revoke all on function public.submit_purchase_review(text,text,integer,text,text[],text,text) from public;
grant execute on function public.submit_purchase_review(text,text,integer,text,text[],text,text) to anon,authenticated;
create function public.profit_report(start_date date,end_date date) returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
  if not public.is_store_admin() then raise exception 'Admin access required'; end if;
  if start_date is null or end_date is null or start_date>end_date then raise exception 'Choose a valid date range'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('id',o.id,'created_at',o.created_at,'status',o.status,'total',o.total,'stock_restored',o.stock_restored,'product_cost',f.product_cost,'delivery_cost',f.delivery_cost,'other_cost',coalesce(f.other_cost,0)) order by o.created_at desc,o.id)
    from public.orders o left join public.order_financials f on f.order_id=o.id
    where o.created_at>=start_date::timestamp at time zone 'Asia/Karachi' and o.created_at<(end_date+1)::timestamp at time zone 'Asia/Karachi'),'[]'::jsonb);
end; $$;
revoke all on function public.profit_report(date,date) from public;
grant execute on function public.profit_report(date,date) to authenticated;
commit;
