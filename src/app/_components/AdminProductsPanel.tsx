"use client";

import type { Product } from "../_data/products";
import { stockAlerts } from "../_data/admin";
import AdminProductEditor from "./AdminProductEditor";

type Props = {
  products: Product[];
  stockOnly: boolean;
  setStockOnly: (value: boolean) => void;
  onProductsChange: () => void;
};

export default function AdminProductsPanel({
  products,
  stockOnly,
  setStockOnly,
  onProductsChange,
}: Props) {
  const inventoryAlerts = stockAlerts(products);
  return (
    <section className="mt-8 bg-white rounded-[20px] shadow-[0_2px_12px_#20211e04]  border border-black/[0.06]  p-5 sm:p-7">
      <div>
        <p className="text-[10px] uppercase tracking-[0.16em] text-black/40">
          Catalogue management
        </p>
        <h2 className="mt-2 text-3xl text-[#20211e]">Products & inventory</h2>
        <p className="mt-2 max-w-xl text-xs leading-5 text-black/45">
          Manage your collection, update prices and images, and keep stock up to
          date.
        </p>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {[false, true].map((only) => (
          <button
            key={String(only)}
            type="button"
            aria-pressed={stockOnly === only}
            onClick={() => setStockOnly(only)}
            className={`rounded-xl px-4 py-2.5 text-xs ${stockOnly === only ? "bg-[#20211e] text-white" : "bg-[#E9E2D7] text-[#20211e]"}`}
          >
            {only
              ? `Needs stock (${inventoryAlerts.length})`
              : `All products (${products.length})`}
          </button>
        ))}
      </div>
      <AdminProductEditor
        initialProducts={products}
        stockOnly={stockOnly}
        onShowAll={() => setStockOnly(false)}
        onProductsChange={onProductsChange}
      />
    </section>
  );
}
