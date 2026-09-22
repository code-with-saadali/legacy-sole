import type { Product } from "../_data/products";
import ProductCard from "./ProductCard";

export default function CompleteTheLook({
  product,
  products,
}: {
  product: Product;
  products: Product[];
}) {
  const matches = (product.complete_the_look ?? [])
    .map((slug) =>
      products.find(
        (item) =>
          item.slug === slug &&
          item.slug !== product.slug &&
          (item.stock ?? 0) > 0,
      ),
    )
    .filter((item): item is Product => Boolean(item));
  if (!matches.length) return null;
  return (
    <section className="mt-20 rounded-3xl bg-[#E9E2D7] p-6 sm:p-10">
      <p className="text-xs uppercase tracking-widest text-[#b66b4d]">
        Better together
      </p>
      <h2 className="mt-3 text-4xl">Complete the look.</h2>
      <p className="mt-3 text-sm text-black/60">
        The finishing touches, chosen to go with {product.name}.
      </p>
      <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {matches.map((item) => (
          <ProductCard key={item.slug} product={item} />
        ))}
      </div>
    </section>
  );
}
