"use client";

import Link from "next/link";
import {
  FiArrowUpRight,
  FiPackage,
  FiPlus,
  FiShoppingBag,
} from "react-icons/fi";
import type { AdminTab } from "./AdminNavigation";

type Props = {
  tab: AdminTab;
  pendingOrders: number;
  stockCount: number;
  onViewOrders: () => void;
  onManageProducts: () => void;
  onManageStock: () => void;
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

export default function AdminHeader({
  tab,
  pendingOrders,
  stockCount,
  onViewOrders,
  onManageProducts,
  onManageStock,
}: Props) {
  return (
    <div className="pb-2">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-black/40">
            Legacy Sole / Workspace
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[#20211e] sm:text-3xl">
            {pageHelp[tab].title}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-black/55">
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
      <div className="mt-5 flex flex-wrap gap-2" aria-label="Quick actions">
        <button
          type="button"
          onClick={onManageProducts}
          className="inline-flex items-center gap-2 rounded-xl bg-[#20211e] px-4 py-3 text-xs font-medium text-white transition-colors hover:bg-[#4b5b40]"
        >
          <FiPlus size={15} /> Manage products
        </button>
        <button
          type="button"
          onClick={onManageStock}
          className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-3 text-xs font-medium text-[#20211e] transition-colors hover:bg-[#E9E2D7]"
        >
          <FiPackage size={15} /> Stock alerts
          {stockCount > 0 && (
            <span className="rounded-full bg-[#ed682c]/12 px-1.5 py-0.5 text-[10px] text-[#b84e1d]">
              {stockCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={onViewOrders}
          className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-3 text-xs font-medium text-[#20211e] transition-colors hover:bg-[#E9E2D7]"
        >
          <FiShoppingBag size={15} /> Pending orders
          {pendingOrders > 0 && (
            <span className="rounded-full bg-[#ed682c]/12 px-1.5 py-0.5 text-[10px] text-[#b84e1d]">
              {pendingOrders}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
