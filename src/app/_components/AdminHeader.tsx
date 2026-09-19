"use client";

import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";
import type { AdminTab } from "./AdminNavigation";

type Props = {
  tab: AdminTab;
};

export default function AdminHeader({ tab }: Props) {
  return (
    <div className="flex flex-col justify-between gap-6 border-b border-black/10 pb-8 sm:flex-row sm:items-end">
      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-black/40">
          Workspace / {tab}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#20211e] sm:text-4xl">
          {tab === "Overview"
            ? "Your store, at a glance."
            : tab === "Orders"
              ? "Every order. All in view."
              : tab === "Customers" ? "Customer care & reviews." : tab === "Settings" ? "Make the store yours." : "Your curated collection."}
        </h1>
        <p className="mt-3 text-sm text-black/50">
          A little clarity for your everyday. Welcome to your workspace.
        </p>
      </div>
      <Link
        href="/shop"
        className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-3 text-xs font-medium text-[#20211e] hover:bg-[#E9E2D7]"
      >
        View storefront <FiArrowUpRight size={15} />
      </Link>
    </div>
  );
}
