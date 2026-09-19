"use client";

import { FormEvent, useState } from "react";
import OrderHelpForm from "./OrderHelpForm";
import type {TrackedOrder} from "../_data/order-requests";
import { FiCheck, FiSearch } from "react-icons/fi";
import { supabase } from "../../lib/supabase";

const steps = ["Pending", "Confirmed", "Dispatched", "Delivered"];
export default function OrderTracker() {
  const [order,setOrder]=useState<TrackedOrder|null>(null);
  const [email,setEmail]=useState("");
  const [busy,setBusy]=useState(false);
  const [error, setError] = useState("");
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if(busy)return;
    setBusy(true);
    setError("");
    setOrder(null);
    if (!supabase) {setError("Tracking is temporarily unavailable.");setBusy(false);return;}
    const form = new FormData(event.currentTarget);
    setEmail(String(form.get("email")).trim());
    const { data, error: requestError } = await supabase.rpc("track_order", {
      order_reference: String(form.get("orderId")),
      customer_email: String(form.get("email")),
    });
    if (requestError || !data)
      setError("Order not found. Check your reference and email.");
    else setOrder(data);
    setBusy(false);
  };
  const active = order ? steps.indexOf(order.status) : -1;
  return (
    <main className="min-h-[70vh] bg-[#F4F1E9] px-[5%] pb-24 pt-14">
      <div className="mx-auto max-w-3xl">
        <p className="text-[10px] uppercase tracking-[0.22em] text-black/40">
          Legacy Sole / Delivery
        </p>
        <h1 className="mt-3 text-6xl text-[#20211e] sm:text-8xl">
          Track order.
        </h1>
        <form
          onSubmit={submit}
          className="mt-10 grid gap-3 border border-black/10 bg-[#F8F6F1] p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        >
          <label className="admin-field">
            Order reference
            <input required name="orderId" placeholder="LS-..." />
          </label>
          <label className="admin-field">
            Checkout email
            <input
              required
              name="email"
              type="email"
              placeholder="you@example.com"
            />
          </label>
          <button disabled={busy} className="flex h-11 items-center justify-center gap-2 bg-[#4b5a42] px-5 text-[10px] uppercase tracking-[0.14em] text-white hover:bg-[#b66b4d]">
            <FiSearch size={14} /> Track
          </button>
        </form>
        {error && <p className="mt-5 text-sm text-red-700">{error}</p>}
        {order && (
          <section className="mt-10 border border-black/10 bg-[#F8F6F1] p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-black/40">
                  Order reference
                </p>
                <p className="mt-2 text-xl">{order.id}</p>
              </div>
              <strong>Rs. {order.total.toLocaleString()}</strong>
            </div>
            {(order.status === "Cancelled" || order.status === "Returned") && (
              <p
                role="status"
                className="mt-6 rounded-xl bg-[#E9E2D7] p-4 text-sm font-medium"
              >
                Order {order.status.toLowerCase()}
              </p>
            )}
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {steps.map((step, index) => (
                <div key={step} className="text-center">
                  <span
                    className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full ${index <= active ? "bg-[#4b5a42] text-white" : "bg-black/10 text-black/30"}`}
                  >
                    <FiCheck size={15} />
                  </span>
                  <p className="mt-3 text-[10px] uppercase tracking-[0.12em] text-black/50">
                    {step}
                  </p>
                </div>
              ))}
            </div>
            {order.courier_name && order.tracking_number && (
              <div className="mt-6 rounded-xl border border-black/10 bg-white/60 p-5">
                <p className="text-xs text-black/50">Courier</p>
                <p className="mt-1 break-words text-sm font-medium">
                  {order.courier_name}
                </p>
                <p className="mt-3 text-xs text-black/50">Tracking number</p>
                <p className="mt-1 break-all text-sm font-medium">
                  {order.tracking_number}
                </p>
                <p className="mt-3 text-xs text-black/45">
                  Use this reference on your courier’s tracking service.
                </p>
              </div>
            )}
            <div className="mt-8 border-t border-black/10 pt-5 text-xs text-black/55">
              {order.items.map((item, index) => (
                <p key={index} className="flex justify-between py-2">
                  <span>{item.name}</span>
                  <span>x {item.quantity}</span>
                </p>
              ))}
            </div>
            <OrderHelpForm key={`${order.id}-${order.status}`} order={order} email={email} onSubmitted={()=>{void supabase?.rpc("track_order",{order_reference:order.id,customer_email:email}).then(({data})=>{if(data)setOrder(data);});}} />
          </section>
        )}
      </div>
    </main>
  );
}
