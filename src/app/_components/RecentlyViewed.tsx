"use client";

import Image from "./ProductImage";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCatalog } from "./CatalogProvider";

const recentKey = "legacy-sole-recently-viewed";

export function rememberProduct(slug: string) {
  try {
    const parsed = JSON.parse(localStorage.getItem(recentKey) || "[]");
    const current: string[] = Array.isArray(parsed) ? parsed : [];
    localStorage.setItem(recentKey, JSON.stringify([slug, ...current.filter(item => item !== slug)].slice(0, 4)));
    window.dispatchEvent(new Event("recent-updated"));
  } catch { /* Browsing still works if local storage is unavailable. */ }
}

export default function RecentlyViewed() {
  const { products } = useCatalog();
  const [slugs, setSlugs] = useState<string[]>([]);
  useEffect(() => {
    const sync = () => { try { const value = JSON.parse(localStorage.getItem(recentKey) || "[]"); setSlugs(Array.isArray(value) ? value : []); } catch { setSlugs([]); } };
    sync();
    window.addEventListener("recent-updated", sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener("recent-updated", sync); window.removeEventListener("storage", sync); };
  }, []);
  const recent = slugs.flatMap(slug => { const product = products.find(item => item.slug === slug); return product ? [product] : []; });

  if (!recent.length) return null;

  return (
    <section className="bg-[#F4F1E9] px-[5%] pb-20 pt-8 lg:pb-28" aria-labelledby="recent-title">
      <div className="mx-auto max-w-[1700px] border-t border-black/10 pt-8">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-black/40">Your edit</p>
        <h2 id="recent-title" className="mt-3 text-4xl text-[#20211e] sm:text-5xl">Recently viewed.</h2>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recent.map((product) => (
            <Link key={product.slug} href={`/products/${product.slug}`} className="group block">
              <div className="relative aspect-[1.15] overflow-hidden bg-[#E9E3D9]"><Image src={product.image} alt={product.name} fill sizes="25vw" className="object-contain p-[8%] transition-transform duration-500 group-hover:scale-105" /></div>
              <div className="flex items-center justify-between pt-3"><h3 className="text-lg text-[#20211e]">{product.name}</h3><span className="text-[11px]">Rs. {product.price.toLocaleString()}</span></div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
