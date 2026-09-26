"use client";

import type { Product } from "../_data/products";
import ProductGallery from "./ProductGallery";
import SizeGuide from "./SizeGuide";
import RelatedProducts from "./RelatedProducts";
import CompleteTheLook from "./CompleteTheLook";
import Link from "next/link";
import { FiArrowLeft, FiCheck } from "react-icons/fi";
import ProductActions from "./ProductActions";
import RecentlyViewedTracker from "./RecentlyViewedTracker";
import WishlistButton from "./WishlistButton";
import { useCatalog } from "./CatalogProvider";
import ProductReviews from "./ProductReviews";
import { colourSwatches } from "../shop/_components/ShopFilters";
import { availableSizes, sizeStock } from "../_data/inventory";

export default function ProductDetailView({
  slug,
  initialProduct,
}: {
  slug: string;
  initialProduct?: Product;
}) {
  const { products, loading, error } = useCatalog();
  const product =
    products.find((item) => item.slug === slug) ??
    (loading ? initialProduct : undefined);
  if (loading && !product)
    return (
      <main className="p-12" role="status">
        Loading product...
      </main>
    );
  if (error)
    return (
      <main className="p-12" role="alert">
        Unable to refresh product details. Please try again shortly.
      </main>
    );
  if (!product)
    return (
      <main className="p-12">
        <h1>This product is no longer available.</h1>
        <Link href="/shop">Browse the collection</Link>
      </main>
    );

  const soldOut =
    (product.stock ?? 0) < 1 ||
    !availableSizes(product).some((size) => sizeStock(product, size) > 0);
  return (
    <main className="bg-[#F4F1E9] px-[5%] pb-20 pt-10 lg:pb-28 lg:pt-16">
      <RecentlyViewedTracker slug={product.slug} />
      <Link
        href="/#collection"
        className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-black/50 transition-colors hover:text-[#4b5a42]"
      >
        <FiArrowLeft size={14} /> Back to collection
      </Link>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch lg:gap-20">
        <ProductGallery key={product.slug} product={product} />
        <div className="max-w-xl">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-black/40">
            {product.category} / Legacy Sole
          </p>
          <div className="flex items-start justify-between gap-5">
            <h1 className="mt-4 text-[clamp(52px,7vw,96px)] leading-none font-medium text-[#20211e]">
              {product.name}
            </h1>
            <WishlistButton
              product={product}
              className="mt-5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/10 text-[#20211e] hover:border-[#b66b4d]"
            />
          </div>
          <div className="mt-6 flex items-center justify-between border-y border-black/10 py-4">
            <span className="text-sm text-black/50">Price</span>
            <strong className="text-base font-medium">
              Rs. {product.price.toLocaleString()}
            </strong>
          </div>
          {soldOut && (
            <div
              role="status"
              className="mt-5 rounded-xl border border-[#a04c2a]/20 bg-[#a04c2a]/5 px-4 py-3"
            >
              <p className="text-sm font-semibold text-[#a04c2a]">Sold out</p>
              <p className="mt-1 text-xs leading-5 text-black/60">
                This pair is currently out of stock. Browse other styles in the
                shop.
              </p>
            </div>
          )}
          <div className="mt-6">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-black/55">
              Colour
            </p>
            {product.variant_group ? (
              <div className="mt-3 flex flex-wrap gap-3">
                {products
                  .filter(
                    (item) => item.variant_group === product.variant_group,
                  )
                  .map((variant) => (
                    <Link
                      key={variant.slug}
                      href={`/products/${variant.slug}`}
                      aria-label={`Choose ${variant.color}`}
                      aria-current={
                        variant.slug === product.slug ? "page" : undefined
                      }
                      title={variant.color}
                      className={`flex h-10 w-10 items-center justify-center rounded-full border p-1 ${variant.slug === product.slug ? "border-[#20211e]" : "border-black/15"}`}
                    >
                      <span
                        className="h-full w-full rounded-full border border-black/10 bg-[#E9E2D7]"
                        style={{
                          background:
                            colourSwatches.find(
                              (item) => item.name === variant.color,
                            )?.gradient ?? variant.color.toLowerCase(),
                        }}
                      />
                    </Link>
                  ))}
              </div>
            ) : product.color.trim() ? (
              <span
                role="img"
                aria-label={product.color}
                title={product.color}
                className="mt-3 flex h-10 w-10 items-center justify-center rounded-full border border-[#20211e] p-1"
              >
                <span
                  className="h-full w-full rounded-full border border-black/10 bg-[#E9E2D7]"
                  style={{
                    background:
                      colourSwatches.find((item) => item.name === product.color)
                        ?.gradient ?? "#E9E2D7",
                  }}
                />
              </span>
            ) : (
              <p className="mt-2 text-sm text-black/55">
                Colour not specified.
              </p>
            )}
          </div>
          <p className="mt-7 max-w-lg text-sm leading-7 text-black/55">
            {product.description}
          </p>
          {!product.one_size && <SizeGuide product={product} />}
          <ProductActions key={product.slug} product={product} />
          <div className="mt-7 grid gap-3 border-t border-black/10 pt-6 sm:grid-cols-3">
            {product.details.map((detail) => (
              <div
                key={detail}
                className="flex items-start gap-2 text-[10px] uppercase leading-5 tracking-[0.08em] text-black/50"
              >
                <FiCheck className="mt-0.5 shrink-0 text-[#b66b4d]" size={13} />
                {detail}
              </div>
            ))}
          </div>
        </div>
      </div>
      <CompleteTheLook product={product} products={products} />
      <RelatedProducts product={product} products={products} />
      <ProductReviews key={product.slug} slug={product.slug} />
    </main>
  );
}
