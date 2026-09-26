"use client";
import { useStoreSettings } from "./StoreSettingsProvider";

import { useCatalog } from "./CatalogProvider";
import Image from "./ProductImage";
import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";

export default function ClassicFeature() {
  const { settings } = useStoreSettings();
  const feature = settings.classic_feature;
  const { products } = useCatalog();
  const product = products.find((item) => item.slug === feature.slug);
  if (!product) return null;
  return (
    <section className="bg-[#F7F4EE] px-[5%] py-16 lg:py-24">
      <div className="grid overflow-hidden rounded-4xl border border-black/10 bg-[#E9E2D7] lg:grid-cols-[1.12fr_0.88fr] lg:rounded-[38px]">
        <Link
          href={`/products/${product.slug}`}
          className="group relative min-h-105 overflow-hidden sm:min-h-140 lg:min-h-170"
        >
          <span className="pointer-events-none absolute left-1/2 top-[7%] -translate-x-1/2 whitespace-nowrap text-[clamp(76px,10vw,160px)] font-semibold leading-none tracking-[-0.085em] text-black/[0.035]">
            {feature.watermark}
          </span>

          <div className="absolute left-5 top-5 z-10 flex items-center gap-2 rounded-full border border-black/10 bg-[#F7F4EE]/80 px-3.5 py-2 backdrop-blur-md sm:left-7 sm:top-7">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ed682c]" />
            <span className="text-[8px] font-medium uppercase tracking-[0.18em] text-black/55">
              {feature.badge}
            </span>
          </div>

          <div className="absolute right-5 top-5 z-10 text-right sm:right-7 sm:top-7">
            <p className="text-[8px] uppercase tracking-[0.18em] text-black/30">
              {feature.styleLabel}
            </p>
            <p className="mt-1 text-[11px] font-medium text-black/60">
              {feature.styleValue}
            </p>
          </div>

          <div className="absolute inset-[5%] bottom-[8%] top-[10%]">
            <Image
              src={feature.image || product.image}
              alt={
                feature.imageAlt ||
                `${feature.name || product.name}, ${feature.color || product.color}`
              }
              fill
              sizes="(max-width: 1023px) 90vw, 56vw"
              className="object-contain transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.025]"
            />
          </div>

          <div className="absolute inset-x-5 bottom-5 flex items-center justify-between rounded-[20px] border border-black/10 bg-[#F7F4EE]/82 px-5 py-4 backdrop-blur-md sm:inset-x-7 sm:bottom-7">
            <div>
              <p className="text-[8px] font-medium uppercase tracking-[0.18em] text-black/35">
                {feature.caption}
              </p>
              <p className="mt-1.5 text-[14px] font-medium tracking-[-0.02em] text-[#20211e]">
                {feature.name || product.name}
              </p>
            </div>

            <span className="text-[11px] font-medium text-black/55">
              {feature.color || product.color}
            </span>
          </div>
        </Link>

        <div className="flex flex-col justify-between border-t border-black/10 bg-[#F4F1E9] p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10 xl:p-12">
          <div>
            <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-black/35">
              {feature.eyebrow}
            </p>

            <h2 className="mt-5 max-w-140 text-[clamp(42px,5vw,72px)] font-medium leading-[0.92] tracking-tighter text-[#20211e]">
              {feature.heading}
              <br />
              <span className="text-[#ed682c]">{feature.accent}</span>
            </h2>

            <p className="mt-6 max-w-105 text-[12px] leading-6 text-black/45 sm:text-[13px]">
              {feature.description || product.description}
            </p>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-2 border-y border-black/10">
              <div className="py-5 pr-5">
                <p className="text-[8px] uppercase tracking-[0.18em] text-black/30">
                  {feature.colorLabel}
                </p>
                <p className="mt-2 text-[12px] font-medium text-[#20211e]">
                  {feature.color || product.color}
                </p>
              </div>

              <div className="border-l border-black/10 py-5 pl-5">
                <p className="text-[8px] uppercase tracking-[0.18em] text-black/30">
                  {feature.priceLabel}
                </p>
                <p className="mt-2 text-[12px] font-medium text-[#20211e]">
                  Rs. {product.price.toLocaleString()}
                </p>
              </div>
            </div>

            <Link
              href={feature.href}
              className="group mt-7 flex items-center justify-between border-b border-black/15 pb-4"
            >
              <span className="text-[12px] font-medium text-[#20211e]">
                {feature.button || `Discover ${product.name}`}
              </span>

              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/50 transition-all duration-300 group-hover:border-[#ed682c] group-hover:bg-[#ed682c] group-hover:text-white">
                <FiArrowUpRight
                  size={15}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
