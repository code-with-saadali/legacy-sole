import type { Metadata } from "next";
const configured = process.env.NEXT_PUBLIC_SITE_URL || "https://legacysole.com";
export const siteUrl = configured ? new URL(configured).origin : undefined;
export const absoluteUrl = (path: string) =>
  siteUrl ? new URL(path, siteUrl).href : undefined;
export function pageMetadata(
  title: string,
  description: string,
  path: string,
  image = "/opengraph-image",
): Metadata {
  return {
    title,
    description,
    alternates: siteUrl ? { canonical: absoluteUrl(path) } : undefined,
    openGraph: {
      type: "website",
      siteName: "Legacy Sole",
      locale: "en_PK",
      title,
      description,
      url: absoluteUrl(path),
      images: [{ url: image, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
export const jsonLd = (value: unknown) =>
  JSON.stringify(value).replace(/</g, "\\u003c");
