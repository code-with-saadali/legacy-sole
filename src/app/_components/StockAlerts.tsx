"use client";

import type { Product } from "../_data/products";
import { stockAlerts, lowStockThreshold } from "../_data/admin";

type Props = {
  products: Product[];
  catalogError: string;
  onManageStock: () => void;
};

export default function StockAlerts({
  products,
  catalogError,
  onManageStock,
}: Props) {
  const inventoryAlerts = stockAlerts(products);
  return (
    <section className="admin-panel mt-8 rounded-[28px] border border-black/[0.06] bg-white p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl">Stock alerts ({inventoryAlerts.length})</h2>
          <p className="mt-2 text-xs text-black/50">
            Products with {lowStockThreshold} or fewer units remaining.
          </p>
        </div>
        <button
          type="button"
          onClick={onManageStock}
          className="rounded-xl border border-black/10 px-4 py-3 text-xs"
        >
          Manage stock
        </button>
      </div>
      {catalogError && (
        <p className="mt-4 text-xs text-amber-800">
          Stock alerts may be outdated. The catalogue could not be refreshed.
        </p>
      )}
      <ul className="mt-4 divide-y divide-black/10">
        {inventoryAlerts.slice(0, 5).map((product) => (
          <li
            key={product.slug}
            className="flex items-center justify-between gap-4 py-4"
          >
            <div>
              <p className="text-sm font-medium">{product.name}</p>
              <p className="mt-1 text-xs text-black/45">{product.category}</p>
            </div>
            <span
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs ${(product.stock ?? 0) <= 0 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800"}`}
            >
              {(product.stock ?? 0) <= 0
                ? "Out of stock"
                : `${product.stock} left`}
            </span>
          </li>
        ))}
      </ul>
      {inventoryAlerts.length > 5 && (
        <p className="mt-3 text-xs text-black/50">
          {inventoryAlerts.length - 5} more products need attention. Open Manage
          stock to see all.
        </p>
      )}
      {!inventoryAlerts.length && (
        <p className="mt-5 text-sm text-black/50">
          {products.length
            ? "All products are above the low-stock threshold."
            : "Stock alerts will appear when your catalogue has products."}
        </p>
      )}
    </section>
  );
}
