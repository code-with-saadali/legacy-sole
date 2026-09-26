"use client";
import { formFieldClasses } from "../_styles/form-classes";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import type { OrderRequest } from "../_data/order-requests";
import CustomSelect from "./CustomSelect";
export default function OrderRequestCard({
  request,
  onSaved,
  onOpenOrder,
}: {
  request: OrderRequest;
  onSaved: () => void;
  onOpenOrder: (id: string) => void;
}) {
  const [status, setStatus] = useState(request.status);
  const [note, setNote] = useState(request.admin_note);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const save = async () => {
    if (!supabase || busy) return;
    setBusy(true);
    const { error } = await supabase
      .from("order_requests")
      .update({ status, admin_note: note.trim() })
      .eq("id", request.id)
      .select("id")
      .single();
    if (error) setError(error.message);
    else {
      setError("");
      onSaved();
    }
    setBusy(false);
  };
  return (
    <article className="rounded-2xl border border-black/10 bg-[#F8F6F1] p-5">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{request.kind} request</p>
          <button
            type="button"
            onClick={() => onOpenOrder(request.order_id)}
            className="mt-1 break-all text-xs text-[#b66b4d] underline"
          >
            {request.order_id}
          </button>
        </div>
        <time className="text-xs text-black/45">
          {new Date(request.created_at).toLocaleDateString()}
        </time>
      </div>
      <p className="mt-4 whitespace-pre-wrap text-sm leading-6">
        {request.reason}
      </p>
      {request.requested_size && (
        <p className="mt-2 text-sm">Requested size: {request.requested_size}</p>
      )}
      <div className="mt-4 grid gap-3 sm:grid-cols-[180px_1fr]">
        <CustomSelect
          label="Request status"
          value={status}
          onChange={setStatus}
          disabled={busy}
          options={["Pending", "Approved", "Rejected", "Completed"].map(
            (value) => ({ value, label: value }),
          )}
        />
        <label className={formFieldClasses}>
          Reply to customer
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={1000}
            rows={2}
          />
        </label>
      </div>
      <p className="mt-3 text-xs leading-5 text-black/45">
        Approval records your decision. Open the order to cancel, process a
        return or arrange an exchange; stock and refunds are not changed here.
      </p>
      <button
        type="button"
        disabled={busy}
        onClick={() => void save()}
        className="mt-4 rounded-xl bg-[#20211e] px-5 py-3 text-xs text-white"
      >
        {busy ? "Saving…" : "Save response"}
      </button>
      {error && (
        <p role="alert" className="mt-3 text-xs text-red-700">
          {error}
        </p>
      )}
    </article>
  );
}
