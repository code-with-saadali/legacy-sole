"use client";

import { useCatalog } from "./CatalogProvider";
﻿import Image from "./ProductImage";
import Link from "next/link";
import { FiArrowUpRight, FiPlus } from "react-icons/fi";

export default function Hero() {
  const { products } = useCatalog();
  const product = products.find(item => item.slug === "aero-runner") ?? products[0];
  if (!product) return <section id="home" className="px-[5%] py-20"><h1 className="text-5xl">Made for every single day.</h1><Link href="/shop">Explore the collection</Link></section>;
  return (
    <section
      id="home"
      aria-labelledby="hero-title"
      className="relative overflow-hidden bg-[#F4F1E9]"
    >
      <div className="mx-auto px-[5%]">
        <div className="grid min-h-[calc(100svh-118px)] items-center gap-7 py-6 lg:h-[calc(100svh-128px)] lg:min-h-140 lg:grid-cols-[0.84fr_1.16fr] lg:gap-8 lg:py-6 xl:gap-10">
          <div className="relative z-10 flex min-w-0 flex-col justify-center lg:h-full">
            <div className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#ed682c]" />
              <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-black/55 sm:text-[10px]">
                Legacy Sole / Summer 2026
              </p>
            </div>

            <h1
              id="hero-title"
              className="mt-5 max-w-150 text-[clamp(48px,6.7vw,92px)] font-medium leading-[0.87] tracking-[-0.07em] text-[#20211e]"
            >
              Made for every
              <br />
              <span className="font-serif font-normal italic tracking-tighter text-[#ed682c]">
                single day.
              </span>
            </h1>

            <p className="mt-5 max-w-92 text-[12px] leading-6 text-black/50 sm:text-[13px]">
              Refined silhouettes made for slow mornings, long days and
              everything in between.
            </p>

            <div className="mt-7">
              <Link
                href="#collections"
                className="group inline-flex items-center gap-6 rounded-full bg-[#20211e] px-5 py-3 text-[11px] font-medium text-white transition-all duration-300 hover:bg-[#b66b4d]"
              >
                Explore the edit
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black">
                  <FiArrowUpRight
                    size={14}
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </span>
              </Link>
            </div>
          </div>

          <div className="relative min-h-107.5 overflow-hidden rounded-[26px] bg-[#EDE7DD] sm:min-h-125 lg:h-[calc(100%-8px)] lg:min-h-0 lg:max-h-162.5 lg:self-center lg:rounded-4xl xl:max-h-170">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-[8%] -translate-x-1/2 whitespace-nowrap text-[clamp(60px,9vw,132px)] font-semibold leading-none tracking-[-0.075em] text-[#DFD6C8]"
            >
              EVERYDAY
            </span>

            <div className="absolute left-5 top-5 z-10 flex items-center gap-2 rounded-full border border-black/10 bg-[#F4F1E9]/85 px-3 py-2 backdrop-blur-md sm:left-6 sm:top-6">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ed682c]" />
              <span className="text-[8px] font-medium uppercase tracking-[0.16em] text-black/60">
                New Season
              </span>
            </div>

            <div className="absolute right-5 top-5 z-10 text-right sm:right-6 sm:top-6">
              <p className="text-[8px] uppercase tracking-[0.18em] text-black/35">
                Featured
              </p>
              <p className="mt-1 text-[11px] font-medium text-black/70">
                01 / 04
              </p>
            </div>

            <div className="absolute inset-x-[3%] bottom-25 top-16.25 sm:bottom-27.5 sm:top-18.75 lg:inset-x-[1%] lg:bottom-26.25 lg:top-19.5">
              <Image
                src={product.image}
                alt={`${product.name}, ${product.color}`}
                fill
                priority
                sizes="(max-width: 1023px) 90vw, 56vw"
                className="object-contain drop-shadow-[0_30px_30px_rgba(0,0,0,0.11)]"
              />
            </div>

            <div className="absolute right-5 top-1/2 z-10 hidden -translate-y-1/2 flex-col items-center gap-3 xl:flex">
              <div className="h-14 w-px bg-black/15" />

              <button
                type="button"
                aria-label="View product details"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 bg-[#F4F1E9]/85 transition-all duration-300 hover:border-[#ed682c] hover:bg-[#ed682c] hover:text-white"
              >
                <FiPlus size={15} />
              </button>

              <div className="h-14 w-px bg-black/15" />
            </div>

            <Link
              href="#new-arrivals"
              className="group absolute inset-x-0 bottom-0 flex items-center justify-between bg-[#F4F1E9]/90 px-5 py-4 backdrop-blur-md sm:px-6"
            >
              <div>
                <p className="text-[8px] font-medium uppercase tracking-[0.18em] text-black/40">
                  In Focus / 01
                </p>

                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h2 className="text-[13px] font-semibold tracking-[-0.02em] text-[#20211e] sm:text-sm">
                    {product.name}
                  </h2>

                  <span className="text-[10px] text-black/45 sm:text-[11px]">
                    {product.color}
                  </span>
                </div>
              </div>

              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/15 bg-white/60 text-[#20211e] transition-all duration-300 group-hover:border-[#ed682c] group-hover:bg-[#ed682c] group-hover:text-white">
                <FiArrowUpRight
                  size={16}
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
