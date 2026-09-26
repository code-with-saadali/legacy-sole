"use client";
import { useState, type ChangeEvent } from "react";
import { supabase } from "../../lib/supabase";
import { useStoreSettings } from "./StoreSettingsProvider";
import { useCatalog } from "./CatalogProvider";
import type { StyleGuideSettings, StyleLook } from "../_data/style-guide";
import { formFieldClasses } from "../_styles/form-classes";
import CustomSelect from "./CustomSelect";
import Image from "./ProductImage";

export default function StyleGuideSettingsPanel() {
  const { settings, refreshSettings } = useStoreSettings();
  const { products } = useCatalog();
  const [draft, setDraft] = useState<StyleGuideSettings | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const guide = draft ?? settings.style_guide;
  function edit(change: Partial<StyleGuideSettings>) {
    setDraft({ ...guide, ...change });
    setMessage("");
  }
  function editLook(index: number, change: Partial<StyleLook>) {
    edit({
      looks: guide.looks.map((look, i) =>
        i === index ? { ...look, ...change } : look,
      ),
    });
  }
  async function upload(event: ChangeEvent<HTMLInputElement>, index: number) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !supabase) return;
    if (file.size > 5 * 1024 * 1024) {
      setMessage("Choose an image under 5 MB.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Sign in again to upload images.");
      const body = new FormData();
      body.set("file", file);
      const response = await fetch("/api/admin/images", {
        method: "POST",
        headers: { Authorization: "Bearer " + session.access_token },
        body,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Upload failed.");
      editLook(index, { image: result.url });
      setMessage("Image uploaded. Save style guide to publish.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    if (!supabase || busy) return;
    if (
      !guide.heading.trim() ||
      guide.looks.some(
        (look) =>
          !look.title.trim() ||
          !products.some((p) => p.slug === look.slug) ||
          (look.image && !/^https:\/\//i.test(look.image)),
      )
    ) {
      setMessage(
        "Add a heading, a title and an existing product for each look. Image links must use HTTPS.",
      );
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const { error } = await supabase
        .from("store_settings")
        .update({ style_guide: guide })
        .eq("id", true)
        .select("id")
        .single();
      if (error) throw error;
      await refreshSettings();
      setDraft(guide);
      setMessage("Style guide saved.");
    } catch {
      setMessage(
        "Could not save style guide. Please retry and check the database migration is applied.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="rounded-[20px] border border-black/10 bg-white p-5 sm:p-7">
      <h2 className="text-2xl font-medium">Homepage style guide</h2>
      <p className="mt-2 text-sm text-black/55">
        Edit every heading, photo and look. Save to publish. Looks linked to
        deleted products are hidden.
      </p>
      <fieldset disabled={busy} className="mt-6 space-y-5 disabled:opacity-60">
        {(
          [
            ["eyebrow", "Section label"],
            ["heading", "Heading (line breaks allowed)"],
            ["description", "Introduction"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className={formFieldClasses}>
            {label}
            <textarea
              rows={2}
              value={guide[key]}
              onChange={(e) => edit({ [key]: e.target.value })}
            />
          </label>
        ))}
        {guide.looks.map((look, index) => (
          <div
            key={index}
            className="rounded-2xl border border-black/10 bg-[#FAF9F6] p-4"
          >
            <div className="mb-4 flex justify-between gap-3">
              <h3 className="font-medium">Look {index + 1}</h3>
              <button
                type="button"
                className="text-xs text-red-700"
                onClick={() =>
                  edit({ looks: guide.looks.filter((_, i) => i !== index) })
                }
              >
                Remove look
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-3">
                <div className="relative aspect-square overflow-hidden rounded-xl bg-[#E9E2D7]">
                  {(look.image ||
                    products.find((p) => p.slug === look.slug)?.image) && (
                    <Image
                      src={
                        look.image ||
                        products.find((p) => p.slug === look.slug)!.image
                      }
                      alt="Look preview"
                      fill
                      sizes="240px"
                      className="object-contain p-3"
                    />
                  )}
                </div>
                <label className={formFieldClasses}>
                  Upload photo
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => void upload(e, index)}
                  />
                </label>
                <label className={formFieldClasses}>
                  Image URL
                  <input
                    type="url"
                    placeholder="Leave blank to use product image"
                    value={look.image}
                    onChange={(e) => editLook(index, { image: e.target.value })}
                  />
                </label>
              </div>
              <div className="space-y-4">
                <CustomSelect
                  label="Linked product"
                  value={look.slug}
                  onChange={(slug) => editLook(index, { slug })}
                  options={[
                    { value: "", label: "Choose product" },
                    ...products.map((p) => ({ value: p.slug, label: p.name })),
                  ]}
                />
                {(
                  [
                    ["number", "Look number"],
                    ["title", "Look title"],
                    ["shoe", "Product label (blank uses product name)"],
                    ["outfit", "Outfit text"],
                    ["note", "Note"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className={formFieldClasses}>
                    {label}
                    <input
                      value={look[key]}
                      onChange={(e) =>
                        editLook(index, { [key]: e.target.value })
                      }
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        ))}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-xl border border-black/15 px-4 py-3 text-xs"
            onClick={() =>
              edit({
                looks: [
                  ...guide.looks,
                  {
                    number: String(guide.looks.length + 1).padStart(2, "0"),
                    title: "",
                    shoe: "",
                    image: "",
                    slug: "",
                    outfit: "",
                    note: "",
                  },
                ],
              })
            }
          >
            Add look
          </button>
          <button
            type="button"
            onClick={() => void save()}
            className="rounded-xl bg-[#4b5b40] px-5 py-3 text-xs text-white"
          >
            {busy ? "Please wait..." : "Save style guide"}
          </button>
        </div>
      </fieldset>
      {message && (
        <p role="status" className="mt-4 text-sm">
          {message}
        </p>
      )}
    </section>
  );
}
