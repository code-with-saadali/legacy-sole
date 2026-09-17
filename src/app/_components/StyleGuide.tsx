"use client";

import { useCatalog } from "./CatalogProvider";
﻿import Image from "./ProductImage";
import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";

const looks = [
  {
    number: "01",
    title: "The Slow Morning",
    shoe: "Court Classic",
    image: "/images/shoes/court-cutout.png",
    slug: "court-classic",
    outfit: "Straight-leg denim + a relaxed white shirt",
    note: "Easy pieces for an unhurried start.",
  },
  {
    number: "02",
    title: "The City Day",
    shoe: "Aero Runner",
    image: "/images/shoes/runner-cutout.png",
    slug: "aero-runner",
    outfit: "Wide-leg trousers + a lightweight layer",
    note: "Built for long walks and longer plans.",
  },
  {
    number: "03",
    title: "The Late Plan",
    shoe: "Shadow Runner",
    image: "/images/shoes/black-cutout.png",
    slug: "shadow-runner",
    outfit: "Dark denim + an easy overshirt",
    note: "A clean finish for wherever the evening goes.",
  },
];

export default function StyleGuide() {
  const { products } = useCatalog();
  const availableLooks = looks.flatMap(look => { const product = products.find(item => item.slug === look.slug); return product ? [{ ...look, shoe: product.name, image: product.image }] : []; });
  if (!availableLooks.length) return null;
  return (
    <section
      id="style-guide"
      aria-labelledby="style-title"
      className="scroll-mt-28 bg-[#F4F1E9] px-[5%] py-16 lg:py-24"
    >
      <div className="mb-10 flex flex-col gap-5 border-b border-black/10 pb-8 sm:flex-row sm:items-end sm:justify-between lg:mb-14">
        <div>
          <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-black/40 sm:text-[10px]">
            Style Notes / Legacy Sole
          </p>

          <h2
            id="style-title"
            className="mt-3 max-w-175 text-[clamp(38px,5vw,68px)] font-medium leading-[0.95] tracking-tighter text-[#20211e]"
          >
            Same pair.
            <br />
            Different plans.
          </h2>
        </div>

        <p className="max-w-75 text-[12px] leading-6 text-black/45 sm:text-[13px]">
          Three easy ways to style everyday footwear without overthinking it.
        </p>
      </div>

      <div className="grid gap-10 md:grid-cols-3 md:gap-5 lg:gap-7">
        {availableLooks.map((look) => (
          <article key={look.number} className="group">
            <Link
              href={`/products/${look.slug}`}
              className="relative block aspect-4/5 overflow-hidden rounded-3xl bg-[#EDE7DD] lg:rounded-[28px]"
            >
              <div className="absolute left-5 top-5 z-10 flex items-center gap-2">
                <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-black/35">
                  Look
                </span>

                <span className="h-px w-6 bg-black/20" />

                <span className="text-[9px] font-medium text-black/50">
                  {look.number}
                </span>
              </div>

              <div className="absolute inset-x-[5%] bottom-[8%] top-[10%]">
                <Image
                  src={look.image}
                  alt={`${look.shoe} styling inspiration`}
                  fill
                  sizes="(max-width: 767px) 90vw, 30vw"
                  className="object-contain transition-transform duration-500 ease-out group-hover:scale-[1.035]"
                />
              </div>

              <div className="absolute inset-x-5 bottom-5 flex items-center justify-between rounded-full border border-black/10 bg-[#F8F6F1]/85 px-4 py-3 backdrop-blur-md">
                <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-black/55">
                  {look.shoe}
                </span>

                <FiArrowUpRight
                  size={14}
                  className="text-black/55 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </div>
            </Link>

            <div className="pt-5">
              <h3 className="text-[22px] font-medium tracking-[-0.035em] text-[#20211e] sm:text-[24px]">
                {look.title}
              </h3>

              <p className="mt-3 text-[12px] leading-6 text-black/65">
                {look.outfit}
              </p>

              <p className="mt-1 text-[11px] leading-5 text-black/40">
                {look.note}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
