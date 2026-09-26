"use client";

import { useMemo } from "react";
import { FiBarChart2 } from "react-icons/fi";
import type { Order } from "../_data/orders";

const money = (value: number) =>
  `Rs. ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
const compact = (value: number) =>
  new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

export default function SalesAnalytics({ orders }: { orders: Order[] }) {
  const points = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      const dailyOrders = orders.filter(
        (order) =>
          new Date(order.createdAt).toDateString() === date.toDateString(),
      );
      return {
        key: date.toDateString(),
        label: date.toLocaleDateString(undefined, { weekday: "short" }),
        date: date.toLocaleDateString(undefined, {
          day: "numeric",
          month: "short",
        }),
        value: dailyOrders.reduce((sum, order) => sum + order.total, 0),
        count: dailyOrders.length,
      };
    });
  }, [orders]);
  const total = points.reduce((sum, point) => sum + point.value, 0);
  const count = points.reduce((sum, point) => sum + point.count, 0);
  const peak = Math.max(...points.map((point) => point.value));
  const ceiling = Math.max(100, Math.ceil(peak / 0.85 / 100) * 100);

  return (
    <section className="bg-white rounded-[20px] shadow-[0_2px_12px_#20211e04] mt-8 min-w-0  border border-black/10 p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#4b5b40]">
            Performance / last 7 days
          </p>
          <h2 className="mt-2 text-2xl text-[#20211e]">Weekly order value</h2>
          <p className="mt-2 text-xs text-black/45">
            {points[0].date} – {points[6].date} · Order amounts in PKR
          </p>
        </div>
        <span
          aria-hidden="true"
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E9E2D7] text-[#4b5b40]"
        >
          <FiBarChart2 size={21} />
        </span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Total order value", value: money(total) },
          { label: "Orders placed", value: String(count).padStart(2, "0") },
          { label: "Daily average", value: money(total / 7) },
        ].map((metric, index) => (
          <div
            key={metric.label}
            className={`min-w-0 rounded-[20px] border p-4 ${index === 0 ? "border-[#20211e] bg-[#20211e] text-[#F4F1E9]" : "border-black/5 bg-[#E9E2D7]/60 text-[#20211e]"}`}
          >
            <p
              className={`text-[10px] uppercase tracking-[0.12em] ${index === 0 ? "text-white/60" : "text-black/50"}`}
            >
              {metric.label}
            </p>
            <p className="mt-3 break-words text-xl font-semibold tracking-tight sm:text-2xl">
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-7 rounded-[22px] border border-black/5 bg-[#F4F1E9] px-3 pb-4 pt-5 sm:px-5">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2 text-[10px] text-black/50">
          <span>Daily order value</span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#4b5b40]" />
            {peak > 0 ? `Peak day: ${money(peak)}` : "No orders yet"}
          </span>
        </div>
        <div className="relative pl-8 sm:pl-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-44 sm:h-52"
          >
            {[1, 0.5, 0].map((fraction) => (
              <div
                key={fraction}
                className="absolute inset-x-0 flex items-center gap-2"
                style={{ top: `${(1 - fraction) * 100}%` }}
              >
                <span className="w-6 shrink-0 text-right text-[9px] text-black/35 sm:w-10">
                  {compact(ceiling * fraction)}
                </span>
                <span className="w-full border-t border-dashed border-black/10" />
              </div>
            ))}
          </div>
          <ul
            aria-label="Daily order values for the last seven days"
            className="relative grid grid-cols-7 gap-1.5 sm:gap-4"
          >
            {points.map((point, index) => (
              <li key={point.key} className="min-w-0">
                <div
                  tabIndex={0}
                  aria-label={`${point.date}: ${money(point.value)}, ${point.count} orders`}
                  title={`${point.date}: ${money(point.value)} · ${point.count} orders`}
                  className="group relative flex h-44 items-end justify-center rounded-lg outline-offset-4 focus-visible:outline-2 focus-visible:outline-[#4b5b40] sm:h-52"
                >
                  <div
                    className={`relative w-full max-w-12 rounded-t-lg transition-colors ${point.value === peak && peak > 0 ? "bg-[#4b5b40]" : "bg-[#20211e]/75"}`}
                    style={{
                      height: point.value
                        ? `${(point.value / ceiling) * 100}%`
                        : "2px",
                    }}
                  >
                    {point.value > 0 && (
                      <span
                        aria-hidden="true"
                        className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-medium text-[#20211e] sm:text-[10px]"
                      >
                        {compact(point.value)}
                      </span>
                    )}
                  </div>
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute top-0 z-10 w-max max-w-44 rounded-lg bg-[#20211e] px-3 py-2 text-[10px] text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 ${index > 3 ? "right-0" : "left-0"}`}
                  >
                    {point.date} · {money(point.value)}
                  </span>
                </div>
                <p
                  className={`mt-4 text-center text-[10px] ${index === 6 ? "font-semibold text-[#4b5b40]" : "text-black/50"}`}
                >
                  {point.label}
                </p>
                <p className="mt-1 hidden text-center text-[9px] text-black/35 sm:block">
                  {point.date}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {!count && (
        <p className="mt-4 text-xs leading-6 text-black/45">
          No orders in the last 7 days. Your weekly performance will appear
          here.
        </p>
      )}
    </section>
  );
}
