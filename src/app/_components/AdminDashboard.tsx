"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FiArrowUpRight,
  FiBox,
  FiCheckCircle,
  FiClock,
  FiImage,
  FiPackage,
  FiShoppingBag,
} from "react-icons/fi";
import { useCatalog } from "./CatalogProvider";
import { type Order } from "../_data/orders";
import AdminProductEditor from "./AdminProductEditor";
import SalesAnalytics from "./SalesAnalytics";
import { supabase } from "../../lib/supabase";

type Tab = "Overview" | "Orders" | "Products";

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("Overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const { products: adminProducts, refresh, connection, error: catalogError } = useCatalog();
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    document.body.classList.add("admin-mode");
    return () => document.body.classList.remove("admin-mode");
  }, []);

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    let active = true;
    let version = 0;
    const loadOrders = async () => {
      const current = ++version;
      const { data, error } = await client.from("orders").select("*").order("created_at", { ascending: false });
      if (!active || current !== version) return;
      if (error) { setError(error.message); return; }
      setOrders((data ?? []).map((row) => ({ ...row, createdAt: row.created_at })) as Order[]);
      setError("");
    };
    void loadOrders();
    const channel = client.channel("admin-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => void loadOrders())
      .subscribe(status => { if (status === "SUBSCRIBED") void loadOrders(); });
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") void loadOrders(); }, 30000);
    return () => { active = false; window.clearInterval(timer); void client.removeChannel(channel); };
  }, []);

  const metrics = [
    {
      label: "Total products",
      value: adminProducts.length.toString().padStart(2, "0"),
      icon: FiBox,
      note: "Pieces in your catalogue",
    },
    {
      label: "Collections",
      value: new Set(adminProducts.map((product) => product.category)).size.toString().padStart(2, "0"),
      icon: FiPackage,
      note: "Curated product edits",
    },
    {
      label: "New enquiries",
      value: orders.filter((order) => order.status === "Pending").length.toString().padStart(2, "0"),
      icon: FiShoppingBag,
      note: "Awaiting your attention",
    },
    {
      label: "Media assets",
      value: adminProducts.filter((product) => product.image).length.toString().padStart(2, "0"),
      icon: FiImage,
      note: "Images in your library",
    },
  ];

  const updateStatus = async (id: string, status: Order["status"]) => {
    if (!supabase || updating) return;
    setUpdating(id);
    setError("");
    try {
      const { data, error } = await supabase.from("orders").update({ status }).eq("id", id).select("id,status").single();
      if (error) throw error;
      setOrders(current => current.map(order => order.id === data.id ? { ...order, status: data.status } : order));
    } catch (cause) {
      setError((cause as { message?: string }).message || "Order status could not be saved.");
    } finally { setUpdating(null); }
  };

  return (
    <main className="min-h-screen bg-[#f0eee6]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-black/10 bg-[#20211e] px-6 py-8 text-white lg:flex lg:flex-col">
        <Link href="/" className="border-b border-white/10 pb-8">
          <span className="text-2xl font-black tracking-[-1.5px]">LEGACY SOLE</span>
          <span className="mt-2 block text-[9px] uppercase tracking-[0.24em] text-white/35">Admin workspace</span>
        </Link>
        <p className="mt-10 text-[9px] uppercase tracking-[0.2em] text-white/30">Manage store</p>
        <nav className="mt-4 space-y-2" aria-label="Dashboard sections">
          {(["Overview", "Orders", "Products"] as Tab[]).map((item) => {
            const Icon = item === "Overview" ? FiBox : item === "Orders" ? FiShoppingBag : FiPackage;
            return <button key={item} type="button" onClick={() => setTab(item)} className={`flex w-full items-center gap-3 px-4 py-3 text-left text-[11px] font-medium uppercase tracking-[0.12em] transition-colors ${tab === item ? "bg-[#4b5a42] text-white" : "text-white/50 hover:bg-white/5 hover:text-white"}`}><Icon size={16} /> {item}</button>;
          })}
        </nav>
        <div className="mt-auto border-t border-white/10 pt-6"><p className="text-[9px] uppercase tracking-[0.18em] text-white/30">Live connection</p><p className="mt-2 flex items-center gap-2 text-xs text-white/70"><span className="h-1.5 w-1.5 rounded-full bg-[#7dbb7a]" /> {connection === "Live" ? "Supabase connected" : connection}</p><Link href="/" className="mt-6 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-white/45 hover:text-white">View storefront <FiArrowUpRight size={13} /></Link></div>
      </aside>

      <div className="border-b border-black/10 bg-[#20211e] px-5 py-3 text-white lg:hidden"><div className="flex items-center justify-between"><span className="text-sm font-black tracking-[-0.8px]">LEGACY SOLE</span><span className="text-[9px] uppercase tracking-[0.16em] text-white/45">Admin workspace</span></div><div className="mt-3 flex gap-2 overflow-x-auto">{(["Overview", "Orders", "Products"] as Tab[]).map((item) => <button key={item} type="button" onClick={() => setTab(item)} className={`whitespace-nowrap px-3 py-2 text-[10px] uppercase tracking-[0.1em] ${tab === item ? "bg-[#4b5a42] text-white" : "text-white/50"}`}>{item}</button>)}</div></div>

      <div className="min-h-screen px-5 pb-24 pt-10 lg:ml-64 lg:px-10 lg:pt-12 xl:px-14">
      <div className="flex flex-col justify-between gap-6 border-b border-black/10 pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-black/40">
              Legacy Sole / Control room
            </p>
            <h1 className="mt-3 text-6xl text-[#20211e] sm:text-8xl">
              Dashboard
            </h1>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-black/55 hover:text-[#4b5a42]"
          >
            View storefront <FiArrowUpRight size={15} />
          </Link>
        </div>

        {(error || catalogError) && <p role="alert" className="mt-4 text-sm text-red-700">{error || catalogError}</p>}
        {tab === "Overview" && (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map(({ label, value, icon: Icon, note }) => (
                <div
                  key={label}
                  className="border border-black/10 bg-[#F8F6F1] p-5"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-black/45">
                      {label}
                    </p>
                    <Icon className="text-[#4b5a42]" size={17} />
                  </div>
                  <p className="mt-5 text-3xl text-[#20211e]">{value}</p>
                  <p className="mt-2 text-[11px] text-black/40">{note}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 w-full">
              <section className="border border-black/10 bg-[#F8F6F1] p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl text-[#20211e]">Recent orders</h2>
                  <button
                    type="button"
                    onClick={() => setTab("Orders")}
                    className="text-[10px] uppercase tracking-[0.14em] text-[#4b5a42]"
                  >
                    View all
                  </button>
                </div>
                {orders.length ? (
                  <div className="mt-5 divide-y divide-black/10">
                    {orders.slice(0, 5).map((order) => (
                      <OrderRow key={order.id} order={order} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={FiClock}
                    text="Orders will appear here after checkout."
                  />
                )}
              </section>
            </div>
            <SalesAnalytics orders={orders} />
          </>
        )}

        {tab === "Orders" && (
          <section className="mt-8 border border-black/10 bg-[#F8F6F1] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-black/40">
                  Fulfilment
                </p>
                <h2 className="mt-2 text-3xl text-[#20211e]">All orders</h2>
              </div>
              <span className="text-xs text-black/45">
                {orders.length} total
              </span>
            </div>
            {orders.length ? (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-175 text-left text-xs">
                  <thead className="border-b border-black/10 text-[9px] uppercase tracking-[0.14em] text-black/40">
                    <tr>
                      <th className="pb-3">Order</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Items</th>
                      <th className="pb-3">Total</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/10">
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className="py-4 font-medium">{order.id}</td>
                        <td className="py-4">
                          <p>{order.customer.name}</p>
                          <p className="mt-1 text-black/40">
                            {order.customer.city}
                          </p>
                        </td>
                        <td className="py-4 text-black/55">
                          {order.items.length}
                        </td>
                        <td className="py-4">
                          Rs. {order.total.toLocaleString()}
                        </td>
                        <td className="py-4">
                          <select
                            disabled={updating !== null}
                            value={order.status}
                            onChange={(event) =>
                              updateStatus(
                                order.id,
                                event.target.value as Order["status"],
                              )
                            }
                            className="border border-black/10 bg-transparent px-2 py-1 text-[11px] outline-none"
                          >
                            <option>Pending</option>
                            <option>Confirmed</option>
                            <option>Delivered</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={FiPackage}
                text="No orders have been placed yet."
              />
            )}
          </section>
        )}

        {tab === "Products" && (
          <section className="mt-8 border border-black/10 bg-[#F8F6F1] p-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-black/40">
                Catalogue management
              </p>
              <h2 className="mt-2 text-3xl text-[#20211e]">
                Products & inventory
              </h2>
              <p className="mt-2 max-w-xl text-xs leading-5 text-black/45">
                Update product pricing, descriptions, colourways, tags and
                images from here. Changes are saved to the database and shared across the website.
              </p>
            </div>
            <AdminProductEditor initialProducts={adminProducts} onProductsChange={() => void refresh()} />
          </section>
        )}
      </div>
    </main>
  );
}

function OrderRow({ order }: { order: Order }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-4">
      <div>
        <p className="text-xs font-medium">
          {order.id}{" "}
          <span className="ml-2 text-black/40">{order.customer.name}</span>
        </p>
        <p className="mt-1 text-[10px] text-black/40">
          {new Date(order.createdAt).toLocaleDateString()} /{" "}
          {order.items.length} items
        </p>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs">Rs. {order.total.toLocaleString()}</span>
        <span className="flex items-center gap-1 text-[10px] text-[#4b5a42]">
          <FiCheckCircle size={13} /> {order.status}
        </span>
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  text,
}: {
  icon: typeof FiClock;
  text: string;
}) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <Icon className="text-black/25" size={25} />
      <p className="mt-4 text-xs text-black/45">{text}</p>
    </div>
  );
}
