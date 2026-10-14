import Link from "next/link";
import type { Product } from "../_data/products";
import ProductImage from "./ProductImage";
import WishlistButton from "./WishlistButton";
import DiscountBadge from "./DiscountBadge";
import ProductPrice from "./ProductPrice";

export default function ProductCard({ product }: { product: Product }) {
  const displayName =
    product.name.length > 16 ? `${product.name.slice(0, 16)}...` : product.name;

  return (
    <article className="group min-w-0">
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#E9E2D7]">
        <Link
          href={`/products/${product.slug}`}
          className="relative block aspect-[0.95]"
        >
          <ProductImage
            src={product.image}
            alt={`${product.name}, ${product.color}`}
            fill
            sizes="(max-width:640px) 45vw, (max-width:1024px) 45vw, 28vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {product.tag && (
            <span className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] wrap-break-word sm:bottom-4 sm:left-4 rounded-full bg-[#F4F1E9] px-3 py-2 text-[9px] uppercase tracking-wider">
              {product.tag}
            </span>
          )}
        </Link>
        <WishlistButton
          product={product}
          className="absolute left-2 top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-[#F4F1E9] sm:left-4 sm:top-4"
        />
        <DiscountBadge
          product={product}
          className="absolute right-2 top-2 z-10 sm:right-4 sm:top-4"
        />
      </div>
      <div className="pt-3 sm:pt-5">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <Link
            href={`/products/${product.slug}`}
            aria-label={product.name}
            title={product.name}
            className="block min-w-0 truncate text-sm font-medium tracking-[-0.035em] text-[#20211e] sm:whitespace-normal sm:text-[21px]"
          >
            {displayName}
          </Link>
          <span
            className={`shrink-0 text-[9px] font-medium uppercase tracking-[0.12em] sm:text-[10px] ${
              (product.stock ?? 0) <= 5 ? "text-[#a04c2a]" : "text-black/50"
            }`}
          >
            Stock: {product.stock ?? 0}
          </span>
        </div>
        <div className="mt-1.5 flex min-w-0 items-center justify-between gap-2">
          <p className="truncate text-[11px] text-black/40">{product.color}</p>
          <ProductPrice
            product={product}
            className="shrink-0 text-[12px] sm:text-[13px]"
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-black/10 pt-3">
          <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-black/35">
            Unisex
          </p>
          <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-black/35">
            {product.category}
          </p>
        </div>
      </div>
    </article>
  );
}
