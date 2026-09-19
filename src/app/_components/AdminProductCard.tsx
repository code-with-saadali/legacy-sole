import { FiEdit3 } from "react-icons/fi";
import Image from "./ProductImage";
import type { Product } from "../_data/products";

type Props = {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => Promise<void>;
};

export default function AdminProductCard({ product, onEdit, onDelete }: Props) {
  return (
    <article className="rounded-[28px] border border-black/[0.07] bg-[#F8F6F1] p-4">
      <p className="mb-3 text-xs text-black/60">
        Stock: {product.stock ?? 0} units
        {(product.stock ?? 0) <= 0 ? " / Out of stock" : ""}
      </p>
      <div className="relative aspect-[1.1] overflow-hidden rounded-xl bg-[#E9E2D7]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="30vw"
          className="object-contain p-[8%]"
        />
      </div>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="break-words text-xl text-[#20211e]">{product.name}</h3>
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
          className="flex items-center justify-center gap-2 border border-black/15 px-3 py-3 text-[10px] font-medium uppercase tracking-[0.1em] text-black/60 hover:border-[#b66b4d] hover:text-[#b66b4d]"
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
