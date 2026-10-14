import type { Product } from "./products";

type DiscountedProduct = Pick<
  Product,
  "price" | "discount_percent" | "sale_price"
>;

export function discountPercent(product: DiscountedProduct): number {
  const percent = Math.min(90, Math.max(0, Math.round(product.discount_percent)));
  return percent > 0 && discountedPrice(product.price, percent) < product.price
    ? percent
    : 0;
}

export function discountedPrice(price: number, percent: number): number {
  return Math.round((price * (100 - percent)) / 100);
}

export function productSalePrice(product: DiscountedProduct): number {
  return discountedPrice(product.price, discountPercent(product));
}
