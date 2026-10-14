"use client";

import { useState, type ChangeEvent } from "react";
import { supabase } from "../../lib/supabase";
import { formFieldClasses } from "../_styles/form-classes";
import Image from "./ProductImage";
import { useStoreSettings } from "./StoreSettingsProvider";

export default function HeroSettingsPanel({
  target,
}: {
  target: "homepage" | "shop";
}) {
  const { settings, refreshSettings } = useStoreSettings();
  const [draft, setDraft] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const settingKey = target === "homepage" ? "hero_image" : "shop_hero_image";
  const defaultImage = target === "homepage" ? "/baner.jpeg" : "";
  const image = draft ?? settings[settingKey];
  const previewImage =
    image ||
    (target === "homepage"
      ? "/baner.jpeg"
      : "https://pub-bbec48a9985d48a988fd956df7da148b.r2.dev/legacy-sole/images/shoes/runner-cutout.png");
  const title =
    target === "homepage" ? "Homepage hero image" : "Shop page hero image";

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!supabase) {
      setMessage("Supabase is not configured.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Please sign in again.");
      const body = new FormData();
      body.set("file", file);
      const response = await fetch("/api/admin/images", {
        method: "POST",
        headers: { Authorization: "Bearer " + session.access_token },
        body,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Image upload failed.");
      setDraft(result.url);
      setMessage("Image uploaded. Save changes to publish it.");
    } catch (cause) {
      setMessage(
        cause instanceof Error ? cause.message : "Image upload failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (busy) return;
    if (!supabase) {
      setMessage("Supabase is not configured.");
      return;
    }
    let valid =
      (target === "shop" && !image) ||
      (image.startsWith("/") && !image.startsWith("//"));
    try {
      valid ||= new URL(image).protocol === "https:";
    } catch {
      valid = false;
    }
    if (!valid) {
      setMessage("Use a local image path or a valid HTTPS image URL.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const { error } = await supabase
        .from("store_settings")
        .update({ [settingKey]: image })
        .eq("id", true)
        .select("id")
        .single();
      if (error) throw error;
      await refreshSettings();
      setDraft(image);
      setMessage(
        `${target === "homepage" ? "Homepage" : "Shop page"} hero image saved.`,
      );
    } catch (cause) {
      setMessage(
        cause instanceof Error
          ? cause.message
          : "Could not save the hero image. Please retry.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5 sm:p-7">
      <h2 className="text-2xl font-medium">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-black/55">
        {target === "homepage"
          ? "Change the banner image shown on the homepage."
          : "Change the image shown beside the collection heading on the shop page. Leave it blank to use the automatic product/category image."}
      </p>
      <fieldset disabled={busy} className="mt-6 space-y-5 disabled:opacity-60">
        <div className="relative aspect-[2.36] overflow-hidden rounded-2xl bg-[#E9E2D7]">
          <Image
            src={previewImage}
            alt={`${title} preview`}
            fill
            sizes="(max-width: 640px) 90vw, 720px"
            className="object-cover"
          />
        </div>
        <label className={formFieldClasses}>
          Upload image (PNG, JPEG, WebP; up to 5 MB)
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => void upload(event)}
          />
        </label>
        <label className={formFieldClasses}>
          Image URL
          <input
            value={image}
            onChange={(event) => {
              setDraft(event.target.value);
              setMessage("");
            }}
            placeholder={
              target === "homepage"
                ? "/baner.jpeg or https://..."
                : "Blank uses the automatic collection image"
            }
          />
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setDraft(defaultImage);
              setMessage("");
            }}
            className="rounded-xl border border-black/15 px-4 py-3 text-xs"
          >
            {target === "homepage"
              ? "Restore default image"
              : "Use automatic collection image"}
          </button>
          <button
            type="button"
            onClick={() => void save()}
            className="rounded-xl bg-[#4b5b40] px-5 py-3 text-sm text-white"
          >
            {busy ? "Please wait..." : "Save hero image"}
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
