"use client";
import { FaAngleDown } from "react-icons/fa";
import { formFieldClasses } from "../_styles/form-classes";
import CustomSelect from "./CustomSelect";

import { useState, type ChangeEvent } from "react";
import {
  FiImage,
  FiSave,
  FiX,
  FiBox,
  FiAlignLeft,
  FiLayers,
} from "react-icons/fi";
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
  uploadImage: (
    event: ChangeEvent<HTMLInputElement>,
    slot: number,
  ) => Promise<void>;
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
  const [activeSection, setActiveSection] = useState("details");
  const sections = [
    { id: "details", label: "Details", icon: FiBox },
    { id: "images", label: "Photos", icon: FiImage },
    { id: "description", label: "Description", icon: FiAlignLeft },
    { id: "inventory", label: "Sizes & variants", icon: FiLayers },
  ];
  const [restocking, setRestocking] = useState(false);
  const [restockQuantity, setRestockQuantity] = useState(1);
  const [restockSize, setRestockSize] = useState(productSizes[0]);
  const totalStock = draft.size_stock
    ? Object.values(draft.size_stock).reduce((sum, count) => sum + count, 0)
    : (draft.stock ?? 0);
  const soldOut = totalStock <= 0;
  const markSoldOut = () => {
    setRestocking(false);
    updateDraft("stock", 0);
    if (draft.size_stock) {
      updateDraft(
        "size_stock",
        Object.fromEntries(
          Object.keys(draft.size_stock).map((size) => [size, 0]),
        ),
      );
    }
  };
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-editor-title"
      onClick={() => {
        if (!saving) onClose();
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0 overflow-y-auto bg-black/40 p-4 backdrop-blur-sm sm:p-8"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="group/editor flex h-[min(850px,calc(100dvh-2rem))] w-full max-w-5xl flex-col overflow-hidden rounded-[24px] border border-black/10 bg-[#F6F5F2] shadow-[0_30px_90px_rgba(0,0,0,0.25)] sm:max-h-[calc(100dvh-4rem)] [&_input:not([type=checkbox])]:rounded-xl [&_textarea]:rounded-xl [&_select]:rounded-xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-black/10 px-5 py-5 sm:px-7">
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative hidden h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#E9E2D7] sm:block">
              {draft.image ? (
                <Image
                  src={draft.image}
                  alt="Product preview"
                  fill
                  sizes="80px"
                  className="object-contain p-2"
                />
              ) : (
                <FiImage className="m-7 text-black/35" size={24} />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#4b5b40]">
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
                {draft.category || "No category"}{" "}
                <span className="mx-2">/</span> Rs.{" "}
                {draft.price.toLocaleString()}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close product editor"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white transition hover:bg-[#E9E2D7] disabled:opacity-40"
          >
            <FiX size={18} />
          </button>
        </div>
        <div
          role="group"
          aria-label="Product editor sections"
          className="grid shrink-0 grid-cols-4 gap-1 border-b border-black/10 bg-white px-3 py-3 sm:px-7"
        >
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-pressed={activeSection === id}
              aria-controls={`product-section-${id}`}
              onClick={() => setActiveSection(id)}
              className={`flex min-w-0 flex-col items-center justify-center gap-2 rounded-xl px-2 py-3 text-[10px] font-medium transition sm:flex-row sm:text-xs ${activeSection === id ? "bg-[#20211e] text-white shadow-sm" : "text-black/50 hover:bg-[#F4F1E9] hover:text-black"}`}
            >
              <Icon size={16} className="shrink-0" />
              {label}
            </button>
          ))}
        </div>
        <div
          data-lenis-prevent
          className="[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0 min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-5 sm:p-7"
        >
          <section
            id="product-section-details"
            hidden={activeSection !== "details"}
            className="rounded-2xl border border-black/10 bg-white p-4 sm:p-6"
          >
            <h4 className="text-base font-semibold">Product information</h4>
            <p className="mt-1 text-xs leading-6 text-black/45">
              The essentials customers see in your collection.
            </p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className={formFieldClasses}>
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
              <label className={formFieldClasses}>
                Product name
                <input
                  value={draft.name}
                  onChange={(event) => updateDraft("name", event.target.value)}
                />
              </label>
              <label className={formFieldClasses}>
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
              <label className={formFieldClasses}>
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
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-black/10 bg-[#F4F1E9] p-4 sm:col-span-2">
                <div>
                  <p className="text-sm font-medium" role="status">
                    Availability: {soldOut ? "Sold out" : "In stock"}
                  </p>
                  <p className="mt-1 max-w-md text-xs leading-5 text-black/55">
                    {soldOut
                      ? "Add a quantity to make this product available again."
                      : `${totalStock} units available. Mark sold out to set all quantities to zero.`}{" "}
                    Save changes to apply.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    soldOut ? setRestocking(true) : markSoldOut()
                  }
                  className="rounded-full bg-[#20211e] px-5 py-3 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {soldOut ? "Mark available" : "Mark sold out"}
                </button>
                {soldOut && restocking && (
                  <div className="grid w-full gap-3 border-t border-black/10 pt-4 sm:grid-cols-3">
                    {draft.size_stock && (
                      <label className={formFieldClasses}>
                        Size to restock
                        <span className="relative block w-full">
                          <FaAngleDown
                            aria-hidden="true"
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#20211e]"
                          />
                          <select
                            className="appearance-none !pr-10"
                            value={restockSize}
                            disabled={saving}
                            onChange={(event) =>
                              setRestockSize(event.target.value)
                            }
                          >
                            {productSizes.map((size) => (
                              <option key={size} value={size}>
                                {size}
                              </option>
                            ))}
                          </select>
                        </span>
                      </label>
                    )}
                    <label className={formFieldClasses}>
                      Available quantity
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={restockQuantity}
                        disabled={saving}
                        onChange={(event) =>
                          setRestockQuantity(Number(event.target.value))
                        }
                      />
                    </label>
                    <button
                      type="button"
                      disabled={
                        saving ||
                        !Number.isSafeInteger(restockQuantity) ||
                        restockQuantity < 1
                      }
                      onClick={() => {
                        if (draft.size_stock)
                          updateDraft("size_stock", {
                            ...draft.size_stock,
                            [restockSize]: restockQuantity,
                          });
                        updateDraft("stock", restockQuantity);
                        setRestocking(false);
                      }}
                      className="self-end rounded-full bg-[#20211e] px-5 py-3 text-xs font-medium text-white disabled:opacity-40"
                    >
                      Apply quantity
                    </button>
                    <p className="text-xs text-black/55 sm:col-span-3">
                      Apply the quantity, then save the product to make it
                      available on the shop.
                    </p>
                  </div>
                )}
              </div>
              <label className={formFieldClasses}>
                Colourway
                <input
                  value={draft.color}
                  onChange={(event) => updateDraft("color", event.target.value)}
                />
              </label>
              <label className={formFieldClasses}>
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
              <label className={formFieldClasses}>
                Badge / tag
                <input
                  value={draft.tag}
                  onChange={(event) => updateDraft("tag", event.target.value)}
                />
              </label>
              <label
                className={`${formFieldClasses} flex-row items-center gap-3`}
              >
                <input
                  type="checkbox"
                  checked={draft.featured}
                  onChange={(event) =>
                    updateDraft("featured", event.target.checked)
                  }
                  className="h-4 w-4 accent-[#4b5b40]"
                />{" "}
                Featured product
              </label>
            </div>
          </section>
          <section
            id="product-section-images"
            hidden={activeSection !== "images"}
            className="rounded-2xl border border-black/10 bg-white p-4 sm:p-6"
          >
            <h4 className="flex items-center gap-2 text-base font-semibold">
              <FiImage size={17} /> Product images
            </h4>
            <p className="mt-1 text-xs leading-6 text-black/45">
              Upload or replace each pose, then save changes to update the shop.
              PNG, JPEG or WebP, up to 5 MB per photo.
            </p>
            <fieldset
              disabled={saving}
              className="mt-5 grid min-w-0 gap-4 sm:grid-cols-3 disabled:opacity-60"
            >
              <legend className="sr-only">Product photo uploads</legend>
              {Array.from(
                { length: Math.max(3, draft.gallery.length + 1) },
                (_, slot) => {
                  const source =
                    slot === 0 ? draft.image : draft.gallery[slot - 1] || "";
                  const label =
                    slot === 0 ? "Pose 1 / Main photo" : "Pose " + (slot + 1);
                  return (
                    <div
                      key={slot}
                      className="min-w-0 rounded-2xl border border-black/10 bg-[#FAF9F6] p-3"
                    >
                      <p className="mb-3 text-xs font-medium">{label}</p>
                      <div className="relative aspect-square overflow-hidden rounded-xl bg-[#E9E2D7]">
                        {source ? (
                          <Image
                            src={source}
                            alt={label + " preview"}
                            fill
                            sizes="(max-width: 639px) 80vw, 240px"
                            className="object-contain p-3"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-black/30">
                            <FiImage size={32} />
                          </div>
                        )}
                      </div>
                      <label className="mt-3 block text-xs font-medium">
                        {source ? "Replace photo" : "Upload photo"}
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          aria-label={"Upload " + label}
                          onChange={(event) => void uploadImage(event, slot)}
                          className="mt-2 block w-full min-w-0 text-[10px] file:mr-2 file:rounded-lg file:border-0 file:bg-[#20211e] file:px-3 file:py-2 file:text-white"
                        />
                      </label>
                      <details className="mt-3">
                        <summary className="flex items-center justify-between gap-3 list-none [&::-webkit-details-marker]:hidden cursor-pointer text-[11px] text-black/55">
                          Use image link
                          <FaAngleDown
                            aria-hidden="true"
                            className="ml-auto shrink-0 transition-transform duration-150 [[open]>summary>&]:rotate-180"
                          />
                        </summary>
                        <label className={`${formFieldClasses} mt-3`}>
                          Image URL
                          <input
                            value={source}
                            placeholder="https://..."
                            onChange={(event) => {
                              if (slot === 0)
                                updateDraft("image", event.target.value);
                              else {
                                const gallery = [...draft.gallery];
                                while (gallery.length < slot) gallery.push("");
                                gallery[slot - 1] = event.target.value;
                                updateDraft("gallery", gallery);
                              }
                            }}
                          />
                        </label>
                      </details>
                      {source && (
                        <button
                          type="button"
                          className="mt-3 text-xs text-red-700 underline"
                          onClick={() => {
                            if (slot === 0) updateDraft("image", "");
                            else
                              updateDraft(
                                "gallery",
                                draft.gallery.filter(
                                  (_, index) => index !== slot - 1,
                                ),
                              );
                          }}
                        >
                          Remove photo
                        </button>
                      )}
                    </div>
                  );
                },
              )}
            </fieldset>
            {saving && (
              <p role="status" className="mt-3 text-xs text-black/60">
                Saving photos and product changes. Please wait...
              </p>
            )}
          </section>
          <section
            id="product-section-description"
            hidden={activeSection !== "description"}
            className="rounded-2xl border border-black/10 bg-white p-4 sm:p-6"
          >
            <h4 className="text-base font-semibold">Description & fit</h4>
            <p className="mt-1 text-xs leading-6 text-black/45">
              Help customers understand the product and choose their size.
            </p>
            <div className="mt-5 grid gap-5">
              <label className={`${formFieldClasses} sm:col-span-2`}>
                Product description
                <textarea
                  rows={4}
                  value={draft.description}
                  onChange={(event) =>
                    updateDraft("description", event.target.value)
                  }
                />
              </label>
              <label className={`${formFieldClasses} sm:col-span-2`}>
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
              <label className={`${formFieldClasses} sm:col-span-2`}>
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
          <section
            id="product-section-inventory"
            hidden={activeSection !== "inventory"}
            className="rounded-2xl border border-black/10 bg-white p-4 sm:p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black/10 pb-5">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#4b5b40]">
                  Inventory setup
                </p>
                <h4 className="mt-1 text-xl font-semibold text-[#20211e]">
                  Sizes & colour variants
                </h4>
                <p className="mt-1 text-xs leading-5 text-black/50">
                  Set stock by size and link colour options for this style.
                </p>
              </div>
              <span
                className={`rounded-full px-4 py-2 text-xs font-medium ${
                  soldOut
                    ? "bg-red-50 text-red-700"
                    : "bg-[#e8eddf] text-[#4b5b40]"
                }`}
              >
                {soldOut ? "Sold out" : `${totalStock} units in stock`}
              </span>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-black/10 bg-[#FAF9F6] p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-[#E9E2D7] text-[#4b5b40]">
                    <FiLayers size={17} />
                  </span>
                  <div>
                    <h5 className="text-sm font-semibold">Colour variants</h5>
                    <p className="text-xs text-black/45">
                      Link matching colourways together.
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-xs leading-5 text-black/50">
                  Give each colour its own product, image and price. Products
                  with the same group name appear as colour options together.
                </p>
                <label className={`${formFieldClasses} mt-5`}>
                  Variant group name
                  <input
                    value={draft.variant_group ?? ""}
                    placeholder="e.g. court-classic"
                    onChange={(event) =>
                      updateDraft(
                        "variant_group",
                        event.target.value.toLowerCase(),
                      )
                    }
                  />
                </label>
                <div className="mt-4">
                  <CustomSelect
                    label="Use an existing colour group"
                    value={draft.variant_group ?? ""}
                    onChange={(value) => updateDraft("variant_group", value)}
                    placeholder="Choose an existing group"
                    options={Array.from(
                      new Set(
                        editableProducts
                          .map((product) => product.variant_group)
                          .filter((value): value is string => Boolean(value)),
                      ),
                    ).map((value) => ({ value, label: value }))}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-[#F4F1E9] p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-[#20211e] text-white">
                    <FiBox size={17} />
                  </span>
                  <div>
                    <h5 className="text-sm font-semibold">Stock control</h5>
                    <p className="text-xs text-black/45">
                      Choose one stock pool or size-level stock.
                    </p>
                  </div>
                </div>

                <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-black/10 bg-white p-3 text-sm transition-colors hover:border-[#4b5b40]/45">
                  <input
                    type="checkbox"
                    checked={draft.one_size ?? false}
                    onChange={(event) => {
                      updateDraft("one_size", event.target.checked);
                      if (event.target.checked) updateDraft("size_stock", null);
                    }}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[#4b5b40]"
                  />
                  <span>
                    <span className="block font-medium text-[#20211e]">
                      One size product
                    </span>
                    <span className="mt-0.5 block text-xs leading-5 text-black/50">
                      For accessories, shoe care and bags.
                    </span>
                  </span>
                </label>

                <label
                  className={`mt-3 flex items-start gap-3 rounded-xl border p-3 text-sm transition-colors ${
                    draft.one_size
                      ? "cursor-not-allowed border-black/5 bg-black/[0.025] text-black/35"
                      : "cursor-pointer border-black/10 bg-white hover:border-[#4b5b40]/45"
                  }`}
                >
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
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[#4b5b40]"
                  />
                  <span>
                    <span className="block font-medium text-[#20211e]">
                      Track stock by size
                    </span>
                    <span className="mt-0.5 block text-xs leading-5 text-black/50">
                      Let customers see which UK sizes are available.
                    </span>
                  </span>
                </label>

                {!draft.size_stock && (
                  <label className={`${formFieldClasses} mt-4`}>
                    Total available units
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={draft.stock ?? 0}
                      onChange={(event) =>
                        updateDraft("stock", Number(event.target.value))
                      }
                    />
                  </label>
                )}
              </div>
            </div>

            {draft.size_stock && (
              <div className="mt-5 rounded-2xl border border-[#4b5b40]/20 bg-[#e8eddf]/45 p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h5 className="text-sm font-semibold text-[#20211e]">
                      Size availability
                    </h5>
                    <p className="mt-1 text-xs text-black/50">
                      Set units per size. A zero quantity marks that size sold
                      out.
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#4b5b40]">
                    Total: {totalStock} units
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {productSizes.map((size) => {
                    const quantity = draft.size_stock?.[size] ?? 0;
                    return (
                      <label
                        key={size}
                        className={`rounded-xl border p-3 transition-colors ${
                          quantity > 0
                            ? "border-[#4b5b40]/25 bg-white"
                            : "border-black/10 bg-white/55"
                        }`}
                      >
                        <span className="flex items-center justify-between gap-2 text-xs font-semibold text-[#20211e]">
                          {size}
                          <span
                            className={`size-2 rounded-full ${quantity > 0 ? "bg-[#4b5b40]" : "bg-black/20"}`}
                          />
                        </span>
                        <input
                          aria-label={`${size} stock`}
                          type="number"
                          min="0"
                          step="1"
                          value={quantity}
                          onChange={(event) =>
                            updateDraft("size_stock", {
                              ...draft.size_stock,
                              [size]: Number(event.target.value),
                            })
                          }
                          className="mt-3 w-full border-0 bg-transparent p-0 text-2xl font-medium tracking-tight text-[#20211e] outline-none"
                        />
                        <span className="text-[10px] uppercase tracking-[0.12em] text-black/40">
                          units
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
          <details
            hidden={activeSection !== "inventory"}
            className="rounded-2xl border border-black/10 bg-white p-4 sm:p-5"
          >
            <summary className="flex items-center justify-between gap-3 list-none [&::-webkit-details-marker]:hidden cursor-pointer text-sm font-semibold">
              Complete the look
              <FaAngleDown
                aria-hidden="true"
                className="ml-auto shrink-0 transition-transform duration-150 [[open]>summary>&]:rotate-180"
              />
            </summary>
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
          </details>
        </div>
        <div className="shrink-0 border-t border-black/10 bg-white px-5 py-4 sm:px-7">
          {error && (
            <p
              role="alert"
              className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-end gap-3">
            <span
              className={`mr-auto rounded-full px-3 py-2 text-xs font-medium ${soldOut ? "bg-red-50 text-red-700" : "bg-[#e8eddf] text-[#4b5b40]"}`}
            >
              {soldOut ? "Sold out" : `${totalStock} in stock`}
            </span>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-black/15 px-4 py-3 text-xs font-medium hover:bg-[#E9E2D7] disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void saveProduct()}
              className="flex items-center gap-2 rounded-xl bg-[#4b5b40] px-5 py-3 text-xs font-medium text-white transition-colors hover:bg-[#36432d] disabled:opacity-50"
            >
              <FiSave size={15} /> {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
