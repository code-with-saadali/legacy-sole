"use client";

import { useEffect, useState } from "react";
import { useCatalog } from "../_components/CatalogProvider";
import { cartKey, parseCart, cartIssues, type CartItem } from "../_data/cart";

export default function useCart() {
  const [stored, setStored] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [storageError, setStorageError] = useState("");
  const { products, loading, error } = useCatalog();
  useEffect(() => {
    const sync = () => {
      try {
        setStored(parseCart(localStorage.getItem(cartKey)));
      } catch {
        setStored([]);
      }
      setHydrated(true);
    };
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("cart-updated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("cart-updated", sync);
    };
  }, []);
  const items = stored.map((item) => ({
    ...item,
    ...products.find((product) => product.slug === item.slug),
  }));
  const issues = !loading && !error ? cartIssues(items, products) : [];
  const updateCart = (next: CartItem[]) => {
    try {
      localStorage.setItem(cartKey, JSON.stringify(next));
      setStorageError("");
      setStored(next);
      window.dispatchEvent(new Event("cart-updated"));
    } catch {
      setStorageError(
        "Your bag could not be updated. Allow browser storage and try again.",
      );
    }
  };
  return {
    items,
    updateCart,
    issues,
    ready: hydrated && !loading,
    error: error || storageError,
  };
}
