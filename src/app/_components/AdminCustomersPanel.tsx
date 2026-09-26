"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiUsers,
  FiRepeat,
  FiMapPin,
  FiShoppingBag,
  FiSearch,
  FiArrowUpRight,
} from "react-icons/fi";
import type { Order } from "../_data/orders";
import MetricCard from "./MetricCard";
import CustomerRequests from "./CustomerRequests";
import ReviewModeration from "./ReviewModeration";

export default function AdminCustomersPanel({
  orders,
  onOpenOrder,
}: {
  orders: Order[];
  onOpenOrder: (id: string) => void;
}) {
  const [view, setView] = useState("Directory");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (selected && view === "Directory") {
      detailsRef.current?.scrollIntoView({
        block: "nearest",
        behavior: "instant",
      });
    }
  }, [selected, view]);
  const customers = useMemo(() => {
    const grouped = new Map<
      string,
      { key: string; customer: Order["customer"]; orders: Order[] }
    >();
    for (const order of [...orders].sort(
      (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
    )) {
      const key =
        order.customer.email.trim().toLowerCase() ||
        order.customer.phone.replace(/\D/g, "") ||
        order.id;
      const existing = grouped.get(key);
      if (existing) existing.orders.push(order);
      else grouped.set(key, { key, customer: order.customer, orders: [order] });
    }
    return [...grouped.values()];
  }, [orders]);
  const visible = customers.filter(({ customer }) =>
    `${customer.name} ${customer.email} ${customer.phone} ${customer.city}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  const active = customers.find((customer) => customer.key === selected);
  const spent = (history: Order[]) =>
    history
      .filter((order) => order.status === "Delivered")
      .reduce((sum, order) => sum + order.total, 0);
  return (
    <div className="mt-7 space-y-6">
      <div className="rounded-[24px] border border-black/10 bg-[#E9E2D7] p-6 sm:p-8">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#796452]">
          Customer management
        </p>
        <h2 className="mt-3 text-2xl font-medium tracking-tight">
          Your customers
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-black/55">
          Customer details, order history and support — all in one place.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <MetricCard
          label="Customers"
          value={String(customers.length)}
          icon={FiUsers}
          note="Unique customers from placed orders"
        />
        <MetricCard
          label="Returning customers"
          value={String(customers.filter((c) => c.orders.length > 1).length)}
          icon={FiRepeat}
          note="Customers with more than one order"
        />
        <MetricCard
          label="Cities reached"
          value={String(
            new Set(
              customers
                .map((c) => c.customer.city.trim().toLowerCase())
                .filter(Boolean),
            ).size,
          )}
          icon={FiMapPin}
          note="Across your customer directory"
        />
        <MetricCard
          label="Delivered value"
          value={`Rs. ${spent(orders).toLocaleString("en-PK")}`}
          icon={FiShoppingBag}
          note="Delivered orders only"
        />
      </div>
      <div
        className="flex w-fit max-w-full flex-wrap gap-1 rounded-2xl border border-black/10 bg-white p-1.5"
        aria-label="Customer sections"
      >
        {["Directory", "Requests", "Reviews"].map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={view === item}
            onClick={() => setView(item)}
            className={`rounded-xl px-5 py-3 text-xs font-medium transition ${view === item ? "bg-[#20211e] text-white shadow-sm" : "text-black/55 hover:bg-[#F4F1E9]"}`}
          >
            {item}
          </button>
        ))}
      </div>
      {view === "Requests" && <CustomerRequests onOpenOrder={onOpenOrder} />}
      {view === "Reviews" && <ReviewModeration />}
      {view === "Directory" && (
        <section className="bg-white rounded-[20px] shadow-[0_2px_12px_#20211e04]  border border-black/[0.06] p-5 sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-black/40">
                Customer directory
              </p>
              <h2 className="mt-2 text-2xl font-medium">
                All customers{" "}
                <span className="text-base text-black/40">
                  ({customers.length})
                </span>
              </h2>
              <p className="mt-2 text-xs text-black/45">
                Customer details reflect their most recent order.
              </p>
            </div>
            <label className="flex w-full items-center gap-3 rounded-xl border border-black/10 bg-[#FAF9F6] px-4 py-3 focus-within:border-[#4b5b40] focus-within:ring-1 focus-within:ring-[#4b5b40] sm:w-72">
              <FiSearch className="shrink-0 text-black/40" />
              <input
                aria-label="Search customers"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Name, email, phone or city"
                className="min-w-0 flex-1 bg-transparent text-xs outline-none"
              />
            </label>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((entry) => (
              <article
                key={entry.key}
                className={`min-w-0 rounded-2xl border p-5 transition-colors ${selected === entry.key ? "border-[#4b5b40] bg-[#f3f5ef]" : "border-black/10 bg-[#FAF9F6] hover:border-black/20"}`}
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E9E2D7] text-sm font-semibold text-[#625143]">
                    {entry.customer.name
                      .trim()
                      .split(/\s+/)
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase() || "?"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="break-words text-sm font-semibold">
                      {entry.customer.name || "Customer"}
                    </h3>
                    <p className="mt-1 flex items-center gap-1 text-xs text-black/50">
                      <FiMapPin className="shrink-0" />
                      {entry.customer.city || "City not provided"}
                    </p>
                  </div>
                  {entry.orders.length > 1 && (
                    <span className="rounded-full bg-[#e8eddf] px-2 py-1 text-[10px] font-medium text-[#4b5b40]">
                      Returning
                    </span>
                  )}
                </div>
                <div className="mt-4 space-y-1 text-xs leading-5 text-black/55">
                  <p className="break-all">
                    {entry.customer.email || "No email provided"}
                  </p>
                  <p>{entry.customer.phone || "No phone provided"}</p>
                </div>
                <dl className="my-4 grid grid-cols-2 gap-3 border-y border-black/[0.07] py-4">
                  <div>
                    <dt className="text-[10px] uppercase tracking-wider text-black/45">
                      Orders
                    </dt>
                    <dd className="mt-1 text-lg font-semibold">
                      {entry.orders.length}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-wider text-black/45">
                      Delivered value
                    </dt>
                    <dd className="mt-1 text-sm font-semibold">
                      Rs. {spent(entry.orders).toLocaleString("en-PK")}
                    </dd>
                  </div>
                </dl>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[11px] text-black/45">
                    Last order
                    <br />
                    <span className="mt-1 inline-block text-black/70">
                      {new Date(entry.orders[0].createdAt).toLocaleDateString(
                        "en-PK",
                        { day: "numeric", month: "short", year: "numeric" },
                      )}
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setSelected(selected === entry.key ? null : entry.key)
                    }
                    aria-expanded={selected === entry.key}
                    aria-controls="customer-details"
                    aria-label={`View ${entry.customer.name}'s details`}
                    className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2.5 text-xs font-medium transition hover:bg-[#E9E2D7]"
                  >
                    View details <FiArrowUpRight />
                  </button>
                </div>
              </article>
            ))}
          </div>
          {!visible.length && (
            <div className="py-12 text-center">
              <FiUsers className="mx-auto text-[#4b5b40]" size={28} />
              <p className="mt-3 text-sm">
                {query
                  ? "No customers match your search."
                  : "Your customers will appear with their first order."}
              </p>
            </div>
          )}
          <p className="mt-4 text-[11px] text-black/40">
            {visible.length} of {customers.length} customers
          </p>
          {active && (
            <div
              ref={detailsRef}
              id="customer-details"
              role="region"
              aria-label="Customer details"
              className="mt-6 rounded-2xl border border-[#4b5b40]/25 bg-[#f3f5ef] p-5 sm:p-6"
            >
              <div className="flex justify-between gap-4">
                <div className="min-w-0 break-words">
                  <h3 className="font-medium">{active.customer.name}</h3>
                  <p className="mt-2 text-xs text-black/50">
                    {active.customer.phone} · {active.customer.email}
                  </p>
                  <p className="mt-1 text-xs text-black/50">
                    {[
                      active.customer.address,
                      active.customer.area,
                      active.customer.city,
                      active.customer.postalCode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="self-start rounded-lg border border-black/10 px-3 py-2 text-xs"
                >
                  Close
                </button>
              </div>
              <h4 className="mt-5 text-[10px] uppercase tracking-[0.16em] text-black/40">
                Order history
              </h4>
              <div className="mt-2 divide-y divide-black/5">
                {active.orders.map((order) => (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => onOpenOrder(order.id)}
                    className="flex w-full flex-wrap items-center justify-between gap-3 py-4 text-left text-xs hover:text-[#4b5b40]"
                  >
                    <span className="break-all">{order.id}</span>
                    <span>
                      {order.status} · Rs. {order.total.toLocaleString("en-PK")}
                    </span>
                    <FiArrowUpRight />
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
