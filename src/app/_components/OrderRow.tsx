"use client";

import { FiArrowUpRight, FiClock, FiCheckCircle } from "react-icons/fi";
import type { Order } from "../_data/orders";
import OrderStatusSelect from "./OrderStatusSelect";

type Props = {
  order: Order;
  onOpen: () => void;
  onStatusChange:
    ((id: string, status: Order["status"]) => Promise<void>) | undefined;
  updating: boolean;
};

export default function OrderRow({
  order,
  onOpen,
  onStatusChange,
  updating,
}: Props) {
  return (
    <li
      className={`grid min-w-0 grid-cols-2 items-start gap-x-4 gap-y-5 bg-[#F8F6F1] p-5 transition-colors hover:bg-[#F4F1E9] xl:items-center ${onStatusChange ? "xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_60px_110px_145px]" : "xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_110px_130px]"}`}
    >
      <div className="col-span-2 min-w-0 xl:col-span-1">
        <button
          type="button"
          onClick={onOpen}
          className="group block w-full min-w-0 text-left"
          aria-label={`View details for order ${order.id}`}
        >
          <span
            title={order.id}
            className="block break-all font-mono text-xs font-medium leading-5 text-[#20211e]"
          >
            {order.id}
          </span>
          <span className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-[#b66b4d] group-hover:underline">
            View details <FiArrowUpRight size={13} />
          </span>
        </button>
        <p className="mt-2 text-[10px] text-black/45">
          {new Date(order.createdAt).toLocaleDateString()}
          {!onStatusChange &&
            ` / ${order.items.reduce((total, item) => total + item.quantity, 0)} items`}
        </p>
      </div>
      <div className="min-w-0">
        <p className="mb-2 text-[9px] uppercase tracking-[0.14em] text-black/40 xl:hidden">
          Customer
        </p>
        <p className="break-words text-sm font-medium">{order.customer.name}</p>
        <p className="mt-1 wrap-break-word text-xs text-black/50">
          {order.customer.city}
        </p>
      </div>
      {onStatusChange && (
        <div>
          <p className="mb-2 text-[9px] uppercase tracking-[0.14em] text-black/40 xl:hidden">
            Items
          </p>
          <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-[#E9E2D7] px-2 text-xs font-medium">
            {order.items.reduce((total, item) => total + item.quantity, 0)}
          </span>
        </div>
      )}
      <div className="min-w-0">
        <p className="mb-2 text-[9px] uppercase tracking-[0.14em] text-black/40 xl:hidden">
          Total
        </p>
        <p className="text-sm font-semibold">
          Rs. {order.total.toLocaleString()}
        </p>
      </div>
      <div className="min-w-0">
        {onStatusChange ? (
          <OrderStatusSelect
            order={order}
            disabled={updating}
            onChange={onStatusChange}
          />
        ) : (
          <>
            <p className="mb-2 text-[9px] uppercase tracking-[0.14em] text-black/40 xl:hidden">
              Status
            </p>
            <span
              className={`admin-status admin-status-${order.status.toLowerCase()} inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px]`}
            >
              {order.status === "Pending" ? (
                <FiClock size={13} />
              ) : (
                <FiCheckCircle size={13} />
              )}{" "}
              {order.status}
            </span>
          </>
        )}
      </div>
    </li>
  );
}
