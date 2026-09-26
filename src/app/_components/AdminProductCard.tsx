import { FiEdit3 } from "react-icons/fi";
import Image from "./ProductImage";
import type { Product } from "../_data/products";
import { productPhotos } from "../_data/product-poses";

type Props = {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => Promise<void>;
};

export default function AdminProductCard({ product, onEdit, onDelete }: Props) {
  return (
    <article className="rounded-2xl border border-black/[0.08] bg-white p-4 shadow-[0_2px_8px_#20211e03]">
      <p className="mb-3 text-xs text-black/60">
        Stock: {product.stock ?? 0} units
        {(product.stock ?? 0) <= 0 ? " / Out of stock" : ""}
      </p>
      <div className="relative aspect-[1.4] overflow-hidden rounded-xl bg-[#E9E2D7]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="30vw"
          className="object-contain p-[8%]"
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-2" aria-label="Product poses">
        {productPhotos(product.image, product.gallery).map((image, index) => (
          <button
            key={image}
            type="button"
            onClick={() => onEdit(product)}
            aria-label={`Edit ${product.name} photo ${index + 1}`}
            className="relative h-14 w-14 shrink-0 rounded-lg border border-black/10 bg-[#E9E2D7] hover:border-[#b66b4d]"
          >
            <Image
              src={image}
              alt=""
              fill
              sizes="56px"
              className="object-contain p-1"
            />
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="break-words text-base font-semibold text-[#20211e]">
            {product.name}
          </h3>
          <p className="mt-1 break-words text-[11px] text-black/45">
            {product.category} / {product.color}
          </p>
        </div>
        <span className="text-sm font-semibold">
          Rs. {product.price.toLocaleString()}
        </span>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onEdit(product)}
          className="flex items-center justify-center gap-2 border border-[#20211e] bg-[#20211e] px-3 py-3 text-[10px] font-medium uppercase tracking-[0.1em] text-white hover:bg-[#383a33]"
        >
          <FiEdit3 size={14} /> Edit
        </button>
        <button
          type="button"
          onClick={() => void onDelete(product)}
          className="border border-[#b66b4d]/30 px-3 py-3 text-[10px] font-medium uppercase tracking-[0.1em] text-[#b66b4d] hover:bg-[#b66b4d] hover:text-white"
        >
          Delete
        </button>
      </div>
    </article>
  );
}
