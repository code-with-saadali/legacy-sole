"use client";

import CustomSelect from "../../_components/CustomSelect";
import { FiCheck } from "react-icons/fi";
import { colourSwatchBackground } from "../../_data/colour-swatches";
import Image from "../../_components/ProductImage";
import { useCatalog } from "../../_components/CatalogProvider";
import { categoryCollections } from "../../_data/storefront";
import { categoryImages } from "../../_data/category-images";

export const colourSwatches = [
  {
    name: "All colours",
    gradient: "conic-gradient(#ed682c, #4b5a42, #20211e, #d9d5cb, #ed682c)",
  },
  {
    name: "Cloud / Graphite",
    gradient: "linear-gradient(135deg, #d9d5cb 50%, #4b4b4b 50%)",
  },
  {
    name: "Cream / Forest",
    gradient: "linear-gradient(135deg, #efe3c8 50%, #3f4d3a 50%)",
  },
  { name: "Triple Black", gradient: "#161616" },
];

const MIN_PRICE = 0;

type ShopFiltersProps = {
  category: string;
  onCategoryChange: (value: string) => void;
  colour: string;
  onColourChange: (value: string) => void;
  maxPrice: number;
  onMaxPriceChange: (value: number) => void;
  onReset: () => void;
  categories: string[];
  priceLimit: number;
  colours: string[];
};

export default function ShopFilters({
  category,
  onCategoryChange,
  colour,
  onColourChange,
  maxPrice,
  onMaxPriceChange,
  onReset,
  categories,
  priceLimit,
  colours,
}: ShopFiltersProps) {
  const { products } = useCatalog();
  const collectionImages = new Map(
    categoryCollections(products).map(({ name, product }) => [
      name,
      product.image,
    ]),
  );
  const rangeProgress =
    ((maxPrice - MIN_PRICE) / (priceLimit - MIN_PRICE)) * 100;

  return (
    <aside aria-label="Filter products" className="lg:h-fit">
      <div className="space-y-8 pt-7">
        {/* CATEGORY */}
        <fieldset>
          <legend className="text-[11px] font-medium uppercase tracking-[0.16em] text-black/40">
            Category
          </legend>

          <div className="mt-4 grid grid-cols-3 gap-x-3 gap-y-4">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onCategoryChange(item)}
                aria-pressed={category === item}
                className={`group flex min-w-0 flex-col items-center gap-2 text-center text-[11px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b64b18] ${
                  category === item
                    ? "text-[#20211e]"
                    : "text-black/55 hover:text-black"
                }`}
              >
                <span
                  className={
                    "relative block size-14 overflow-hidden rounded-full bg-[#E9E2D7] " +
                    (category === item
                      ? "ring-2 ring-[#ed682c] ring-offset-4 ring-offset-[#f4f1ea]"
                      : "ring-1 ring-black/10 group-hover:ring-black/25")
                  }
                >
                  <Image
                    src={
                      collectionImages.get(item) ||
                      categoryImages[item] ||
                      "https://pub-bbec48a9985d48a988fd956df7da148b.r2.dev/legacy-sole/images/shoes/runner-cutout.png"
                    }
                    alt=""
                    fill
                    sizes="56px"
                    className="object-contain"
                  />
                </span>
                <span className="min-w-0 flex-1 break-words">{item}</span>
              </button>
            ))}
          </div>
        </fieldset>

        {/* PRICE */}
        <fieldset className="border-t border-black/10 pt-6">
          <legend className="text-[11px] font-medium uppercase tracking-[0.16em] text-black/40">
            Price Range
          </legend>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-[12px] text-black/45">
              Rs. {MIN_PRICE.toLocaleString()}
            </span>
            <span className="rounded-full bg-[#20211e] px-3 py-1.5 text-[11px] font-medium text-white">
              Rs. {maxPrice.toLocaleString()}
            </span>
          </div>

          <div className="relative mt-5 h-5">
            <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 rounded-full bg-black/10" />

            <div
              className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-[#ed682c]"
              style={{ width: `${rangeProgress}%` }}
            />

            <input
              aria-label="Maximum price"
              type="range"
              min={MIN_PRICE}
              max={priceLimit}
              step="1"
              value={maxPrice}
              onChange={(event) => onMaxPriceChange(Number(event.target.value))}
              className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#20211e] [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:mt-0.5 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#20211e]"
            />
          </div>
        </fieldset>

        {/* COLOUR SWATCHES */}
        <fieldset className="border-t border-black/10 pt-6">
          <legend className="text-[11px] font-medium uppercase tracking-[0.16em] text-black/40">
            Colour
          </legend>

          <div className="mt-4 flex flex-wrap gap-3">
            {[
              colourSwatches[0],
              ...colours.filter(Boolean).map(
                (name) =>
                  colourSwatches.find((item) => item.name === name) ?? {
                    name,
                    gradient: colourSwatchBackground(name),
                  },
              ),
            ].map((item) => {
              const isActive = colour === item.name;

              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => onColourChange(item.name)}
                  aria-label={item.name}
                  aria-pressed={isActive}
                  title={item.name}
                  className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#20211e]"
                >
                  <span
                    className="flex h-full w-full items-center justify-center rounded-full text-[10px] text-black/50"
                    style={{ background: item.gradient }}
                    aria-hidden="true"
                  >
                    {!item.gradient ? "?" : null}
                  </span>

                  {isActive && (
                    <span
                      className="absolute inset-0 flex items-center justify-center"
                      aria-hidden="true"
                    >
                      <FiCheck
                        size={18}
                        className="rounded-full bg-[#20211e] p-0.5 text-white ring-1 ring-white"
                      />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </fieldset>

        <button
          type="button"
          onClick={onReset}
          className="text-[11px] font-medium uppercase tracking-[0.14em] text-black/40 transition-colors hover:text-[#ed682c]"
        >
          Clear Filters
        </button>
      </div>
    </aside>
  );
}

export function SortDropdown({
  sort,
  onSortChange,
  options,
}: {
  sort: string;
  onSortChange: (value: string) => void;
  options: string[];
}) {
  return (
    <CustomSelect
      label="Sort products"
      value={sort}
      onChange={onSortChange}
      options={options.map((value) => ({ value, label: value }))}
      className="min-w-52"
    />
  );
}
