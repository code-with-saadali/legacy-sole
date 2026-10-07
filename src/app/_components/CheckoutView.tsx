"use client";

import Link from "next/link";
import ProductImage from "./ProductImage";
import OrderConfirmation from "./OrderConfirmation";
import type { Order } from "../_data/orders";
import { FormEvent, useEffect, useRef, useState } from "react";
import {
  FiArrowLeft,
  FiArrowUpRight,
  FiCheck,
  FiMapPin,
  FiPackage,
  FiTruck,
  FiUser,
  FiCreditCard,
  FiChevronDown,
} from "react-icons/fi";
import useCart from "../_hooks/useCart";
import CheckoutCoupon from "./CheckoutCoupon";
import CheckoutRewards from "./CheckoutRewards";
import CheckoutCity from "./CheckoutCity";
import SavedAddresses from "./SavedAddresses";
import useRewardsQuote from "../_hooks/useRewardsQuote";
import { useStoreSettings } from "./StoreSettingsProvider";
import { deliveryCharge } from "../_data/store-settings";
import { cartKey } from "../_data/cart";
import { pakistanProvinces } from "../_data/pakistan-regions";

import { supabase } from "../../lib/supabase";

export default function CheckoutView() {
  const { items, issues, ready, error: catalogError } = useCart();
  const { settings } = useStoreSettings();
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [coupon, setCoupon] = useState("");
  const [email, setEmail] = useState("");
  const [reward, setReward] = useState({ reference: "", points: 0 });
  const { quote, quoteError, quoting, retryQuote } = useRewardsQuote(
    items,
    city,
    coupon,
    email,
    reward.reference,
    reward.points,
  );
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [placed, setPlaced] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const requestId = useRef<string | null>(null);
  const inFlight = useRef(false);
  const checkoutForm = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (placed) window.scrollTo({ top: 0, behavior: "instant" });
  }, [placed]);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shipping = quote?.shipping ?? deliveryCharge(subtotal, city, settings);
  const discount = quote?.discount ?? 0;
  const total = quote?.total ?? subtotal + shipping;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const fieldClass =
    "mt-2 w-full rounded-xl border border-black/12 bg-[#F8F6F1] px-4 py-3.5 text-sm text-[#20211e] outline-none transition placeholder:text-black/30 focus:border-[#4b5a42] focus:ring-2 focus:ring-[#4b5a42]/10";

  const placeOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      inFlight.current ||
      !ready ||
      issues.length ||
      catalogError ||
      !items.length
    )
      return;
    if (!pakistanProvinces.some((value) => value === province)) {
      setError("Please choose your delivery province / territory.");
      return;
    }
    if (!city.trim()) {
      setError("Please choose your delivery city.");
      return;
    }
    if (quoting || quoteError || !quote) {
      setError(quoteError || "Please wait for the updated total.");
      return;
    }
    if (!supabase) {
      setError("Checkout is temporarily unavailable.");
      return;
    }
    inFlight.current = true;
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      requestId.current ??= crypto.randomUUID();
      const customer = Object.fromEntries(
        [
          "name",
          "email",
          "phone",
          "address",
          "area",
          "province",
          "city",
          "postalCode",
        ].map((key) => [key, String(form.get(key) || "").trim()]),
      );
      const { data, error } = await supabase.rpc("place_rewards_order", {
        request_id: requestId.current,
        coupon_code: coupon,
        reward_reference: reward.reference,
        reward_points: reward.points,
        customer,
        items: items.map((item) => ({
          slug: item.slug,
          size: item.size,
          quantity: item.quantity,
        })),
      });
      if (error) throw error;
      if (!data?.id)
        throw new Error("The order could not be confirmed. Please retry.");
      setConfirmedOrder({
        id: data.id,
        createdAt: new Date().toISOString(),
        status: "Pending",
        customer: customer as Order["customer"],
        items: items.map((item) => ({ ...item })),
        total: data.total,
      });
      setPlaced(true);
      try {
        localStorage.removeItem(cartKey);
        window.dispatchEvent(new Event("cart-updated"));
      } catch {
        /* The confirmed database order remains valid. */
      }
    } catch (cause) {
      const failure = cause as { code?: string; message?: string };
      setError(
        failure.code === "PGRST202"
          ? "Checkout is temporarily unavailable. Please try again later."
          : failure.message ||
              "Your order could not be placed. Your bag has been kept.",
      );
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  };

  if (placed && confirmedOrder)
    return <OrderConfirmation order={confirmedOrder} />;

  if (!ready)
    return (
      <main className="px-[5%] py-12" role="status">
        Loading checkout...
      </main>
    );

  if (!items.length) {
    return (
      <main className="min-h-[70vh] bg-[#F4F1E9] px-[5%] pb-24 pt-16 text-center lg:pt-24">
        <h1 className="text-5xl text-[#20211e] sm:text-7xl">
          Your bag is empty.
        </h1>
        <Link
          href="/shop"
          className="mt-8 inline-flex bg-[#4b5a42] px-6 py-4 text-[11px] font-medium uppercase tracking-[0.14em] text-white hover:bg-[#b66b4d]"
        >
          Explore the shop
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-[70vh] bg-[#F4F1E9] px-[5%] pb-24 pt-10 lg:pt-16">
      <div className="w-full">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-black/50 hover:text-[#4b5a42]"
        >
          <FiArrowLeft size={14} /> Back to bag
        </Link>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-8 border-b border-black/10 pb-8 lg:pb-10">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#b66b4d]">
              Legacy Sole / Checkout
            </p>
            <h1 className="mt-4 text-[clamp(40px,5vw,72px)] font-medium leading-none tracking-[-0.06em] text-[#20211e]">
              One step closer.
              <span className="mt-2 block text-[#4b5a42]">
                Your next pair awaits.
              </span>
            </h1>
            <p className="mt-4 text-sm leading-6 text-black/55">
              A few details, one final check. Pay when your order arrives.
            </p>
          </div>
          <ol
            aria-label="Checkout steps"
            className="flex flex-wrap items-center gap-3 text-[11px] sm:gap-5"
          >
            <li className="flex items-center gap-2 text-[#4b5a42]">
              <span className="flex size-7 items-center justify-center rounded-full bg-[#4b5a42]/10">
                <FiCheck />
              </span>{" "}
              Bag
            </li>
            <li
              aria-current="step"
              className="flex items-center gap-2 font-medium text-[#20211e]"
            >
              <span className="flex size-7 items-center justify-center rounded-full bg-[#20211e] text-white">
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

        {(error || catalogError) && (
          <p role="alert" className="mt-5 text-sm text-red-700">
            {error || "Unable to refresh your bag. Please try again shortly."}
          </p>
        )}
        {issues.map((issue) => (
          <p key={issue} role="alert" className="mt-3 text-sm text-red-700">
            {issue}
          </p>
        ))}
        <form
          ref={checkoutForm}
          onSubmit={placeOrder}
          className="grid items-start gap-8 py-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.85fr)] lg:gap-10 lg:py-10 xl:gap-16"
        >
          <div className="space-y-6">
            <details className="group rounded-2xl border border-black/10 bg-[#E9E2D7]/40 p-4 sm:px-6">
              <summary className="flex cursor-pointer list-none items-center gap-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
                <FiMapPin className="text-[#4b5a42]" /> Have a saved address?
                <FiChevronDown className="ml-auto transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-5">
                <SavedAddresses
                  formRef={checkoutForm}
                  disabled={submitting}
                  onCity={(value, savedProvince) => {
                    setProvince(savedProvince ?? "");
                    setCity(value);
                  }}
                />
              </div>
            </details>
            <fieldset
              disabled={submitting}
              className="min-w-0 rounded-[24px] border border-black/8 bg-white/70 p-5 sm:p-8"
            >
              <legend className="sr-only">Contact details</legend>
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-[#E9E2D7] text-[#4b5a42]">
                  <FiUser size={19} />
                </span>
                <div>
                  <h2 className="text-lg font-medium tracking-tight">
                    Contact details
                  </h2>
                  <p className="mt-1 text-xs text-black/45">
                    So we can keep you in the loop.
                  </p>
                </div>
                <span className="ml-auto font-mono text-xs text-black/25">
                  01
                </span>
              </div>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label className="text-xs font-medium text-black/65">
                  Full name
                  <input
                    required
                    name="name"
                    aria-label="Full name"
                    autoComplete="name"
                    maxLength={500}
                    type="text"
                    placeholder="Your full name"
                    className={fieldClass}
                  />
                </label>
                <label className="text-xs font-medium text-black/65">
                  Email address
                  <input
                    required
                    name="email"
                    aria-label="Email address"
                    autoComplete="email"
                    maxLength={500}
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setReward({ reference: "", points: 0 });
                    }}
                    type="email"
                    placeholder="you@example.com"
                    className={fieldClass}
                  />
                </label>
                <label className="text-xs font-medium text-black/65 sm:col-span-2">
                  Phone number
                  <input
                    required
                    name="phone"
                    aria-label="Phone number"
                    autoComplete="tel"
                    maxLength={500}
                    type="tel"
                    placeholder="03XX XXXXXXX"
                    className={fieldClass}
                  />
                  <span className="mt-2 block text-[11px] font-normal text-black/40">
                    Use a number we can reach for delivery updates.
                  </span>
                </label>
              </div>
            </fieldset>
            <fieldset
              disabled={submitting}
              className="min-w-0 rounded-[24px] border border-black/8 bg-white/70 p-5 sm:p-8"
            >
              <legend className="sr-only">Delivery address</legend>
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-[#E9E2D7] text-[#4b5a42]">
                  <FiMapPin size={19} />
                </span>
                <div>
                  <h2 className="text-lg font-medium tracking-tight">
                    Where should we deliver?
                  </h2>
                  <p className="mt-1 text-xs text-black/45">
                    A complete address helps your pair find you.
                  </p>
                </div>
                <span className="ml-auto font-mono text-xs text-black/25">
                  02
                </span>
              </div>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label className="text-xs font-medium text-black/65 sm:col-span-2">
                  House / street address
                  <input
                    required
                    name="address"
                    aria-label="House / street address"
                    autoComplete="address-line1"
                    maxLength={500}
                    type="text"
                    placeholder="House / flat number and street"
                    className={fieldClass}
                  />
                </label>
                <label className="block text-xs font-medium text-black/65 sm:col-span-2">
                  Area / neighbourhood
                  <input
                    required
                    name="area"
                    autoComplete="address-line2"
                    maxLength={120}
                    placeholder="e.g. Gulshan-e-Iqbal, Block 13"
                    className={fieldClass}
                  />
                </label>
                <CheckoutCity
                  province={province}
                  city={city}
                  onProvinceChange={setProvince}
                  onCityChange={setCity}
                  disabled={submitting}
                />
                <label className="text-xs font-medium text-black/65">
                  Postal code
                  <input
                    required
                    name="postalCode"
                    aria-label="Postal code"
                    autoComplete="postal-code"
                    maxLength={500}
                    type="text"
                    placeholder="Postal code"
                    className={fieldClass}
                  />
                </label>
              </div>
            </fieldset>
            <fieldset
              disabled={submitting}
              className="min-w-0 rounded-[24px] border border-black/8 bg-white/70 p-5 sm:p-8"
            >
              <legend className="sr-only">Payment method</legend>
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-[#E9E2D7] text-[#4b5a42]">
                  <FiCreditCard size={19} />
                </span>
                <h2 className="text-lg font-medium tracking-tight">
                  Payment method
                </h2>
                <span className="ml-auto font-mono text-xs text-black/25">
                  03
                </span>
              </div>
              <label className="mt-6 flex items-center gap-3 rounded-2xl border border-[#4b5a42]/40 bg-[#4b5a42]/5 p-4 text-sm">
                <input
                  type="radio"
                  defaultChecked
                  name="payment"
                  value="cod"
                  className="size-4 accent-[#4b5a42]"
                />{" "}
                <span className="flex-1 font-medium">
                  Cash on delivery
                  <span className="mt-1 block text-xs font-normal text-black/50">
                    No payment needed today.
                  </span>
                </span>
                <FiTruck size={22} className="text-[#4b5a42]" />
              </label>
              <p className="mt-2 text-[11px] leading-5 text-black/45">
                Payment is collected when your order arrives.
              </p>
            </fieldset>
          </div>

          <aside className="h-fit min-w-0 rounded-[28px] border border-black/10 bg-[#E9E2D7] p-5 sm:p-7 lg:sticky lg:top-28">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-black/45">
                  The final check
                </p>
                <h2 className="mt-2 text-2xl font-medium tracking-tight text-[#20211e]">
                  Your order
                  <span className="ml-2 align-middle text-xs font-normal text-black/45">
                    ({itemCount})
                  </span>
                </h2>
              </div>
              <Link
                href="/cart"
                className="rounded-full border border-black/15 px-4 py-2 text-xs hover:bg-white/50"
              >
                Edit bag
              </Link>
            </div>
            <details className="group mt-5 border-y border-black/10 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-medium [&::-webkit-details-marker]:hidden">
                Have a promo code?
                <FiChevronDown className="transition-transform group-open:rotate-180" />
              </summary>
              <CheckoutCoupon
                code={coupon}
                onChange={setCoupon}
                disabled={submitting}
              />
            </details>
            {quoteError && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <p role="alert">{quoteError}</p>
                <button
                  type="button"
                  onClick={retryQuote}
                  disabled={submitting}
                  className="mt-2 font-medium underline underline-offset-4"
                >
                  Retry total
                </button>
              </div>
            )}
            {quoting && (
              <p role="status" className="mt-3 text-xs text-black/50">
                Updating your total...
              </p>
            )}
            <details className="group border-b border-black/10 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-medium [&::-webkit-details-marker]:hidden">
                Use loyalty points
                <FiChevronDown className="transition-transform group-open:rotate-180" />
              </summary>
              <CheckoutRewards
                email={email}
                disabled={submitting}
                applied={reward.points}
                onApply={(reference, points) =>
                  setReward({ reference, points })
                }
              />
            </details>
            <div className="mt-5 divide-y divide-black/10">
              {items.map((item) => (
                <div
                  key={`${item.slug}-${item.size}`}
                  className="flex items-center justify-between gap-3 py-4 text-xs sm:gap-4"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-black/5 bg-[#F8F6F1]">
                    <ProductImage
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-contain"
                    />
                  </div>
                  <span className="min-w-0 flex-1 text-sm font-medium">
                    {item.name}{" "}
                    <span className="mt-2 block text-xs font-normal text-black/50">
                      {item.size} / Qty {item.quantity}
                    </span>
                  </span>
                  <strong className="shrink-0 font-medium">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </strong>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-3 border-t border-black/10 pt-4 text-xs">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rs. {subtotal.toLocaleString()}</span>
              </div>
              {(quote?.loyalty_discount ?? 0) > 0 && (
                <div className="flex justify-between text-[#4b5a42]">
                  <span>Loyalty points</span>
                  <span>- Rs. {quote!.loyalty_discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>{shipping ? `Rs. ${shipping}` : "Free"}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#4b5a42]">
                  <span>Discount ({coupon})</span>
                  <span>- Rs. {discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex items-end justify-between gap-3 border-t border-black/15 pt-5 font-medium">
                <span className="text-sm">
                  Total
                  <span className="mt-1 block text-[11px] font-normal text-black/45">
                    Pay on delivery
                  </span>
                </span>
                <span className="text-2xl tracking-tight sm:text-3xl">
                  Rs. {total.toLocaleString()}
                </span>
              </div>
            </div>
            <button
              type="submit"
              disabled={
                submitting ||
                quoting ||
                !quote ||
                Boolean(quoteError) ||
                Boolean(catalogError) ||
                issues.length > 0
              }
              className="mt-6 flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-[#20211e] px-5 py-4 text-sm font-medium text-white transition hover:bg-[#4b5a42] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4b5a42] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Placing order..." : "Place my order"}
              <FiArrowUpRight size={19} aria-hidden />
            </button>
            <p className="mt-4 text-center text-[11px] leading-5 text-black/50">
              Before you order, read our{" "}
              <Link
                href="/shipping-delivery"
                className="underline underline-offset-2"
              >
                delivery
              </Link>{" "}
              and{" "}
              <Link
                href="/returns-exchanges"
                className="underline underline-offset-2"
              >
                returns policies
              </Link>
              .
            </p>
            <div className="mt-5 flex items-center justify-center gap-2 border-t border-black/10 pt-5 text-xs text-[#4b5a42]">
              <FiPackage size={16} /> Your next good day starts here.
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}
