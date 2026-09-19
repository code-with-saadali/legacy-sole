export const shopSorts = {
  featured: "Featured",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
} as const;

export function readShopFilters(params: Pick<URLSearchParams, "get">) {
  const price = params.get("maxPrice");
  const parsedPrice = price?.trim() ? Number(price) : NaN;
  const sortKey = params.get("sort") ?? "featured";
  return {
    category: params.get("category")?.trim() || "All shoes",
    colour: params.get("colour")?.trim() || "All colours",
    maxPrice:
      Number.isSafeInteger(parsedPrice) && parsedPrice >= 0
        ? parsedPrice
        : null,
    sort: shopSorts[sortKey as keyof typeof shopSorts] ?? "Featured",
  };
}

export function shopFilterUrl(
  currentUrl: string,
  changes: Record<string, string | null>,
) {
  const url = new URL(currentUrl);
  for (const [key, value] of Object.entries(changes)) {
    if (value === null) url.searchParams.delete(key);
    else url.searchParams.set(key, value);
  }
  return url.pathname + url.search + url.hash;
}
