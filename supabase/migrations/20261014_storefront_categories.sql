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
