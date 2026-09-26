"use client";
import { formFieldClasses } from "../_styles/form-classes";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { supabase } from "../../lib/supabase";
import type { Product } from "../_data/products";
import { orderProfit, type FinancialOrder } from "../_data/profit";
import { FiDollarSign, FiTrendingUp, FiAlertCircle } from "react-icons/fi";
import MetricCard from "./MetricCard";

const money = (value: number) => `Rs. ${value.toLocaleString("en-PK")}`;
const inputCost = (value: FormDataEntryValue | null) =>
  value === "" || value === null ? null : Number(value);

function OrderCosts({
  order,
  saved,
}: {
  order: FinancialOrder;
  saved: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || busy) return;
    const form = new FormData(event.currentTarget);
    const values = {
      product_cost: inputCost(form.get("product")),
      delivery_cost: inputCost(form.get("delivery")),
      other_cost: inputCost(form.get("other")) ?? 0,
    };
    if (
      Object.values(values).some(
        (value) =>
          value !== null &&
          (!Number.isSafeInteger(value) || value < 0 || value > 1000000000),
      )
    ) {
      setMessage("Costs must be non-negative whole rupees.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const { error } = await supabase
        .from("order_financials")
        .upsert({ order_id: order.id, ...values });
      if (error) throw error;
      await saved();
      setMessage("Costs saved.");
    } catch (cause) {
      setMessage(
        (cause as { message?: string }).message ?? "Could not save costs.",
      );
    } finally {
      setBusy(false);
    }
  };
  const result = orderProfit(order);
  return (
    <details className="group rounded-2xl border border-black/10 bg-white open:bg-[#F4F1E9]/50">
      <summary className="cursor-pointer rounded-2xl p-4 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 sm:p-5">
        <span className="ml-2 inline-flex w-[calc(100%-2rem)] flex-col gap-3 align-middle sm:flex-row sm:items-center sm:justify-between">
          <span className="min-w-0">
            <span className="block break-all font-medium">{order.id}</span>
            <span className="mt-1 block text-xs text-black/50">
              {order.status} · Edit costs
            </span>
          </span>
          <strong
            className={`shrink-0 self-start rounded-lg px-3 py-2 text-xs ${result.profit === null ? "bg-[#E9E2D7] text-[#20211e]" : result.profit < 0 ? "bg-red-50 text-red-700" : "bg-green-50 text-green-800"}`}
          >
            {result.profit === null
              ? result.closed
                ? "Add missing costs"
                : "Not yet closed"
              : `Profit: ${money(result.profit)}`}
          </strong>
        </span>
      </summary>
      <div className="border-t border-black/10 px-4 pb-5 sm:px-5">
        <p className="mt-3 text-xs text-black/50">
          Revenue: {money(result.revenue)}. Enter total product purchase cost
          and actual courier charges (including return shipping). Leave unknown
          costs blank; enter 0 only when there was no expense.
        </p>
        <form onSubmit={save} className="mt-4">
          <fieldset disabled={busy} className="grid gap-3 sm:grid-cols-3">
            <label className={formFieldClasses}>
              Product cost (Rs.)
              <input
                name="product"
                type="number"
                min={0}
                step={1}
                defaultValue={order.product_cost ?? ""}
              />
            </label>
            <label className={formFieldClasses}>
              Delivery expense (Rs.)
              <input
                name="delivery"
                type="number"
                min={0}
                step={1}
                defaultValue={order.delivery_cost ?? ""}
              />
            </label>
            <label className={formFieldClasses}>
              Other expenses (Rs.)
              <input
                name="other"
                type="number"
                min={0}
                step={1}
                defaultValue={order.other_cost}
              />
            </label>
            <button className="rounded-xl bg-[#20211e] px-4 py-3 text-xs text-white">
              {busy ? "Saving..." : "Save costs"}
            </button>
          </fieldset>
          {message && (
            <p role="status" className="mt-3 text-xs">
              {message}
            </p>
          )}
        </form>
      </div>
    </details>
  );
}

