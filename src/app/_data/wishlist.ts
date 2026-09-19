export const wishlistKey = "legacy-sole-wishlist";

export function readWishlist(): string[] {
  try {
    const stored = window.localStorage.getItem(wishlistKey);
    const parsed: unknown = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed)
      ? parsed.filter((slug): slug is string => typeof slug === "string")
      : [];
  } catch {
    return [];
  }
}

export function toggleWishlist(slug: string) {
  const current = readWishlist();
  const next = current.includes(slug)
    ? current.filter((item) => item !== slug)
    : [...current, slug];
  window.localStorage.setItem(wishlistKey, JSON.stringify(next));
  window.dispatchEvent(new Event("wishlist-updated"));
  return next.includes(slug);
}
