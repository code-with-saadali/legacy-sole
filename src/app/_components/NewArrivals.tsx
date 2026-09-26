"use client";

import { useCatalog } from "./CatalogProvider";
import Image from "./ProductImage";
import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";

export default function NewArrivals() {
  const { products } = useCatalog();
  const product =
    [...products].reverse().find((item) => /new|arrival/i.test(item.tag)) ??
    products[products.length - 1];
  if (!product) return null;
  return (
    <section
      id="new-arrivals"
      aria-labelledby="arrivals-title"
      className="scroll-mt-28 bg-[#F4F1E9] px-[5%] py-16 lg:py-24"
    >
      <div className="mb-8 flex items-center justify-between border-b border-black/10 pb-5">
        <div className="flex items-center gap-3">
          <span className="h-1.5 w-1.5 rounded-full bg-[#ed682c]" />
          <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-black/40 sm:text-[10px]">
            New Arrival / Legacy Sole
          </p>
        </div>

        <p className="text-[9px] uppercase tracking-[0.18em] text-black/30">
          Drop 01
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-10">
        <div className="flex flex-col justify-between rounded-[28px] bg-[#20211e] p-6 text-white sm:p-8 lg:rounded-[34px] lg:p-10">
          <div>
            <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/40">
              Introducing
            </p>

            <h2
              id="arrivals-title"
              className="mt-5 max-w-140 text-[clamp(42px,5vw,72px)] font-medium leading-[0.9] tracking-[-0.06em]"
            >
              The pace
              <br />
              just changed.
            </h2>

            <p className="mt-6 max-w-90 text-[12px] leading-6 text-white/55 sm:text-[13px]">
              {product.description}
            </p>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-2 border-y border-white/10">
              <div className="py-5 pr-4">
                <p className="text-[8px] uppercase tracking-[0.18em] text-white/35">
                  Colourway
                </p>
                <p className="mt-2 text-[12px] font-medium">{product.color}</p>
              </div>

              <div className="border-l border-white/10 py-5 pl-5">
                <p className="text-[8px] uppercase tracking-[0.18em] text-white/35">
                  Price
                </p>
                <p className="mt-2 text-[12px] font-medium">
                  Rs. {product.price.toLocaleString()}
                </p>
              </div>
            </div>

            <Link
              href={`/products/${product.slug}`}
              className="group mt-7 flex items-center justify-between"
            >
              <span className="text-[11px] font-medium">
                Explore {product.name}
              </span>

              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#20211e] transition-transform duration-300 group-hover:rotate-45">
                <FiArrowUpRight size={15} />
              </span>
            </Link>
          </div>
        </div>

        <Link
          href={`/products/${product.slug}`}
          className="group relative min-h-115 overflow-hidden rounded-[28px] bg-[#E9E2D7] sm:min-h-140 lg:min-h-170 lg:rounded-[34px]"
        >
          <span className="pointer-events-none absolute left-1/2 top-[7%] -translate-x-1/2 whitespace-nowrap text-[clamp(80px,11vw,170px)] font-semibold leading-none tracking-[-0.085em] text-black/[0.035]">
            NEW
          </span>

          <div className="absolute left-5 top-5 z-10 flex items-center gap-2 rounded-full border border-black/10 bg-[#F4F1E9]/80 px-3.5 py-2 backdrop-blur-md sm:left-7 sm:top-7">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ed682c]" />
            <span className="text-[8px] font-medium uppercase tracking-[0.16em] text-black/55">
              Just Landed
            </span>
          </div>

          <div className="absolute right-5 top-5 z-10 text-right sm:right-7 sm:top-7">
            <p className="text-[8px] uppercase tracking-[0.18em] text-black/30">
              Series
            </p>
            <p className="mt-1 text-[11px] font-medium text-black/60">
              {product.category} / 01
            </p>
          </div>

          <div className="absolute inset-[4%] bottom-[13%] top-[9%]">
            <Image
              src={product.image}
              alt={`${product.name}, ${product.color}`}
              fill
              priority
              sizes="(max-width: 1023px) 90vw, 58vw"
              className="object-contain transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035] group-hover:-rotate-1"
            />
          </div>

          <div className="absolute inset-x-5 bottom-5 flex items-center justify-between rounded-[20px] border border-black/10 bg-[#F4F1E9]/82 px-5 py-4 backdrop-blur-md sm:inset-x-7 sm:bottom-7">
            <div>
              <p className="text-[8px] font-medium uppercase tracking-[0.18em] text-black/35">
                Legacy Sole / New Season
              </p>
              <p className="mt-1.5 text-[15px] font-medium tracking-tight text-[#20211e]">
                {product.name}
              </p>
            </div>

            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#20211e] text-white transition-all duration-300 group-hover:bg-[#ed682c]">
              <FiArrowUpRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
