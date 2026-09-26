"use client";
import type { Order } from "../_data/orders";
import OrderRow from "./OrderRow";

type Props = {
  orders: Order[];
  onOpenOrder: (id: string) => void;
  onStatusChange?: (id: string, status: Order["status"]) => Promise<void>;
  updating?: boolean;
  onDelete?: (id: string) => Promise<boolean>;
};
export default function OrderTable({
  orders,
  onOpenOrder,
  onStatusChange,
  updating = false,
  onDelete,
}: Props) {
  return (
    <div className="mt-5 overflow-hidden rounded-[22px] border border-black/10">
      <div
        aria-hidden="true"
        className={`hidden gap-4 bg-[#E9E2D7] px-5 py-4 text-[10px] font-medium uppercase tracking-[0.14em] text-black/50 xl:grid ${onDelete && onStatusChange ? "grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_48px_100px_140px_80px]" : onDelete ? "grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_100px_140px_80px]" : onStatusChange ? "grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_60px_110px_145px]" : "grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_110px_130px]"}`}
      >
        <span>Order</span>
        <span>Customer</span>
        {onStatusChange && <span>Items</span>}
        <span>Total</span>
        <span>Status</span>
        {onDelete && <span className="text-right">Actions</span>}
      </div>
      <ul className="divide-y divide-black/10">
        {orders.map((order) => (
          <OrderRow
            key={order.id}
            order={order}
            onOpen={() => onOpenOrder(order.id)}
            onStatusChange={onStatusChange}
            updating={updating}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </div>
  );
}
