"use client";

import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";
import Image from "./ProductImage";
import { useCatalog } from "./CatalogProvider";
import { categoryCollections } from "../_data/storefront";

const tones = ["bg-[#e9e2d7]", "bg-[#e2e6d9]", "bg-[#e9ded5]", "bg-[#e3e4e1]"];

export default function ShopByCategory() {
  const { products, loading, error } = useCatalog();
  const collections = categoryCollections(products);
  return (
    <section
      id="collections"
      aria-labelledby="collections-title"
      className="scroll-mt-28 bg-[#F4F1E9] px-[5%] py-16 lg:py-24"
    >
      <div className="mb-9 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-black/45">
            01 / Shop by category
          </p>
          <h2
            id="collections-title"
            className="mt-4 text-[clamp(38px,5vw,68px)] font-medium leading-[0.98] tracking-[-0.055em]"
          >
            Find your{" "}
            <span className="font-serif font-normal italic text-[#ed682c]">
              everyday.
            </span>
          </h2>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-3 border-b border-black/30 pb-2 text-xs font-medium"
        >
          Explore all shoes <FiArrowUpRight size={17} />
        </Link>
      </div>
      {loading && !collections.length && (
        <div role="status" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <span className="sr-only">Loading categories</span>
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className="aspect-[0.85] animate-pulse rounded-3xl bg-black/5"
            />
          ))}
        </div>
      )}
      {error && (
        <p role="alert" className="mb-5 text-sm text-black/60">
          We could not refresh the collection. Please try again shortly.
        </p>
      )}
      {!loading && !error && !collections.length && (
        <p className="py-8 text-sm text-black/55">
          New collections are on their way. Check back soon.
        </p>
      )}
      <div
        className={`grid grid-cols-2 gap-3 sm:gap-5 ${collections.length <= 2 ? "lg:grid-cols-2" : collections.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}
      >
        {collections.map((collection, index) => (
          <Link
            key={collection.name}
            href={collection.href}
            className={`group overflow-hidden rounded-[22px] sm:rounded-[28px] ${tones[index % tones.length]}`}
          >
            <div
              className={`relative aspect-square ${collections.length <= 2 ? "lg:aspect-[1.65]" : ""}`}
            >
              <span className="absolute left-4 top-4 z-10 text-[9px] tracking-[0.18em] text-black/40">
                {String(index + 1).padStart(2, "0")}
              </span>
              <Image
                src={collection.product.image}
                alt={`${collection.name} collection`}
                fill
                sizes={
                  collections.length <= 2
                    ? "45vw"
                    : "(max-width: 1023px) 45vw, 30vw"
                }
                className="object-contain p-[10%] drop-shadow-xl transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-105"
              />
            </div>
            <div className="flex items-end justify-between gap-2 border-t border-black/10 p-4 sm:p-6">
              <div className="min-w-0">
                <h3 className="wrap-break-word text-lg font-medium tracking-tight sm:text-2xl">
                  {collection.name}
                </h3>
                <p className="mt-2 text-[11px] text-black/50">
                  {collection.count}{" "}
                  {collection.count === 1 ? "style" : "styles"} to explore
                </p>
              </div>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/60 transition-colors group-hover:bg-[#20211e] group-hover:text-white sm:h-10 sm:w-10">
                <FiArrowUpRight />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
