"use client";
import { useState, type FormEvent } from "react";
import { supabase } from "../../lib/supabase";
import useAdminRows from "../_hooks/useAdminRows";
import CustomSelect from "./CustomSelect";
type Coupon = {
  code: string;
  kind: string;
  amount: number;
  minimum: number;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  active: boolean;
};
export default function CouponManager() {
  const { rows, error, setError, loading, reload } = useAdminRows<Coupon>(
    "coupons",
    "code",
  );
  const [kind, setKind] = useState("percent");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || busy) return;
    const element = event.currentTarget;
    const form = new FormData(element);
    setBusy(true);
    setError("");
    try {
      const expiry = String(form.get("expires") ?? "");
      const { error } = await supabase
        .from("coupons")
        .insert({
          code: String(form.get("code")).trim().toUpperCase(),
          kind,
          amount: Number(form.get("amount")),
          minimum: Number(form.get("minimum")),
          max_uses: form.get("max_uses") ? Number(form.get("max_uses")) : null,
          expires_at: expiry ? new Date(expiry).toISOString() : null,
        });
      if (error) throw error;
      element.reset();
      setMessage("Coupon created.");
      await reload();
    } catch (cause) {
      setError((cause as Error).message || "Coupon could not be saved.");
    } finally {
      setBusy(false);
    }
  };
  const toggle = async (coupon: Coupon) => {
    if (!supabase || busy) return;
    setBusy(true);
    const { error } = await supabase
      .from("coupons")
      .update({ active: !coupon.active })
      .eq("code", coupon.code)
      .select("code")
      .single();
    if (error) setError(error.message);
    else await reload();
    setBusy(false);
  };
  return (
    <section className="admin-panel rounded-[28px] border border-black/[0.06] bg-white p-5 sm:p-7">
      <h2 className="text-2xl font-medium tracking-tight">Discount coupons</h2>
      <form onSubmit={save} className="mt-5">
        <fieldset
          disabled={busy}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <label className="admin-field">
            Code
            <input
              required
              name="code"
              pattern="[A-Za-z0-9_-]{3,30}"
              maxLength={30}
              placeholder="e.g. WELCOME10"
            />
          </label>
          <div className="admin-field">
            Discount type
            <CustomSelect
              label="Coupon discount type"
              value={kind}
              onChange={setKind}
              disabled={busy}
              options={[
                { value: "percent", label: "Percentage" },
                { value: "fixed", label: "Fixed amount (Rs.)" },
              ]}
            />
          </div>
          <label className="admin-field">
            {kind === "percent" ? "Discount (%)" : "Discount (Rs.)"}
            <input
              required
              name="amount"
              type="number"
              min="1"
              max={kind === "percent" ? 100 : 1000000}
              step="1"
            />
          </label>
          <label className="admin-field">
            Minimum subtotal
            <input
              required
              name="minimum"
              type="number"
              min="0"
              step="1"
              defaultValue="0"
            />
          </label>
          <label className="admin-field">
            Maximum uses (optional)
            <input name="max_uses" type="number" min="1" step="1" />
          </label>
          <label className="admin-field">
            Expires at (optional)
            <input name="expires" type="datetime-local" />
          </label>
        </fieldset>
        <button
          disabled={busy}
          className="mt-4 rounded-xl bg-[#20211e] px-5 py-3 text-sm text-white disabled:opacity-50"
        >
          Create coupon
        </button>
      </form>
      {error && (
        <p role="alert" className="mt-4 text-sm text-red-700">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="mt-4 text-sm">
          {message}
        </p>
      )}
      {loading ? (
        <p className="mt-5 text-sm">Loading coupons…</p>
      ) : (
        <ul className="mt-5 divide-y divide-black/10">
          {rows.map((coupon) => (
            <li
              key={coupon.code}
              className="flex flex-wrap items-center justify-between gap-3 py-4"
            >
              <div>
                <strong className="text-sm">{coupon.code}</strong>
                <p className="mt-1 text-xs text-black/50">
                  {coupon.kind === "percent"
                    ? `${coupon.amount}%`
                    : `Rs. ${coupon.amount}`}{" "}
                  off · Min Rs. {coupon.minimum} · Used {coupon.used_count}
                  {coupon.max_uses ? ` / ${coupon.max_uses}` : ""}
                  {coupon.expires_at
                    ? ` · Expires ${new Date(coupon.expires_at).toLocaleDateString()}`
                    : ""}
                </p>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => void toggle(coupon)}
                className="rounded-full border border-black/15 px-4 py-2 text-xs"
              >
                {coupon.active ? "Deactivate" : "Activate"}
              </button>
            </li>
          ))}
          {!rows.length && (
            <li className="py-5 text-sm text-black/50">No coupons yet.</li>
          )}
        </ul>
      )}
    </section>
  );
}
