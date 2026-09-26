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
      <section className="bg-white rounded-[20px] shadow-[0_2px_12px_#20211e04]  border border-black/[0.06]  p-5 sm:p-7">
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
