-- Repair missing product editor fields on databases without shop_growth applied.
begin;
alter table public.products add column if not exists one_size boolean not null default false;
alter table public.products add column if not exists complete_the_look text[] not null default '{}';
do $$
begin
  if not exists (select 1 from pg_constraint where conrelid = 'public.products'::regclass and conname = 'complete_the_look_limit') then
    alter table public.products add constraint complete_the_look_limit check(cardinality(complete_the_look)<=4 and not(slug=any(complete_the_look)));
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.products'::regclass and conname = 'one_size_shared_stock') then
    alter table public.products add constraint one_size_shared_stock check(not one_size or size_stock is null);
  end if;
end;
$$;
notify pgrst, 'reload schema';
commit;
