"use client";

import StockWatchButton from "./StockWatchButton";
import { useStoreSettings } from "./StoreSettingsProvider";
import { supportLink } from "../_data/store-settings";
import { useState } from "react";
import { FiMessageCircle, FiShoppingBag } from "react-icons/fi";
import type { Product } from "../_data/products";

export type { CartItem } from "../_data/cart";
import { cartKey, parseCart } from "../_data/cart";
import { productSizes, sizeStock } from "../_data/inventory";

function saveItem(product: Product, quantity: number, size: string) {
  const stored = window.localStorage.getItem(cartKey);
  const cart = parseCart(stored);
  const alreadyAdded = cart
    .filter((item) => item.slug === product.slug)
    .reduce((sum, item) => sum + item.quantity, 0);
  if (alreadyAdded + quantity > (product.stock ?? 0))
    throw new Error("Not enough stock for this quantity.");
  const existing = cart.find(
    (item) => item.slug === product.slug && item.size === size,
  );
  const sizeQuantity = cart
    .filter((item) => item.slug === product.slug && item.size === size)
    .reduce((sum, item) => sum + item.quantity, 0);
  if (sizeQuantity + quantity > sizeStock(product, size))
    throw new Error("Not enough stock for this size.");

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ ...product, quantity, size });
  }

  window.localStorage.setItem(cartKey, JSON.stringify(cart));
  window.dispatchEvent(new Event("cart-updated"));
}

export default function ProductActions({ product }: { product: Product }) {
  const {settings} = useStoreSettings();
  const [size, setSize] = useState(
    () => productSizes.find((size) => sizeStock(product, size) > 0) ?? "UK 8",
  );
  const [message, setMessage] = useState("");

  const addToCart = () => {
    try {
      saveItem(product, 1, size);
      setMessage(`${product.name} added to your bag.`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Your bag could not be saved.",
      );
    }
  };

  const buyNow = () => {
    try {
      saveItem(product, 1, size);
      window.location.href = "/checkout";
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Your bag could not be saved.",
      );
    }
  };

  const whatsappOrder = () => {
    const message = `Assalam o Alaikum, I want to order ${product.name} (${product.color}) in size ${size}. Price: Rs. ${product.price.toLocaleString()}.`;
    window.open(
      supportLink(settings.whatsapp, `${message} ${window.location.origin}/products/${product.slug}`),
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <div className="mt-8 border-t border-black/10 pt-7">
      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-black/45">
          Select size
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {productSizes.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={size === option}
              disabled={sizeStock(product, option) < 1}
              title={
                sizeStock(product, option) < 1
                  ? "Sold out"
                  : `${sizeStock(product, option)} available`
              }
              onClick={() => setSize(option)}
              className={`disabled:opacity-30 disabled:line-through min-w-14 border px-3 py-2.5 text-[11px] transition-colors ${size === option ? "border-[#4b5a42] bg-[#4b5a42] text-white" : "border-black/15 hover:border-[#4b5a42]"}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <button
          type="button"
          disabled={sizeStock(product, size) < 1}
          onClick={addToCart}
          className="flex min-h-12 w-full items-center justify-center gap-3 bg-[#4b5a42] px-5 text-[11px] font-medium uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#b66b4d]"
        >
          <FiShoppingBag size={16} /> Add to cart
        </button>
      </div>

      <button
        type="button"
        disabled={sizeStock(product, size) < 1}
        onClick={buyNow}
        className="mt-3 flex min-h-12 w-full items-center justify-center border border-[#4b5a42] px-5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#4b5a42] transition-colors hover:bg-[#4b5a42] hover:text-white"
      >
        Buy now
      </button>

      <button
        type="button"
        disabled={sizeStock(product, size) < 1}
        onClick={whatsappOrder}
        className="mt-3 flex min-h-12 w-full items-center justify-center gap-3 border border-[#25D366] px-5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#168b43] transition-colors hover:bg-[#25D366] hover:text-white"
      >
        <FiMessageCircle size={16} /> Order on WhatsApp
      </button>

      {sizeStock(product,size)>0 && sizeStock(product,size)<=5 && <p className="mt-4 text-xs text-[#a04c2a]">Only {sizeStock(product,size)} left in {size}.</p>}<StockWatchButton slug={product.slug} />
      <p aria-live="polite" className="mt-4 min-h-5 text-xs text-[#4b5a42]">
        {message}
      </p>
    </div>
  );
}
