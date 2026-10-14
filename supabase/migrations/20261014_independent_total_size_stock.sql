begin;

create or replace function public.validate_size_inventory()
returns trigger
language plpgsql
set search_path = ''
as $$
declare entry record;
begin
  new.variant_group := lower(trim(new.variant_group));
  if new.size_stock is null then return new; end if;
  if jsonb_typeof(new.size_stock) <> 'object' then
    raise exception 'Invalid size stock';
  end if;
  for entry in select key, value from jsonb_each(new.size_stock) loop
    if entry.key not in ('UK 6','UK 7','UK 8','UK 9','UK 10')
       or jsonb_typeof(entry.value) <> 'number' then
      raise exception 'Invalid size stock';
    end if;
    if (entry.value::text)::numeric < 0
       or (entry.value::text)::numeric <> trunc((entry.value::text)::numeric) then
      raise exception 'Size stock must be a non-negative integer';
    end if;
  end loop;
  return new;
end;
$$;

notify pgrst, 'reload schema';

commit;
