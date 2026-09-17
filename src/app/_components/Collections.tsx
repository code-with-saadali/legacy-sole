"use client";

import { useCatalog } from "./CatalogProvider";
import Image from "./ProductImage";
import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";

export default function Collections() {
  const { products } = useCatalog();
  const collections = products.slice(0, 3).map((product, index) => ({
    name: product.name, description: product.description, image: product.image,
    href: "/products/" + product.slug, number: String(index + 1).padStart(2, "0"), label: product.category,
  }));
  if (!collections.length) return null;
  return (
    <section
      id="collections"
      aria-labelledby="collections-title"
      className="scroll-mt-28 bg-[#F4F1E9] px-[5%] py-16 lg:py-24"
    >
      <div className="mx-auto">
        <div className="mb-10 flex flex-col gap-6 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ed682c]" />
              <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-black/40 sm:text-[10px]">
                Collections / Legacy Sole
              </p>
            </div>

            <h2
              id="collections-title"
              className="mt-4 max-w-205 text-[clamp(42px,5.6vw,76px)] font-medium leading-[0.92] tracking-[-0.06em] text-[#20211e]"
            >
              Built around
              <br />
              <span className="font-serif font-normal italic text-[#ed682c]">
                how your day moves.
              </span>
            </h2>
          </div>

          <p className="max-w-[320px] text-[12px] leading-6 text-black/45 sm:text-[13px]">
            Three everyday directions, each with its own rhythm, mood and
            silhouette.
          </p>
        </div>

        <div className="grid gap-5">
          <Link
            href={collections[0].href}
            className="group grid overflow-hidden rounded-[30px] bg-[#E9E2D7] lg:grid-cols-[1.05fr_0.95fr] lg:rounded-[36px]"
          >
            <div className="relative min-h-90 overflow-hidden lg:min-h-140">
              <span className="pointer-events-none absolute left-6 top-6 text-[9px] font-medium uppercase tracking-[0.18em] text-black/35">
                {collections[0].label} / {collections[0].number}
              </span>

              <span className="pointer-events-none absolute left-1/2 top-[8%] -translate-x-1/2 text-[clamp(70px,10vw,150px)] font-semibold tracking-[-0.08em] text-black/[0.035]">
                SOLE
              </span>

              <div className="absolute inset-[7%]">
                <Image
                  src={collections[0].image}
                  alt={collections[0].name}
                  fill
                  sizes="(max-width: 1023px) 90vw, 52vw"
                  className="object-contain drop-shadow-[0_30px_28px_rgba(0,0,0,0.10)] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                />
              </div>
            </div>

            <div className="flex flex-col justify-between border-t border-black/10 p-6 lg:border-l lg:border-t-0 lg:p-8 xl:p-10">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-black/35">
                  Legacy Sole
                </span>

                <span className="text-[10px] text-black/35">Featured</span>
              </div>

              <div className="mt-12 lg:mt-auto">
                <h3 className="max-w-105 text-[clamp(34px,4vw,58px)] font-medium leading-[0.95] tracking-[-0.055em] text-[#20211e]">
                  {collections[0].name}
                </h3>

                <p className="mt-4 max-w-90 text-[12px] leading-6 text-black/45 sm:text-[13px]">
                  {collections[0].description}
                </p>

                <div className="mt-8 flex items-center justify-between border-t border-black/10 pt-5">
                  <span className="text-[11px] font-medium text-[#20211e]">
                    Explore Collection
                  </span>

                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white/55 transition-all duration-300 group-hover:border-[#ed682c] group-hover:bg-[#ed682c] group-hover:text-white">
                    <FiArrowUpRight size={17} />
                  </span>
                </div>
              </div>
            </div>
          </Link>

          <div className="grid gap-5 md:grid-cols-2">
            {collections.slice(1).map((collection) => (
              <Link
                key={collection.href}
                href={collection.href}
                className="group overflow-hidden rounded-[28px] bg-[#E9E2D7] lg:rounded-4xl"
              >
                <div className="relative aspect-[1.35] overflow-hidden">
                  <div className="absolute left-5 top-5 z-10 flex items-center gap-2">
                    <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-black/35">
                      {collection.label}
                    </span>
                    <span className="h-px w-5 bg-black/15" />
                    <span className="text-[9px] text-black/35">
                      {collection.number}
                    </span>
                  </div>

                  <div className="absolute inset-[7%]">
                    <Image
                      src={collection.image}
                      alt={collection.name}
                      fill
                      sizes="(max-width: 767px) 90vw, 45vw"
                      className="object-contain drop-shadow-[0_24px_22px_rgba(0,0,0,0.09)] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]"
                    />
                  </div>
                </div>

                <div className="flex items-end justify-between gap-5 border-t border-black/10 px-5 py-5 lg:px-6 lg:py-6">
                  <div>
                    <h3 className="text-[24px] font-medium tracking-[-0.04em] text-[#20211e]">
                      {collection.name}
                    </h3>

                    <p className="mt-2 max-w-[320px] text-[11px] leading-5 text-black/45 sm:text-[12px]">
                      {collection.description}
                    </p>
                  </div>

                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white/55 transition-all duration-300 group-hover:border-[#ed682c] group-hover:bg-[#ed682c] group-hover:text-white">
                    <FiArrowUpRight size={17} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
