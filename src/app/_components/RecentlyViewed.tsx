"use client";
import { useEffect, useRef, useState } from "react";
import { recentKey, recentLimit } from "../_data/recently-viewed";
import { useCatalog } from "./CatalogProvider";
import ProductCard from "./ProductCard";

export default function RecentlyViewed() {
  const { products } = useCatalog();
  const [slugs, setSlugs] = useState<string[]>([]);
  const [error, setError] = useState("");
  const drag = useRef({ active: false, moved: false, x: 0, scroll: 0 });
  useEffect(() => {
    const sync = () => {
      try {
        const value: unknown = JSON.parse(
          localStorage.getItem(recentKey) || "[]",
        );
        setSlugs(
          Array.isArray(value)
            ? [
                ...new Set(
                  value.filter(
                    (item): item is string => typeof item === "string",
                  ),
                ),
              ].slice(0, recentLimit)
            : [],
        );
      } catch {
        setSlugs([]);
      }
    };
    sync();
    window.addEventListener("recent-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("recent-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  const recent = slugs.flatMap((slug) =>
    products.filter((product) => product.slug === slug),
  );
  if (!recent.length) return null;
  return (
    <section className="bg-[#F4F1E9] px-[5%] py-14">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl tracking-tight">Recently viewed</h2>
          <p className="mt-2 text-sm text-black/55">
            Pick up where you left off.
          </p>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-full border border-black/20 px-5 py-3 text-xs hover:bg-[#E9E2D7]"
          onClick={() => {
            try {
              localStorage.removeItem(recentKey);
              setSlugs([]);
              window.dispatchEvent(new Event("recent-updated"));
            } catch {
              setError("Could not clear your history. Please try again.");
            }
          }}
        >
          Clear
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <div
        role="region"
        aria-label="Recently viewed products, scroll to see more"
        tabIndex={0}
        className="scrollbar-hidden mt-7 flex cursor-grab gap-6 overflow-x-auto overscroll-x-contain pb-5 active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-offset-4"
        onDragStart={(event) => event.preventDefault()}
        onPointerDown={(event) => {
          drag.current.moved = false;
          if (event.pointerType !== "mouse" || event.button !== 0) return;
          drag.current = {
            active: true,
            moved: false,
            x: event.clientX,
            scroll: event.currentTarget.scrollLeft,
          };
        }}
        onPointerMove={(event) => {
          const state = drag.current;
          if (!state.active) return;
          const delta = event.clientX - state.x;
          if (Math.abs(delta) > 6) {
            state.moved = true;
            event.currentTarget.setPointerCapture(event.pointerId);
          }
          if (state.moved) {
            event.preventDefault();
            event.currentTarget.scrollLeft = state.scroll - delta;
          }
        }}
        onPointerUp={() => {
          drag.current.active = false;
        }}
        onPointerCancel={() => {
          drag.current.active = false;
        }}
        onLostPointerCapture={() => {
          drag.current.active = false;
        }}
        onPointerLeave={() => {
          if (!drag.current.moved) drag.current.active = false;
        }}
        onClickCapture={(event) => {
          if (drag.current.moved) {
            event.preventDefault();
            event.stopPropagation();
            drag.current.moved = false;
          }
        }}
      >
        {recent.map((product) => (
          <div
            key={product.slug}
            className="w-[80%] shrink-0 select-none sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-4.5rem)/4)]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
