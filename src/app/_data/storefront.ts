import type { Product } from "./products";

export function categoryCollections(products: Product[]) {
  const groups = new Map<string, Product[]>();
  for (const product of products) {
    if (!product.category.trim()) continue;
    const group = groups.get(product.category) ?? [];
    group.push(product);
    groups.set(product.category, group);
  }
  return Array.from(groups, ([name, items]) => ({
    name,
    count: items.length,
    product: items.find((item) => (item.stock ?? 0) > 0) ?? items[0],
    href: `/shop?category=${encodeURIComponent(name)}`,
  }));
}

export function bestsellerSelection(
  products: Product[],
  rankedSlugs: string[],
) {
  const ranked = [...new Set(rankedSlugs)]
    .flatMap((slug) => {
      const product = products.find(
        (item) => item.slug === slug && (item.stock ?? 0) > 0,
      );
      return product ? [product] : [];
    })
    .slice(0, 4);
  return {
    isBestseller: ranked.length > 0,
    products: ranked.length
      ? ranked
      : products
          .filter((item) => item.featured && (item.stock ?? 0) > 0)
          .slice(0, 4),
  };
}
