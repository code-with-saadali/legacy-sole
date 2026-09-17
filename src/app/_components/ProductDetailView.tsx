"use client";

import Image from "./ProductImage";
import Link from "next/link";
import { FiArrowLeft, FiCheck, FiInfo } from "react-icons/fi";
import ProductActions from "./ProductActions";
import RecentlyViewedTracker from "./RecentlyViewedTracker";
import WishlistButton from "./WishlistButton";
import { useCatalog } from "./CatalogProvider";
import ProductReviews from "./ProductReviews";


export default function ProductDetailView({ slug }: { slug: string }) {
  const { products, loading, error } = useCatalog();
  const product = products.find(item => item.slug === slug);
  if (loading) return <main className="p-12" role="status">Loading product...</main>;
  if (error) return <main className="p-12" role="alert">Unable to refresh product details. Please try again shortly.</main>;
  if (!product) return <main className="p-12"><h1>This product is no longer available.</h1><Link href="/shop">Browse the collection</Link></main>;

  return (
    <main className="bg-[#F4F1E9] px-[5%] pb-20 pt-10 lg:pb-28 lg:pt-16">
      <RecentlyViewedTracker slug={product.slug} />
      <Link
        href="/#collection"
        className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-black/50 transition-colors hover:text-[#4b5a42]"
      >
        <FiArrowLeft size={14} /> Back to collection
      </Link>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-20">
        <div className="relative aspect-[1.08] overflow-hidden rounded-[30px] bg-[#E9E2D7] lg:rounded-[40px]">
          <span className="absolute left-6 top-6 z-10 rounded-full border border-black/10 bg-[#F4F1E9]/85 px-3 py-2 text-[8px] font-medium uppercase tracking-[0.16em] text-black/55 backdrop-blur-md">
            {product.tag}
          </span>
          <span className="pointer-events-none absolute left-1/2 top-[9%] -translate-x-1/2 text-[clamp(70px,12vw,170px)] font-semibold tracking-[-0.08em] text-black/[0.035]">
            SOLE
          </span>
          <div className="absolute inset-[7%]">
            <Image
              src={product.image}
              alt={`${product.name}, ${product.color}`}
              fill
              priority
              sizes="(max-width: 1023px) 90vw, 58vw"
              className="object-contain drop-shadow-[0_35px_30px_rgba(0,0,0,0.12)]"
            />
          </div>
          {product.gallery.length > 0 && <div className="absolute bottom-5 left-5 right-5 z-10 flex gap-2 overflow-x-auto">{product.gallery.map((image) => <div key={image} className="relative h-14 w-16 shrink-0 bg-[#F4F1E9]/80"><Image src={image} alt={product.name} fill sizes="64px" className="object-contain p-1" /></div>)}</div>}
        </div>

        <div className="max-w-xl">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-black/40">
            {product.category} / Legacy Sole
          </p>
          <div className="flex items-start justify-between gap-5">
            <h1 className="mt-4 text-[clamp(52px,7vw,96px)] leading-[0.85] text-[#20211e]">{product.name}</h1>
            <WishlistButton product={product} className="mt-5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/10 text-[#20211e] hover:border-[#b66b4d]" />
          </div>
          <div className="mt-6 flex items-center justify-between border-y border-black/10 py-4">
            <span className="text-sm text-black/50">{product.color}</span>
            <strong className="text-base font-medium">
              Rs. {product.price.toLocaleString()}
            </strong>
          </div>
          <p className="mt-7 max-w-lg text-sm leading-7 text-black/55">
            {product.description}
          </p>
          <details className="mt-6 border-y border-black/10 py-4"><summary className="flex cursor-pointer list-none items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-black/55"><FiInfo size={14} /> Size guide</summary><div className="mt-4 grid grid-cols-2 gap-2 text-xs text-black/55">{product.sizeGuide.length ? product.sizeGuide.map(row => <div key={row.size} className="flex justify-between border-b border-black/10 py-2"><span>{row.size}</span><span>{row.footLength}</span></div>) : <p className="col-span-2">Standard UK fit. Select your usual size.</p>}</div></details>
          <ProductActions product={product} />
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
      <ProductReviews slug={product.slug} />
    </main>
  );
}
