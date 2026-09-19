"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";
import { supabase } from "../../lib/supabase";
import { bestsellerSelection } from "../_data/storefront";
import { useCatalog } from "./CatalogProvider";
import Image from "./ProductImage";
import WishlistButton from "./WishlistButton";

export default function BestSellers() {
  const { products } = useCatalog();
  const [slugs, setSlugs] = useState<string[]>([]);
  useEffect(() => {
    const client = supabase;
    if (!client) return;
    let active = true;
    let version = 0;
    const load = async () => {
      const request = ++version;
      const { data, error } = await client.rpc("store_bestsellers");
      if (active && request === version && !error)
        setSlugs((data ?? []).map((row: { slug: string }) => row.slug));
    };
    void load();
    const resume = () => {
      if (document.visibilityState === "visible") void load();
    };
    window.addEventListener("focus", resume);
    return () => {
      active = false;
      window.removeEventListener("focus", resume);
    };
  }, []);
  const selection = bestsellerSelection(products, slugs);
  if (!selection.products.length) return null;
  return (
    <section
      id="best-sellers"
      aria-labelledby="bestsellers-title"
      className={`scroll-mt-28 bg-[#e9ecdf] px-[5%] py-16 lg:py-24 ${selection.products.length === 1 ? "lg:grid lg:grid-cols-2 lg:items-center lg:gap-14" : ""}`}
    >
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#4b5a42]">
            02 /{" "}
            {selection.isBestseller
              ? "Customer favourites"
              : "Selected by Legacy Sole"}
          </p>
          <h2
            id="bestsellers-title"
            className="mt-4 text-[clamp(38px,5vw,68px)] font-medium leading-none tracking-[-0.055em]"
          >
            {selection.isBestseller ? "The most-loved" : "The curated"}{" "}
            <span className="font-serif font-normal italic text-[#4b5a42]">
              pairs.
            </span>
          </h2>
          <p className="mt-4 max-w-lg text-xs leading-6 text-black/55">
            {selection.isBestseller
              ? "Best sellers, ranked by pairs ordered across confirmed, dispatched and delivered orders."
              : "A considered selection from our featured collection. Find a pair that feels like you."}
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-3 rounded-full border border-[#4b5a42]/25 px-5 py-3 text-xs"
        >
          Shop the collection <FiArrowUpRight />
        </Link>
      </div>
      <div
        className={`grid gap-x-4 gap-y-8 ${selection.products.length === 1 ? "mx-auto w-full max-w-md grid-cols-1" : "grid-cols-2 lg:grid-cols-4"}`}
      >
        {selection.products.map((product, index) => (
          <article key={product.slug} className="group min-w-0">
            <div className="relative overflow-hidden rounded-3xl bg-[#f6f5ee]">
              <Link
                href={`/products/${product.slug}`}
                className="relative block aspect-[0.95]"
              >
                <span className="absolute left-3 top-4 z-10 rounded-full bg-white/80 px-3 py-1.5 text-[9px] text-[#4b5a42]">
                  {selection.isBestseller
                    ? `Best seller / ${String(index + 1).padStart(2, "0")}`
                    : "Featured"}
                </span>
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes={
                    selection.products.length === 1
                      ? "(max-width: 767px) 90vw, 448px"
                      : "(max-width: 1023px) 45vw, 23vw"
                  }
                  className="object-contain p-[10%] transition-transform duration-500 group-hover:scale-105"
                />
              </Link>
              <div className="absolute bottom-3 right-3">
                <WishlistButton product={product} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-[9px] uppercase tracking-[0.12em] text-black/45">
                {product.category}
              </p>
              <Link
                href={`/products/${product.slug}`}
                className="mt-2 block wrap-break-word text-base font-medium tracking-tight sm:text-xl"
              >
                {product.name}
              </Link>
              <p className="mt-2 text-xs text-black/60">
                Rs. {product.price.toLocaleString()}
              </p>
              <Link
                href={`/products/${product.slug}`}
                className="mt-4 inline-flex items-center gap-2 text-[11px] font-medium text-[#4b5a42]"
              >
                Choose your size <FiArrowUpRight />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
