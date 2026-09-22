"use client";
import { useRef, useState, type FormEvent } from "react";
import { FiImage, FiSend } from "react-icons/fi";
import { supabase } from "../../lib/supabase";
import StarRating from "./StarRating";
export default function ReviewForm({
  slug,
  onSubmitted,
}: {
  slug: string;
  onSubmitted: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inFlight.current) return;
    const element = event.currentTarget;
    const form = new FormData(element);
    const files = form
      .getAll("photos")
      .filter((file): file is File => file instanceof File && file.size > 0);
    if (
      files.length > 3 ||
      files.some(
        (file) =>
          !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
          file.size > 3 * 1024 * 1024,
      )
    ) {
      setMessage("Choose up to 3 JPG, PNG or WebP photos, each under 3 MB.");
      return;
    }
    if (
      files.length &&
      (!String(form.get("orderReference") ?? "").trim() ||
        !String(form.get("email") ?? "").trim())
    ) {
      setMessage(
        "Enter your delivered order reference and checkout email to share photos.",
      );
      return;
    }
    const name = String(form.get("name") ?? "").trim();
    const body = String(form.get("body") ?? "").trim();
    if (name.length < 2 || body.length < 5) {
      setMessage(
        "Please enter your name and at least 5 characters for your review.",
      );
      return;
    }
    if (!supabase) {
      setMessage("Reviews are temporarily unavailable.");
      return;
    }
    inFlight.current = true;
    setBusy(true);
    setMessage("");
    try {
      const photos: string[] = [];
      for (const file of files) {
        const extension =
          file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
        const path = `${slug}/${crypto.randomUUID()}.${extension}`;
        const { error } = await supabase.storage
          .from("review-images")
          .upload(path, file, { contentType: file.type });
        if (error) throw error;
        photos.push(
          supabase.storage.from("review-images").getPublicUrl(path).data
            .publicUrl,
        );
      }
      const { error } = await supabase.rpc("submit_purchase_review", {
        product_slug: slug,
        reviewer: name,
        stars: rating,
        review_body: body,
        photo_urls: photos,
        order_reference: String(form.get("orderReference") ?? "").trim(),
        customer_email: String(form.get("email") ?? "").trim(),
      });
      if (error) throw error;
      element.reset();
      setRating(5);
      setMessage("Thank you! Your review has been sent for approval.");
      onSubmitted();
    } catch (cause) {
      const error = cause as { message?: string; code?: string };
      setMessage(
        error.code === "23505"
          ? "You have already reviewed this product from that order."
          : error.message ||
              "Your review could not be submitted. Please try again shortly.",
      );
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };
  return (
    <form
      onSubmit={submit}
      className="rounded-3xl border border-black/10 bg-[#E9E2D7]/60 p-6 sm:p-8"
    >
      <h3 className="text-2xl font-medium">How does your pair feel?</h3>
      <p className="mt-2 text-sm leading-6 text-black/50">
        Tell us about the fit, comfort and the details you noticed.
      </p>
      <fieldset disabled={busy} className="mt-5 space-y-4 disabled:opacity-60">
        <legend className="sr-only">Write a review</legend>
        <StarRating value={rating} onChange={setRating} />
        <label className="block text-xs font-medium">
          Your name
          <input
            required
            name="name"
            minLength={2}
            maxLength={80}
            autoComplete="name"
            className="checkout-input mt-2 rounded-xl"
            placeholder="Name shown with your review"
          />
        </label>
        <label className="block text-xs font-medium">
          Your review
          <textarea
            required
            name="body"
            minLength={5}
            maxLength={1000}
            rows={4}
            className="checkout-input mt-2 rounded-xl"
            placeholder="What worked well? How was the fit?"
          />
        </label>
        <div className="rounded-xl border border-black/10 p-4">
          <p className="text-xs leading-5 text-black/60">
            Sharing photos? Verify your purchase with your delivered order
            reference and checkout email. These details stay private. One
            verified review per product per order.
          </p>
          <label className="mt-3 block text-xs font-medium">
            Order reference
            <input
              name="orderReference"
              maxLength={100}
              className="checkout-input mt-2 rounded-xl"
              placeholder="LS-..."
            />
          </label>
          <label className="mt-3 block text-xs font-medium">
            Checkout email
            <input
              name="email"
              type="email"
              maxLength={500}
              className="checkout-input mt-2 rounded-xl"
              placeholder="you@example.com"
            />
          </label>
        </div>
        <label className="block rounded-xl border border-dashed border-black/20 bg-white/40 p-4 text-xs text-black/60">
          <span className="flex items-center gap-2 font-medium">
            <FiImage /> Add photos (optional)
          </span>
          <span className="mt-1 block text-[11px]">
            Up to 3 images · 3 MB each
          </span>
          <input
            type="file"
            name="photos"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="mt-3 block w-full text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-[#E9E2D7] file:px-3 file:py-2"
          />
        </label>
        <button
          type="submit"
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#4b5a42] px-5 py-3 text-sm font-medium text-white hover:bg-[#20211e]"
        >
          <FiSend />
          {busy ? "Submitting…" : "Submit review"}
        </button>
      </fieldset>
      {message && (
        <p role="status" className="mt-4 text-sm leading-6">
          {message}
        </p>
      )}
    </form>
  );
}
