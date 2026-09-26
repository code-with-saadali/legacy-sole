# Product gallery poses

The expanded Boots, Formal, Gym, Running and Sneakers catalogue also includes
matching top/rear poses on solid `#E9E2D7`. See
[`../catalog-expansion.md`](../catalog-expansion.md) for the asset paths, prompts
and database migration. The transparent-background workflow below documents
the earlier catalogue images.

Generated with the built-in imagegen tool from the matching original PNG in
`public/images/shoes/`. Each existing catalogue product uses its original photo
plus a `-top.png` and a `-rear.png` here, for three distinct views.

The mapping in `src/app/_data/product-poses.ts` matches the original image path.
Custom gallery photos take precedence. Replacing the main image stops the old
generated poses from being attached to it. No database migration is required.

## Generation prompt

One call per product and angle, using the original product PNG as the reference:

> Use case: product-mockup. Create an alternate ecommerce product photo of the EXACT same shoe in the reference image. Change only the camera angle to {angle}. Preserve the reference shoe's precise colors, sole shape, materials, stitching, panels and laces. One complete shoe, centered, generous margins, transparent background with genuine alpha, soft studio lighting, no text or added logos, square canvas. Output a single individual photo, not a collage.

Top angle: `a directly overhead top view, toe toward bottom of frame`

Rear angle: `a rear three-quarter view, heel closest to camera, showing heel construction and side receding away`

The first image, `cloud-court-top.png`, used this equivalent prompt:

> Create a new ecommerce product photo of exactly the same white leather cream sole sneaker in the reference, now viewed directly from above (top view), toe toward bottom of frame. Preserve product design, panel seams, materials, white laces and cream sole. Single whole shoe centered with generous margin, square canvas, transparent background, studio lighting, no text or added logos. This is an alternate gallery pose for the same product. Save the output image and return its local file path for use in the project.
