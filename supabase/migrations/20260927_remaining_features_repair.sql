begin;
alter table public.orders add column if not exists closure_reason text not null default '';
alter table public.orders add column if not exists stock_restored boolean not null default false;
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check check (status in ('Pending','Confirmed','Dispatched','Delivered','Cancelled','Returned'));

create or replace function public.resolve_order_inventory()
returns trigger language plpgsql security definer set search_path = '' as $$
declare line record; product public.products%rowtype; remaining jsonb;
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
      select * into product from public.products p where p.slug=line.slug for update;
      if not found then raise exception 'Product % no longer exists. Close without restocking and reconcile manually.',line.slug; end if;
      if line.quantity is null or line.quantity < 1 then raise exception 'Invalid ordered quantity'; end if;
      remaining := product.size_stock;
      if remaining is not null then
        if line.size not in ('UK 6','UK 7','UK 8','UK 9','UK 10') then raise exception 'Invalid ordered size'; end if;
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
    where o.deleted_at is null and o.created_at>=start_date::timestamp at time zone 'Asia/Karachi' and o.created_at<(end_date+1)::timestamp at time zone 'Asia/Karachi'),'[]'::jsonb);
end; $$;
revoke all on function public.profit_report(date,date) from public;
grant execute on function public.profit_report(date,date) to authenticated;

notify pgrst, 'reload schema';
commit;
