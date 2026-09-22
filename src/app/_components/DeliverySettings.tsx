"use client";
import { useState, type FormEvent } from "react";
import { supabase } from "../../lib/supabase";
import { useStoreSettings } from "./StoreSettingsProvider";
import { whatsappPhone } from "../_data/admin";
export default function DeliverySettings() {
  const { settings, refreshSettings } = useStoreSettings();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || busy) return;
    const form = new FormData(event.currentTarget);
    const phone = whatsappPhone(String(form.get("whatsapp")));
    if (!phone) {
      setMessage("Enter a valid WhatsApp number.");
      return;
    }
    const city_rates: Record<string, number> = {};
    for (const line of String(form.get("rates") ?? "")
      .split("\n")
      .filter((line) => line.trim())) {
      const [city, amount, ...rest] = line.split("=");
      const charge = Number(amount);
      if (
        !city?.trim() ||
        amount === undefined ||
        !amount.trim() ||
        rest.length ||
        !Number.isSafeInteger(charge) ||
        charge < 0
      ) {
        setMessage(
          "Use City = charge on each line, with a whole-number charge.",
        );
        return;
      }
      const existing = Object.keys(city_rates).find(
        (name) => name.toLowerCase() === city.trim().toLowerCase(),
      );
      if (existing) {
        setMessage("Each city should appear once.");
        return;
      }
      city_rates[city.trim()] = charge;
    }
    setBusy(true);
    setMessage("");
    try {
      const { error } = await supabase
        .from("store_settings")
        .update({
          whatsapp: phone,
          default_shipping: Number(form.get("default_shipping")),
          free_shipping_minimum: Number(form.get("free_shipping_minimum")),
          city_rates,
        })
        .eq("id", true)
        .select("id")
        .single();
      if (error) throw error;
      await refreshSettings();
      setMessage("Store settings saved.");
    } catch {
      setMessage("Settings could not be saved. Please retry.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="admin-panel rounded-[28px] border border-black/[0.06] bg-white p-5 sm:p-7">
      <h2 className="text-2xl font-medium tracking-tight">
        Delivery & support
      </h2>
      <p className="mt-2 text-sm text-black/50">
        City overrides apply below the free-delivery threshold.
      </p>
      <form
        key={JSON.stringify(settings)}
        onSubmit={save}
        className="mt-5 space-y-4"
      >
        <fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2">
          <label className="admin-field">
            WhatsApp number
            <input name="whatsapp" required defaultValue={settings.whatsapp} />
          </label>
          <label className="admin-field">
            Default delivery (Rs.)
            <input
              name="default_shipping"
              required
              type="number"
              min="0"
              max="100000"
              step="1"
              defaultValue={settings.default_shipping}
            />
          </label>
          <label className="admin-field">
            Free delivery from (Rs.)
            <input
              name="free_shipping_minimum"
              required
              type="number"
              min="0"
              step="1"
              defaultValue={settings.free_shipping_minimum}
            />
          </label>
          <label className="admin-field sm:col-span-2">
            City delivery charges
            <textarea
              name="rates"
              rows={5}
              placeholder={"Karachi = 250\nLahore = 300"}
              defaultValue={Object.entries(settings.city_rates)
                .map(([city, charge]) => `${city} = ${charge}`)
                .join("\n")}
            />
            <span className="text-xs font-normal text-black/50">
              One city per line. Unlisted cities use the default charge.
            </span>
          </label>
        </fieldset>
        <button
          disabled={busy}
          className="rounded-xl bg-[#20211e] px-5 py-3 text-sm text-white disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save settings"}
        </button>
        {message && (
          <p role="status" className="text-sm">
            {message}
          </p>
        )}
      </form>
    </section>
  );
}
