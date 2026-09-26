begin;

create table if not exists public.store_settings (
  id boolean primary key default true check (id),
  whatsapp text not null default '923023898785',
  default_shipping integer not null default 250 check (default_shipping >= 0),
  free_shipping_minimum integer not null default 10000 check (free_shipping_minimum >= 0),
  city_rates jsonb not null default '{}'::jsonb check (jsonb_typeof(city_rates) = 'object')
);
insert into public.store_settings(id) values(true) on conflict do nothing;
alter table public.store_settings enable row level security;
drop policy if exists "Read store settings" on public.store_settings;
create policy "Read store settings" on public.store_settings for select using(true);
drop policy if exists "Admin store settings" on public.store_settings;
create policy "Admin store settings" on public.store_settings for all to authenticated using(public.is_store_admin()) with check(public.is_store_admin());
grant select on public.store_settings to anon,authenticated;
grant update on public.store_settings to authenticated;

create or replace function public.validate_store_settings() returns trigger language plpgsql set search_path='' as $$
declare entry record;
begin
  if new.whatsapp !~ '^[1-9][0-9]{7,14}$' then raise exception 'Enter a valid international WhatsApp number'; end if;
  for entry in select key,value from jsonb_each(new.city_rates) loop
    if length(trim(entry.key)) not between 2 and 80 or jsonb_typeof(entry.value)<>'number' then raise exception 'Invalid city rate'; end if;
    if (entry.value::text)::numeric < 0 or (entry.value::text)::numeric > 100000 or (entry.value::text)::numeric <> trunc((entry.value::text)::numeric) then raise exception 'Delivery charges must be whole numbers from 0 to 100000'; end if;
  end loop;
  return new;
end; $$;
drop trigger if exists validate_store_settings on public.store_settings;
create trigger validate_store_settings before insert or update on public.store_settings for each row execute function public.validate_store_settings();


alter table public.store_settings add column if not exists menu_columns jsonb;
update public.store_settings set menu_columns = '[{"title":"Shop","caption":"Explore all footwear","links":[{"label":"Running","href":"/shop?category=Running"},{"label":"Casual","href":"/shop?category=Everyday"},{"label":"Boots","href":"/shop?category=Boots"},{"label":"Sneakers","href":"/shop?category=Sneakers"},{"label":"View All","href":"/shop"}]},{"title":"Collections","caption":"Curated seasonal edits","links":[{"label":"New Season","href":"/#collections"},{"label":"Essentials","href":"/shop?category=Everyday"},{"label":"Limited Edition","href":"/shop"}]},{"title":"Shoes","caption":"Find your everyday pair","links":[{"label":"Sneakers","href":"/shop?category=Sneakers"},{"label":"Running","href":"/shop?category=Running"},{"label":"Boots","href":"/shop?category=Boots"},{"label":"Everyday","href":"/shop?category=Everyday"}]},{"title":"Discover","caption":"More from Legacy Sole","links":[{"label":"New Arrivals","href":"/#new-arrivals"},{"label":"The Line-Up","href":"/#collection"},{"label":"Track Order","href":"/track-order"},{"label":"Restock watchlist","href":"/watchlist"}]}]'::jsonb where menu_columns is null;
alter table public.store_settings alter column menu_columns set default '[]'::jsonb;
alter table public.store_settings alter column menu_columns set not null;
commit;