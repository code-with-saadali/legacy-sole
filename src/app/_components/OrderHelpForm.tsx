"use client";
import { formFieldClasses } from "../_styles/form-classes";
import { useState, type FormEvent } from "react";
import { supabase } from "../../lib/supabase";
import type { TrackedOrder } from "../_data/order-requests";
import { productSizes } from "../_data/inventory";
import CustomSelect from "./CustomSelect";
export default function OrderHelpForm({
  order,
  email,
  onSubmitted,
}: {
  order: TrackedOrder;
  email: string;
  onSubmitted: () => void;
}) {
  const cancellation = ["Pending", "Confirmed"].includes(order.status);
  const choices = cancellation
    ? ["Cancellation"]
    : order.status === "Delivered"
      ? ["Return", "Exchange"]
      : [];
  const [kind, setKind] = useState(choices[0] ?? "");
  const [size, setSize] = useState("UK 8");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || busy) return;
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setMessage("");
    try {
      const { error } = await supabase.rpc("request_order_help", {
        order_reference: order.id,
        customer_email: email,
        request_kind: kind,
        request_reason: String(form.get("reason")).trim(),
        exchange_size: kind === "Exchange" ? size : "",
      });
      if (error) throw error;
      setMessage("Request received. You can check the response here.");
      onSubmitted();
    } catch (cause) {
      setMessage((cause as Error).message || "Request could not be sent.");
    } finally {
      setBusy(false);
    }
  };
  const openRequest = order.requests?.some((request) =>
    ["Pending", "Approved"].includes(request.status),
  );
  return (
    <div className="mt-8 border-t border-black/10 pt-6">
      <h3 className="text-xl">Need help with this order?</h3>
      {order.requests?.map((request) => (
        <div
          key={request.id}
          className="mt-4 rounded-xl bg-[#E9E2D7] p-4 text-sm"
        >
          <p className="font-medium">
            {request.kind} · {request.status}
          </p>
          <p className="mt-2 text-black/60">{request.reason}</p>
          {request.admin_note && (
            <p className="mt-3 border-t border-black/10 pt-3">
              Store response: {request.admin_note}
            </p>
          )}
        </div>
      ))}
      {choices.length > 0 && !openRequest && (
        <form onSubmit={submit} className="mt-5 space-y-4">
          <p className="text-xs leading-6 text-black/50">
            {cancellation
              ? "Cancellation can be requested before dispatch. The store will confirm the outcome."
              : "Request a return or size exchange within 7 days of delivery. Include the item name and your reason."}
          </p>
          <CustomSelect
            label="Request type"
            value={kind}
            onChange={setKind}
            disabled={busy}
            options={choices.map((value) => ({ value, label: value }))}
          />
          {kind === "Exchange" && (
            <CustomSelect
              label="Replacement size"
              value={size}
              onChange={setSize}
              disabled={busy}
              options={productSizes.map((value) => ({ value, label: value }))}
            />
          )}
          <label className={formFieldClasses}>
            Reason
            <textarea
              required
              name="reason"
              minLength={5}
              maxLength={1000}
              rows={3}
              disabled={busy}
            />
          </label>
          <button
            disabled={busy}
            className="rounded-xl bg-[#20211e] px-5 py-3 text-xs text-white"
          >
            {busy ? "Sending…" : "Send request"}
          </button>
        </form>
      )}
      {!choices.length && (
        <p className="mt-3 text-sm text-black/50">
          Contact support for help. Return and exchange requests become
          available after delivery.
        </p>
      )}
      {message && (
        <p role="status" className="mt-4 text-sm">
          {message}
        </p>
      )}
    </div>
  );
}
