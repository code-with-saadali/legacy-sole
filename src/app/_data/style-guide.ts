export type StyleLook = {
  number: string;
  title: string;
  shoe: string;
  image: string;
  slug: string;
  outfit: string;
  note: string;
};
export type StyleGuideSettings = {
  eyebrow: string;
  heading: string;
  description: string;
  looks: StyleLook[];
};
const looks = [
  {
    number: "01",
    title: "The Slow Morning",
    shoe: "Court Classic",
    image:
      "https://pub-bbec48a9985d48a988fd956df7da148b.r2.dev/legacy-sole/images/shoes/court-cutout.png",
    slug: "court-classic",
    outfit: "Straight-leg denim + a relaxed white shirt",
    note: "Easy pieces for an unhurried start.",
  },
  {
    number: "02",
    title: "The City Day",
    shoe: "Aero Runner",
    image:
      "https://pub-bbec48a9985d48a988fd956df7da148b.r2.dev/legacy-sole/images/shoes/runner-cutout.png",
    slug: "aero-runner",
    outfit: "Wide-leg trousers + a lightweight layer",
    note: "Built for long walks and longer plans.",
  },
  {
    number: "03",
    title: "The Late Plan",
    shoe: "Shadow Runner",
    image:
      "https://pub-bbec48a9985d48a988fd956df7da148b.r2.dev/legacy-sole/images/shoes/black-cutout.png",
    slug: "shadow-runner",
    outfit: "Dark denim + an easy overshirt",
    note: "A clean finish for wherever the evening goes.",
  },
];

export const defaultStyleGuide: StyleGuideSettings = {
  eyebrow: "Style Notes / Legacy Sole",
  heading: "Same pair.\nDifferent plans.",
  description:
    "Three easy ways to style everyday footwear without overthinking it.",
  looks,
};
