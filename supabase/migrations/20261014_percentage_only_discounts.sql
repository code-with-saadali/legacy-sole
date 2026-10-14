begin;

create or replace function public.product_sale_price(
  base_price integer,
  percent_off integer,
  manual_sale_price integer
)
returns integer
language sql
immutable
set search_path = ''
as $$
  select greatest(0, round(base_price::numeric * (100 - least(90, greatest(0, percent_off))) / 100)::integer);
$$;

notify pgrst, 'reload schema';

commit;
