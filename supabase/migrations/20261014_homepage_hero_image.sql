begin;

alter table public.store_settings
  add column if not exists hero_image text not null default '/baner.jpeg';

notify pgrst, 'reload schema';
commit;
