export type MenuColumn = {
  title: string;
  caption: string;
  links: { label: string; href: string }[];
};
export const menuColumns = [
  {
    title: "Shop",
    caption: "Explore all footwear",
    links: [
      { label: "Running", href: "/shop?category=Running" },
      { label: "Casual", href: "/shop?category=Everyday" },
      { label: "Boots", href: "/shop?category=Boots" },
      { label: "Sneakers", href: "/shop?category=Sneakers" },
      { label: "View All", href: "/shop" },
    ],
  },
  {
    title: "Collections",
    caption: "Curated seasonal edits",
    links: [
      { label: "New Season", href: "/#collections" },
      { label: "Essentials", href: "/shop?category=Everyday" },
      { label: "Limited Edition", href: "/shop" },
    ],
  },
  {
    title: "Shoes",
    caption: "Find your everyday pair",
    links: [
      { label: "Sneakers", href: "/shop?category=Sneakers" },
      { label: "Running", href: "/shop?category=Running" },
      { label: "Boots", href: "/shop?category=Boots" },
      { label: "Everyday", href: "/shop?category=Everyday" },
    ],
  },
  {
    title: "Discover",
    caption: "More from Legacy Sole",
    links: [
      { label: "New Arrivals", href: "/#new-arrivals" },
      { label: "The Line-Up", href: "/#collection" },
      { label: "Track Order", href: "/track-order" },
      { label: "Restock watchlist", href: "/watchlist" },
    ],
  },
];

export function menuCategories(columns: MenuColumn[]) {
  return Array.from(
    new Set(
      columns.flatMap((column) =>
        column.links.flatMap(({ href }) => {
          if (!href.startsWith("/shop?")) return [];
          const category = new URLSearchParams(
            href.split("?")[1].split("#")[0],
          ).get("category");
          return category ? [category] : [];
        }),
      ),
    ),
  );
}
export function validMenuHref(href: string) {
  if (/\s|\\/.test(href)) return false;
  if (href.startsWith("/") && !href.startsWith("//")) return true;
  try {
    const url = new URL(href);
    return url.protocol === "https:" && !!url.hostname;
  } catch {
    return false;
  }
}
