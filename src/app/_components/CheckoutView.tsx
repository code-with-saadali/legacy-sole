"use client";

import Link from "next/link";
import ProductImage from "./ProductImage";
import OrderConfirmation from "./OrderConfirmation";
import type { Order } from "../_data/orders";
import { FormEvent, useEffect, useRef, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import useCart from "../_hooks/useCart";
import CheckoutCoupon from "./CheckoutCoupon";
import CheckoutRewards from "./CheckoutRewards";
import CheckoutCity from "./CheckoutCity";
import SavedAddresses from "./SavedAddresses";
import useRewardsQuote from "../_hooks/useRewardsQuote";
import { useStoreSettings } from "./StoreSettingsProvider";
import { deliveryCharge } from "../_data/store-settings";
import { cartKey } from "../_data/cart";

import { supabase } from "../../lib/supabase";

export default function CheckoutView() {
  const { items, issues, ready, error: catalogError } = useCart();
  const { settings } = useStoreSettings();
  const [city, setCity] = useState("");
  const [cityChoice, setCityChoice] = useState("");
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
        ["name", "email", "phone", "address", "area", "city", "postalCode"].map(
          (key) => [key, String(form.get(key) || "").trim()],
        ),
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
      <main className="p-12" role="status">
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
      <div className="mx-auto max-w-7xl">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-black/50 hover:text-[#4b5a42]"
        >
          <FiArrowLeft size={14} /> Back to bag
        </Link>
        <div className="mt-8 border-b border-black/10 pb-7">
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-black/45">
            Legacy Sole / Checkout
          </p>
          <h1 className="mt-3 text-4xl font-medium tracking-tight text-[#20211e] sm:text-6xl">
            Complete your order.
          </h1>
          <p className="mt-4 text-sm leading-6 text-black/55">
            Delivery details, a quick review, and your next pair is on its way.
          </p>
          <ol
            aria-label="Checkout steps"
            className="mt-6 flex flex-wrap gap-3 text-xs"
          >
            <li className="rounded-full bg-[#E9E2D7] px-4 py-2">
              1 / Your bag
            </li>
            <li
              aria-current="step"
              className="rounded-full bg-[#20211e] px-4 py-2 text-white"
            >
              2 / Delivery & payment
            </li>
            <li className="rounded-full border border-black/15 px-4 py-2 text-black/45">
              3 / Confirmation
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
          className="grid items-start gap-7 py-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-10"
        >
          <div className="space-y-6">
            <SavedAddresses
              formRef={checkoutForm}
              disabled={submitting}
              onCity={(value) => {
                setCityChoice("Other");
                setCity(value);
              }}
            />
            <fieldset
              disabled={submitting}
              className="rounded-3xl border border-black/10 bg-white/60 p-5 sm:p-7"
            >
              <legend className="px-2 text-xs font-semibold uppercase tracking-[0.12em] text-black/65">
                Contact details
              </legend>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input
                  required
                  name="name"
                  aria-label="Full name"
                  autoComplete="name"
                  maxLength={500}
                  type="text"
                  placeholder="Full name"
                  className="w-full rounded-xl border border-black/14 bg-[#f8f6f1]/70 px-[0.9rem] py-[0.85rem] text-xs outline-none focus:border-[#b66b4d] focus:ring-1 focus:ring-[#b66b4d]"
                />
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
                  placeholder="Email address"
                  className="w-full rounded-xl border border-black/14 bg-[#f8f6f1]/70 px-[0.9rem] py-[0.85rem] text-xs outline-none focus:border-[#b66b4d] focus:ring-1 focus:ring-[#b66b4d]"
                />
                <input
                  required
                  name="phone"
                  aria-label="Phone number"
                  autoComplete="tel"
                  maxLength={500}
                  type="tel"
                  placeholder="Phone number"
                  className="w-full rounded-xl border border-black/14 bg-[#f8f6f1]/70 px-[0.9rem] py-[0.85rem] text-xs outline-none focus:border-[#b66b4d] focus:ring-1 focus:ring-[#b66b4d] sm:col-span-2"
                />
              </div>
            </fieldset>
            <fieldset
              disabled={submitting}
              className="rounded-3xl border border-black/10 bg-white/60 p-5 sm:p-7"
            >
              <legend className="px-2 text-xs font-semibold uppercase tracking-[0.12em] text-black/65">
                Delivery address
              </legend>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input
                  required
                  name="address"
                  aria-label="House / street address"
                  autoComplete="address-line1"
                  maxLength={500}
                  type="text"
                  placeholder="House / flat number and street"
                  className="w-full rounded-xl border border-black/14 bg-[#f8f6f1]/70 px-[0.9rem] py-[0.85rem] text-xs outline-none focus:border-[#b66b4d] focus:ring-1 focus:ring-[#b66b4d] sm:col-span-2"
                />
                <label className="block text-xs font-medium text-black/65 sm:col-span-2">
                  Area / neighbourhood
                  <input
                    required
                    name="area"
                    autoComplete="address-line2"
                    maxLength={120}
                    placeholder="e.g. Gulshan-e-Iqbal, Block 13"
                    className="mt-2 w-full rounded-xl border border-black/14 bg-[#f8f6f1]/70 px-4 py-3.5 text-sm outline-none focus:border-[#b66b4d] focus:ring-1 focus:ring-[#b66b4d]"
                  />
                </label>
                <CheckoutCity
                  choice={cityChoice}
                  city={city}
                  onChoiceChange={setCityChoice}
                  onCityChange={setCity}
                  disabled={submitting}
                />
                <input
                  required
                  name="postalCode"
                  aria-label="Postal code"
                  autoComplete="postal-code"
                  maxLength={500}
                  type="text"
                  placeholder="Postal code"
                  className="w-full rounded-xl border border-black/14 bg-[#f8f6f1]/70 px-[0.9rem] py-[0.85rem] text-xs outline-none focus:border-[#b66b4d] focus:ring-1 focus:ring-[#b66b4d]"
                />
              </div>
            </fieldset>
            <fieldset
              disabled={submitting}
              className="rounded-3xl border border-black/10 bg-white/60 p-5 sm:p-7"
            >
              <legend className="px-2 text-xs font-semibold uppercase tracking-[0.12em] text-black/65">
                Payment method
              </legend>
              <label className="mt-4 flex items-center gap-3 border border-[#4b5a42] bg-[#F8F6F1] p-4 text-xs">
                <input type="radio" defaultChecked name="payment" /> Cash on
                delivery
              </label>
              <p className="mt-2 text-[11px] leading-5 text-black/45">
                Payment is collected when your order arrives.
              </p>
            </fieldset>
          </div>

          <aside className="h-fit rounded-3xl border border-black/10 bg-[#E9E2D7] p-5 sm:p-7 lg:sticky lg:top-28">
            <h2 className="text-2xl text-[#20211e]">Order summary</h2>
            <CheckoutCoupon
              code={coupon}
              onChange={setCoupon}
              disabled={submitting}
            />
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
            <CheckoutRewards
              email={email}
              disabled={submitting}
              applied={reward.points}
              onApply={(reference, points) => setReward({ reference, points })}
            />
            <div className="mt-5 divide-y divide-black/10">
              {items.map((item) => (
                <div
                  key={`${item.slug}-${item.size}`}
                  className="flex justify-between gap-4 py-3 text-xs"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#E9E2D7]">
                    <ProductImage
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="64px"
                      className="object-contain"
                    />
                  </div>
                  <span className="flex-1">
                    {item.name}{" "}
                    <span className="mt-1 block text-black/50">
                      {item.size} / Qty {item.quantity}
                    </span>
                  </span>
                  <strong className="font-medium">
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
              <div className="flex justify-between border-t border-black/10 pt-4 text-sm font-medium">
                <span>Total</span>
                <span>Rs. {total.toLocaleString()}</span>
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
              className="mt-7 w-full rounded-full disabled:cursor-not-allowed disabled:opacity-50 bg-[#20211e] px-5 py-4 text-[11px] font-medium uppercase tracking-[0.14em] text-white hover:bg-[#b66b4d]"
            >
              {submitting
                ? "Placing order..."
                : "Place order - Cash on delivery"}
            </button>
          </aside>
        </form>
      </div>
    </main>
  );
}
