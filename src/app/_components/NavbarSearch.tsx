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
  const categories = [
    ...new Set(products.map((product) => product.category).filter(Boolean)),
  ].slice(0, 6);
  const suggestions = products
    .filter((product) => (product.stock ?? 0) > 0)
    .slice(0, 3);
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
    const position = () => {
      if (!element) return;
      const top =
        document.querySelector("header.site-chrome")?.getBoundingClientRect()
          .bottom ?? 88;
      element.style.top = `${top}px`;
      element.style.maxHeight = `calc(100dvh - ${top}px)`;
    };
    position();
    window.addEventListener("resize", position);
    const previousOverflow = document.body.style.overflow;
    element?.showModal();
    input.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("resize", position);
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
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="scrollbar-hidden fixed inset-x-0 bottom-auto m-0 w-full max-w-none overflow-x-hidden overflow-y-auto overscroll-contain border-0 border-b border-black/10 bg-[#F4F1E9] p-0 text-[#20211e] shadow-[0_24px_40px_-30px_rgba(32,33,30,0.25)] backdrop:bg-black/10"
    >
      <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 sm:py-10">
        <div className="mb-7 flex items-center justify-between gap-4">
          <div>
            <p className="text-[9px] uppercase tracking-[0.24em] text-[#687451]">
              Explore Legacy Sole
            </p>
            <h2
              id="search-heading"
              className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl"
            >
              Find your everyday pair.
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/10 text-black/50 transition-colors hover:bg-[#E9E2D7] focus-visible:outline-2"
          >
            <FiX size={20} />
          </button>
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
          className="pb-2"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-black/15 bg-[#F8F6F1] px-4 transition-shadow focus-within:border-[#687451]/50 focus-within:ring-4 focus-within:ring-[#687451]/5 sm:gap-5 sm:px-6">
            <FiSearch
              size={19}
              aria-hidden="true"
              className="shrink-0 text-[#687451]"
            />
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
              className="min-w-0 flex-1 bg-transparent py-5 text-base outline-none placeholder:text-black/35 sm:py-6 sm:text-xl [&::-webkit-search-cancel-button]:appearance-none"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  input.current?.focus();
                }}
                aria-label="Clear search"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-black/45 hover:bg-black/5"
              >
                <FiX size={18} />
              </button>
            )}
            <button
              type="submit"
              disabled={!searchTerm}
              aria-label="View search results"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#4b5a42] text-white transition-colors hover:bg-[#35422e] disabled:bg-black/5 disabled:text-black/25"
            >
              <FiArrowUpRight size={20} />
            </button>
          </div>
          {!searchTerm && (
            <div className="mt-8 grid gap-8 pb-3 md:grid-cols-[1fr_2fr]">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-black/45">
                  Browse by style
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Link
                      key={category}
                      href={`/shop?category=${encodeURIComponent(category)}`}
                      onClick={onClose}
                      className="rounded-full border border-black/10 px-4 py-2.5 text-xs transition-colors hover:border-[#687451] hover:bg-[#F8F6F1]"
                    >
                      {category}
                    </Link>
                  ))}
                </div>
                <p className="mt-5 max-w-xs text-xs leading-6 text-black/45">
                  Search by name, colour or category. Your next favourite is a
                  few letters away.
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-black/45">
                  Discover the collection
                </p>
                <div className="mt-4 grid grid-cols-3 gap-3 sm:gap-5">
                  {suggestions.map((product) => (
                    <Link
                      key={product.slug}
                      href={`/products/${product.slug}`}
                      onClick={onClose}
                      className="group min-w-0"
                    >
                      <div className="relative aspect-[1.2] overflow-hidden rounded-xl bg-[#E9E3D9]">
                        <ProductImage
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="(max-width: 767px) 28vw, 220px"
                          className="object-contain p-3 transition-transform duration-300 motion-safe:group-hover:scale-105"
                        />
                      </div>
                      <p className="mt-3 text-xs font-medium sm:text-sm">
                        {product.name}
                      </p>
                      <p className="mt-1 text-[10px] text-black/45 sm:text-xs">
                        Rs. {product.price.toLocaleString("en-PK")}
                      </p>
                    </Link>
                  ))}
                </div>
                {loading && (
                  <p role="status" className="mt-4 text-xs">
                    Loading collection...
                  </p>
                )}
                {error && (
                  <p role="alert" className="mt-4 text-xs">
                    Unable to refresh the collection.
                  </p>
                )}
              </div>
            </div>
          )}
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
                    {matchingProducts.slice(0, 12).map((product) => (
                      <li key={product.slug}>
                        <Link
                          href={`/products/${product.slug}`}
                          onClick={() => onClose()}
                          className="group flex w-full items-center gap-4 py-5 transition-colors hover:bg-[#E9E2D7]/40 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#687451] sm:gap-5"
                        >
                          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#E9E3D9] sm:h-24 sm:w-24">
                            <ProductImage
                              src={product.image}
                              alt={`${product.name}, ${product.color}`}
                              fill
                              sizes="96px"
                              className="object-contain p-2 transition-transform duration-300 motion-safe:group-hover:scale-105"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-lg font-serif tracking-tight text-[#20211e] sm:text-2xl">
                              {product.name}
                            </p>
                            <p className="mt-2 text-[10px] uppercase tracking-wider text-black/45 sm:text-xs">
                              {product.category} · {product.color}
                            </p>
                          </div>
                          <p className="shrink-0 text-xs font-semibold text-[#956248] sm:text-sm">
                            Rs. {product.price.toLocaleString("en-PK")}
                          </p>
                          <FiArrowUpRight
                            aria-hidden="true"
                            className="hidden shrink-0 text-black/35 sm:block"
                            size={16}
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/shop?q=${encodeURIComponent(searchTerm)}`}
                    onClick={() => onClose()}
                    className="mt-4 flex items-center justify-between gap-2 border-t border-black/10 py-4 text-sm font-medium text-[#4b5a42] hover:underline"
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
