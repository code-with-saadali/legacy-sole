import type { Product } from "./products";

export const productSizes = ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10"];
export const availableSizes = (product: Product) =>
  product.one_size ? ["One size"] : productSizes;

export function sizeStock(product: Product, size: string) {
  if (!availableSizes(product).includes(size)) return 0;
  return product.size_stock
    ? (product.size_stock[size] ?? 0)
    : (product.stock ?? 0);
}

export function inventoryError(product: Product) {
  if (product.one_size && product.size_stock)
    return "One-size products must use shared stock.";
  if (!product.size_stock) return "";
  if (
    Object.entries(product.size_stock).some(
      ([size, stock]) =>
        !productSizes.includes(size) ||
        !Number.isSafeInteger(stock) ||
        stock < 0,
    )
  ) {
    return "Size stock must contain non-negative whole numbers for UK sizes 6–10.";
  }
  return "";
}
