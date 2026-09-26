"use client";

import Link from "next/link";
import { useState } from "react";
import { FiCheck, FiCopy, FiArrowUpRight } from "react-icons/fi";
import type { Order } from "../_data/orders";
import ProductImage from "./ProductImage";

export default function OrderConfirmation({ order }: { order: Order }) {
  const [copied, setCopied] = useState("");
  return (
    <main className="min-h-[70vh] bg-[#F4F1E9] px-[5%] py-10 sm:py-16">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-[28px] border border-black/10 bg-[#F8F6F1]">
        <header className="bg-[#20211e] px-6 py-8 text-white sm:px-10 sm:py-10">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-white/70">
            <span className="flex size-9 items-center justify-center rounded-full bg-[#E9E2D7] text-[#20211e]">
              <FiCheck size={20} />
            </span>
            Order received
          </div>
          <h1 className="mt-6 text-4xl font-medium tracking-tight sm:text-5xl">
            Thank you, {order.customer.name.split(" ")[0]}.
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-white/65">
            Your order is in. We will contact you to confirm the delivery
            details. Keep your order reference for tracking.
          </p>
        </header>
        <div className="p-6 sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-black/10 bg-[#E9E2D7]/50 p-4">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.14em] text-black/50">
                Order reference
              </p>
              <p className="mt-2 break-all font-mono text-xs sm:text-sm">
                {order.id}
              </p>
            </div>
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(order.id);
                  setCopied("Reference copied.");
                } catch {
                  setCopied("Select the reference above to copy it.");
                }
              }}
              className="inline-flex items-center gap-2 rounded-full border border-black/15 px-4 py-2 text-xs"
            >
              <FiCopy />
              Copy
            </button>
          </div>
          {copied && (
            <p role="status" className="mt-2 text-xs text-black/55">
              {copied}
            </p>
          )}
          <div className="mt-7 grid gap-7 md:grid-cols-2">
            <section>
              <h2 className="text-sm font-semibold">Delivering to</h2>
              <p className="mt-3 text-sm leading-6 text-black/65">
                {order.customer.name}
                <br />
                {order.customer.address}
                <br />
                {[
                  order.customer.area,
                  order.customer.city,
                  order.customer.postalCode,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <p className="mt-2 break-words text-xs leading-6 text-black/55">
                {order.customer.phone}
                <br />
                {order.customer.email}
              </p>
            </section>
            <section className="rounded-2xl bg-[#E9E2D7] p-5">
              <p className="text-xs text-black/55">Total payable on delivery</p>
              <p className="mt-2 text-3xl font-medium tracking-tight">
                Rs. {order.total.toLocaleString("en-PK")}
              </p>
              <p className="mt-3 text-xs text-black/55">
                Cash on delivery · Payment pending
              </p>
              <p className="mt-2 text-xs text-black/55">
                Status: {order.status}
              </p>
            </section>
          </div>
          <section className="mt-7 border-t border-black/10 pt-5">
            <h2 className="text-sm font-semibold">Your order</h2>
            <div className="mt-3 divide-y divide-black/10">
              {order.items.map((item) => (
                <div
                  key={`${item.slug}-${item.size}`}
                  className="flex items-center gap-4 py-3"
                >
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-[#E9E2D7]">
                    <ProductImage
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="64px"
                      className="object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="mt-1 text-xs text-black/50">
                      {item.size} / {item.color} / Qty {item.quantity}
                    </p>
                  </div>
                  <p className="text-xs font-medium">
                    Rs. {(item.price * item.quantity).toLocaleString("en-PK")}
                  </p>
                </div>
              ))}
            </div>
          </section>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Link
              href="/track-order"
              className="flex items-center justify-center gap-2 rounded-full bg-[#20211e] px-6 py-4 text-sm font-medium text-white"
            >
              Track your order <FiArrowUpRight />
            </Link>
            <Link
              href="/shop"
              className="flex items-center justify-center rounded-full border border-black/20 px-6 py-4 text-sm font-medium"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
