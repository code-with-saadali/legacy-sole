import type { Product } from "../_data/products";

import { sizeStock } from "./inventory";
export type CartItem = Product & { quantity: number; size: string };
export const cartKey = "legacy-sole-cart";
export const sizes = ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10"];

export function parseCart(stored: string | null): CartItem[] {
  try {
    const parsed: unknown = JSON.parse(stored || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is CartItem =>
        item &&
        typeof item.slug === "string" &&
        sizes.includes(item.size) &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0 &&
        Number.isFinite(item.price) &&
        item.price >= 0 &&
        typeof item.name === "string" &&
        typeof item.image === "string",
    );
  } catch {
    return [];
  }
}

export function cartIssues(items: CartItem[], products: Product[]): string[] {
  const quantities = new Map<string, number>();
  for (const item of items)
    quantities.set(item.slug, (quantities.get(item.slug) ?? 0) + item.quantity);
  const issues: string[] = [];
  const sizeQuantities = new Map<string, number>();
  for (const item of items) {
    const key = `${item.slug}:${item.size}`;
    sizeQuantities.set(key, (sizeQuantities.get(key) ?? 0) + item.quantity);
  }
  for (const item of items) {
    const product = products.find((product) => product.slug === item.slug);
    if (
      product?.size_stock &&
      (sizeQuantities.get(`${item.slug}:${item.size}`) ?? 0) >
        sizeStock(product, item.size)
    )
      issues.push(
        `${product.name} (${product.color}, ${item.size}) does not have enough stock. Remove it and choose an available size.`,
      );
  }
  for (const [slug, quantity] of quantities) {
    const product = products.find((item) => item.slug === slug);
    if (!product)
      issues.push(
        "A product in your bag is no longer available. Please remove it.",
      );
    else if (quantity > (product.stock ?? 0))
      issues.push(
        product.name +
          " does not have enough stock. Please remove it and choose an available quantity.",
      );
  }
  return issues;
}
