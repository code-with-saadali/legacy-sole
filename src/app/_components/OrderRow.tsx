"use client";

import { orderStatusClasses } from "../_data/order-status-styles";
import {
  FiArrowUpRight,
  FiClock,
  FiCheckCircle,
  FiTrash2,
} from "react-icons/fi";
import type { Order } from "../_data/orders";
import OrderStatusSelect from "./OrderStatusSelect";
import { useState } from "react";

type Props = {
  order: Order;
  onOpen: () => void;
  onStatusChange:
    ((id: string, status: Order["status"]) => Promise<void>) | undefined;
  updating: boolean;
  onDelete?: (id: string) => Promise<boolean>;
};

export default function OrderRow({
  order,
  onOpen,
  onStatusChange,
  updating,
  onDelete,
}: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  return (
    <li
      className={`grid min-w-0 grid-cols-2 items-start gap-x-4 gap-y-4 bg-[#F8F6F1] px-5 py-4 transition-colors hover:bg-[#F4F1E9] xl:items-center ${onDelete && onStatusChange ? "xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_48px_100px_140px_80px]" : onDelete ? "xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_100px_140px_80px]" : onStatusChange ? "xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_60px_110px_145px]" : "xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_110px_130px]"}`}
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
            className="block truncate text-xs font-medium leading-5 text-[#20211e]"
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
        <p className="whitespace-nowrap text-sm font-semibold tabular-nums">
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
              className={`${orderStatusClasses[order.status] ?? ""} inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px]`}
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
      {onDelete && (
        <div className="flex items-center justify-end self-center">
          <button
            type="button"
            disabled={updating}
            aria-label={`Delete order ${order.id}`}
            onClick={() => setConfirmDelete(true)}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            <FiTrash2 size={13} /> Delete
          </button>
        </div>
      )}
      {onDelete && confirmDelete && (
        <div className="col-span-full flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <div>
            <p className="text-xs font-medium text-red-800">
              Delete this order for {order.customer.name}?
            </p>
            <p className="mt-1 text-[11px] text-black/55">
              Removes it from the admin list. Stock stays unchanged.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={updating}
              onClick={async () => {
                if (await onDelete(order.id)) setConfirmDelete(false);
              }}
              className="rounded-lg bg-red-700 px-4 py-2 text-xs text-white disabled:opacity-50"
            >
              {updating ? "Please wait..." : "Confirm delete"}
            </button>
            <button
              type="button"
              disabled={updating}
              onClick={() => setConfirmDelete(false)}
              className="rounded-lg border border-black/15 bg-white px-4 py-2 text-xs disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
