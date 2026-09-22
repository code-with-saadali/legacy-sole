"use client";

import BulkProductActions from "./BulkProductActions";
import AdminProductCard from "./AdminProductCard";
import ProductEditorDialog from "./ProductEditorDialog";
import { ChangeEvent, useEffect, useState } from "react";
import { FiBox, FiCheckCircle, FiPlus, FiSearch, FiX } from "react-icons/fi";
import { type Product } from "../_data/products";
import { searchProducts, stockAlerts } from "../_data/admin";
import { supabase } from "../../lib/supabase";
import { inventoryError } from "../_data/inventory";

type Props = {
  initialProducts?: Product[];
  stockOnly?: boolean;
  onShowAll?: () => void;
  onProductsChange?: (next: Product[]) => void;
};

export default function AdminProductEditor({
  initialProducts = [],
  stockOnly = false,
  onShowAll,
  onProductsChange,
}: Props) {
  const [editableProducts, setEditableProducts] =
    useState<Product[]>(initialProducts);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [draft, setDraft] = useState<Product | null>(null);
  const editorOpen = draft !== null;
  const [saved, setSaved] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [search, setSearch] = useState("");
  const visibleProducts = searchProducts(
    stockOnly ? stockAlerts(editableProducts) : editableProducts,
    search,
  );
  const allCategories = Array.from(
    new Set([
      ...categories,
      ...editableProducts.map((product) => product.category).filter(Boolean),
    ]),
  ).sort();

  useEffect(() => {
    setEditableProducts(initialProducts);
  }, [initialProducts]);

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    const load = async () => {
      const { data, error } = await client
        .from("categories")
        .select("name")
        .order("name");
      if (error) setError(error.message);
      else setCategories((data ?? []).map((item) => item.name));
    };
    void load();
    const channel = client
      .channel("admin-categories")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "categories" },
        () => void load(),
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") void load();
      });
    return () => {
      void client.removeChannel(channel);
    };
  }, []);

  const addCategory = async () => {
    const name = newCategory.trim();
    if (!name || !supabase) return;
    const { error } = await supabase.from("categories").insert({ name });
    if (error) {
      setError(error.message);
      return;
    }
    setError("");
    if (!error) {
      setCategories((current) => [...new Set([...current, name])].sort());
      setNewCategory("");
      setSaved(`${name} category added.`);
    }
  };

  const deleteCategory = async (name: string) => {
    if (editableProducts.some((product) => product.category === name)) {
      setError(
        "Move products to another category before deleting this category.",
      );
      return;
    }
    if (!window.confirm(`Delete ${name} category?`)) return;
    if (!supabase) return;
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("name", name);
    if (error) {
      setError(error.message);
      return;
    }
    setError("");
    if (!error) {
      setCategories((current) =>
        current.filter((category) => category !== name),
      );
      setSaved(`${name} category deleted.`);
    }
  };

  useEffect(() => {
    if (!editorOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
    };
  }, [editorOpen]);

  const startEditing = (product: Product) => {
    setEditingSlug(product.slug);
    setDraft({ ...product });
    setSaved("");
    setError("");
  };

  const startAdding = () => {
    setEditingSlug("new-product");
    setDraft({
      slug: "",
      name: "",
      category: "",
      color: "",
      price: 0,
      image: "",
      tag: "",
      description: "",
      details: [],
      stock: 0,
      gallery: [],
      sizeGuide: [],
      featured: false,
    });
    setSaved("");
    setError("");
  };

  const updateDraft = <Key extends keyof Product>(
    key: Key,
    value: Product[Key],
  ) => {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  };

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !draft || !supabase || saving) return;
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setError("Choose a PNG, JPEG or WebP image smaller than 5 MB.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const extension =
        file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
      const path = crypto.randomUUID() + "." + extension;
      const { error } = await supabase.storage
        .from("product-images")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(path);
      updateDraft("image", data.publicUrl);
    } catch (cause) {
      setError(
        (cause as { message?: string }).message || "Image upload failed.",
      );
    } finally {
      setSaving(false);
    }
  };

  const saveProduct = async () => {
    if (!draft || saving) return;
    setError("");
    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }
    if (
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug) ||
      !draft.name.trim() ||
      !draft.category.trim()
    ) {
      setError(
        "Enter a name, category and a URL slug using lowercase letters, numbers and hyphens.",
      );
      return;
    }
    if (
      !Number.isSafeInteger(draft.price) ||
      draft.price < 0 ||
      !Number.isSafeInteger(draft.stock ?? 0) ||
      (draft.stock ?? 0) < 0
    ) {
      setError("Price and stock must be non-negative whole numbers.");
      return;
    }
    if (
      !draft.image ||
      !/^(\/(?!\/)|https:\/\/|data:image\/(png|jpeg|webp);base64,)/.test(
        draft.image,
      )
    ) {
      setError("Choose an image, a local image path or an HTTPS image URL.");
      return;
    }
    setSaving(true);
    try {
      const isNew = editingSlug === "new-product";
      const issue = inventoryError(draft);
      if (issue) throw new Error(issue);
      const savedDraft = {
        ...draft,
        stock: draft.size_stock
          ? Object.values(draft.size_stock).reduce(
              (sum, count) => sum + count,
              0,
            )
          : (draft.stock ?? 0),
      };
      const { sizeGuide, ...fields } = savedDraft;
      const payload = {
        ...fields,
        name: draft.name.trim(),
        variant_group: draft.variant_group?.trim() || "",
        size_stock: draft.size_stock ?? null,
        size_guide: sizeGuide,
        updated_at: new Date().toISOString(),
      };
      const query = isNew
        ? supabase.from("products").insert(payload)
        : supabase.from("products").update(payload).eq("slug", editingSlug);
      const { error } = await query.select("slug").single();
      if (error) throw error;
      const next = isNew
        ? [...editableProducts, savedDraft]
        : editableProducts.map((product) =>
            product.slug === editingSlug ? savedDraft : product,
          );
      setEditableProducts(next);
      onProductsChange?.(next);
      setSaved(draft.name + " saved to database.");
      setEditingSlug(null);
      setDraft(null);
    } catch (cause) {
      setError(
        (cause as { message?: string }).message ||
          "Product could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (product: Product) => {
    if (saving || !window.confirm("Delete " + product.name + "?")) return;
    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("slug", product.slug)
        .select("slug")
        .single();
      if (error) throw error;
      const next = editableProducts.filter(
        (item) => item.slug !== product.slug,
      );
      setEditableProducts(next);
      onProductsChange?.(next);
      setSaved(product.name + " deleted from database.");
    } catch (cause) {
      setError(
        (cause as { message?: string }).message ||
          "Product could not be deleted.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-product-editor mt-6">
      <BulkProductActions
        products={visibleProducts}
        onSaved={() => onProductsChange?.(editableProducts)}
      />
      <div className="flex flex-col gap-3 rounded-[22px] border border-black/10 bg-[#F4F1E9] p-4 sm:flex-row sm:items-center">
        <label className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-black/10 bg-[#F8F6F1] px-4 py-3">
          <FiSearch aria-hidden="true" className="shrink-0 text-black/40" />
          <span className="sr-only">Search products</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, category or colour..."
            className="min-w-0 w-full bg-transparent text-xs outline-none"
          />
        </label>
        <button
          type="button"
          onClick={startAdding}
          className="inline-flex shrink-0 items-center justify-center gap-2 bg-[#20211e] px-5 py-3 text-xs font-medium text-white transition-colors hover:bg-[#b66b4d]"
        >
          <FiPlus size={16} /> Add new product
        </button>
      </div>
      <div className="my-5 flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="text-xs text-black/50">
          <strong className="text-[#20211e]">{visibleProducts.length}</strong>{" "}
          {stockOnly ? "products need restocking" : "products shown"}
        </p>
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="inline-flex items-center gap-1 text-xs text-[#b66b4d]"
          >
            <FiX size={13} /> Clear search
          </button>
        )}
      </div>
      {!visibleProducts.length && (
        <div className="mb-5 flex flex-col items-center rounded-[24px] border border-dashed border-black/15 bg-[#F4F1E9] px-5 py-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E9E2D7] text-[#b66b4d]">
            {stockOnly && !search.trim() ? (
              <FiCheckCircle size={24} />
            ) : (
              <FiBox size={24} />
            )}
          </span>
          <h3 className="mt-5 text-xl font-medium">
            {search.trim()
              ? "No matching products"
              : stockOnly
                ? "Inventory is looking good"
                : "Start your collection"}
          </h3>
          <p className="mt-2 max-w-sm text-xs leading-6 text-black/50">
            {search.trim()
              ? "Try another name, category or colour, or clear your filters."
              : stockOnly
                ? "No products need restocking. View your full collection to manage products."
                : "Add your first product with its images, price and available stock."}
          </p>
          {stockOnly && onShowAll && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                onShowAll();
              }}
              className="mt-5 border border-black/15 bg-[#F8F6F1] px-5 py-3 text-xs font-medium hover:bg-[#E9E2D7]"
            >
              View all products
            </button>
          )}
        </div>
      )}
      <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
        {visibleProducts.map((product) => (
          <AdminProductCard
            key={product.slug}
            product={product}
            onEdit={startEditing}
            onDelete={deleteProduct}
          />
        ))}
      </div>

      {error && !draft && (
        <p role="alert" className="mt-5 text-sm text-red-700">
          {error}
        </p>
      )}
      {saved && <p className="mt-5 text-xs text-[#b66b4d]">{saved}</p>}

      <section className="mt-8 rounded-[24px] border border-black/10 bg-[#F4F1E9] p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xl font-medium">Categories</h3>
          <span className="rounded-full bg-[#E9E2D7] px-3 py-1 text-xs">
            {allCategories.length}
          </span>
        </div>
        <p className="mt-2 text-xs leading-6 text-black/50">
          Organise your collection so customers can find their next pair.
        </p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void addCategory();
          }}
          className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <label className="admin-field min-w-0 flex-1">
            Category name
            <input
              value={newCategory}
              onChange={(event) => setNewCategory(event.target.value)}
              placeholder="e.g. Boots, Formal, Kids"
            />
          </label>
          <button
            type="submit"
            disabled={!newCategory.trim()}
            className="inline-flex min-h-10 items-center justify-center gap-2 bg-[#20211e] px-5 py-3 text-xs font-medium text-white hover:bg-[#b66b4d] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FiPlus size={14} /> Add category
          </button>
        </form>
        {allCategories.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2 border-t border-black/10 pt-5">
            {allCategories.map((category) => (
              <span
                key={category}
                className="inline-flex max-w-full items-center gap-3 rounded-full border border-black/10 bg-[#F8F6F1] py-2 pl-4 pr-3 text-xs text-[#20211e]"
              >
                <span className="break-words">{category}</span>
                {categories.includes(category) && (
                  <button
                    type="button"
                    onClick={() => void deleteCategory(category)}
                    aria-label={`Delete ${category} category`}
                    className="flex h-6 w-6 shrink-0 items-center justify-center text-black/40 hover:bg-[#E9E2D7] hover:text-[#b66b4d]"
                  >
                    <FiX size={13} />
                  </button>
                )}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-xs text-black/45">
            Your categories will appear here.
          </p>
        )}
      </section>

      {draft && editingSlug && (
        <ProductEditorDialog
          draft={draft}
          editingSlug={editingSlug}
          allCategories={allCategories}
          editableProducts={editableProducts}
          error={error}
          saving={saving}
          onClose={() => {
            setEditingSlug(null);
            setDraft(null);
          }}
          updateDraft={updateDraft}
          uploadImage={uploadImage}
          saveProduct={saveProduct}
        />
      )}
    </div>
  );
}
