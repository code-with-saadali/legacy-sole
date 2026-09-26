"use client";

import { formFieldClasses } from "../_styles/form-classes";
import { useState } from "react";
import type { Order } from "../_data/orders";
import { supabase } from "../../lib/supabase";

export default function AdminOrderResolution({
  order,
  onResolved,
}: {
  order: Order;
  onResolved: (order: Order) => void;
}) {
  const [reason, setReason] = useState("");
  const [restore, setRestore] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const closed = order.status === "Cancelled" || order.status === "Returned";
  const status =
    order.status === "Pending" || order.status === "Confirmed"
      ? "Cancelled"
      : "Returned";
  return (
    <section className="mt-5 rounded-[22px] border border-black/10 bg-[#F8F6F1] p-5">
      <h3 className="text-sm font-semibold">Cancellation & returns</h3>
      {closed ? (
        <div className="mt-3 text-sm">
          <p className="font-medium">{order.status}</p>
          <p className="mt-2 whitespace-pre-wrap break-words text-black/60">
            {order.closure_reason}
          </p>
          <p className="mt-3 text-xs text-black/50">
            {order.stock_restored
              ? "Stock returned to inventory."
              : "Stock was not returned to inventory."}
          </p>
        </div>
      ) : (
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            if (!supabase || busy || !reason.trim()) return;
            setBusy(true);
            setError("");
            try {
              const { data, error } = await supabase
                .from("orders")
                .update({
                  status,
                  closure_reason: reason.trim(),
                  stock_restored: restore,
                })
                .eq("id", order.id)
                .eq("status", order.status)
                .select("*")
                .single();
              if (error) throw error;
              onResolved({ ...data, createdAt: data.created_at } as Order);
            } catch (cause) {
              setError(
                (cause as { message?: string }).message ||
                  "Order could not be updated. Refresh and try again.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <p className="mt-2 text-xs leading-6 text-black/50">
            {status === "Cancelled"
              ? "Cancel this order before dispatch."
              : "Record a return after the parcel has been dispatched or delivered."}{" "}
            This closes the order.
          </p>
          <fieldset
            disabled={busy}
            className="mt-4 space-y-4 disabled:opacity-50"
          >
            <label className={formFieldClasses}>
              Reason
              <textarea
                required
                maxLength={500}
                rows={3}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Why is this order being cancelled or returned?"
              />
            </label>
            <label className="flex items-start gap-3 text-xs leading-6">
              <input
                type="checkbox"
                checked={restore}
                onChange={(event) => setRestore(event.target.checked)}
                className="mt-1 accent-[#b66b4d]"
              />{" "}
              Return all ordered quantities to stock (only if the items are
              available to sell again).
            </label>
            <button
              type="submit"
              className="rounded-xl bg-[#20211e] px-5 py-3 text-xs text-white hover:bg-[#b66b4d]"
            >
              {busy
                ? "Saving..."
                : status === "Cancelled"
                  ? "Cancel order"
                  : "Record return"}
            </button>
          </fieldset>
          {error && (
            <p role="alert" className="mt-3 text-xs text-red-700">
              {error}
            </p>
          )}
        </form>
      )}
    </section>
  );
}
