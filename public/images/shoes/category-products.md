# Category product images

Generated using the built-in image_gen tool for the category catalogue additions.
These are illustrative product concepts; suggested prices and zero stock are seeded
by `supabase/migrations/20260926_category_products.sql`. Confirm actual inventory,
materials, sizing and photography before offering these styles for sale.

## Saved assets and subjects

- `heritage-chelsea.png`: chestnut Chelsea boot, black elastic gusset, chunky lug sole.
- `oxford-derby.png`: polished black Derby formal shoe, rounded toe, open lacing.
- `pulse-trainer.png`: charcoal mesh gym trainer with orange accents.
- `aero-stride.png`: pale grey mesh running shoe with lime accents and sculpted sole.
- `navy-court.png`: ivory court sneaker, navy panels, gum sole.

## Prompt set

Use case: product-mockup. One square ecommerce product photograph of a single
{subject above}. Three-quarter side view facing left, whole shoe centered with
generous margins, warm off-white #F4F1E9 background, soft studio shadow, realistic
texture. No text, logos, watermark or collage.

The Chelsea image came from an initial multi-product request that returned only
the Chelsea boot. Each remaining asset was generated with an individual call.

## Background correction

All five assets were edited using the built-in image_gen tool with their existing
PNG as the edit target. Final prompt: Change only the background to uniform solid
sRGB #E9E2D7 (233, 226, 215), edge to edge; no gradient, vignette, texture, floor
line or cast shadow. Preserve the shoe colours, material, silhouette, laces,
scale, position, camera angle and internal lighting. Keep the square framing.

With the user's explicit approval, the generated background was then corrected
in code to exact #E9E2D7 using a border-connected colour mask, protecting the
ivory sneaker upper. Background samples were checked for RGB (233, 226, 215).
