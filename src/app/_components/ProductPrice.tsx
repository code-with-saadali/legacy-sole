import { discountPercent, productSalePrice } from "../_data/discounts";
import type { Product } from "../_data/products";

export default function ProductPrice({
  product,
  className = "",
  quantity = 1,
}: {
  product: Pick<Product, "price" | "discount_percent" | "sale_price">;
  className?: string;
  quantity?: number;
}) {
  const percent = discountPercent(product);
  return (
    <span className={`inline-flex flex-col ${className}`}>
      <span className="font-semibold text-[#a64226]">
        Rs. {(productSalePrice(product) * quantity).toLocaleString("en-PK")}
      </span>
      {percent > 0 && (
        <span className="text-[0.8em] text-black/45 line-through">
          Rs. {(product.price * quantity).toLocaleString("en-PK")}
        </span>
      )}
    </span>
  );
}
