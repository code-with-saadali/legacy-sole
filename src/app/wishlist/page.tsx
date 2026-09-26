"use client";

import Image from "../_components/ProductImage";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FiArrowLeft, FiHeart } from "react-icons/fi";
import { useCatalog } from "../_components/CatalogProvider";
import { readWishlist, toggleWishlist } from "../_data/wishlist";

export default function WishlistPage() {
  const { products } = useCatalog();
  const [saved, setSaved] = useState<string[]>([]);
  const items = products.filter((product) => saved.includes(product.slug));

  useEffect(() => {
    const sync = () => setSaved(readWishlist());
    sync();
    window.addEventListener("wishlist-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("wishlist-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <main className="min-h-[70vh] bg-[#F4F1E9] px-[5%] pb-24 pt-12 lg:pt-20">
      <div className="content">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-black/50 hover:text-[#4b5a42]"
        >
          <FiArrowLeft size={14} /> Continue shopping
        </Link>
        <div className="mt-10 flex items-end justify-between border-b border-black/10 pb-6">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-black/40">
              Saved for later
            </p>
            <h1 className="mt-3 text-5xl text-[#20211e] sm:text-7xl">
              Favourites
            </h1>
          </div>
          <span className="text-xs text-black/45">{items.length} saved</span>
        </div>
        {!items.length ? (
          <div className="py-24 text-center">
            <FiHeart className="mx-auto text-black/25" size={28} />
            <p className="mt-5 text-sm text-black/50">
              Your favourite pairs will appear here.
            </p>
            <Link
              href="/shop"
              className="mt-7 inline-flex bg-[#4b5a42] px-6 py-4 text-[11px] font-medium uppercase tracking-[0.14em] text-white hover:bg-[#b66b4d]"
            >
              Explore the shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 py-8 sm:gap-5 lg:grid-cols-3">
            {items.map((product) => (
              <article key={product.slug}>
                <Link
                  href={`/products/${product.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-[1.05] bg-[#E9E2D7]">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="33vw"
                      className="object-contain p-[8%] transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex items-start justify-between pt-4">
                    <div>
                      <h2 className="text-2xl text-[#20211e]">
                        {product.name}
                      </h2>
                      <p className="mt-1 text-xs text-black/45">
                        {product.color}
                      </p>
                    </div>
                    <span className="text-xs">
                      Rs. {product.price.toLocaleString()}
                    </span>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    toggleWishlist(product.slug);
                    setSaved(readWishlist());
                  }}
                  className="mt-4 text-[10px] uppercase tracking-[0.14em] text-black/45 underline underline-offset-4 hover:text-[#b66b4d]"
                >
                  Remove from favourites
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
