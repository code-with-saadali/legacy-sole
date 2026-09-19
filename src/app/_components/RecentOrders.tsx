"use client";

import { FiClock } from "react-icons/fi";
import type { Order } from "../_data/orders";
import EmptyState from "./EmptyState";
import OrderTable from "./OrderTable";

type Props = {
  orders: Order[];
  onViewAll: () => void;
  onOpenOrder: (id: string) => void;
};

export default function RecentOrders({
  orders,
  onViewAll,
  onOpenOrder,
}: Props) {
  return (
    <div className="mt-8 w-full">
      <section className="admin-panel rounded-[28px] border border-black/[0.06] bg-white p-5 sm:p-7">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl text-[#20211e]">Recent orders</h2>
          <button
            type="button"
            onClick={onViewAll}
            className="text-[10px] uppercase tracking-[0.14em] text-[#b66b4d]"
          >
            View all
          </button>
        </div>
        {orders.length ? (
          <OrderTable orders={orders.slice(0, 5)} onOpenOrder={onOpenOrder} />
        ) : (
          <EmptyState
            icon={FiClock}
            text="Orders will appear here after checkout."
          />
        )}
      </section>
    </div>
  );
}
