"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FiArrowUpRight, FiSliders, FiX } from "react-icons/fi";
import ProductImage from "./ProductImage";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  readShopFilters,
  shopFilterUrl,
  shopSorts,
} from "../_data/shop-filters";
import { useCatalog } from "./CatalogProvider";
import { menuCategories } from "../_data/navigation";
import { useStoreSettings } from "./StoreSettingsProvider";
import { categoryImages } from "../_data/category-images";
import ShopFilters from "../shop/_components/ShopFilters";
import ShopProducts from "../shop/_components/ShopProducts";

export default function ShopClient() {
  const { settings } = useStoreSettings();
  const navigationCategories = menuCategories(settings.menu_columns);
  const {
    products,
    categories: databaseCategories,
    loading,
    error,
  } = useCatalog();
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const { category, colour, maxPrice, sort } = readShopFilters(searchParams);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const productsRef = useRef<HTMLDivElement>(null);
  const previousSearch = useRef<string | null>(null);
  useEffect(() => {
    if (loading) return;
    const searchKey = JSON.stringify([category, query]);
    if (previousSearch.current === searchKey) return;
    const shouldScroll =
      previousSearch.current !== null || category !== "All shoes" || !!query;
    if (!shouldScroll) {
      previousSearch.current = searchKey;
      return;
    }

    // Wait for the filtered grid and mobile sidebar to finish laying out.
    const frame = requestAnimationFrame(() => {
      previousSearch.current = searchKey;
      productsRef.current?.scrollIntoView({
        block: "start",
        behavior: "instant",
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [category, query, loading]);
  const categoryProducts = useMemo(
    () =>
      products.filter(
        (product) => category === "All shoes" || product.category === category,
      ),
    [products, category],
  );
  const availableColours = useMemo(
    () =>
      [
        ...new Set(
          categoryProducts
            .map((product) => product.color)
            .filter((color) => color.trim()),
        ),
      ].sort(),
    [categoryProducts],
  );
  const activeColour = availableColours.includes(colour)
    ? colour
    : "All colours";
  const updateFilters = (
    changes: Record<string, string | null>,
    replace = false,
  ) => {
    // Read the latest URL so rapid interactions preserve each other's filters.
    const next = shopFilterUrl(window.location.href, changes);
    const current =
      window.location.pathname + window.location.search + window.location.hash;
    if (next === current) return;
    if (replace) window.history.replaceState(null, "", next);
    else window.history.pushState(null, "", next);
  };
  const categories = [
    "All shoes",
    ...Array.from(
      new Set([
        ...navigationCategories,
        ...databaseCategories,
        ...products.map((product) => product.category),
      ]),
    ),
  ];

  const visibleProducts = useMemo(() => {
    const filtered = categoryProducts.filter((product) => {
      const matchesColour =
        activeColour === "All colours" || product.color === activeColour;
      const searchable =
        `${product.name} ${product.category} ${product.color} ${product.slug}`.toLowerCase();
      const matchesSearch = query
        .toLowerCase()
        .split(/\s+/)
        .every((word) => searchable.includes(word));

      return (
        matchesSearch &&
        matchesColour &&
        product.price <= (maxPrice ?? Infinity)
      );
    });

    return [...filtered].sort((first, second) => {
      if (sort === "Price: low to high") return first.price - second.price;
      if (sort === "Price: high to low") return second.price - first.price;
      return Number(second.featured) - Number(first.featured);
    });
  }, [activeColour, maxPrice, categoryProducts, sort, query]);

  const resetFilters = () => {
    updateFilters({
      category: null,
      colour: null,
      maxPrice: null,
      sort: null,
      q: null,
    });
  };

  return (
    <main className="min-h-screen bg-[#F4F1E9] px-[5%] pb-24 pt-10 lg:pb-28 lg:pt-14">
      <section className="border-b border-black/10 pb-8 lg:pb-10">
        <div className="flex items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-[#ed682c]" />
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-black/45 sm:text-xs"
            >
              <Link href="/">Legacy Sole</Link>
              <span aria-hidden="true">/</span>
              <Link
                href="/shop"
                aria-current={category === "All shoes" ? "page" : undefined}
              >
                Shop
              </Link>
              {category !== "All shoes" && (
                <>
                  <span aria-hidden="true">/</span>
                  <span aria-current="page">{category}</span>
                </>
              )}
            </nav>
          </div>

          <p className="hidden text-[11px] uppercase tracking-[0.16em] text-black/35 sm:block">
            {products.length.toString().padStart(2, "0")} Styles
          </p>
        </div>

        <div className="mt-7 grid overflow-hidden rounded-[28px] bg-[#E9E2D7] md:grid-cols-[1.3fr_1fr]">
          <div className="flex flex-col justify-center px-7 py-10 sm:px-10 lg:px-12">
            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#76624f]">
              The Legacy Sole collection
            </p>
            <h1 className="text-[clamp(46px,6vw,84px)] font-medium leading-[0.95] tracking-[-0.055em] text-[#20211e]">
              {category === "All shoes" ? (
                <>
                  Find your
                  <br />
                  <span className="text-[#b64b18]">next pair.</span>
                </>
              ) : (
                <>
                  {category}
                  <span className="text-[#b64b18]">.</span>
                </>
              )}
            </h1>
            <p className="mt-5 max-w-80 text-sm leading-6 text-black/55">
              A fresh rotation for wherever the day takes you. Explore the
              details. Find your fit.
            </p>
            <a
              href="#shop-products"
              className="mt-6 inline-flex w-fit items-center gap-3 border-b border-[#20211e]/30 pb-1 text-xs font-medium"
            >
              Explore{" "}
              {category === "All shoes"
                ? "the collection"
                : category.toLowerCase()}{" "}
              <FiArrowUpRight aria-hidden="true" />
            </a>
          </div>
          <div className="relative hidden min-h-72 md:block">
            <ProductImage
              src={
                categoryProducts[0]?.image ||
                categoryImages[category] ||
                "/images/shoes/runner-cutout.png"
              }
              alt={categoryProducts[0]?.name || `${category} collection`}
              fill
              sizes="45vw"
              className="object-contain p-8 lg:p-10"
            />
          </div>
        </div>
      </section>

      <div className="mt-7 flex items-center justify-between lg:hidden">
        <button
          type="button"
          aria-expanded={filtersOpen}
          aria-controls="shop-filters"
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="inline-flex items-center gap-2 rounded-full border border-black/15 px-5 py-3 text-sm"
        >
          <FiSliders aria-hidden="true" />{" "}
          {filtersOpen ? "Hide filters" : "Filter collection"}
        </button>
        <span className="text-xs text-black/50">
          {visibleProducts.length} styles
        </span>
      </div>
      <div className="mt-7 grid items-start gap-8 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[270px_minmax(0,1fr)]">
        <div
          id="shop-filters"
          className={`${filtersOpen ? "block" : "hidden"} lg:sticky lg:top-28 lg:block`}
        >
          <ShopFilters
            category={category}
            onCategoryChange={(value) => {
              setFiltersOpen(false);
              updateFilters({
                category: value === "All shoes" ? null : value,
                colour: null,
              });
            }}
            colour={activeColour}
            onColourChange={(value) =>
              updateFilters({ colour: value === "All colours" ? null : value })
            }
            maxPrice={
              maxPrice ??
              Math.max(1, ...products.map((product) => product.price))
            }
            priceLimit={Math.max(
              1,
              maxPrice ?? 0,
              ...products.map((product) => product.price),
            )}
            colours={availableColours}
            onMaxPriceChange={(value) =>
              updateFilters({ maxPrice: String(value) }, true)
            }
            onReset={resetFilters}
            categories={categories}
          />
        </div>

        <div
          ref={productsRef}
          id="shop-products"
          className="min-w-0 scroll-mt-28"
        >
          {(activeColour !== "All colours" || maxPrice !== null) && (
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs text-black/45">Selected:</span>
              {activeColour !== "All colours" && (
                <button
                  type="button"
                  onClick={() => updateFilters({ colour: null })}
                  className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white/40 px-3 py-2 text-xs"
                  aria-label={`Remove ${activeColour} filter`}
                >
                  {activeColour}
                  <FiX aria-hidden="true" />
                </button>
              )}
              {maxPrice !== null && (
                <button
                  type="button"
                  onClick={() => updateFilters({ maxPrice: null })}
                  className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white/40 px-3 py-2 text-xs"
                  aria-label="Remove maximum price filter"
                >
                  Up to Rs. {maxPrice.toLocaleString()}
                  <FiX aria-hidden="true" />
                </button>
              )}
            </div>
          )}
          {query && (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <p role="status" className="text-sm text-black/65">
                Search results for <strong>&ldquo;{query}&rdquo;</strong>
              </p>
              <button
                type="button"
                onClick={() => updateFilters({ q: null })}
                className="text-sm underline underline-offset-4"
              >
                Clear search
              </button>
            </div>
          )}
          {loading && (
            <div role="status" className="grid grid-cols-2 gap-5">
              <span className="sr-only">Loading products...</span>
              {[0, 1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="aspect-[0.8] animate-pulse rounded-3xl bg-[#E9E2D7] motion-reduce:animate-none"
                />
              ))}
            </div>
          )}
          {error && (
            <p role="alert">
              Unable to refresh products. Please try again shortly.
            </p>
          )}
          {!loading && (
            <ShopProducts
              category={category}
              categoryImage={
                products.find((product) => product.category === category)
                  ?.image ||
                categoryImages[category] ||
                "/images/shoes/runner-cutout.png"
              }
              products={visibleProducts}
              totalCount={categoryProducts.length}
              sort={sort}
              onSortChange={(value) =>
                updateFilters({
                  sort:
                    value === "Featured"
                      ? null
                      : (Object.entries(shopSorts).find(
                          ([, label]) => label === value,
                        )?.[0] ?? null),
                })
              }
              onReset={resetFilters}
            />
          )}
        </div>
      </div>
    </main>
  );
}
