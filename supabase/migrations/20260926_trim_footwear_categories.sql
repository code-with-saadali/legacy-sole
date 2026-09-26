-- Keep eight categories, preserving every category currently containing products.
begin;

delete from public.categories c
where c.name not in (
  'Everyday', 'Runners', 'Shoes', 'Running',
  'Boots', 'Sneakers', 'Gym', 'Formal'
)
and not exists (
  select 1 from public.products p where p.category = c.name
);

commit;
