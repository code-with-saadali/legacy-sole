"use client";

import { useMemo } from "react";
import type { Order } from "../_data/orders";

export default function SalesAnalytics({ orders }: { orders: Order[] }) {
  const points = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      const key = date.toISOString().slice(0, 10);
      return { label: date.toLocaleDateString(undefined, { weekday: "short" }), value: orders.filter(order => order.createdAt.slice(0, 10) === key).reduce((sum, order) => sum + order.total, 0) };
    });
  }, [orders]);
  const max = Math.max(...points.map(point => point.value), 1);
  return <section className="mt-8 border border-black/10 bg-[#F8F6F1] p-6"><div className="flex items-end justify-between"><div><p className="text-[10px] uppercase tracking-[0.16em] text-black/40">Performance / last 7 days</p><h2 className="mt-2 text-2xl text-[#20211e]">Sales analytics</h2></div><span className="text-xs text-black/40">Rs. {points.reduce((sum, point) => sum + point.value, 0).toLocaleString()}</span></div><div className="mt-8 flex h-44 items-end gap-3 border-b border-black/10">{points.map(point => <div key={point.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><span className="text-[9px] text-black/40">{point.value ? `Rs. ${(point.value / 1000).toFixed(1)}k` : ""}</span><div className="w-full max-w-12 bg-[#4b5a42] transition-all" style={{ height: `${Math.max((point.value / max) * 100, 3)}%` }} /><span className="text-[10px] text-black/45">{point.label}</span></div>)}</div></section>;
}
