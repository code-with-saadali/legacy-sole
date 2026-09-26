"use client";
import { FaAngleDown } from "react-icons/fa";

import { FiArrowUpRight } from "react-icons/fi";
import type { Order } from "../_data/orders";
import type { Product } from "../_data/products";
import AdminMetrics from "./AdminMetrics";
import RecentOrders from "./RecentOrders";
import SalesAnalytics from "./SalesAnalytics";
import StockAlerts from "./StockAlerts";
import { stockAlerts } from "../_data/admin";

type Props = {
  products: Product[];
  orders: Order[];
  catalogError: string;
  onManageProducts: () => void;
  onManageStock: () => void;
  onViewOrders: () => void;
  onOpenOrder: (id: string) => void;
};

export default function AdminOverview({
  products,
  orders,
  catalogError,
  onManageProducts,
  onManageStock,
  onViewOrders,
  onOpenOrder,
}: Props) {
  const pendingCount = orders.filter(
    (order) => order.status === "Pending",
  ).length;
  const stockCount = stockAlerts(products).length;
  return (
    <>
      <div className="border border-black/10 mt-7 flex flex-wrap items-center justify-between gap-5 rounded-[28px] bg-[#E9E2D7] p-6 text-[#20211e] sm:p-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#796452]">
            Start here
          </p>
          <h2 className="mt-3 text-2xl font-medium tracking-tight">
            {pendingCount
              ? `${pendingCount} orders awaiting confirmation`
              : "Your daily store tasks"}
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-black/55">
            Check new orders first, then keep product prices and stock up to
            date.
          </p>
        </div>
        <button
          type="button"
          onClick={onViewOrders}
          className="flex items-center gap-3 rounded-xl bg-[#4b5b40] px-5 py-3 text-xs font-semibold text-white hover:bg-[#36432d]"
        >
          View orders <FiArrowUpRight size={16} />
        </button>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {[
          {
            title: "Manage products",
            description: "Add or edit products, prices and photos.",
            action: onManageProducts,
          },
          {
            title: "Update stock",
            description: catalogError
              ? "Check product stock availability."
              : `${stockCount} products with low or no stock.`,
            action: onManageStock,
          },
        ].map((task) => (
          <button
            key={task.title}
            type="button"
            onClick={task.action}
            className="flex items-center justify-between gap-4 rounded-2xl border border-black/10 bg-white p-5 text-left transition-colors hover:bg-[#E9E2D7] focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <span>
              <span className="block text-base font-semibold">
                {task.title}
              </span>
              <span className="mt-1 block text-sm text-black/60">
                {task.description}
              </span>
            </span>
            <FiArrowUpRight className="shrink-0" size={20} aria-hidden="true" />
          </button>
        ))}
      </div>
      <AdminMetrics products={products} orders={orders} />
      <RecentOrders
        orders={orders}
        onViewAll={onViewOrders}
        onOpenOrder={onOpenOrder}
      />
      <StockAlerts
        products={products}
        catalogError={catalogError}
        onManageStock={onManageStock}
      />
      <details className="mt-7 rounded-2xl border border-black/10 bg-white p-5">
        <summary className="flex items-center justify-between gap-3 list-none [&::-webkit-details-marker]:hidden cursor-pointer text-base font-semibold">
          Sales chart — last 7 days
          <FaAngleDown
            aria-hidden="true"
            className="ml-auto shrink-0 transition-transform duration-150 [[open]>summary>&]:rotate-180"
          />
        </summary>
        <SalesAnalytics orders={orders} />
      </details>
    </>
  );
}
