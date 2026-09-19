"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiArrowUpRight, FiSearch, FiX } from "react-icons/fi";
import { useCatalog } from "./CatalogProvider";
import ProductImage from "./ProductImage";

export default function NavbarSearch({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
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

  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    element?.showModal();
    input.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, []);

  return createPortal(
    <dialog
      ref={dialog}
      id="product-search"
      aria-labelledby="search-heading"
      data-lenis-prevent
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      className="scrollbar-hidden fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-2xl overflow-x-hidden overflow-y-auto overscroll-contain rounded-[24px] border border-black/10 bg-[#F4F1E9] p-0 text-[#20211e] shadow-[0_30px_100px_rgba(0,0,0,0.25)] backdrop:bg-[#20211e]/65 backdrop:backdrop-blur-md sm:rounded-[28px]"
    >
    <div>
    <div className="flex items-start justify-between gap-4 px-5 pb-5 pt-6 sm:px-8 sm:pt-8">
      <div>
        <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-[#956248]">The Legacy Sole collection</p>
        <h2 id="search-heading" className="mt-2 text-2xl tracking-tight sm:text-3xl">Find your next pair.</h2>
      </div>
      <button type="button" onClick={onClose} aria-label="Close search" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 hover:bg-[#E9E2D7] focus-visible:outline-2 focus-visible:outline-[#b66b4d]"><FiX size={18} /></button>
    </div>
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        const term = query.trim();
        if (!term) return;
        router.push(term ? `/shop?q=${encodeURIComponent(term)}` : "/shop");
        onClose();
      }}
      className="px-5 pb-5 sm:px-8 sm:pb-8"
    >
      <div className="flex items-center gap-3 rounded-2xl border border-black/15 bg-white p-2 pl-4 focus-within:border-[#b66b4d] focus-within:ring-2 focus-within:ring-[#b66b4d]/10">
      <FiSearch size={19} aria-hidden="true" className="shrink-0 text-[#956248]" />
      <label htmlFor="navbar-search" className="sr-only">
        Search products
      </label>
      <input
        ref={input}
        id="navbar-search"
        type="search"
        autoComplete="off"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Name, category or colour..."
        className="min-w-0 flex-1 bg-transparent py-3 text-base outline-none placeholder:text-black/35"
      />
      <button
        type="submit"
        disabled={!searchTerm}
        aria-label="See all search results"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#20211e] text-white hover:bg-[#956248] disabled:opacity-30"
      >
        <FiArrowUpRight size={19} />
      </button>
      </div>
      {!searchTerm && <div className="px-3 pb-5 pt-10 text-center"><FiSearch size={25} aria-hidden="true" className="mx-auto text-[#b66b4d]" /><p className="mt-4 text-sm font-medium">A good pair starts with a search.</p><p className="mt-2 text-xs leading-5 text-black/45">Type a name, colour or style to explore the collection.</p></div>}
      {searchTerm && (
        <div className="mt-5 w-full min-w-0 border-t border-black/10 pt-4">
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
              <ul className="flex flex-col divide-y divide-black/[0.07]">
                {matchingProducts.slice(0, 6).map((product) => (
                  <li key={product.slug}>
                    <Link
                      href={`/products/${product.slug}`}
                      onClick={() => onClose()}
                      className="group flex w-full items-center gap-3 rounded-xl py-3 transition-colors hover:bg-[#E9E2D7]/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#b66b4d] sm:gap-4 sm:px-2"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#E9E3D9] sm:h-20 sm:w-20">
                        <ProductImage
                          src={product.image}
                          alt={`${product.name}, ${product.color}`}
                          fill
                          sizes="80px"
                          className="object-contain p-1"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[#20211e]">
                          {product.name}
                        </p>
                        <p className="mt-1 truncate text-xs text-black/50">
                          {product.category} · {product.color}
                        </p>
                      </div>
                      <p className="shrink-0 text-xs font-semibold text-[#956248] sm:text-sm">Rs. {product.price.toLocaleString("en-PK")}</p>
                      <FiArrowUpRight aria-hidden="true" className="hidden shrink-0 text-black/35 sm:block" size={16} />
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={`/shop?q=${encodeURIComponent(searchTerm)}`}
                onClick={() => onClose()}
                className="mt-4 flex items-center justify-between gap-2 rounded-xl bg-[#20211e] px-5 py-3.5 text-xs font-medium text-white transition-colors hover:bg-[#956248]"
              >
                View all {matchingProducts.length} results{" "}
                <FiArrowUpRight aria-hidden="true" />
              </Link>
            </>
          )}
        </div>
      )}
    </form>
    </div>
    </dialog>,
    document.body,
  );
}
