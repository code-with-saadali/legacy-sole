"use client";
import CustomSelect from "./CustomSelect";

import type { ChangeEvent } from "react";
import { FiImage, FiSave, FiX } from "react-icons/fi";
import Image from "./ProductImage";
import type { Product } from "../_data/products";
import { productSizes } from "../_data/inventory";

type Props = {
  draft: Product;
  editingSlug: string;
  allCategories: string[];
  editableProducts: Product[];
  error: string;
  saving: boolean;
  onClose: () => void;
  updateDraft: <Key extends keyof Product>(
    key: Key,
    value: Product[Key],
  ) => void;
  uploadImage: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  saveProduct: () => Promise<void>;
};

export default function ProductEditorDialog({
  draft,
  editingSlug,
  allCategories,
  editableProducts,
  error,
  saving,
  onClose,
  updateDraft,
  uploadImage,
  saveProduct,
}: Props) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-editor-title"
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center scrollbar-hidden overflow-y-auto bg-black/40 p-4 backdrop-blur-sm sm:p-8"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="product-editor-dialog flex max-h-[calc(100dvh-4rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-black/10 bg-[#F4F1E9] shadow-[0_30px_90px_rgba(0,0,0,0.25)]"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-black/10 px-5 py-5 sm:px-7">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#b66b4d]">
              {editingSlug !== "new-product"
                ? "Editing product"
                : "New product"}
            </p>
            <h3
              id="product-editor-title"
              className="mt-2 break-words text-2xl font-medium text-[#20211e] sm:text-3xl"
            >
              {draft.name || "Add product"}
            </h3>
            <p className="mt-2 text-xs text-black/50">
              Product information, images and availability.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close product editor"
            className="flex h-10 w-10 shrink-0 items-center justify-center border border-black/10 bg-[#F8F6F1] hover:bg-[#E9E2D7]"
          >
            <FiX size={18} />
          </button>
        </div>
        <div
          data-lenis-prevent
          className="scrollbar-hidden min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-5 sm:p-7"
        >
          <section className="rounded-[22px] border border-black/10 bg-[#F8F6F1] p-4 sm:p-5">
            <h4 className="text-base font-semibold">Product information</h4>
            <p className="mt-1 text-xs leading-6 text-black/45">
              The essentials customers see in your collection.
            </p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="admin-field">
                URL slug
                <input
                  value={draft.slug}
                  disabled={editingSlug !== "new-product"}
                  placeholder="e.g. leather-boot"
                  onChange={(event) =>
                    updateDraft(
                      "slug",
                      event.target.value.toLowerCase().replace(/\s+/g, "-"),
                    )
                  }
                />
              </label>
              <label className="admin-field">
                Product name
                <input
                  value={draft.name}
                  onChange={(event) => updateDraft("name", event.target.value)}
                />
              </label>
              <label className="admin-field">
                Price (Rs.)
                <input
                  type="number"
                  min="0"
                  value={draft.price}
                  onChange={(event) =>
                    updateDraft("price", Number(event.target.value))
                  }
                />
              </label>
              <label className="admin-field">
                Total stock
                <input
                  type="number"
                  min="0"
                  disabled={!!draft.size_stock}
                  value={
                    draft.size_stock
                      ? Object.values(draft.size_stock).reduce(
                          (sum, count) => sum + count,
                          0,
                        )
                      : (draft.stock ?? 0)
                  }
                  onChange={(event) =>
                    updateDraft("stock", Number(event.target.value))
                  }
                />
              </label>
              <label className="admin-field">
                Colourway
                <input
                  value={draft.color}
                  onChange={(event) => updateDraft("color", event.target.value)}
                />
              </label>
              <label className="admin-field">
                Category
                <CustomSelect
                  label="Product category"
                  value={draft.category}
                  onChange={(value) => updateDraft("category", value)}
                  options={[
                    { value: "", label: "Select category" },
                    ...Array.from(
                      new Set(
                        [...allCategories, draft.category].filter(Boolean),
                      ),
                    ).map((value) => ({ value, label: value })),
                  ]}
                />
              </label>
              <label className="admin-field">
                Badge / tag
                <input
                  value={draft.tag}
                  onChange={(event) => updateDraft("tag", event.target.value)}
                />
              </label>
              <label className="admin-field flex-row items-center gap-3">
                <input
                  type="checkbox"
                  checked={draft.featured}
                  onChange={(event) =>
                    updateDraft("featured", event.target.checked)
                  }
                  className="h-4 w-4 accent-[#b66b4d]"
                />{" "}
                Featured product
              </label>
            </div>
          </section>
          <section className="rounded-[22px] border border-black/10 bg-[#F8F6F1] p-4 sm:p-5">
            <h4 className="text-base font-semibold">Sizes & colour variants</h4>
            <label className="mt-4 flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={draft.one_size ?? false}
                onChange={(event) => {
                  updateDraft("one_size", event.target.checked);
                  if (event.target.checked) updateDraft("size_stock", null);
                }}
              />
              One size (accessories, shoe care, bags)
            </label>
            <p className="mt-2 text-xs leading-6 text-black/50">
              Create a separate product for each colour, with its own image and
              price. Use the same group name to link their colour options.
            </p>
            <label className="admin-field mt-5">
              Colour group
              <input
                value={draft.variant_group ?? ""}
                placeholder="e.g. court-classic"
                onChange={(event) =>
                  updateDraft("variant_group", event.target.value.toLowerCase())
                }
              />
            </label>
            <CustomSelect
              label="Existing colour groups"
              value={draft.variant_group ?? ""}
              onChange={(value) => updateDraft("variant_group", value)}
              placeholder="Or choose an existing colour group"
              options={Array.from(
                new Set(
                  editableProducts
                    .map((product) => product.variant_group)
                    .filter((value): value is string => Boolean(value)),
                ),
              ).map((value) => ({ value, label: value }))}
            />
            <label className="mt-5 flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={!!draft.size_stock}
                disabled={draft.one_size}
                onChange={(event) =>
                  updateDraft(
                    "size_stock",
                    event.target.checked
                      ? Object.fromEntries(
                          productSizes.map((size) => [size, 0]),
                        )
                      : null,
                  )
                }
                className="h-4 w-4 accent-[#b66b4d]"
              />{" "}
              Track stock for each size
            </label>
            {draft.size_stock && (
              <>
                <p className="mt-2 text-xs leading-6 text-black/50">
                  Enter the available units for every size. Zero means sold out.
                  Total stock is calculated automatically.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {productSizes.map((size) => (
                    <label key={size} className="admin-field">
                      {size}
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={draft.size_stock?.[size] ?? 0}
                        onChange={(event) =>
                          updateDraft("size_stock", {
                            ...draft.size_stock,
                            [size]: Number(event.target.value),
                          })
                        }
                      />
                    </label>
                  ))}
                </div>
              </>
            )}
          </section>
          <section className="rounded-[22px] border border-black/10 bg-[#F8F6F1] p-4 sm:p-5">
            <h4 className="text-base font-semibold">Complete the look</h4>
            <p className="mt-2 text-xs text-black/50">
              Choose up to four matching products. Only available products
              appear on the storefront.
            </p>
            <div className="my-5 max-h-48 space-y-3 overflow-y-auto">
              {editableProducts
                .filter((item) => item.slug !== draft.slug)
                .map((item) => (
                  <label
                    key={item.slug}
                    className="flex items-center gap-3 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={
                        draft.complete_the_look?.includes(item.slug) ?? false
                      }
                      disabled={
                        !draft.complete_the_look?.includes(item.slug) &&
                        (draft.complete_the_look?.length ?? 0) >= 4
                      }
                      onChange={(event) =>
                        updateDraft(
                          "complete_the_look",
                          event.target.checked
                            ? [...(draft.complete_the_look ?? []), item.slug]
                            : (draft.complete_the_look ?? []).filter(
                                (slug) => slug !== item.slug,
                              ),
                        )
                      }
                    />
                    {item.name}{" "}
                    <span className="text-xs text-black/40">
                      {item.category}
                    </span>
                  </label>
                ))}
            </div>
            <h4 className="flex items-center gap-2 text-base font-semibold">
              <FiImage size={17} /> Product images
            </h4>
            <p className="mt-1 text-xs leading-6 text-black/45">
              Choose a main photo and add more views to the gallery.
            </p>
            <div className="mt-5 flex items-center gap-4 rounded-2xl bg-[#E9E2D7] p-4">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#F4F1E9]">
                {draft.image ? (
                  <Image
                    src={draft.image}
                    alt="Main product preview"
                    fill
                    sizes="96px"
                    className="object-contain p-2"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-black/30">
                    <FiImage size={28} />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">Main product photo</p>
                <p className="mt-2 text-xs leading-5 text-black/50">
                  {draft.image
                    ? "Preview of the image shown in your collection."
                    : "Upload a photo or add an image URL below."}
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-5">
              <label className="admin-field">
                Image URL
                <input
                  value={
                    draft.image.startsWith("data:")
                      ? "Uploaded image"
                      : draft.image
                  }
                  onChange={(event) => updateDraft("image", event.target.value)}
                />
              </label>
              <label className="admin-field sm:col-span-2">
                Gallery URLs{" "}
                <span className="font-normal text-black/35">
                  (one HTTPS URL per line)
                </span>
                <textarea
                  rows={3}
                  value={draft.gallery.join("\n")}
                  onChange={(event) =>
                    updateDraft(
                      "gallery",
                      event.target.value
                        .split("\n")
                        .map((value) => value.trim())
                        .filter(Boolean),
                    )
                  }
                />
              </label>
              <label className="admin-field sm:col-span-2">
                Upload image
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={uploadImage}
                  className="file:mr-3 file:border-0 file:bg-[#b66b4d] file:px-3 file:py-2 file:text-white"
                />
                <span className="mt-1 text-[10px] text-black/40">
                  <FiImage className="mr-1 inline" size={12} /> Use a product
                  image or paste a public image URL.
                </span>
              </label>
            </div>
          </section>
          <section className="rounded-[22px] border border-black/10 bg-[#F8F6F1] p-4 sm:p-5">
            <h4 className="text-base font-semibold">Description & fit</h4>
            <p className="mt-1 text-xs leading-6 text-black/45">
              Help customers understand the product and choose their size.
            </p>
            <div className="mt-5 grid gap-5">
              <label className="admin-field sm:col-span-2">
                Product description
                <textarea
                  rows={4}
                  value={draft.description}
                  onChange={(event) =>
                    updateDraft("description", event.target.value)
                  }
                />
              </label>
              <label className="admin-field sm:col-span-2">
                Product details{" "}
                <span className="font-normal text-black/35">
                  (one per line)
                </span>
                <textarea
                  rows={3}
                  value={draft.details.join("\n")}
                  onChange={(event) =>
                    updateDraft(
                      "details",
                      event.target.value.split("\n").filter(Boolean),
                    )
                  }
                />
              </label>
              <label className="admin-field sm:col-span-2">
                Size guide{" "}
                <span className="font-normal text-black/45">
                  UK 6: 24cm — one size per line
                </span>
                <textarea
                  rows={3}
                  value={draft.sizeGuide
                    .map((item) => `${item.size}: ${item.footLength}`)
                    .join("\n")}
                  onChange={(event) =>
                    updateDraft(
                      "sizeGuide",
                      event.target.value
                        .split("\n")
                        .map((line) => {
                          const [size, footLength] = line.split(":");
                          return {
                            size: (size ?? "").trim(),
                            footLength: (footLength ?? "").trim(),
                          };
                        })
                        .filter((item) => item.size && item.footLength),
                    )
                  }
                />
              </label>
            </div>
          </section>
        </div>
        <div className="shrink-0 border-t border-black/10 bg-[#F8F6F1] px-5 py-4 sm:px-7">
          {error && (
            <p role="alert" className="mb-3 text-sm text-red-700">
              {error}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="border border-black/15 px-5 py-3 text-xs font-medium hover:bg-[#E9E2D7]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void saveProduct()}
              className="flex items-center gap-2 bg-[#20211e] px-5 py-3 text-xs font-medium text-white transition-colors hover:bg-[#b66b4d] disabled:opacity-50"
            >
              <FiSave size={15} /> {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
