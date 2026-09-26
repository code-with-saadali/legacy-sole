-- Add missing footwear categories without changing existing products or categories.
begin;

with requested(name) as (
  values
    ('Running'), ('Everyday'), ('Boots'), ('Sneakers'),
    ('Gym'), ('Formal'), ('Golf'), ('Padel Shoes'),
    ('Loafers'), ('Sandals'), ('Slippers'), ('Hiking'),
    ('Football'), ('Basketball')
), missing as (
  select name from requested
  union
  select distinct trim(category) from public.products
  where trim(category) <> ''
)
insert into public.categories (name)
select name from missing
where not exists (
  select 1 from public.categories existing
  where lower(trim(existing.name)) = lower(missing.name)
)
on conflict (name) do nothing;

commit;
