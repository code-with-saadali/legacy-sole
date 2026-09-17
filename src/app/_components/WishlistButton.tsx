"use client";

import { useEffect, useState } from "react";
import { FiHeart } from "react-icons/fi";
import type { Product } from "../_data/products";

export const wishlistKey = "legacy-sole-wishlist";

export function readWishlist(): string[] {
  try {
    const stored = window.localStorage.getItem(wishlistKey);
    const parsed: unknown = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed.filter((slug): slug is string => typeof slug === "string") : [];
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

export default function WishlistButton({ product, className = "" }: { product: Product; className?: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const update = () => setSaved(readWishlist().includes(product.slug));
    update();
    window.addEventListener("wishlist-updated", update);
    window.addEventListener("storage", update);
    return () => { window.removeEventListener("wishlist-updated", update); window.removeEventListener("storage", update); };
  }, [product.slug]);

  return (
    <button
      type="button"
      aria-label={saved ? `Remove ${product.name} from favourites` : `Add ${product.name} to favourites`}
      aria-pressed={saved}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setSaved(toggleWishlist(product.slug));
      }}
      className={`transition-all ${className} ${saved ? "border-[#b66b4d] bg-[#b66b4d] text-white" : ""}`}
    >
      <FiHeart size={16} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
