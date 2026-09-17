"use client";

import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { FiArrowLeft, FiCheck } from "react-icons/fi";
import useCart from "../_hooks/useCart";
import { cartKey } from "../_data/cart";

import { supabase } from "../../lib/supabase";



export default function CheckoutView() {
  const { items, issues, ready, error: catalogError } = useCart();
  const [placed, setPlaced] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("");
  const requestId = useRef<string | null>(null);
  const inFlight = useRef(false);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 10000 ? 0 : 250;
  const total = subtotal + shipping;

  const placeOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inFlight.current || !ready || issues.length || catalogError || !items.length) return;
    if (!supabase) { setError("Checkout is temporarily unavailable."); return; }
    inFlight.current = true;
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);
    requestId.current ??= crypto.randomUUID();
    try {
      const customer = Object.fromEntries(["name", "email", "phone", "address", "city", "postalCode"].map(key => [key, String(form.get(key) || "").trim()]));
      const { data, error } = await supabase.rpc("place_order", {
        request_id: requestId.current,
        customer,
        items: items.map(item => ({ slug: item.slug, size: item.size, quantity: item.quantity })),
      });
      if (error) throw error;
      if (!data?.id) throw new Error("The order could not be confirmed. Please retry.");
      setOrderId(data.id);
      setPlaced(true);
      try { localStorage.removeItem(cartKey); window.dispatchEvent(new Event("cart-updated")); } catch { /* The confirmed database order remains valid. */ }
    } catch (cause) {
      const failure = cause as { code?: string; message?: string };
      setError(failure.code === "PGRST202" ? "Checkout is temporarily unavailable. Please try again later." : failure.message || "Your order could not be placed. Your bag has been kept.");
    } finally { inFlight.current = false; setSubmitting(false); }
  };

  if (placed) {
    return (
      <main className="min-h-[70vh] bg-[#F4F1E9] px-[5%] pb-24 pt-16 lg:pt-24">
        <div className="mx-auto max-w-xl border border-black/10 bg-[#F8F6F1] px-6 py-16 text-center sm:px-12">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#4b5a42] text-white"><FiCheck size={24} /></span>
          <p className="mt-7 text-[10px] font-medium uppercase tracking-[0.2em] text-black/45">Order received</p>
          <h1 className="mt-3 text-5xl text-[#20211e] sm:text-6xl">Thank you.</h1>
          <p className="mx-auto mt-5 max-w-sm text-sm leading-6 text-black/55">Your Legacy Sole order has been placed. We will contact you shortly to confirm delivery details.</p>
          <p className="mt-4 break-all text-xs">Order reference: {orderId}</p>
          <Link href="/" className="mt-8 inline-flex bg-[#4b5a42] px-6 py-4 text-[11px] font-medium uppercase tracking-[0.14em] text-white hover:bg-[#b66b4d]">Back to home</Link>
        </div>
      </main>
    );
  }

  if (!ready) return <main className="p-12" role="status">Loading checkout...</main>;

  if (!items.length) {
    return (
      <main className="min-h-[70vh] bg-[#F4F1E9] px-[5%] pb-24 pt-16 text-center lg:pt-24">
        <h1 className="text-5xl text-[#20211e] sm:text-7xl">Your bag is empty.</h1>
        <Link href="/shop" className="mt-8 inline-flex bg-[#4b5a42] px-6 py-4 text-[11px] font-medium uppercase tracking-[0.14em] text-white hover:bg-[#b66b4d]">Explore the shop</Link>
      </main>
    );
  }

  return (
    <main className="min-h-[70vh] bg-[#F4F1E9] px-[5%] pb-24 pt-10 lg:pt-16">
      <div className="content">
        <Link href="/cart" className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-black/50 hover:text-[#4b5a42]"><FiArrowLeft size={14} /> Back to bag</Link>
        <div className="mt-8 border-b border-black/10 pb-7"><p className="text-[10px] font-medium uppercase tracking-[0.22em] text-black/45">Legacy Sole / Checkout</p><h1 className="mt-3 text-6xl text-[#20211e] sm:text-8xl">Complete your order.</h1></div>

        {(error || catalogError) && <p role="alert" className="mt-5 text-sm text-red-700">{error || "Unable to refresh your bag. Please try again shortly."}</p>}
        {issues.map(issue => <p key={issue} role="alert" className="mt-3 text-sm text-red-700">{issue}</p>)}
        <form onSubmit={placeOrder} className="grid gap-12 py-10 lg:grid-cols-[1fr_360px] lg:gap-20">
          <div className="space-y-9">
            <fieldset><legend className="text-[10px] font-medium uppercase tracking-[0.18em] text-black/45">Contact details</legend><div className="mt-4 grid gap-3 sm:grid-cols-2"><input required name="name" type="text" placeholder="Full name" className="checkout-input" /><input required name="email" type="email" placeholder="Email address" className="checkout-input" /><input required name="phone" type="tel" placeholder="Phone number" className="checkout-input sm:col-span-2" /></div></fieldset>
            <fieldset><legend className="text-[10px] font-medium uppercase tracking-[0.18em] text-black/45">Delivery address</legend><div className="mt-4 grid gap-3 sm:grid-cols-2"><input required name="address" type="text" placeholder="Address" className="checkout-input sm:col-span-2" /><input required name="city" type="text" placeholder="City" className="checkout-input" /><input required name="postalCode" type="text" placeholder="Postal code" className="checkout-input" /></div></fieldset>
            <fieldset><legend className="text-[10px] font-medium uppercase tracking-[0.18em] text-black/45">Payment method</legend><label className="mt-4 flex items-center gap-3 border border-[#4b5a42] bg-[#F8F6F1] p-4 text-xs"><input type="radio" defaultChecked name="payment" /> Cash on delivery</label><p className="mt-2 text-[11px] leading-5 text-black/45">Payment is collected when your order arrives.</p></fieldset>
          </div>

          <aside className="h-fit border-t border-black/10 pt-5 lg:border-l lg:border-t-0 lg:pl-8"><h2 className="text-2xl text-[#20211e]">Order summary</h2><div className="mt-5 divide-y divide-black/10">{items.map((item) => <div key={`${item.slug}-${item.size}`} className="flex justify-between gap-4 py-3 text-xs"><span>{item.name} <span className="text-black/40">x {item.quantity}</span></span><strong className="font-medium">Rs. {(item.price * item.quantity).toLocaleString()}</strong></div>)}</div><div className="mt-4 space-y-3 border-t border-black/10 pt-4 text-xs"><div className="flex justify-between"><span>Subtotal</span><span>Rs. {subtotal.toLocaleString()}</span></div><div className="flex justify-between"><span>Delivery</span><span>{shipping ? `Rs. ${shipping}` : "Free"}</span></div><div className="flex justify-between border-t border-black/10 pt-4 text-sm font-medium"><span>Total</span><span>Rs. {total.toLocaleString()}</span></div></div><button type="submit" disabled={submitting || Boolean(catalogError) || issues.length > 0} className="mt-7 w-full bg-[#4b5a42] px-5 py-4 text-[11px] font-medium uppercase tracking-[0.14em] text-white hover:bg-[#b66b4d]">{submitting ? "Placing order..." : "Place order"}</button></aside>
        </form>
      </div>
    </main>
  );
}
