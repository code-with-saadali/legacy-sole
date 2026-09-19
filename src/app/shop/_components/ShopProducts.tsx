"use client";

import ProductCard from "../../_components/ProductCard";
import type { Product } from "../../_data/products";
import { SortDropdown } from "./ShopFilters";

export const sortOptions = [
  "Featured",
  "Price: low to high",
  "Price: high to low",
];

type ShopProductsProps = {
  products: Product[];
  totalCount: number;
  sort: string;
  onSortChange: (value: string) => void;
  onReset: () => void;
};

export default function ShopProducts({
  products,
  totalCount,
  sort,
  onSortChange,
  onReset,
}: ShopProductsProps) {
  return (
    <section className="min-w-0">
      <div className="relative mb-7 flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-5">
        <p className="text-[12px] text-black/45">
          Showing{" "}
          <span className="font-medium text-[#20211e]">{products.length}</span>{" "}
          of {totalCount} styles
        </p>

        <SortDropdown
          sort={sort}
          onSortChange={onSortChange}
          options={sortOptions}
        />
      </div>

      {products.length === 0 ? (
        <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[28px] border border-black/10 bg-[#ECE6DC] px-6 text-center">
          <p className="text-[26px] font-medium tracking-[-0.03em] text-[#20211e]">
            No pairs found.
          </p>

          <p className="mt-3 max-w-[340px] text-[13px] leading-6 text-black/45">
            Try a different search, category, colour or price range.
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
