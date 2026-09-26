"use client";
import Link from "next/link";
import { useCatalog } from "../_components/CatalogProvider";
import useProductList from "../_hooks/useProductList";
import { watchKey } from "../_data/product-lists";
import ProductCard from "../_components/ProductCard";
export default function WatchlistPage() {
  const { products, loading, error } = useCatalog();
  const { items, toggle } = useProductList(watchKey);
  return (
    <main className="min-h-[70vh] bg-[#F4F1E9] px-[5%] py-14">
      <h1 className="text-5xl">Your restock watchlist.</h1>
      <p className="mt-4 text-sm text-black/50">
        Live availability for pairs saved in this browser. Check the product
        page for your size.
      </p>
      {loading ? (
        <p role="status" className="mt-8">
          Checking stock…
        </p>
      ) : error ? (
        <p role="alert" className="mt-8">
          Availability could not be refreshed. Please try again.
        </p>
      ) : items.length ? (
        <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-8 lg:grid-cols-3">
          {items.map((slug) => {
            const product = products.find((item) => item.slug === slug);
            return (
              <div key={slug}>
                {product ? (
                  <>
                    <p
                      role="status"
                      className={`mb-4 rounded-xl px-4 py-3 text-sm ${(product.stock ?? 0) > 0 ? "bg-[#4b5a42] text-white" : "bg-[#E9E2D7]"}`}
                    >
                      {(product.stock ?? 0) > 0
                        ? "Back in stock — choose your size"
                        : "Still waiting for restock"}
                    </p>
                    <ProductCard product={product} />
                  </>
                ) : (
                  <p>This product is no longer listed.</p>
                )}
                <button
                  type="button"
                  onClick={() => toggle(slug)}
                  className="mt-4 text-xs underline"
                >
                  Stop watching
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <Link
          href="/shop"
          className="mt-10 inline-block rounded-full bg-[#20211e] px-6 py-3 text-sm text-white"
        >
          Browse the collection
        </Link>
      )}
    </main>
  );
}
