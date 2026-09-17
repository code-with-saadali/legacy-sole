"use client";

import { useMemo, useState } from "react";
import { useCatalog } from "./CatalogProvider";
import ShopFilters from "../shop/_components/ShopFilters";
import ShopProducts from "../shop/_components/ShopProducts";


export default function ShopClient() {
  const { products, categories: databaseCategories, loading, error } = useCatalog();
  const [category, setCategory] = useState("All shoes");
  const [colour, setColour] = useState("All colours");
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [sort, setSort] = useState("Featured");
  const categories = ["All shoes", ...Array.from(new Set([...databaseCategories, ...products.map((product) => product.category)]))];

  const visibleProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesCategory = category === "All shoes" || product.category === category;
      const matchesColour = colour === "All colours" || product.color === colour;

      return matchesCategory && matchesColour && product.price <= (maxPrice ?? Infinity);
    });

    return [...filtered].sort((first, second) => {
      if (sort === "Price: low to high") return first.price - second.price;
      if (sort === "Price: high to low") return second.price - first.price;
      return 0;
    });
  }, [category, colour, maxPrice, products, sort]);

  const resetFilters = () => {
    setCategory("All shoes");
    setColour("All colours");
    setMaxPrice(null);
  };

  return (
    <main className="min-h-screen bg-[#F4F1E9] px-[5%] pb-24 pt-10 lg:pb-28 lg:pt-14">
      <section className="border-b border-black/10 pb-10 lg:pb-14">
        <div className="flex items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-[#ed682c]" />
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-black/45 sm:text-xs">
              Legacy Sole / Shop
            </p>
          </div>

          <p className="hidden text-[11px] uppercase tracking-[0.16em] text-black/35 sm:block">
            {products.length.toString().padStart(2, "0")} Styles
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <h1 className="max-w-262.5 text-[clamp(64px,10vw,150px)] font-medium leading-[0.8] tracking-[-0.075em] text-[#20211e]">
            The
            <br />
            <span className="font-serif font-normal italic tracking-tighter text-[#ed682c]">shop.</span>
          </h1>

          <p className="max-w-90 text-[14px] leading-7 text-black/50">
            A focused rotation of everyday footwear designed around comfort, versatility and the way your day
            actually moves.
          </p>
        </div>
      </section>

      <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr] lg:gap-14 xl:grid-cols-[300px_1fr]">
        <ShopFilters
          category={category}
          onCategoryChange={setCategory}
          colour={colour}
          onColourChange={setColour}
          maxPrice={maxPrice ?? Math.max(1, ...products.map((product) => product.price))}
          priceLimit={Math.max(1, maxPrice ?? 0, ...products.map((product) => product.price))}
          colours={[...new Set(products.map((product) => product.color))]}
          onMaxPriceChange={setMaxPrice}
          onReset={resetFilters}
          categories={categories}
        />

        <div>
        {loading && <p role="status">Loading products...</p>}
        {error && <p role="alert">Unable to refresh products. Please try again shortly.</p>}
        <ShopProducts
          products={visibleProducts}
          totalCount={products.length}
          sort={sort}
          onSortChange={setSort}
          onReset={resetFilters}
        />
        </div>
      </div>
    </main>
  );
}
