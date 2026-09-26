-- Generated catalogue concepts with suggested prices. Verify inventory before sale.
-- Requires 20260919_product_variants.sql. Safe to rerun; existing products are preserved.
begin;

insert into public.categories(name)
values ('Boots'), ('Formal'), ('Gym'), ('Running'), ('Sneakers')
on conflict (name) do nothing;

insert into public.products
  (slug, name, category, color, price, image, tag, description, details,
   stock, size_stock, gallery, size_guide, featured)
select slug, name, category, color, price,
  '/images/shoes/' || slug || '.png', 'New arrival', description,
  details::jsonb, 0,
  '{"UK 6":0,"UK 7":0,"UK 8":0,"UK 9":0,"UK 10":0}'::jsonb,
  jsonb_build_array('/images/shoes/' || slug || '.png'),
  '[]'::jsonb, false
from (values
  ('heritage-chelsea', 'Heritage Chelsea', 'Boots', 'Chestnut / Black', 8990,
   'A chestnut Chelsea silhouette with dark elastic side panels and a bold lug sole. Pair with denim or tailored trousers.',
   '["Ankle-height silhouette","Elastic side panels and heel pull tab","Chestnut finish with contrasting sole"]'),
  ('oxford-derby', 'Oxford Derby', 'Formal', 'Black', 7990,
   'A polished black lace-up silhouette with clean lines for office looks and evening occasions.',
   '["Open-lacing design","Rounded toe profile","Understated tonal finish"]'),
  ('pulse-trainer', 'Pulse Trainer', 'Gym', 'Charcoal / Orange', 6990,
   'Charcoal mesh styling and orange accents give this low-profile training silhouette a distinct look.',
   '["Mesh-style upper","Lace-up silhouette","Contrasting orange accents"]'),
  ('aero-stride', 'Aero Stride', 'Running', 'Grey / Lime', 7490,
   'A streamlined running silhouette pairing light grey mesh styling with lime details and a sculpted sole.',
   '["Sculpted sole profile","Lace-up silhouette","Grey and lime colourway"]'),
  ('navy-court', 'Navy Court', 'Sneakers', 'Ivory / Navy', 6490,
   'An ivory court silhouette with navy panels and a gum-tone sole for an easy casual rotation.',
   '["Low-top court silhouette","Navy contrast panels","Gum-tone outsole"]')
) as additions(slug, name, category, color, price, description, details)
on conflict (slug) do nothing;

commit;
