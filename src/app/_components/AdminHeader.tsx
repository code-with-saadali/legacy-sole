"use client";

import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";
import type { AdminTab } from "./AdminNavigation";

type Props = {
  tab: AdminTab;
};

const pageHelp: Record<AdminTab, { title: string; description: string }> = {
  Overview: {
    title: "Store dashboard",
    description:
      "Start with orders that need attention, or choose a task below.",
  },
  Orders: {
    title: "Orders",
    description:
      "Open an order to check customer details, confirm it and add delivery tracking.",
  },
  Products: {
    title: "Products & stock",
    description:
      "Add products, edit prices and photos, or update available stock.",
  },
  Customers: {
    title: "Customers & reviews",
    description: "Find customer orders and manage product reviews.",
  },
  Profit: {
    title: "Profit report",
    description: "Review sales, product costs and profit.",
  },
  Settings: {
    title: "Store settings",
    description: "Update your store information and shopping preferences.",
  },
};

export default function AdminHeader({ tab }: Props) {
  return (
    <div className="flex flex-col justify-between gap-6 border-b border-black/10 pb-8 sm:flex-row sm:items-end">
      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-black/40">
          Store admin
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#20211e] sm:text-4xl">
          {pageHelp[tab].title}
        </h1>
        <p className="mt-3 text-sm text-black/50">
          {pageHelp[tab].description}
        </p>
      </div>
      <Link
        href="/shop"
        className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-3 text-xs font-medium text-[#20211e] hover:bg-[#E9E2D7]"
      >
        View shop <FiArrowUpRight size={15} />
      </Link>
    </div>
  );
}
