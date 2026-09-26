import type { Product } from "../_data/products";
import ProductCard from "./ProductCard";
export default function RelatedProducts({
  product,
  products,
}: {
  product: Product;
  products: Product[];
}) {
  const related = products
    .filter(
      (item) =>
        item.slug !== product.slug &&
        item.category === product.category &&
        (item.stock ?? 0) > 0,
    )
    .slice(0, 4);
  if (!related.length) return null;
  return (
    <section className="mt-20 border-t border-black/10 pt-10">
      <h2 className="text-4xl">More in your style.</h2>
      <div className="mt-7 grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-6 lg:grid-cols-4">
        {related.map((item) => (
          <ProductCard key={item.slug} product={item} />
        ))}
      </div>
    </section>
  );
}
