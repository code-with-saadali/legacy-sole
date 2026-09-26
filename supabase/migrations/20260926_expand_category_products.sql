-- Catalogue expansion: Boots/Formal/Gym 4 each, Running/Sneakers 6 each.
-- Generated concepts, suggested prices, unverified inventory remains zero.
begin;
insert into public.categories(name) values ('Boots'),('Formal'),('Gym'),('Running'),('Sneakers') on conflict(name) do nothing;
insert into public.products(slug,name,category,color,price,image,tag,description,details,stock,size_stock,gallery,size_guide,featured)
select slug,name,category,color,price,'/images/shoes/'||slug||'.png','New arrival',description,details::jsonb,0,
'{"UK 6":0,"UK 7":0,"UK 8":0,"UK 9":0,"UK 10":0}'::jsonb,
jsonb_build_array('/images/shoes/'||slug||'.png','/images/shoes/poses/'||slug||'-top.png','/images/shoes/poses/'||slug||'-rear.png'),
'[]'::jsonb,false
from (values
('ridge-hiker', 'Ridge Hiker', 'Boots', 'Olive / Black', 9490, 'Ridge Hiker pairs olive / black tones with a distinct boots silhouette for your footwear rotation.', '["Olive nubuck-style lace-up hiking ankle boot, black padded collar, metal eyelets, rugged black lug outsole","See all three product views","Confirm sizing and availability before ordering"]'),
('midnight-chelsea', 'Midnight Chelsea', 'Boots', 'Black', 8990, 'Midnight Chelsea pairs black tones with a distinct boots silhouette for your footwear rotation.', '["Matte black leather Chelsea ankle boot, black elastic gussets, slim black stacked heel","See all three product views","Confirm sizing and availability before ordering"]'),
('sand-chukka', 'Sand Chukka', 'Boots', 'Sand / Brown', 8490, 'Sand Chukka pairs sand / brown tones with a distinct boots silhouette for your footwear rotation.', '["Sand suede chukka ankle boot, three pairs of lace eyelets, dark brown flat sole","See all three product views","Confirm sizing and availability before ordering"]'),
('walnut-brogue', 'Walnut Brogue', 'Formal', 'Walnut', 8490, 'Walnut Brogue pairs walnut tones with a distinct formal silhouette for your footwear rotation.', '["Walnut brown leather wingtip brogue dress shoe, intricate punched detailing, brown laces, stacked heel","See all three product views","Confirm sizing and availability before ordering"]'),
('burgundy-monk', 'Burgundy Monk', 'Formal', 'Burgundy / Black', 8990, 'Burgundy Monk pairs burgundy / black tones with a distinct formal silhouette for your footwear rotation.', '["Deep burgundy leather double monk strap dress shoe, two brushed silver buckles, black sole","See all three product views","Confirm sizing and availability before ordering"]'),
('classic-penny', 'Classic Penny', 'Formal', 'Black / Brown', 7990, 'Classic Penny pairs black / brown tones with a distinct formal silhouette for your footwear rotation.', '["Black leather penny loafer, classic penny strap, apron toe seam, brown welt and low heel","See all three product views","Confirm sizing and availability before ordering"]'),
('graphite-lift', 'Graphite Lift', 'Gym', 'Graphite / Red', 7490, 'Graphite Lift pairs graphite / red tones with a distinct gym silhouette for your footwear rotation.', '["Graphite cross training shoe, red heel accents, wide flat black sole, black laces, angular synthetic overlays","See all three product views","Confirm sizing and availability before ordering"]'),
('cobalt-flex', 'Cobalt Flex', 'Gym', 'Cobalt / White', 6990, 'Cobalt Flex pairs cobalt / white tones with a distinct gym silhouette for your footwear rotation.', '["Cobalt blue mesh gym trainer, white flexible sole, blue laces, black heel support panel","See all three product views","Confirm sizing and availability before ordering"]'),
('sage-trainer', 'Sage Trainer', 'Gym', 'Sage / Charcoal', 7290, 'Sage Trainer pairs sage / charcoal tones with a distinct gym silhouette for your footwear rotation.', '["Sage green knit training shoe, charcoal overlays and laces, flat charcoal outsole","See all three product views","Confirm sizing and availability before ordering"]'),
('retro-burgundy', 'Retro Burgundy', 'Sneakers', 'Burgundy / Cream', 6990, 'Retro Burgundy pairs burgundy / cream tones with a distinct sneakers silhouette for your footwear rotation.', '["Burgundy suede retro low-top sneaker, cream leather curved side panel, cream laces, gum sole","See all three product views","Confirm sizing and availability before ordering"]'),
('cobalt-court', 'Cobalt Court', 'Sneakers', 'White / Cobalt', 6790, 'Cobalt Court pairs white / cobalt tones with a distinct sneakers silhouette for your footwear rotation.', '["White leather low-top court sneaker, cobalt blue toe overlays and heel tab, white cupsole","See all three product views","Confirm sizing and availability before ordering"]'),
('rose-platform', 'Rose Platform', 'Sneakers', 'Dusty Rose / White', 7290, 'Rose Platform pairs dusty rose / white tones with a distinct sneakers silhouette for your footwear rotation.', '["Dusty rose suede low-top platform sneaker, broad white platform sole, rose laces, tonal panels","See all three product views","Confirm sizing and availability before ordering"]'),
('mono-high', 'Mono High', 'Sneakers', 'Black / White', 7490, 'Mono High pairs black / white tones with a distinct sneakers silhouette for your footwear rotation.', '["Black canvas high-top sneaker, white rubber toe cap, white flat sole, white laces and silver eyelets","See all three product views","Confirm sizing and availability before ordering"]'),
('gum-street', 'Gum Street', 'Sneakers', 'Navy / Gum', 6490, 'Gum Street pairs navy / gum tones with a distinct sneakers silhouette for your footwear rotation.', '["Navy suede low-top skate sneaker, gum sole, navy laces, padded tongue and contrasting white stitching","See all three product views","Confirm sizing and availability before ordering"]')
) as additions(slug,name,category,color,price,description,details)
on conflict(slug) do nothing;

-- Consolidate the old Runners label into the requested Running collection.
update public.products set category='Running'
where category='Runners' and slug in ('dune-runner','forest-runner','slate-runner','olive-trail','onyx-knit');
delete from public.categories where name='Runners'
and not exists(select 1 from public.products where category='Runners');

-- Append matching poses only for unchanged generated product images.
-- Preserve custom galleries and avoid duplicates on subsequent runs.
update public.products p set gallery=(
  select jsonb_agg(photo order by first_position)
  from (
    select photo,min(position) as first_position
    from jsonb_array_elements_text(
      p.gallery || jsonb_build_array('/images/shoes/poses/'||p.slug||'-top.png','/images/shoes/poses/'||p.slug||'-rear.png')
    ) with ordinality as photos(photo,position)
    group by photo
  ) unique_photos
)
where p.slug in ('ridge-hiker','midnight-chelsea','sand-chukka','walnut-brogue','burgundy-monk','classic-penny','graphite-lift','cobalt-flex','sage-trainer','retro-burgundy','cobalt-court','rose-platform','mono-high','gum-street','heritage-chelsea','oxford-derby','pulse-trainer','aero-stride','navy-court')
and p.image='/images/shoes/'||p.slug||'.png';
commit;
