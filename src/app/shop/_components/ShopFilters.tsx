"use client";

import CustomSelect from "../../_components/CustomSelect";
import { FiCheck } from "react-icons/fi";

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
  const rangeProgress =
    ((maxPrice - MIN_PRICE) / (priceLimit - MIN_PRICE)) * 100;

  return (
    <aside className="lg:sticky lg:top-28 lg:h-fit">
      <div className="space-y-8 pt-7">
        {/* CATEGORY */}
        <fieldset>
          <legend className="text-[11px] font-medium uppercase tracking-[0.16em] text-black/40">
            Category
          </legend>

          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onCategoryChange(item)}
                aria-pressed={category === item}
                className={`rounded-full px-4 py-2.5 text-[12px] font-medium transition-all duration-300 ${
                  category === item
                    ? "bg-[#20211e] text-white"
                    : "border border-black/10 text-black/55 hover:border-black/25 hover:text-black"
                }`}
              >
                {item}
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
            <div className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 rounded-full bg-black/10" />

            <div
              className="absolute left-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-[#ed682c]"
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
                    gradient: "#E9E2D7",
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
                  className={`group/swatch relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                    isActive
                      ? "ring-2 ring-[#20211e] ring-offset-2 ring-offset-[#F4F1E9]"
                      : "ring-1 ring-black/10 ring-offset-2 ring-offset-[#F4F1E9] hover:ring-black/30"
                  }`}
                >
                  <span
                    className="h-full w-full rounded-full"
                    style={{ background: item.gradient }}
                  />

                  {isActive && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <FiCheck
                        size={14}
                        className={
                          item.name === "Triple Black"
                            ? "text-white"
                            : "text-[#20211e] mix-blend-difference invert"
                        }
                      />
                    </span>
                  )}

                  <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#20211e] px-2.5 py-1 text-[9px] font-medium text-white opacity-0 transition-opacity duration-200 group-hover/swatch:opacity-100">
                    {item.name}
                  </span>
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

export function SortDropdown({sort,onSortChange,options}:{sort:string;onSortChange:(value:string)=>void;options:string[]}) { return <CustomSelect label="Sort products" value={sort} onChange={onSortChange} options={options.map(value=>({value,label:value}))} className="min-w-52"/>; }
