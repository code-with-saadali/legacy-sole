import { notFound, redirect } from "next/navigation";
import ProductDetailView from "../../_components/ProductDetailView";
import { productSlugAlias, seoProducts } from "../../../lib/seo-catalog";
import { absoluteUrl, pageMetadata, jsonLd } from "../../../lib/seo";
import { availableSizes, sizeStock } from "../../_data/inventory";
import { productSalePrice } from "../../_data/discounts";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
async function findProduct(params: Props["params"]) {
  const { slug } = await params;
  const products = await seoProducts();
  let product = products.find((p) => p.slug === slug);
  if (!product) {
    const currentSlug = await productSlugAlias(slug);
    product = products.find((p) => p.slug === currentSlug);
  }
  if (!product) notFound();
  return product;
}
export async function generateMetadata({ params }: Props) {
  const p = await findProduct(params);
  return pageMetadata(
    p.name + " | Legacy Sole",
    p.description ||
      "Shop " + p.name + " in " + p.color + " at Legacy Sole, Pakistan.",
    "/products/" + encodeURIComponent(p.slug),
    p.image,
  );
}
export default async function ProductPage({ params }: Props) {
  const p = await findProduct(params);
  const { slug } = await params;
  if (p.slug !== slug) redirect(`/products/${encodeURIComponent(p.slug)}`);
  const url = absoluteUrl("/products/" + encodeURIComponent(p.slug));
  const inStock =
    (p.stock ?? 0) > 0 && availableSizes(p).some((s) => sizeStock(p, s) > 0);
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    image: [p.image, ...p.gallery].filter(Boolean),
    sku: p.slug,
    color: p.color,
    category: p.category,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "PKR",
      price: productSalePrice(p),
      availability:
        "https://schema.org/" + (inStock ? "InStock" : "OutOfStock"),
      seller: { "@type": "Organization", name: "Legacy Sole" },
    },
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(schema) }}
      />
      <ProductDetailView slug={p.slug} initialProduct={p} />
    </>
  );
}
