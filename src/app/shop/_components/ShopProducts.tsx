"use client";

import Image from "../../_components/ProductImage";
import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";
import { SortDropdown } from "./ShopFilters";
import WishlistButton from "../../_components/WishlistButton";

export const sortOptions = ["Featured", "Price: low to high", "Price: high to low"];

type Product = {
  slug: string;
  name: string;
  color: string;
  price: number;
  category: string;
  tag: string;
  image: string;
};

type ShopProductsProps = {
  products: Product[];
  totalCount: number;
  sort: string;
  onSortChange: (value: string) => void;
  onReset: () => void;
};

export default function ShopProducts({ products, totalCount, sort, onSortChange, onReset }: ShopProductsProps) {
  return (
    <section className="min-w-0">
      <div className="relative mb-7 flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-5">
        <p className="text-[12px] text-black/45">
          Showing <span className="font-medium text-[#20211e]">{products.length}</span> of {totalCount} styles
        </p>

        <SortDropdown sort={sort} onSortChange={onSortChange} options={sortOptions} />
      </div>

      {products.length === 0 ? (
        <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[28px] border border-black/10 bg-[#ECE6DC] px-6 text-center">
          <p className="text-[26px] font-medium tracking-[-0.03em] text-[#20211e]">No pairs found.</p>

          <p className="mt-3 max-w-[340px] text-[13px] leading-6 text-black/45">
            Try changing the category, colour or price range.
          </p>

          <button
            type="button"
            onClick={onReset}
            className="mt-6 rounded-full bg-[#20211e] px-5 py-3 text-[11px] font-medium text-white transition-colors hover:bg-[#ed682c]"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid gap-x-5 gap-y-12 sm:grid-cols-2 xl:grid-cols-3 xl:gap-x-6">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group min-w-0">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[0.9] overflow-hidden rounded-[26px] bg-[#E9E3D9] lg:rounded-[30px]">
          <span className="absolute left-4 top-4 z-10 rounded-full border border-black/10 bg-[#F4F1E9]/85 px-3 py-2 text-[9px] font-medium uppercase tracking-[0.13em] text-black/55 backdrop-blur-md">
            {product.tag}
          </span>

          <WishlistButton product={product as Parameters<typeof WishlistButton>[0]["product"]} className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-[#F4F1E9]/80 text-black/50 backdrop-blur-md hover:border-[#ed682c] hover:bg-[#ed682c] hover:text-white" />

          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-[10%] -translate-x-1/2 whitespace-nowrap text-[clamp(54px,5vw,88px)] font-semibold tracking-[-0.08em] text-black/[0.03]"
          >
            SOLE
          </span>

          <div className="absolute inset-[6%]">
            <Image
              src={product.image}
              alt={`${product.name}, ${product.color}`}
              fill
              sizes="(max-width: 639px) 90vw, (max-width: 1279px) 42vw, 28vw"
              className="object-contain drop-shadow-[0_24px_22px_rgba(0,0,0,0.10)] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]"
            />
          </div>

          <div className="absolute inset-x-4 bottom-4 flex translate-y-2 items-center justify-between rounded-full border border-black/10 bg-[#F4F1E9]/88 px-4 py-3 opacity-0 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="text-[11px] font-medium text-[#20211e]">View Product</span>
            <FiArrowUpRight size={15} />
          </div>
        </div>

        <div className="pt-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[22px] font-medium tracking-[-0.035em] text-[#20211e]">{product.name}</h2>
              <p className="mt-2 text-[12px] text-black/45">{product.color}</p>
            </div>

            <strong className="shrink-0 text-[13px] font-medium text-[#20211e]">
              Rs. {product.price.toLocaleString()}
            </strong>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-3">
            <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-black/35">Unisex</span>
            <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-black/35">
              {product.category}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}