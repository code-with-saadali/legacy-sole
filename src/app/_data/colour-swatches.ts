const colourValues: Record<string, string> = {
  black: "#161616",
  white: "#ffffff",
  cream: "#efe3c8",
  forest: "#3f4d3a",
  cloud: "#d9d5cb",
  graphite: "#4b4b4b",
  grey: "#858585",
  gray: "#858585",
  silver: "#c0c0c0",
  red: "#c83232",
  blue: "#3478c8",
  navy: "#202e50",
  green: "#448454",
  olive: "#737a42",
  beige: "#d8c5a5",
  tan: "#c39b70",
  brown: "#795239",
  chocolate: "#593c2b",
  pink: "#e9a0b5",
  purple: "#8758a6",
  lavender: "#b8a1d4",
  orange: "#ed682c",
  yellow: "#edcb4c",
  gold: "#c7a54b",
  burgundy: "#722f44",
  maroon: "#800020",
  teal: "#308581",
  turquoise: "#40b9b0",
  mint: "#a5d7bd",
  sand: "#d9c8a7",
  nude: "#dec0ac",
  khaki: "#aaa078",
  ivory: "#fffff0",
  charcoal: "#36454f",
  offwhite: "#f6f3e8",
};

export function colourSwatchBackground(name: string): string | undefined {
  const normalized = name.trim().toLowerCase();
  if (
    /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(normalized)
  ) {
    return normalized;
  }
  const parts = normalized
    .replace(/off[ -]white/g, "offwhite")
    .split(/[\s/,&+–-]+/);
  const colours = [
    ...new Set(
      parts.flatMap((part) => (colourValues[part] ? [colourValues[part]] : [])),
    ),
  ];
  if (!colours.length) return undefined;
  if (colours.length === 1) return colours[0];
  return `linear-gradient(135deg, ${colours.map((value, index) => `${value} ${(index / colours.length) * 100}% ${((index + 1) / colours.length) * 100}%`).join(", ")})`;
}