function ProductCost({ product }: { product: Product }) {
  const [cost, setCost] = useState("");
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState("");
  useEffect(() => {
    let active = true;
    if (!supabase) {
      setMessage("Database unavailable.");
      return;
    }
    void supabase
      .from("product_costs")
      .select("unit_cost")
      .eq("product_slug", product.slug)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        setCost(data ? String(data.unit_cost) : "");
        setMessage(error?.message ?? "");
        setBusy(false);
      });
    return () => {
      active = false;
    };
  }, [product.slug]);
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || busy) return;
    const value = Number(cost);
    if (
      !cost.trim() ||
      !Number.isSafeInteger(value) ||
      value < 0 ||
      value > 100000000
    ) {
      setMessage("Enter a non-negative whole rupee cost.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase
        .from("product_costs")
        .upsert({ product_slug: product.slug, unit_cost: value });
      if (error) throw error;
      setMessage(
        "Cost saved for future orders. Existing order costs stay unchanged.",
      );
    } catch (cause) {
      setMessage(
        (cause as { message?: string }).message ?? "Could not save cost.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={save} className="mt-4">
      <fieldset disabled={busy} className="flex flex-wrap items-end gap-3">
        <label className={formFieldClasses}>
          Purchase cost per unit (Rs.)
          <input
            type="number"
            required
            min={0}
            step={1}
            value={cost}
            onChange={(event) => setCost(event.target.value)}
          />
        </label>
        <button className="rounded-xl bg-[#20211e] px-4 py-3 text-xs text-white">
          Save product cost
        </button>
      </fieldset>
      {message && (
        <p role="status" className="mt-3 text-xs">
          {message}
        </p>
      )}
    </form>
  );
}

export default function ProfitReport({ products }: { products: Product[] }) {
  const [start, setStart] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
  });
  const [end, setEnd] = useState(() =>
    new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Karachi" }),
  );
  const [orders, setOrders] = useState<FinancialOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState("");
  const [limit, setLimit] = useState(20);
  const [range, setRange] = useState({ start, end });
  const load = useCallback(async () => {
    if (!supabase) {
      setError("Database unavailable.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase.rpc("profit_report", {
        start_date: range.start,
        end_date: range.end,
      });
      if (error) throw error;
      setOrders(data ?? []);
    } catch (cause) {
      setError(
        (cause as { message?: string }).message ??
          "Could not load profit report.",
      );
    } finally {
      setLoading(false);
    }
  }, [range]);
  useEffect(() => {
    void load();
  }, [load]);
  const results = orders.map(orderProfit);
  const complete = results.filter((result) => result.complete);
  const incomplete = results.filter(
    (result) => result.closed && !result.complete,
  ).length;
  const product = products.find((item) => item.slug === selected);
  return (
    <div className="mt-8 space-y-6">
      <section className="bg-white rounded-[20px] shadow-[0_2px_12px_#20211e04]  border border-black/[0.06]  p-5 sm:p-7">
        <h2 className="text-xl font-semibold text-[#20211e]">
          Choose report dates
        </h2>
        <p className="mt-2 text-sm leading-6 text-black/60">
          See sales and recorded profit for orders placed during this period.
        </p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (start && end && start <= end) {
              setRange({ start, end });
              setLimit(20);
            }
          }}
          className="mt-5 grid items-end gap-4 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_auto]"
        >
          <label className={`${formFieldClasses} min-w-0`}>
            From date
            <input
              className="min-w-0"
              type="date"
              required
              value={start}
              max={end}
              onChange={(event) => setStart(event.target.value)}
            />
          </label>
          <label className={`${formFieldClasses} min-w-0`}>
            To date (Pakistan time)
            <input
              className="min-w-0"
              type="date"
              required
              value={end}
              min={start}
              onChange={(event) => setEnd(event.target.value)}
            />
          </label>
          <button
            disabled={loading}
            className="min-h-11 rounded-xl bg-[#20211e] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#4b5a42] disabled:cursor-wait disabled:opacity-50"
          >
            {loading ? "Loading..." : "Update report"}
          </button>
        </form>
      </section>
      {loading ? (
        <p role="status" className="mt-5">
          Loading report...
        </p>
      ) : error ? (
        <p role="alert" className="mt-5 text-red-700">
          {error}
        </p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <MetricCard
              label="Delivered sales"
              value={money(
                results.reduce((sum, result) => sum + result.revenue, 0),
              )}
              icon={FiDollarSign}
              note="After coupons and reward points"
            />
            <MetricCard
              label="Recorded profit"
              value={money(
                complete.reduce((sum, result) => sum + (result.profit ?? 0), 0),
              )}
              icon={FiTrendingUp}
              note={`From ${complete.length} closed orders with complete costs`}
            />
            <MetricCard
              label="Missing costs"
              value={String(incomplete)}
              icon={FiAlertCircle}
              note="Closed orders that need your attention"
            />
          </div>
          <section className="bg-white rounded-[20px] shadow-[0_2px_12px_#20211e04]  border border-black/[0.06]  p-5 sm:p-7">
            <h2 className="text-xl font-semibold text-[#20211e]">
              Order costs & profit
            </h2>
            <p className="mt-2 text-sm text-black/60">
              Open an order below to enter or update its expenses.
            </p>
            <p className="mt-4 text-xs text-black/60">
              Profit covers {complete.length} fully costed closed orders.{" "}
              {incomplete > 0
                ? "Complete the missing costs below before treating this as the full profit."
                : "Pending, confirmed and dispatched orders are excluded until closed."}
            </p>
            <div className="mt-5 space-y-3">
              {orders.slice(0, limit).map((order) => (
                <OrderCosts
                  key={`${order.id}-${order.product_cost}-${order.delivery_cost}-${order.other_cost}`}
                  order={order}
                  saved={load}
                />
              ))}
              {!orders.length && (
                <p className="text-sm">No orders placed in this period.</p>
              )}
            </div>
            {orders.length > limit && (
              <button
                onClick={() => setLimit((value) => value + 20)}
                className="mt-4 text-sm underline"
              >
                Show more orders
              </button>
            )}
            <details className="mt-6 border-t border-black/10 pt-4 text-sm text-black/60">
              <summary className="cursor-pointer font-medium text-[#20211e]">
                How profit is calculated
              </summary>
              <p className="mt-3 leading-6">
                Delivered revenue after coupons and points, minus product,
                courier and other recorded expenses. Returned or cancelled
                orders have no revenue; unreturned stock is an expense. This
                excludes unrecorded overheads and tax.
              </p>
            </details>
          </section>
        </>
      )}
      <section className="bg-white rounded-[20px] shadow-[0_2px_12px_#20211e04]  border border-black/[0.06]  p-5 sm:p-7">
        <h2 className="text-xl font-semibold text-[#20211e]">
          Product purchase costs
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-black/60">
          Set what you pay per pair. These private costs apply to future orders.
          Update existing orders in the list above.
        </p>
        <div className="mt-5 max-w-2xl rounded-2xl bg-[#F4F1E9] p-4 sm:p-5">
          <label className={formFieldClasses}>
            Choose product
            <select
              value={selected}
              onChange={(event) => setSelected(event.target.value)}
            >
              <option value="">Choose a product</option>
              {products.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name} ({item.color})
                </option>
              ))}
            </select>
          </label>
          {product && <ProductCost key={product.slug} product={product} />}
        </div>
      </section>
    </div>
  );
}
