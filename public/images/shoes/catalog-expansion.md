# Expanded footwear catalogue

Boots, Formal and Gym contain four styles each; Running and Sneakers contain six.
The five existing Runners products are consolidated into Running. Existing Everyday
products retain their categories and galleries.

New generated catalogue concepts use suggested prices and start with zero stock.
The database migration is `supabase/migrations/20260926_expand_category_products.sql`.

## Images

Main photographs: `public/images/shoes/{slug}.png`.
Top and rear views: `public/images/shoes/poses/{slug}-top.png` and `{slug}-rear.png`.
Each pose is generated separately with the corresponding main photo as reference.
The built-in image_gen tool is used. Background correction in code to solid
`#E9E2D7` follows the user's previously approved image workflow.

Main prompt: Single square ecommerce photograph of ONE {product subject}.
Three-quarter side view facing left. Whole shoe centered, generous 12% empty
margins. Uniform solid sRGB #E9E2D7, no gradient, texture or cast shadow. Realistic
studio-lit shoe materials. No text, branding, logo, watermark or collage.

Pose prompt: Photograph the EXACT shoe in the reference from {angle}. Preserve
colours, materials, panels, sole shape, laces, stitching and hardware. Change only
camera angle. One complete centered shoe with generous margins, square canvas,
solid #E9E2D7 background, no cast shadow, gradient, text, logos or collage.
Angles: directly overhead with toe toward bottom; rear three-quarter with heel
closest to camera and toe receding away.

Subjects: olive lace-up Ridge Hiker; black Midnight Chelsea; sand suede Sand
Chukka; walnut wingtip Walnut Brogue; burgundy double-strap Burgundy Monk; black
Classic Penny loafer; graphite/red Graphite Lift; blue Cobalt Flex; green Sage
Trainer; burgundy/cream Retro Burgundy; white/blue Cobalt Court; rose Rose
Platform; black/white Mono High; navy/gum Gum Street.

Matching alternate poses also cover Heritage Chelsea, Oxford Derby, Pulse
Trainer, Aero Stride and Navy Court from the earlier catalogue additions.
