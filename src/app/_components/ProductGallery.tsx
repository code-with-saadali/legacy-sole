"use client";
import { useState } from "react";
import type { Product } from "../_data/products";
import ProductImage from "./ProductImage";
import Modal from "./Modal";
export default function ProductGallery({ product }: { product: Product }) {
  const images = [
    ...new Set([product.image, ...product.gallery].filter(Boolean)),
  ];
  const [active, setActive] = useState(images[0]);
  const [zoom, setZoom] = useState(false);
  return (
    <div className="relative flex min-h-100 flex-col rounded-[30px] bg-[#E9E2D7] p-5 lg:min-h-130">
      {product.tag && (
        <span className="absolute left-5 top-5 z-10 rounded-full bg-[#F4F1E9] px-3 py-2 text-[10px] uppercase tracking-widest">
          {product.tag}
        </span>
      )}
      <button
        type="button"
        onClick={() => setZoom(true)}
        aria-label={`Enlarge ${product.name} image`}
        className="relative min-h-80 flex-1"
      >
        <ProductImage
          src={active}
          alt={`${product.name}, ${product.color}`}
          fill
          priority
          sizes="(max-width: 1023px) 90vw, 50vw"
          className="object-contain p-5"
        />
      </button>
      <p className="text-center text-[10px] uppercase tracking-widest text-black/40">
        Tap image to enlarge
      </p>
      {images.length > 1 && (
        <div className="mt-4 flex justify-center gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              aria-label={`View product photo ${index + 1}`}
              aria-pressed={active === image}
              onClick={() => setActive(image)}
              className={`relative h-16 w-16 shrink-0 rounded-xl border bg-[#F4F1E9] ${active === image ? "border-[#4b5a42]" : "border-transparent"}`}
            >
              <ProductImage
                src={image}
                alt=""
                fill
                sizes="64px"
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}
      {zoom && (
        <Modal title={product.name} onClose={() => setZoom(false)}>
          <div className="relative aspect-square">
            <ProductImage
              src={active}
              alt={`${product.name}, ${product.color}`}
              fill
              sizes="640px"
              className="object-contain"
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
