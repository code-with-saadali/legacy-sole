"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiArrowUpRight } from "react-icons/fi";
import { useCatalog } from "./CatalogProvider";
import ProductImage from "./ProductImage";

export default function NavbarSearch({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { products, loading, error } = useCatalog();
  const searchTerm = query.trim();
  const matchingProducts = searchTerm
    ? products.filter((product) => {
        const text =
          `${product.name} ${product.category} ${product.color} ${product.slug}`.toLowerCase();
        return searchTerm
          .toLowerCase()
          .split(/\s+/)
          .every((word) => text.includes(word));
      })
    : [];

  return (
    <form
      id="product-search"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        const term = query.trim();
        router.push(term ? `/shop?q=${encodeURIComponent(term)}` : "/shop");
        onClose();
      }}
      className="flex flex-wrap items-center gap-3 border-t border-black/10 px-[5%] py-4"
    >
      <label htmlFor="navbar-search" className="sr-only">
        Search products
      </label>
      <input
        id="navbar-search"
        type="search"
        autoFocus
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by name, category or colour..."
        className="min-w-0 flex-1 rounded-full border border-black/15 bg-white px-4 py-3 text-sm outline-none focus:border-[#b66b4d]"
      />
      <button
        type="submit"
        className="rounded-full bg-[#20211e] px-5 py-3 text-sm text-white hover:bg-[#b66b4d]"
      >
        Search
      </button>
      {searchTerm && (
        <div className="w-full min-w-0 border-t border-black/10 pt-3">
          <p role="status" className="mb-3 text-xs text-black/55">
            {loading
              ? "Loading products..."
              : error
                ? "Unable to refresh products. Please try again shortly."
                : matchingProducts.length
                  ? `${matchingProducts.length} products found`
                  : "No products found. Try another name, category or colour."}
          </p>
          {matchingProducts.length > 0 && (
            <>
              <ul
                data-lenis-prevent
                className="grid max-h-[min(50dvh,420px)] gap-2 overflow-y-auto overscroll-contain sm:grid-cols-2 lg:grid-cols-3"
              >
                {matchingProducts.slice(0, 6).map((product) => (
                  <li key={product.slug}>
                    <Link
                      href={`/products/${product.slug}`}
                      onClick={() => onClose()}
                      className="flex items-center gap-3 rounded-xl border border-black/5 bg-white/50 p-3 transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-[#b66b4d]"
                    >
                      <div className="relative h-20 w-20 shrink-0 rounded-lg bg-[#E9E3D9]">
                        <ProductImage
                          src={product.image}
                          alt={`${product.name}, ${product.color}`}
                          fill
                          sizes="80px"
                          className="object-contain p-1"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[#20211e]">
                          {product.name}
                        </p>
                        <p className="mt-1 truncate text-xs text-black/50">
                          {product.category} · {product.color}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-[#b66b4d]">
                          Rs. {product.price.toLocaleString()}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={`/shop?q=${encodeURIComponent(searchTerm)}`}
                onClick={() => onClose()}
                className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[#20211e] underline underline-offset-4"
              >
                View all {matchingProducts.length} results{" "}
                <FiArrowUpRight aria-hidden="true" />
              </Link>
            </>
          )}
        </div>
      )}
    </form>
  );
}
