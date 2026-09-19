"use client";
import CustomSelect from "./CustomSelect";

import type { Order } from "../_data/orders";

type Props = {
  order: Order;
  disabled: boolean;
  onChange: (id: string, status: Order["status"]) => Promise<void>;
};

export default function OrderStatusSelect({
  order,
  disabled,
  onChange,
}: Props) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={`order-status-${order.id}`}
        className="mb-2 block text-[9px] uppercase tracking-[0.14em] text-black/40 xl:sr-only"
      >
        Status
      </label>
      <CustomSelect id={`order-status-${order.id}`} label={`Status for order ${order.id}`} value={order.status} disabled={disabled || order.status === "Cancelled" || order.status === "Returned"} onChange={value => void onChange(order.id,value as Order["status"])} options={["Pending","Confirmed","Dispatched","Delivered",...(["Cancelled","Returned"].includes(order.status)?[order.status]:[])].map(value=>({value,label:value}))} />
    </div>
  );
}
