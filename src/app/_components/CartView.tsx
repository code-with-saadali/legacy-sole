"use client";

import Image from "./ProductImage";
import Link from "next/link";
import useCart from "../_hooks/useCart";
import { FiArrowLeft, FiTrash2, FiMessageCircle } from "react-icons/fi";
import { useStoreSettings } from "./StoreSettingsProvider";
import { supportLink } from "../_data/store-settings";

export default function CartView() {
  const { items, updateCart, issues, ready, error } = useCart();
  const { settings } = useStoreSettings();
  if (!ready)
    return (
      <main className="p-12" role="status">
        Loading your bag...
      </main>
    );

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <main className="min-h-[70vh] bg-[#F4F1E9] px-[5%] pb-24 pt-12 lg:pt-20">
      <div className="content">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-black/50 hover:text-[#4b5a42]"
        >
          <FiArrowLeft size={14} /> Continue shopping
        </Link>
        <div className="mt-10 flex items-end justify-between border-b border-black/10 pb-6">
          <h1 className="text-5xl text-[#20211e] sm:text-7xl">Your bag</h1>
          <span className="text-xs text-black/45">
            {items.length} {items.length === 1 ? "style" : "styles"}
          </span>
        </div>

        {error && (
          <p role="alert">
            Unable to refresh prices. Please try again shortly.
          </p>
        )}
        {issues.map((issue) => (
          <p key={issue} role="alert" className="mt-3 text-sm text-red-700">
            {issue}
          </p>
        ))}
        {items.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-sm text-black/50">
              Your bag is waiting for its first pair.
            </p>
            <Link
              href="/#collection"
              className="mt-7 inline-flex bg-[#4b5a42] px-6 py-4 text-[11px] font-medium uppercase tracking-[0.14em] text-white hover:bg-[#b66b4d]"
            >
              Explore the collection
            </Link>
          </div>
        ) : (
          <div className="grid gap-10 py-8 lg:grid-cols-[1fr_320px] lg:gap-16">
            <div className="divide-y divide-black/10">
              {items.map((item) => (
                <article
                  key={`${item.slug}-${item.size}`}
                  className="flex gap-5 py-5 first:pt-0"
                >
                  <div className="relative h-32 w-36 shrink-0 bg-[#E9E2D7] sm:h-40 sm:w-48">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="192px"
                      className="object-contain p-2"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
                    <div className="flex justify-between gap-3">
                      <div>
                        <h2 className="text-xl text-[#20211e]">{item.name}</h2>
                        <p className="mt-1 text-xs text-black/45">
                          Size {item.size} / {item.color}
                        </p>
                      </div>
                      <strong className="text-sm font-medium">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
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
                        className="text-black/40 hover:text-[#b66b4d]"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <aside className="h-fit border-t border-black/10 pt-5 lg:border-l lg:border-t-0 lg:pl-8">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <strong className="font-medium">
                  Rs. {total.toLocaleString()}
                </strong>
              </div>
              <p className="mt-3 text-xs leading-5 text-black/45">
                Shipping and final payment details will be confirmed at
                checkout.
              </p>
              <Link
                href={issues.length || error ? "/shop" : "/checkout"}
                className="mt-7 flex w-full justify-center bg-[#4b5a42] px-5 py-4 text-[11px] font-medium uppercase tracking-[0.14em] text-white hover:bg-[#b66b4d]"
              >
                {issues.length || error
                  ? "Review available products"
                  : "Proceed to checkout"}
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
                className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 border border-[#168b43] px-4 py-3 text-xs font-medium text-[#168b43] transition-colors hover:bg-[#168b43] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FiMessageCircle size={18} /> Order on WhatsApp
              </button>
              <p className="mt-3 text-xs leading-5 text-black/50">
                Send your bag details on WhatsApp. Our team will confirm your
                order and delivery charges there.
              </p>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
