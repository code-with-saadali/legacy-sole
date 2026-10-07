"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FiArrowUpRight, FiPackage, FiTrash2 } from "react-icons/fi";
import {
  deleteOrderHistory,
  readOrderHistory,
  type Order,
} from "../_data/orders";
import ProductImage from "./ProductImage";
import Modal from "./Modal";

export default function CustomerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [feedback, setFeedback] = useState("");
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  const handleDelete = (orderId: string) => {
    setOrderToDelete(null);
    setFeedback(
      deleteOrderHistory(orderId)
        ? `Order ${orderId} deleted from this device's history.`
        : "Unable to delete this order. Please check your browser storage settings and try again.",
    );
  };

  useEffect(() => {
    const load = () => setOrders(readOrderHistory());
    load();
    window.addEventListener("order-history-updated", load);
    return () => window.removeEventListener("order-history-updated", load);
  }, []);

  return (
    <main className="min-h-[70vh] bg-[#F4F1E9] px-[5%] pb-24 pt-14 sm:pt-18">
      <div className="w-full">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#ed682c]">
          Legacy Sole / Customer dashboard
        </p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="text-[clamp(42px,6vw,72px)] font-medium leading-none tracking-[-0.06em] text-[#20211e]">
              My orders.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-black/55">
              Your recent orders on this device. Open any order to see its
              reference and latest delivery status.
            </p>
          </div>
          <Link
            href="/track-order"
            className="inline-flex items-center gap-2 border-b border-black/25 pb-1 text-xs font-medium text-[#20211e] hover:border-[#ed682c] hover:text-[#ed682c]"
          >
            Track another order <FiArrowUpRight size={15} />
          </Link>
        </div>

        <p
          role="status"
          aria-live="polite"
          className="mt-4 text-sm text-[#4b5a42]"
        >
          {feedback}
        </p>

        {!orders.length ? (
          <section className="mt-10 rounded-[28px] border border-dashed border-black/15 bg-[#F8F6F1] px-6 py-14 text-center">
            <span className="mx-auto flex size-13 items-center justify-center rounded-2xl bg-[#E9E2D7] text-[#4b5a42]">
              <FiPackage size={25} />
            </span>
            <h2 className="mt-5 text-2xl font-medium">No saved orders yet.</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-black/55">
              After placing an order, its reference and items will stay here so
              you can find them again.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex rounded-full bg-[#20211e] px-6 py-3 text-xs font-medium text-white hover:bg-[#ed682c]"
            >
              Explore the shop
            </Link>
          </section>
        ) : (
          <div className="mt-10 grid gap-5">
            {orders.map((order) => {
              const trackHref = `/track-order?reference=${encodeURIComponent(order.id)}&email=${encodeURIComponent(order.customer.email)}`;
              return (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-[24px] border border-black/10 bg-[#F8F6F1]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black/10 bg-[#E9E2D7]/55 px-5 py-4 sm:px-6">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.15em] text-black/45">
                        Order reference
                      </p>
                      <p className="mt-1 font-mono text-xs font-medium sm:text-sm">
                        {order.id}
                      </p>
                      <p className="mt-2 text-xs text-black/50">
                        {new Date(order.createdAt).toLocaleDateString("en-PK", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#4b5a42]">
                      {order.status}
                    </span>
                  </div>
                  <div className="p-5 sm:p-6">
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div
                          key={`${item.slug}-${item.size}`}
                          className="flex items-center gap-3"
                        >
                          <div className="relative size-13 shrink-0 overflow-hidden rounded-xl bg-[#E9E2D7]">
                            <ProductImage
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="52px"
                              className="object-contain"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {item.name}
                            </p>
                            <p className="mt-1 text-xs text-black/50">
                              {item.size} · {item.color} · Qty {item.quantity}
                            </p>
                          </div>
                          <p className="text-xs font-medium">
                            Rs.{" "}
                            {(item.price * item.quantity).toLocaleString(
                              "en-PK",
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-black/10 pt-4">
                      <strong className="text-sm">
                        Total: Rs. {order.total.toLocaleString("en-PK")}
                      </strong>
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setOrderToDelete(order.id)}
                          aria-label={`Delete order ${order.id} from history`}
                          className="inline-flex items-center gap-2 rounded-full border border-red-700/20 px-4 py-2.5 text-xs font-medium text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
                        >
                          <FiTrash2 size={14} /> Delete
                        </button>
                        <Link
                          href={trackHref}
                          className="inline-flex items-center gap-2 rounded-full bg-[#20211e] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#ed682c]"
                        >
                          Track order <FiArrowUpRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
      {orderToDelete !== null && (
        <Modal
          title="Delete this order?"
          onClose={() => setOrderToDelete(null)}
        >
          <div className="flex size-14 items-center justify-center rounded-2xl bg-red-100 text-red-700">
            <FiTrash2 size={25} aria-hidden="true" />
          </div>
          <p className="mt-5 text-sm leading-6 text-black/65">
            This order will be removed from your history on this device. This
            does not cancel your order or stop its delivery.
          </p>
          <div className="mt-4 rounded-2xl border border-black/10 bg-[#E9E2D7]/55 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.15em] text-black/45">
              Order reference
            </p>
            <p className="mt-1 break-all font-mono text-sm font-medium">
              {orderToDelete}
            </p>
          </div>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setOrderToDelete(null)}
              className="rounded-full border border-black/15 px-6 py-3 text-sm font-medium hover:bg-[#E9E2D7] focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Keep order
            </button>
            <button
              type="button"
              onClick={() => handleDelete(orderToDelete)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-red-700 px-6 py-3 text-sm font-medium text-white hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
            >
              <FiTrash2 size={16} aria-hidden="true" /> Delete order
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}
