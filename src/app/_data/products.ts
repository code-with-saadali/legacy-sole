import { supabase } from "../../lib/supabase";

export type Product = {
  slug: string;
  name: string;
  category: string;
  color: string;
  price: number;
  discount_percent: number;
  sale_price: number | null;
  image: string;
  tag: string;
  description: string;
  details: string[];
  stock?: number;
  sizes?: string[];
  size_stock?: Record<string, number> | null;
  variant_group?: string;
  gallery: string[];
  sizeGuide: { size: string; footLength: string }[];
  featured: boolean;
  one_size?: boolean;
  complete_the_look?: string[];
};

export function normalizeProduct(row: Record<string, unknown>): Product {
  return {
    slug: String(row.slug),
    name: String(row.name ?? "Untitled product"),
    category: String(row.category ?? "Uncategorised"),
    color: String(row.color ?? ""),
    price: Number(row.price ?? 0),
    discount_percent: Number(row.discount_percent ?? 0),
    sale_price:
      row.sale_price == null ? null : Number(row.sale_price),
    image: String(row.image || "https://pub-bbec48a9985d48a988fd956df7da148b.r2.dev/legacy-sole/images/shoes/runner-cutout.png"),
    tag: String(row.tag ?? ""),
    description: String(row.description ?? ""),
    details: Array.isArray(row.details) ? row.details.map(String) : [],
    stock: Number(row.stock ?? 0),
    sizes: Array.isArray(row.sizes)
      ? row.sizes.map(String)
      : ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10"],
    size_stock:
      row.size_stock && typeof row.size_stock === "object"
        ? (row.size_stock as Record<string, number>)
        : null,
    variant_group: String(row.variant_group ?? ""),
    gallery: Array.isArray(row.gallery) ? row.gallery.map(String) : [],
    sizeGuide: Array.isArray(row.size_guide)
      ? (row.size_guide as { size: string; footLength: string }[])
      : [],
    featured: Boolean(row.featured),
    one_size: Boolean(row.one_size),
    complete_the_look: Array.isArray(row.complete_the_look)
      ? row.complete_the_look.map(String)
      : [],
  };
}

export async function getProducts(): Promise<Product[]> {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at");
  if (error) throw new Error(error.message);
  return (data ?? []).map(normalizeProduct);
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? normalizeProduct(data) : undefined;
}

export async function getCategories(): Promise<string[]> {
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase
    .from("categories")
    .select("name")
    .eq("storefront_visible", true)
    .order("name");
  if (error?.code === "42703" || error?.message.includes("storefront_visible")) {
    const legacyResult = await supabase
      .from("categories")
      .select("name")
      .order("name");
    if (legacyResult.error) throw new Error(legacyResult.error.message);
    return (legacyResult.data ?? []).map((row) => String(row.name));
  }
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => String(row.name));
}
