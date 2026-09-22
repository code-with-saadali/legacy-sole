"use client";

import OrderExport from "./OrderExport";
import { FiSearch, FiPackage } from "react-icons/fi";
import type { Order } from "../_data/orders";
import OrderTable from "./OrderTable";
import EmptyState from "./EmptyState";

type Props = {
  orders: Order[];
  search: string;
  setSearch: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  onOpenOrder: (id: string) => void;
  onStatusChange: (id: string, status: Order["status"]) => Promise<void>;
  updating: boolean;
};

export default function AdminOrdersPanel({
  orders,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  onOpenOrder,
  onStatusChange,
  updating,
}: Props) {
  const filteredOrders = orders.filter(
    (order) =>
      (statusFilter === "All" || order.status === statusFilter) &&
      `${order.id} ${order.customer.name} ${order.customer.city}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <section className="mt-8 admin-panel rounded-[28px] border border-black/[0.06] bg-white p-5 sm:p-7">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-black/40">
            Manage orders
          </p>
          <h2 className="mt-2 text-3xl text-[#20211e]">All orders</h2>
        </div>
        <span className="text-xs text-black/45">{orders.length} total</span>
      </div>
      <p className="mt-4 text-sm leading-6 text-black/60">
        Start with Pending orders. Confirm the order, add courier details when
        dispatched, then mark it Delivered after delivery.
      </p>
      <div className="mt-5">
        <OrderExport orders={filteredOrders} />
      </div>
      <div className="mt-6 flex flex-col gap-3 2xl:flex-row 2xl:justify-between">
        <label className="flex items-center gap-3 rounded-xl border border-black/10 bg-[#F4F1E9] px-4 py-3">
          <FiSearch className="shrink-0 text-black/40" />
          <input
            aria-label="Search orders"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search order, customer or city..."
            className="w-full bg-transparent text-xs outline-none 2xl:w-60"
          />
        </label>
        <div className="flex flex-wrap gap-1 rounded-xl bg-[#E9E2D7] p-1">
          {[
            "All",
            "Pending",
            "Confirmed",
            "Dispatched",
            "Delivered",
            "Cancelled",
            "Returned",
          ].map((status) => (
            <button
              key={status}
              type="button"
              aria-pressed={statusFilter === status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg px-3 py-2 text-xs ${statusFilter === status ? "bg-white font-semibold text-[#20211e] shadow-sm" : "text-black/50"}`}
            >
              {status} (
              {status === "All"
                ? orders.length
                : orders.filter((order) => order.status === status).length}
              )
            </button>
          ))}
        </div>
      </div>
      {filteredOrders.length ? (
        <OrderTable
          orders={filteredOrders}
          onOpenOrder={onOpenOrder}
          onStatusChange={onStatusChange}
          updating={updating}
        />
      ) : (
        <EmptyState
          icon={FiPackage}
          text={
            orders.length
              ? "No orders match your search or filter."
              : "No orders have been placed yet."
          }
        />
      )}
    </section>
  );
}
