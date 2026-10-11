"use client";

import { useState } from "react";
import { FiChevronLeft, FiChevronRight, FiMinus, FiPlus } from "react-icons/fi";
import Modal from "./Modal";
import ProductImage from "./ProductImage";

export default function ProductZoom({
  images,
  initialImage,
  name,
  onClose,
}: {
  images: string[];
  initialImage: string;
  name: string;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(Math.max(0, images.indexOf(initialImage)));
  const [scale, setScale] = useState(1);
  const [origin, setOrigin] = useState("50% 50%");
  const changeImage = (direction: number) => {
    setIndex(
      (current) => (current + direction + images.length) % images.length,
    );
    setScale(1);
    setOrigin("50% 50%");
  };
  const controlClass =
    "flex size-10 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm hover:bg-[#F4F1E9] disabled:opacity-35";

  return (
    <Modal title={name} onClose={onClose} variant="image">
      <div
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            changeImage(-1);
          }
          if (event.key === "ArrowRight") {
            event.preventDefault();
            changeImage(1);
          }
        }}
      >
        <button
          type="button"
          aria-label={
            scale > 1 ? "Zoom out of product image" : "Zoom in on product image"
          }
          onClick={() => {
            setScale(scale > 1 ? 1 : 2);
            setOrigin("50% 50%");
          }}
          onPointerMove={(event) => {
            if (scale === 1) return;
            const bounds = event.currentTarget.getBoundingClientRect();
            setOrigin(
              `${((event.clientX - bounds.left) / bounds.width) * 100}% ${((event.clientY - bounds.top) / bounds.height) * 100}%`,
            );
          }}
          className={`relative block h-[max(120px,calc(90dvh_-_160px))] max-h-[700px] w-full overflow-hidden bg-white ${scale > 1 ? "cursor-zoom-out" : "cursor-zoom-in"}`}
        >
          <ProductImage
            src={images[index]}
            alt={`${name}, photo ${index + 1}`}
            fill
            sizes="(max-width: 1024px) 95vw, 1024px"
            className="object-contain motion-safe:transition-transform motion-safe:duration-200"
            style={{ transform: `scale(${scale})`, transformOrigin: origin }}
          />
        </button>
        <div className="flex items-center justify-between gap-2 border-t border-black/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous photo"
              disabled={images.length < 2}
              onClick={() => changeImage(-1)}
              className={controlClass}
            >
              <FiChevronLeft />
            </button>
            <span
              aria-live="polite"
              className="min-w-10 text-center text-xs text-black/60"
            >
              {index + 1} / {images.length}
            </span>
            <button
              type="button"
              aria-label="Next photo"
              disabled={images.length < 2}
              onClick={() => changeImage(1)}
              className={controlClass}
            >
              <FiChevronRight />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Zoom out"
              disabled={scale === 1}
              onClick={() => setScale(Math.max(1, scale - 0.5))}
              className={controlClass}
            >
              <FiMinus />
            </button>
            <span
              aria-live="polite"
              className="min-w-10 text-center text-xs text-black/60"
            >
              {scale * 100}%
            </span>
            <button
              type="button"
              aria-label="Zoom in"
              disabled={scale === 3}
              onClick={() => setScale(Math.min(3, scale + 0.5))}
              className={controlClass}
            >
              <FiPlus />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
