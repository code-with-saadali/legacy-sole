import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";

export default function CallToAction() {
  return (
    <section className="bg-[#F7F4EE] px-[5%] py-16 lg:py-24">
      <div className="relative overflow-hidden rounded-[30px] bg-[#20211e] px-6 py-10 text-white sm:px-8 sm:py-12 lg:rounded-[38px] lg:px-12 lg:py-14 xl:px-14 xl:py-16">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[clamp(90px,16vw,250px)] font-semibold leading-none tracking-[-0.09em] text-white/2.5"
        >
          LEGACY
        </span>

        <div className="relative z-10 flex min-h-90 flex-col justify-between sm:min-h-105 lg:min-h-120">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ed682c]" />

              <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-white/45 sm:text-[10px]">
                Legacy Sole / Find Your Pair
              </p>
            </div>

            <p className="hidden text-[9px] uppercase tracking-[0.18em] text-white/30 sm:block">
              Everyday Footwear
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.2em] text-white/35">
                Your next favourite is waiting
              </p>

              <h2 className="max-w-275 text-[clamp(52px,8vw,118px)] font-medium leading-[0.86] tracking-[-0.075em]">
                Step into
                <br />
                <span className="font-serif font-normal italic tracking-[-0.045em] text-[#ed682c]">
                  your everyday.
                </span>
              </h2>
            </div>

            <Link
              href="#collections"
              aria-label="Explore the collections"
              className="group flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white text-[#20211e] transition-all duration-300 hover:scale-105 hover:bg-[#ed682c] hover:text-white sm:h-24 sm:w-24 lg:h-28 lg:w-28"
            >
              <FiArrowUpRight
                size={30}
                className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </Link>
          </div>

          <div className="flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-115 text-[11px] leading-5 text-white/40 sm:text-[12px]">
              Easy silhouettes, thoughtful comfort and pairs designed to become
              part of your daily rotation.
            </p>

            <Link
              href="#collections"
              className="group inline-flex w-fit items-center gap-3 text-[11px] font-medium text-white"
            >
              Explore all collections
              <FiArrowUpRight
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
