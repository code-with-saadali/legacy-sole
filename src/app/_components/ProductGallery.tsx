"use client";
import { useState } from "react";
import type { Product } from "../_data/products";
import { productPhotos } from "../_data/product-poses";
import ProductImage from "./ProductImage";
import ProductZoom from "./ProductZoom";
export default function ProductGallery({ product }: { product: Product }) {
  const images = productPhotos(product.image, product.gallery);
  const [selectedImage, setSelectedImage] = useState(images[0]);
  const active = images.includes(selectedImage) ? selectedImage : images[0];
  const [zoom, setZoom] = useState(false);
  return (
    <div className="relative aspect-square w-full self-start overflow-hidden rounded-[30px] bg-white lg:aspect-auto lg:min-h-130 lg:self-stretch">
      {product.tag && (
        <span className="absolute left-5 top-5 z-10 rounded-full bg-[#F4F1E9] px-3 py-2 text-[10px] uppercase tracking-widest">
          {product.tag}
        </span>
      )}
      <button
        type="button"
        onClick={() => setZoom(true)}
        aria-label={`Enlarge ${product.name} image`}
        className="absolute inset-0 h-full w-full cursor-zoom-in"
      >
        <ProductImage
          src={active}
          alt={`${product.name}, ${product.color}`}
          fill
          priority
          sizes="(max-width: 1023px) 90vw, 50vw"
          className="object-cover object-center"
        />
      </button>
      {images.length > 1 && (
        <div
          aria-label="Product photos"
          className="absolute bottom-4 left-1/2 z-10 flex max-w-[calc(100%_-_2rem)] -translate-x-1/2 gap-2 overflow-x-auto rounded-2xl bg-white/85 p-2 shadow-sm ring-1 ring-black/5 backdrop-blur-sm sm:bottom-5"
        >
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              aria-label={`View product photo ${index + 1}`}
              aria-pressed={active === image}
              onClick={() => setSelectedImage(image)}
              className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 bg-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4b5a42] sm:h-16 sm:w-16 ${active === image ? "border-[#4b5a42]" : "border-black/10 hover:border-[#4b5a42]/40"}`}
            >
              <ProductImage
                src={image}
                alt=""
                fill
                sizes="(max-width: 639px) 56px, 64px"
                className="object-cover object-center"
              />
            </button>
          ))}
        </div>
      )}
      {zoom && (
        <ProductZoom
          images={images}
          initialImage={active}
          name={product.name}
          onClose={() => setZoom(false)}
        />
      )}
    </div>
  );
}
