"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  readShopFilters,
  shopFilterUrl,
  shopSorts,
} from "../_data/shop-filters";
import { useCatalog } from "./CatalogProvider";
import ShopFilters from "../shop/_components/ShopFilters";
import ShopProducts from "../shop/_components/ShopProducts";

export default function ShopClient() {
  const {
    products,
    categories: databaseCategories,
    loading,
    error,
  } = useCatalog();
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const { category, colour, maxPrice, sort } = readShopFilters(searchParams);
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
        ...databaseCategories,
        ...products.map((product) => product.category),
      ]),
    ),
  ];

  const visibleProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesCategory =
        category === "All shoes" || product.category === category;
      const matchesColour =
        colour === "All colours" || product.color === colour;
      const searchable =
        `${product.name} ${product.category} ${product.color} ${product.slug}`.toLowerCase();
      const matchesSearch = query
        .toLowerCase()
        .split(/\s+/)
        .every((word) => searchable.includes(word));

      return (
        matchesSearch &&
        matchesCategory &&
        matchesColour &&
        product.price <= (maxPrice ?? Infinity)
      );
    });

    return [...filtered].sort((first, second) => {
      if (sort === "Price: low to high") return first.price - second.price;
      if (sort === "Price: high to low") return second.price - first.price;
      return 0;
    });
  }, [category, colour, maxPrice, products, sort, query]);

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
      <section className="border-b border-black/10 pb-10 lg:pb-14">
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

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <h1 className="max-w-262.5 text-[clamp(64px,10vw,150px)] font-medium leading-[0.8] tracking-[-0.075em] text-[#20211e]">
            The
            <br />
            <span className="font-serif font-normal italic tracking-tighter text-[#ed682c]">
              shop.
            </span>
          </h1>

          <p className="max-w-90 text-[14px] leading-7 text-black/50">
            A focused rotation of everyday footwear designed around comfort,
            versatility and the way your day actually moves.
          </p>
        </div>
      </section>

      <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr] lg:gap-14 xl:grid-cols-[300px_1fr]">
        <ShopFilters
          category={category}
          onCategoryChange={(value) =>
            updateFilters({ category: value === "All shoes" ? null : value })
          }
          colour={colour}
          onColourChange={(value) =>
            updateFilters({ colour: value === "All colours" ? null : value })
          }
          maxPrice={
            maxPrice ?? Math.max(1, ...products.map((product) => product.price))
          }
          priceLimit={Math.max(
            1,
            maxPrice ?? 0,
            ...products.map((product) => product.price),
          )}
          colours={[...new Set(products.map((product) => product.color))]}
          onMaxPriceChange={(value) =>
            updateFilters({ maxPrice: String(value) }, true)
          }
          onReset={resetFilters}
          categories={categories}
        />

        <div>
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
          {loading && <p role="status">Loading products...</p>}
          {error && (
            <p role="alert">
              Unable to refresh products. Please try again shortly.
            </p>
          )}
          <ShopProducts
            products={visibleProducts}
            totalCount={products.length}
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
        </div>
      </div>
    </main>
  );
}
