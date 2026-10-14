begin;

alter table public.store_settings
  add column if not exists shop_hero_image text not null default '';

notify pgrst, 'reload schema';
commit;
