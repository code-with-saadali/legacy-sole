import type { Product } from "./products";

export const productSizes = ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10"];
export const availableSizes = (product: Product) =>
  product.one_size
    ? ["One size"]
    : (product.sizes ?? productSizes);

export function sizeStock(product: Product, size: string) {
  if (!availableSizes(product).includes(size)) return 0;
  return product.size_stock
    ? (product.size_stock[size] ?? 0)
    : (product.stock ?? 0);
}

export function inventoryError(product: Product) {
  if (product.one_size && product.size_stock)
    return "One-size products must use shared stock.";
  if (!Number.isSafeInteger(product.stock ?? 0) || (product.stock ?? 0) < 0)
    return "Total stock must be a non-negative whole number.";
  if (
    !availableSizes(product).length ||
    availableSizes(product).some(
      (size) => !size.trim() || size.length > 40,
    ) ||
    new Set(availableSizes(product).map((size) => size.trim().toLowerCase()))
      .size !== availableSizes(product).length
  )
    return "Add unique sizes between 1 and 40 characters.";
  if (!product.size_stock) return "";
  if (
    Object.entries(product.size_stock).some(
      ([size, stock]) =>
        !size.trim() ||
        size.length > 40 ||
        !Number.isSafeInteger(stock) ||
        stock < 0,
    )
  ) {
    return "Size stock must contain non-negative whole numbers for the sizes listed.";
  }
  return "";
}
