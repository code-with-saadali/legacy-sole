"use client";

import { useState } from "react";
import Image from "./ProductImage";
import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";

import { useCatalog } from "./CatalogProvider";
import WishlistButton from "./WishlistButton";

export default function ProductLineup() {
  const { products, loading, error } = useCatalog();
  const [filter, setFilter] = useState("All shoes");
  const filters = [
    "All shoes",
    ...Array.from(new Set(products.map((product) => product.category))),
  ];

  const visible = products.filter(
    (product) =>
      filter === "All shoes" ||
      !filters.includes(filter) ||
      product.category === filter,
  );

  return (
    <section
      id="collection"
      aria-labelledby="collection-title"
      className="scroll-mt-28 bg-[#F8F6F1] px-[5%] py-16 lg:py-24"
    >
      <div className="grid gap-6 border-b border-black/10 pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ed682c]" />

            <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-black/40 sm:text-[10px]">
              The Line-Up / Legacy Sole
            </p>
          </div>

          <h2
            id="collection-title"
            className="mt-4 max-w-190 text-[clamp(40px,5vw,68px)] font-medium leading-[0.95] tracking-[-0.055em] text-[#20211e]"
          >
            Your everyday
            <br />
            <span className="font-serif font-normal italic text-[#ed682c]">
              rotation, refined.
            </span>
          </h2>
        </div>

        <p className="max-w-77.5 text-[12px] leading-6 text-black/45 sm:text-[13px]">
          Three silhouettes designed around comfort, versatility and the way
          your day actually moves.
        </p>
      </div>

      <div className="flex flex-col gap-5 py-7 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => {
            const active = filter === item;

            return (
              <button
                key={item}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(item)}
                className={`rounded-full border px-4 py-2 text-[11px] font-medium transition-all duration-300 ${
                  active
                    ? "border-[#20211e] bg-[#20211e] text-white"
                    : "border-black/10 bg-transparent text-black/55 hover:border-black/25 hover:text-black"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        <p className="text-[10px] uppercase tracking-[0.16em] text-black/30">
          {visible.length.toString().padStart(2, "0")} Styles
        </p>
      </div>

      {loading && <p role="status">Loading collection...</p>}
      {error && (
        <p role="alert">
          Unable to refresh the collection. Please try again shortly.
        </p>
      )}
      {!loading && !error && !products.length && (
        <p>No products are available yet.</p>
      )}
      <div className="grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-6">
        {visible.map((product) => (
          <article key={product.slug} className="group min-w-0">
            <Link href={`/products/${product.slug}`} className="block">
              <div className="relative aspect-[1.08] overflow-hidden rounded-[26px] bg-[#EAE3D8] lg:rounded-[30px]">
                <div className="absolute left-5 top-5 z-10 flex items-center rounded-full border border-black/10 bg-[#F8F6F1]/85 px-3 py-2 backdrop-blur-md">
                  <span className="text-[8px] font-medium uppercase tracking-[0.16em] text-black/55">
                    {product.featured ? "Featured / " : ""}
                    {product.tag}
                  </span>
                </div>

                <WishlistButton
                  product={product}
                  className="absolute right-5 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-[#F8F6F1]/80 text-[#20211e] backdrop-blur-md hover:border-[#ed682c] hover:bg-[#ed682c] hover:text-white"
                />

                <span className="pointer-events-none absolute left-1/2 top-[10%] -translate-x-1/2 whitespace-nowrap text-[clamp(52px,6vw,90px)] font-semibold tracking-[-0.08em] text-black/[0.035]">
                  SOLE
                </span>

                <div className="absolute inset-[7%]">
                  <Image
                    src={product.image}
                    alt={`${product.name}, ${product.color}`}
                    fill
                    sizes="(max-width: 639px) 90vw, (max-width: 1023px) 45vw, 30vw"
                    className="object-contain drop-shadow-[0_26px_24px_rgba(0,0,0,0.1)] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]"
                  />
                </div>

                <div className="absolute inset-x-5 bottom-5 flex translate-y-3 items-center justify-between rounded-full border border-black/10 bg-[#F8F6F1]/90 px-4 py-3 opacity-0 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <span className="text-[10px] font-medium text-[#20211e]">
                    View Product
                  </span>

                  <FiArrowUpRight size={14} />
                </div>
              </div>

              <div className="pt-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-[19px] font-medium tracking-[-0.035em] text-[#20211e] sm:text-[21px]">
                      {product.name}
                    </h3>

                    <p className="mt-1.5 text-[11px] text-black/40">
                      {product.color}
                    </p>
                  </div>

                  <strong className="shrink-0 text-[12px] font-medium text-[#20211e] sm:text-[13px]">
                    Rs. {product.price.toLocaleString()}
                  </strong>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-3">
                  <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-black/35">
                    Unisex
                  </p>

                  <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-black/35">
                    {product.category}
                  </p>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
