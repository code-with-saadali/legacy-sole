"use client";

import { FiArrowUpRight } from "react-icons/fi";
import type { Order } from "../_data/orders";
import type { Product } from "../_data/products";
import AdminMetrics from "./AdminMetrics";
import RecentOrders from "./RecentOrders";
import SalesAnalytics from "./SalesAnalytics";
import StockAlerts from "./StockAlerts";

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
  return (
    <>
      <div className="admin-welcome mt-7 flex flex-wrap items-center justify-between gap-5 rounded-[28px] bg-[#20211e] p-6 text-white sm:p-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#E9E2D7]">
            THE LEGACY SOLE WORKSPACE
          </p>
          <h2 className="mt-3 text-2xl font-medium tracking-tight">
            Good details. Great business.
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-white/65">
            Your collection, customers and daily performance, together in one
            place.
          </p>
        </div>
        <button
          type="button"
          onClick={onManageProducts}
          className="flex items-center gap-3 rounded-xl bg-[#E9E2D7] px-5 py-3 text-xs font-semibold text-[#20211e]"
        >
          Manage collection <FiArrowUpRight size={16} />
        </button>
      </div>
      <AdminMetrics products={products} orders={orders} />
      <RecentOrders
        orders={orders}
        onViewAll={onViewOrders}
        onOpenOrder={onOpenOrder}
      />
      <SalesAnalytics orders={orders} />
      <StockAlerts
        products={products}
        catalogError={catalogError}
        onManageStock={onManageStock}
      />
    </>
  );
}
