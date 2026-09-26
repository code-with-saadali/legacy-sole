import "server-only";
import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { normalizeProduct } from "../app/_data/products";
export const seoProducts = cache(async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Catalogue configuration missing");
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client
    .from("products")
    .select("*")
    .order("created_at");
  if (error) throw new Error("Catalogue unavailable");
  return (data ?? []).map(normalizeProduct);
});
