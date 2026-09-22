"use client";
import { useEffect, useState } from "react";
import { readList, saveList } from "../_data/product-lists";
export default function useProductList(key: string) {
  const [items, setItems] = useState<string[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    const sync = () => setItems(readList(key));
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("product-lists-updated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("product-lists-updated", sync);
    };
  }, [key]);
  const toggle = (item: string, limit = 100) => {
    try {
      const current = readList(key);
      if (!current.includes(item) && current.length >= limit) {
        setError(`You can choose up to ${limit} products.`);
        return;
      }
      saveList(
        key,
        current.includes(item)
          ? current.filter((value) => value !== item)
          : [...current, item],
      );
      setError("");
    } catch {
      setError("Your browser could not save this selection.");
    }
  };
  return { items, toggle, error };
}
