// Match the original image, rather than the slug, so changing a product's
// main photo never attaches generated poses of a different shoe.
const poseNames = [
  "black-cutout",
  "court-cutout",
  "runner-cutout",
  "dune-runner",
  "forest-runner",
  "slate-runner",
  "cloud-court",
  "espresso-court",
  "midnight-court",
  "clay-retro",
  "olive-trail",
  "onyx-knit",
  "ivory-platform",
  "ridge-hiker",
  "midnight-chelsea",
  "sand-chukka",
  "walnut-brogue",
  "burgundy-monk",
  "classic-penny",
  "graphite-lift",
  "cobalt-flex",
  "sage-trainer",
  "retro-burgundy",
  "cobalt-court",
  "rose-platform",
  "mono-high",
  "gum-street",
  "heritage-chelsea",
  "oxford-derby",
  "pulse-trainer",
  "aero-stride",
  "navy-court",
];

const generatedPoses: Record<string, string[]> = Object.fromEntries(
  poseNames.map((name) => [
    `/images/shoes/${name}.png`,
    [
      `/images/shoes/poses/${name}-top.png`,
      `/images/shoes/poses/${name}-rear.png`,
    ],
  ]),
);

export function productPhotos(image: string, gallery: string[]): string[] {
  const photos = [...new Set([image, ...gallery].filter(Boolean))];
  for (const pose of generatedPoses[image] ?? []) {
    if (photos.length >= 3) break;
    if (!photos.includes(pose)) photos.push(pose);
  }
  return photos;
}
