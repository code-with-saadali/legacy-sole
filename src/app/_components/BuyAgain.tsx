"use client";
import { useState } from "react";
import Link from "next/link";
import { useCatalog } from "./CatalogProvider";
import { cartIssues, cartKey, parseCart } from "../_data/cart";

export default function BuyAgain({
  items,
}: {
  items: { slug?: string; name: string; size?: string; quantity: number }[];
}) {
  const { products, loading, error } = useCatalog();
  const [message, setMessage] = useState("");
  const [added, setAdded] = useState(false);
  const add = () => {
    try {
      const next = parseCart(localStorage.getItem(cartKey));
      for (const item of items) {
        const product = products.find((product) => product.slug === item.slug);
        if (
          !product ||
          !item.size ||
          !Number.isSafeInteger(item.quantity) ||
          item.quantity < 1
        ) {
          setMessage(
            `${item.name} is no longer available with the original size. Please choose it from the shop.`,
          );
          return;
        }
        const existing = next.find(
          (row) => row.slug === product.slug && row.size === item.size,
        );
        if (existing) existing.quantity += item.quantity;
        else
          next.push({ ...product, size: item.size, quantity: item.quantity });
      }
      const issues = cartIssues(next, products);
      if (issues.length) {
        setMessage(issues.join(" "));
        return;
      }
      localStorage.setItem(cartKey, JSON.stringify(next));
      window.dispatchEvent(new Event("cart-updated"));
      setAdded(true);
      setMessage(
        "Added to your bag at current prices. Review your bag before placing a new order.",
      );
    } catch {
      setMessage(
        "Could not save your bag. Please enable browser storage and try again.",
      );
    }
  };
  return (
    <div className="mt-6 border-t border-black/10 pt-5">
      <button
        type="button"
        disabled={loading || !!error || added || !items.length}
        onClick={add}
        className="rounded-full bg-[#4b5a42] px-5 py-3 text-sm text-white disabled:opacity-50"
      >
        {added ? "Added to bag" : "Buy again"}
      </button>
      <Link href={added ? "/cart" : "/shop"} className="ml-4 text-sm underline">
        {added ? "View bag" : "Browse shop"}
      </Link>
      <p className="mt-2 text-xs text-black/55">
        Same sizes and quantities, subject to current stock and prices.
      </p>
      {error && (
        <p role="alert" className="mt-2 text-sm">
          Unable to check stock. Please try again later.
        </p>
      )}
      {message && (
        <p role="status" className="mt-3 text-sm">
          {message}
        </p>
      )}
    </div>
  );
}
