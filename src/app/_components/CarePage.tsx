import Link from "next/link";
import type { ReactNode } from "react";
import { careLinks } from "../_data/customer-care";
import CareSupport from "./CareSupport";

export default function CarePage({
  title,
  intro,
  href,
  children,
}: {
  title: string;
  intro: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <main className="bg-[#f4f1e9] px-6 py-12 text-[#20211e] sm:px-[5%] sm:py-20">
      <div className="mx-auto max-w-7xl">
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex gap-3 text-xs text-black/55"
        >
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{title}</span>
        </nav>
        <p className="text-xs font-semibold uppercase tracking-[.22em] text-[#b64b18]">
          Here to help
        </p>
        <h1 className="mt-4 text-4xl font-medium tracking-tight sm:text-6xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-black/65 sm:text-base">
          {intro}
        </p>
        <div className="mt-12 grid items-start gap-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16">
          <nav
            aria-label="Customer care pages"
            className="flex flex-wrap gap-2 lg:flex-col"
          >
            {careLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={href === link.href ? "page" : undefined}
                className={`rounded-xl px-4 py-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${href === link.href ? "bg-[#f26924] font-medium" : "bg-black/5 hover:bg-black/10"}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="min-w-0 space-y-6">
            {children}
            <CareSupport />
          </div>
        </div>
      </div>
    </main>
  );
}

export function CareSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-black/10 bg-[#faf8f3] p-6 sm:p-8">
      <h2 className="mb-4 text-xl font-medium">{title}</h2>
      <div className="space-y-4 text-sm leading-7 text-black/70">
        {children}
      </div>
    </section>
  );
}
