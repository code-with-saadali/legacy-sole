import { discountPercent } from "../_data/discounts";
import type { Product } from "../_data/products";

export default function DiscountBadge({
  product,
  className = "",
}: {
  product: Pick<Product, "price" | "discount_percent" | "sale_price">;
  className?: string;
}) {
  const percent = discountPercent(product);
  if (!percent) return null;
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full bg-[#a64226] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm ${className}`}
    >
      {percent}% OFF
    </span>
  );
}
