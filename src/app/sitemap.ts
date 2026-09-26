import type { MetadataRoute } from "next";
import { absoluteUrl, siteUrl } from "../lib/seo";
import { seoProducts } from "../lib/seo-catalog";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!siteUrl) return [];
  const products = await seoProducts();
  return [
    "/",
    "/shop",
    "/contact",
    "/faqs",
    "/size-guide",
    "/shipping-delivery",
    "/returns-exchanges",
    ...products.map((p) => "/products/" + encodeURIComponent(p.slug)),
  ].map((path) => ({ url: absoluteUrl(path)! }));
}
