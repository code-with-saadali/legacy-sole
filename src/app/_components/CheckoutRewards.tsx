"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function CheckoutRewards({
  email,
  disabled,
  applied,
  onApply,
}: {
  email: string;
  disabled: boolean;
  applied: number;
  onApply: (reference: string, points: number) => void;
}) {
  const [reference, setReference] = useState("");
  const [points, setPoints] = useState(0);
  const [result, setResult] = useState<{ key: string; balance: number } | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const key = JSON.stringify([reference.trim(), email.trim().toLowerCase()]);
  const balance = result?.key === key ? result.balance : null;
  const check = async () => {
    if (!supabase || busy) return;
    setBusy(true);
    setMessage("");
    setResult(null);
    try {
      const { data, error } = await supabase.rpc("loyalty_balance", {
        order_reference: reference,
        customer_email: email,
      });
      if (error) throw error;
      setResult({ key, balance: Number(data) });
      setPoints(0);
    } catch (cause) {
      setMessage(
        (cause as { message?: string }).message ??
          "Could not check your points.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <fieldset
      disabled={disabled || busy}
      className="mt-6 space-y-3 rounded-2xl bg-[#E9E2D7] p-4 text-xs disabled:opacity-60"
    >
      <legend className="sr-only">Loyalty points</legend>
      <h3 className="text-base font-medium">Your loyalty points</h3>
      <p className="leading-5 text-black/60">
        Earn 1 point per Rs. 100 of merchandise paid after delivery. Each point
        takes Rs. 1 off your next order.
      </p>
      <label className="block">
        Previous order reference
        <input
          className="w-full border border-black/14 bg-[#f8f6f1]/70 px-[0.9rem] py-[0.85rem] text-xs outline-none focus:border-[#b66b4d] focus:ring-1 focus:ring-[#b66b4d] mt-2"
          value={reference}
          placeholder="LS-..."
          onChange={(event) => {
            setReference(event.target.value);
            onApply("", 0);
            setMessage("");
          }}
        />
      </label>
      <p className="text-black/50">
        Use the same checkout email as your previous order.
      </p>
      <button
        type="button"
        disabled={!email.trim() || !reference.trim()}
        onClick={() => void check()}
        className="rounded-xl border border-black/20 px-4 py-2 disabled:opacity-40"
      >
        {busy ? "Checking..." : "Check points"}
      </button>
      {balance !== null && (
        <>
          <p role="status">
            Available: <strong>{balance.toLocaleString()} points</strong>
          </p>
          <label className="block">
            Points to use
            <input
              className="w-full border border-black/14 bg-[#f8f6f1]/70 px-[0.9rem] py-[0.85rem] text-xs outline-none focus:border-[#b66b4d] focus:ring-1 focus:ring-[#b66b4d] mt-2"
              type="number"
              min={0}
              max={balance}
              step={1}
              value={points}
              onChange={(event) => setPoints(Number(event.target.value))}
            />
          </label>
          <button
            type="button"
            disabled={
              !Number.isSafeInteger(points) || points < 0 || points > balance
            }
            onClick={() => onApply(reference.trim(), points)}
            className="rounded-xl bg-[#4b5a42] px-4 py-2 text-white disabled:opacity-40"
          >
            Apply points
          </button>
        </>
      )}
      {applied > 0 && (
        <p>
          {applied} points selected.{" "}
          <button
            type="button"
            onClick={() => onApply("", 0)}
            className="underline"
          >
            Remove
          </button>
        </p>
      )}
      {message && <p role="alert">{message}</p>}
    </fieldset>
  );
}
