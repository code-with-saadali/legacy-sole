"use client";
import { useState, type ChangeEvent } from "react";
import { supabase } from "../../lib/supabase";
import { useStoreSettings } from "./StoreSettingsProvider";
import { useCatalog } from "./CatalogProvider";
import type { NewArrivalsSettings } from "../_data/new-arrivals";
import { formFieldClasses } from "../_styles/form-classes";
import { validMenuHref } from "../_data/navigation";
import CustomSelect from "./CustomSelect";
import Image from "./ProductImage";
const fields: [keyof NewArrivalsSettings, string][] = [
  ["watermark", "Background word"],
  ["badge", "Image badge"],
  ["styleLabel", "Style label"],
  ["styleValue", "Series value (blank uses category)"],
  ["caption", "Image caption"],
  ["name", "Product name override"],
  ["color", "Colour override"],
  ["eyebrow", "Section label"],
  ["heading", "Heading"],
  ["sectionLabel", "Section heading label"],
  ["drop", "Drop label"],
  ["description", "Description override"],
  ["colorLabel", "Colour label"],
  ["priceLabel", "Price label"],
  ["button", "Button text override"],
  ["href", "Button link (blank opens product)"],
  ["imageAlt", "Image description"],
];
export default function NewArrivalsSettingsPanel() {
  const { settings, refreshSettings } = useStoreSettings();
  const { products } = useCatalog();
  const [draft, setDraft] = useState<NewArrivalsSettings | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const value = draft ?? settings.new_arrivals;
  const product = value.slug
    ? products.find((p) => p.slug === value.slug)
    : ([...products].reverse().find((p) => /new|arrival/i.test(p.tag)) ??
      products[products.length - 1]);
  function edit(change: Partial<NewArrivalsSettings>) {
    setDraft({ ...value, ...change });
    setMessage("");
  }
  async function upload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !supabase) return;
    setBusy(true);
    setMessage("");
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw Error("Please sign in again.");
      const body = new FormData();
      body.set("file", file);
      const r = await fetch("/api/admin/images", {
        method: "POST",
        headers: { Authorization: "Bearer " + session.access_token },
        body,
      });
      const data = await r.json();
      if (!r.ok) throw Error(data.error || "Upload failed");
      edit({ image: data.url });
      setMessage("Uploaded. Save changes to publish.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    if (!supabase || busy) return;
    let imageValid = !value.image;
    try {
      if (value.image) imageValid = new URL(value.image).protocol === "https:";
    } catch {}
    if (
      !product ||
      !imageValid ||
      !(
        !value.href ||
        validMenuHref(value.href) ||
        /^#[a-zA-Z][\w-]*$/.test(value.href)
      )
    ) {
      setMessage(
        "Select an existing product, a valid HTTPS image URL and a valid button link.",
      );
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const { error } = await supabase
        .from("store_settings")
        .update({ new_arrivals: value })
        .eq("id", true)
        .select("id")
        .single();
      if (error) throw error;
      await refreshSettings();
      setDraft(value);
      setMessage("New arrivals saved.");
    } catch {
      setMessage("Could not save. Please retry.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5 sm:p-7">
      <h2 className="text-2xl font-medium">New arrivals</h2>
      <p className="mt-2 text-sm leading-6 text-black/55">
        Edit this homepage section. Blank overrides use the selected product
        details. Price stays linked to the product; update it in Products.
        Deleted products hide this section.
      </p>
      <fieldset disabled={busy} className="mt-6 space-y-5 disabled:opacity-60">
        <CustomSelect
          label="Featured product"
          value={value.slug}
          onChange={(slug) => edit({ slug })}
          options={[
            { value: "", label: "Automatic latest arrival" },
            ...products.map((p) => ({ value: p.slug, label: p.name })),
          ]}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#E9E2D7]">
            {(value.image || product?.image) && (
              <Image
                src={value.image || product!.image}
                alt={value.imageAlt || "Feature preview"}
                fill
                sizes="300px"
                className="object-contain p-4"
              />
            )}
          </div>
          <div className="space-y-4">
            <label className={formFieldClasses}>
              Upload photo (PNG, JPEG, WebP; up to 5 MB)
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => void upload(e)}
              />
            </label>
            <label className={formFieldClasses}>
              Image URL
              <input
                value={value.image}
                placeholder="Blank uses product photo"
                onChange={(e) => edit({ image: e.target.value })}
              />
            </label>
            <button
              type="button"
              onClick={() => edit({ image: "" })}
              className="rounded-xl border border-black/15 px-4 py-3 text-xs"
            >
              Use product photo
            </button>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map(([key, label]) => (
            <label key={key} className={formFieldClasses}>
              {label}
              <textarea
                rows={key === "description" ? 4 : 2}
                value={value[key]}
                onChange={(e) => edit({ [key]: e.target.value })}
              />
            </label>
          ))}
        </div>
        <button
          type="button"
          onClick={() => void save()}
          className="rounded-xl bg-[#4b5b40] px-5 py-3 text-sm text-white"
        >
          {busy ? "Please wait..." : "Save new arrivals"}
        </button>
      </fieldset>
      {message && (
        <p role="status" className="mt-4 text-sm">
          {message}
        </p>
      )}
    </section>
  );
}
