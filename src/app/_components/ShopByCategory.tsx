"use client";

import Link from "next/link";
import Image from "./ProductImage";
import { useCatalog } from "./CatalogProvider";
import { categoryCollections } from "../_data/storefront";
import { menuCategories } from "../_data/navigation";
import { useStoreSettings } from "./StoreSettingsProvider";

import { categoryImages } from "../_data/category-images";

export default function ShopByCategory() {
  const { settings } = useStoreSettings();
  const navigationCategories = menuCategories(settings.menu_columns);
  const { products, categories, loading, error } = useCatalog();
  const productCollections = categoryCollections(products);
  const collectionsByName = new Map(
    productCollections.map((collection) => [collection.name, collection]),
  );
  const collections = [
    ...new Set([
      ...navigationCategories,
      ...categories,
      ...productCollections.map(({ name }) => name),
    ]),
  ]
    .filter((name) => name.trim())
    .map((name) => ({
      name,
      href: `/shop?category=${encodeURIComponent(name)}`,
      image: collectionsByName.get(name)?.product.image || categoryImages[name],
    }));

  return (
    <section
      id="collections"
      aria-labelledby="collections-title"
      className="scroll-mt-28 bg-[#F4F1E9] px-5 py-10 sm:px-[5%]"
    >
      <h2 id="collections-title" className="sr-only">
        Shop by category
      </h2>

      {loading && !collections.length && (
        <div
          role="status"
          className="flex flex-nowrap justify-start gap-8 sm:gap-10 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden"
        >
          <span className="sr-only">Loading categories</span>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <div
              key={index}
              aria-hidden="true"
              className="flex w-22.5 shrink-0 animate-pulse flex-col items-center gap-2 first-of-type:ml-auto last:mr-auto"
            >
              <div className="size-22.5 rounded-full bg-black/5" />
              <div className="h-3 w-14 rounded bg-black/5" />
            </div>
          ))}
        </div>
      )}
      {error && (
        <p role="alert" className="mb-5 text-sm text-black/60">
          We could not refresh the collection. Please try again shortly.
        </p>
      )}
      {!loading && !error && !collections.length && (
        <p className="py-8 text-sm text-black/55">
          New collections are on their way. Check back soon.
        </p>
      )}

      <ul
        aria-labelledby="collections-title"
        tabIndex={0}
        className="-my-2 flex w-full flex-nowrap justify-start gap-8 sm:gap-10 overflow-x-auto overscroll-x-contain py-2 scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ed682c]"
      >
        {collections.map((collection) => (
          <li key={collection.name} className="w-22.5 shrink-0 first:ml-auto last:mr-auto">
            <Link
              href={collection.href}
              className="group flex flex-col items-center gap-2 rounded-lg text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ed682c]"
            >
              <div className="relative size-22.5 overflow-hidden rounded-full border border-[#cececa] bg-[#E9E2D7] transition-colors duration-200 group-hover:border-[#ed682c]">
                <Image
                  src={collection.image || "https://pub-bbec48a9985d48a988fd956df7da148b.r2.dev/legacy-sole/images/shoes/runner-cutout.png"}
                  alt=""
                  fill
                  sizes="90px"
                  className="object-contain transition-transform duration-300 group-hover:scale-110 motion-reduce:transform-none motion-reduce:transition-none"
                />
              </div>
              <span className="w-full wrap-break-word text-[11px] font-medium leading-4 text-[#171717] transition-colors group-hover:text-[#b64b18]">
                {collection.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
