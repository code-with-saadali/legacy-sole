"use client";

import { useMemo, useState } from "react";
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
      <div className="bg-[radial-gradient(ellipse_at_100%_0%,#775442_0%,transparent_65%)] rounded-[28px] bg-[#20211e] p-6 text-white sm:p-8">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#E9E2D7]">
          People behind every order
        </p>
        <h2 className="mt-3 text-2xl font-medium tracking-tight">
          Good service. Lasting connections.
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">
          Get to know your customers, follow their orders and give every request
          the attention it deserves.
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
      <div className="flex flex-wrap gap-2" aria-label="Customer sections">
        {["Directory", "Requests", "Reviews"].map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={view === item}
            onClick={() => setView(item)}
            className={`rounded-xl px-5 py-3 text-xs font-medium ${view === item ? "bg-[#20211e] text-white" : "bg-[#E9E2D7] text-[#20211e]"}`}
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
                A familiar face with every order.
              </h2>
              <p className="mt-2 text-xs text-black/45">
                Customer details reflect their most recent order.
              </p>
            </div>
            <label className="flex w-full items-center gap-3 rounded-xl border border-black/10 bg-white px-4 py-3 sm:w-72">
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
          <div className="mt-6 overflow-x-auto rounded-2xl border border-black/[0.06]">
            <table className="w-full min-w-[700px] text-left text-xs">
              <thead>
                <tr>
                  {[
                    "Customer",
                    "City",
                    "Orders",
                    "Delivered value",
                    "Latest order",
                    "",
                  ].map((label, index) => (
                    <th key={index} scope="col">
                      {label || <span className="sr-only">Actions</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.06]">
                {visible.map((entry) => (
                  <tr key={entry.key}>
                    <td>
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E9E2D7] font-semibold text-[#956248]">
                          {entry.customer.name
                            .split(/\s+/)
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </span>
                        <div>
                          <p className="font-medium">{entry.customer.name}</p>
                          <p className="mt-1 text-black/45">
                            {entry.customer.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>{entry.customer.city}</td>
                    <td>{entry.orders.length}</td>
                    <td>Rs. {spent(entry.orders).toLocaleString("en-PK")}</td>
                    <td>
                      {new Date(entry.orders[0].createdAt).toLocaleDateString(
                        "en-PK",
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() =>
                          setSelected(selected === entry.key ? null : entry.key)
                        }
                        aria-expanded={selected === entry.key}
                        className="flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2"
                      >
                        View <FiArrowUpRight />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!visible.length && (
            <div className="py-12 text-center">
              <FiUsers className="mx-auto text-[#b66b4d]" size={28} />
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
            <div className="mt-6 rounded-2xl border border-black/10 bg-white p-5">
              <div className="flex justify-between gap-4">
                <div>
                  <h3 className="font-medium">{active.customer.name}</h3>
                  <p className="mt-2 text-xs text-black/50">
                    {active.customer.phone} · {active.customer.email}
                  </p>
                  <p className="mt-1 text-xs text-black/50">
                    {active.customer.address}, {active.customer.city}
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
                    className="flex w-full flex-wrap items-center justify-between gap-3 py-4 text-left text-xs hover:text-[#b66b4d]"
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
