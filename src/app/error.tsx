"use client";

import Link from "next/link";
import { FiArrowRight, FiHome, FiRefreshCw } from "react-icons/fi";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="relative isolate flex min-h-[calc(100svh-8rem)] items-center overflow-hidden bg-[#F4F1E9] px-[5%] py-16 sm:py-24">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-45 [background-image:linear-gradient(to_right,rgba(32,33,30,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(32,33,30,0.055)_1px,transparent_1px)] [background-size:36px_36px]"
      />
      <div
        aria-hidden="true"
        className="absolute -right-32 top-1/2 -z-10 size-80 -translate-y-1/2 rounded-full bg-[#ed682c]/10 blur-3xl"
      />

      <section className="grid w-full items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <div>
          <p className="mb-5 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.2em] text-[#ed682c]">
            <span className="size-1.5 rounded-full bg-[#ed682c]" />
            A small misstep
          </p>
          <p className="select-none text-[clamp(120px,23vw,300px)] font-medium leading-[0.72] tracking-[-0.12em] text-[#20211e]">
            Oops
          </p>
          <p className="mt-8 max-w-115 border-t border-black/10 pt-5 text-[11px] uppercase tracking-[0.16em] text-black/40">
            Our team has been notified. Please try again.
          </p>
        </div>

        <div className="max-w-115 lg:justify-self-end">
          <h1 className="text-[clamp(42px,5vw,72px)] font-medium leading-[0.94] tracking-[-0.06em] text-[#20211e]">
            Something slipped.
            <br />
            <span className="text-[#ed682c]">Let&apos;s reset.</span>
          </h1>
          <p className="mt-6 max-w-95 text-sm leading-7 text-black/55 sm:text-base">
            We couldn&apos;t load this page right now. Try once more, or continue
            browsing the collection.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-12 items-center gap-3 rounded-full bg-[#20211e] px-6 text-xs font-medium text-white transition-colors hover:bg-[#ed682c]"
            >
              Try again <FiRefreshCw aria-hidden="true" size={16} />
            </button>
            <Link
              href="/"
              className="inline-flex min-h-12 items-center gap-3 rounded-full border border-black/15 bg-[#F8F6F1]/70 px-6 text-xs font-medium text-[#20211e] transition-colors hover:border-[#20211e]"
            >
              <FiHome aria-hidden="true" size={16} /> Back home
            </Link>
            <Link
              href="/shop"
              className="inline-flex min-h-12 items-center gap-2 px-2 text-xs font-medium text-[#20211e] underline decoration-black/20 underline-offset-5 transition-colors hover:text-[#ed682c]"
            >
              Shop instead <FiArrowRight aria-hidden="true" size={15} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
