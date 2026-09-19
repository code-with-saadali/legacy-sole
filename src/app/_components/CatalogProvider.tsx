"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { getCategories, getProducts, type Product } from "../_data/products";
import { supabase } from "../../lib/supabase";

type Catalog = {
  products: Product[];
  categories: string[];
  loading: boolean;
  error: string;
  connection: string;
  refresh: () => Promise<void>;
};
const CatalogContext = createContext<Catalog | null>(null);

export function useCatalog() {
  const catalog = useContext(CatalogContext);
  if (!catalog) throw new Error("useCatalog must be inside CatalogProvider.");
  return catalog;
}

export default function CatalogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [connection, setConnection] = useState("Connecting");
  const request = useRef(0);

  const refresh = useCallback(async () => {
    const version = ++request.current;
    try {
      const [nextProducts, nextCategories] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);
      if (version !== request.current) return;
      setProducts(nextProducts);
      setCategories(nextCategories);
      setError("");
    } catch (cause) {
      if (version === request.current)
        setError(
          cause instanceof Error
            ? cause.message
            : "Unable to load the collection.",
        );
    } finally {
      if (version === request.current) setLoading(false);
    }
  }, []);

  const invalidate = useCallback(() => {
    request.current += 1;
  }, []);

  useEffect(() => {
    void refresh();
    const client = supabase;
    if (!client) {
      setConnection("Not configured");
      return;
    }
    const channel = client
      .channel("storefront-catalog")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => void refresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "categories" },
        () => void refresh(),
      )
      .subscribe((status) => {
        setConnection(
          status === "SUBSCRIBED"
            ? "Live"
            : status === "CHANNEL_ERROR" || status === "TIMED_OUT"
              ? "Reconnecting"
              : "Connecting",
        );
        if (status === "SUBSCRIBED") void refresh();
      });
    const resume = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    window.addEventListener("online", resume);
    window.addEventListener("focus", resume);
    document.addEventListener("visibilitychange", resume);
    // Keeps the catalogue fresh if a project's replication publication is incomplete.
    const timer = window.setInterval(resume, 30000);
    return () => {
      invalidate();
      window.clearInterval(timer);
      window.removeEventListener("online", resume);
      window.removeEventListener("focus", resume);
      document.removeEventListener("visibilitychange", resume);
      void client.removeChannel(channel);
    };
  }, [refresh, invalidate]);

  return (
    <CatalogContext.Provider
      value={{ products, categories, loading, error, connection, refresh }}
    >
      {children}
    </CatalogContext.Provider>
  );
}
