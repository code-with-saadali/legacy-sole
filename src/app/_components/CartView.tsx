"use client";

import Image from "./ProductImage";
import Link from "next/link";
import useCart from "../_hooks/useCart";
import {
  FiArrowLeft,
  FiArrowUpRight,
  FiTrash2,
  FiMessageCircle,
  FiShoppingBag,
  FiTruck,
  FiCheck,
} from "react-icons/fi";
import { useStoreSettings } from "./StoreSettingsProvider";
import { supportLink } from "../_data/store-settings";

export default function CartView() {
  const { items, updateCart, issues, ready, error } = useCart();
  const { settings } = useStoreSettings();
  if (!ready)
    return (
      <main className="px-[5%] py-12" role="status">
        Loading your bag...
      </main>
    );

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const freeShippingRemaining = Math.max(
    0,
    settings.free_shipping_minimum - total,
  );

  return (
    <main className="min-h-[70vh] bg-[#F4F1E9] px-[5%] pb-12 pt-6 sm:pt-8">
      <div className="w-full">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-black/50 hover:text-[#4b5a42]"
        >
          <FiArrowLeft size={14} /> Continue shopping
        </Link>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-5">
          <div>
            <h1 className="flex items-center gap-3 text-4xl font-medium leading-none tracking-[-0.05em] text-[#20211e] sm:text-5xl">
              Your bag.
              <span className="flex size-8 items-center justify-center rounded-full bg-[#E9E2D7] text-sm tracking-normal">
                {itemCount}
              </span>
            </h1>
          </div>
          <ol
            aria-label="Checkout steps"
            className="flex flex-wrap items-center gap-3 text-[11px] sm:gap-5"
          >
            <li
              aria-current="step"
              className="flex items-center gap-2 font-medium"
            >
              <span className="flex size-7 items-center justify-center rounded-full bg-[#20211e] text-white">
                01
              </span>{" "}
              Bag
            </li>
            <li className="flex items-center gap-2 text-black/40">
              <span className="flex size-7 items-center justify-center rounded-full border border-black/15">
                02
              </span>{" "}
              Checkout
            </li>
            <li className="flex items-center gap-2 text-black/40">
              <span className="flex size-7 items-center justify-center rounded-full border border-black/15">
                03
              </span>{" "}
              Confirmation
            </li>
          </ol>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </p>
        )}
        {issues.map((issue) => (
          <p key={issue} role="alert" className="mt-3 text-sm text-red-700">
            {issue}
          </p>
        ))}
        {items.length === 0 ? (
          <div className="my-6 rounded-[24px] border border-dashed border-black/15 bg-[#F8F6F1] px-5 py-12 text-center">
            <span className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-[#E9E2D7] text-[#4b5a42]">
              <FiShoppingBag size={32} />
            </span>
            <h2 className="mt-6 text-3xl font-medium tracking-tight">
              A fresh start for your feet.
            </h2>
            <p className="mt-3 text-sm text-black/50">
              Your bag is waiting for its first pair.
            </p>
            <Link
              href="/shop"
              className="mt-7 inline-flex items-center gap-3 rounded-full bg-[#20211e] px-7 py-4 text-sm font-medium text-white hover:bg-[#4b5a42]"
            >
              Find your next pair <FiArrowUpRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="grid items-start gap-5 py-6 lg:grid-cols-[minmax(0,1fr)_350px] xl:grid-cols-[minmax(0,1fr)_390px] xl:gap-8">
            <div className="min-w-0 rounded-[22px] border border-black/10 bg-[#F8F6F1]">
              <div className="flex items-center justify-between border-b border-black/10 px-5 py-4 sm:px-6">
                <h2 className="text-xs font-medium uppercase tracking-[0.12em] text-black/55">
                  Your selection
                </h2>
                <span className="text-[10px] uppercase tracking-[0.15em] text-black/35">
                  {items.length} {items.length === 1 ? "style" : "styles"}
                </span>
              </div>
              {items.map((item) => (
                <article
                  key={`${item.slug}-${item.size}`}
                  className="flex gap-4 border-b border-black/8 p-4 last:border-b-0 sm:gap-5 sm:p-5"
                >
                  <Link
                    href={`/products/${encodeURIComponent(item.slug)}`}
                    aria-label={`View ${item.name}`}
                    className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-[#E9E2D7]/65 sm:h-32 sm:w-32"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 639px) 96px, 128px"
                      className="object-contain"
                    />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row">
                      <div className="min-w-0">
                        <h3 className="text-base font-medium tracking-tight text-[#20211e] sm:text-lg">
                          <Link
                            href={`/products/${encodeURIComponent(item.slug)}`}
                            className="hover:text-[#4b5a42]"
                          >
                            {item.name}
                          </Link>
                        </h3>
                        <p className="mt-2 text-xs text-black/45">
                          {item.color}
                        </p>
                        <span className="mt-2 inline-block rounded-md border border-black/10 px-2 py-1 text-[10px] text-black/60">
                          {item.size}
                        </span>
                      </div>
                      <strong className="shrink-0 text-sm font-medium sm:text-base">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </strong>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs text-black/45">
                        Quantity: {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={`Remove ${item.name}`}
                        onClick={() =>
                          updateCart(
                            items.filter((cartItem) => cartItem !== item),
                          )
                        }
                        className="flex min-h-9 items-center gap-1.5 rounded-full px-2 text-[11px] text-black/40 transition hover:bg-red-50 hover:text-red-700 focus-visible:outline-2"
                      >
                        <FiTrash2 size={14} />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <aside className="h-fit min-w-0 rounded-[22px] border border-black/10 bg-[#E9E2D7]/60 p-5 lg:sticky lg:top-28">
              <h2 className="-mx-5 -mt-5 flex items-center gap-2 rounded-t-[22px] bg-[#4b5a42] px-5 py-4 text-base font-medium text-white">
                <FiShoppingBag size={17} />
                Order summary
              </h2>
              <div className="mt-4 rounded-xl border border-[#4b5a42]/15 bg-[#F8F6F1]/70 p-3">
                <p className="flex items-start gap-2 text-xs leading-5 text-[#4b5a42]">
                  {freeShippingRemaining > 0 ? (
                    <FiTruck className="mt-0.5 shrink-0" size={16} />
                  ) : (
                    <FiCheck className="mt-0.5 shrink-0" size={16} />
                  )}
                  {freeShippingRemaining > 0
                    ? `Add Rs. ${freeShippingRemaining.toLocaleString("en-PK")} more for free delivery.`
                    : "Your bag qualifies for free delivery."}
                </p>
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-black/10">
                  <div
                    className="h-full rounded-full bg-[#4b5a42] transition-all duration-300"
                    style={{
                      width: `${settings.free_shipping_minimum > 0 ? Math.min(100, (total / settings.free_shipping_minimum) * 100) : 100}%`,
                    }}
                  />
                </div>
              </div>
              <div className="mt-5 flex justify-between text-sm">
                <span>Subtotal</span>
                <strong className="font-medium">
                  Rs. {total.toLocaleString()}
                </strong>
              </div>
              <div className="mt-3 flex justify-between gap-3 text-xs text-black/50">
                <span>Delivery</span>
                <span>
                  {freeShippingRemaining === 0
                    ? "Free"
                    : "Calculated at checkout"}
                </span>
              </div>
              <div className="mt-4 flex items-end justify-between gap-3 border-t border-black/15 pt-4">
                <span className="text-sm font-medium">
                  Bag total
                  <span className="mt-1 block text-[11px] font-normal text-black/45">
                    Before discounts & delivery
                  </span>
                </span>
                <strong
                  aria-live="polite"
                  className="text-2xl font-medium tracking-tight"
                >
                  Rs. {total.toLocaleString("en-PK")}
                </strong>
              </div>
              <Link
                href={issues.length || error ? "/shop" : "/checkout"}
                className="mt-5 flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#20211e] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#4b5a42] focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                {issues.length || error
                  ? "Review available products"
                  : "Proceed to checkout"}
                <FiArrowUpRight size={19} />
              </Link>
              <button
                type="button"
                disabled={!!error || issues.length > 0}
                onClick={() => {
                  if (error || issues.length || !items.length) return;
                  const lines = items.map(
                    (item) =>
                      `${item.name} (${item.color})\nSize: ${item.size} | Quantity: ${item.quantity}\nRs. ${(item.price * item.quantity).toLocaleString("en-PK")}\n${window.location.origin}/products/${encodeURIComponent(item.slug)}`,
                  );
                  const message = `Assalam o Alaikum, I would like to order:\n\n${lines.join("\n\n")}\n\nSubtotal: Rs. ${total.toLocaleString("en-PK")}\nPlease confirm availability, delivery charges and final total.`;
                  window.open(
                    supportLink(settings.whatsapp, message),
                    "_blank",
                    "noopener,noreferrer",
                  );
                }}
                className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#4b5a42]/30 px-4 py-3 text-xs font-medium text-[#4b5a42] transition-colors hover:bg-[#4b5a42] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FiMessageCircle size={18} /> Order on WhatsApp
              </button>
              <p className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#4b5a42]">
                <FiTruck size={16} /> Cash on delivery available
              </p>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
