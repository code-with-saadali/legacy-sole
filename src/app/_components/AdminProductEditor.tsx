"use client";

import Image from "./ProductImage";
import { ChangeEvent, useEffect, useState } from "react";
import { FiEdit3, FiImage, FiPlus, FiSave, FiX } from "react-icons/fi";
import { type Product } from "../_data/products";
import { supabase } from "../../lib/supabase";



type Props = {
  initialProducts?: Product[];
  onProductsChange?: (next: Product[]) => void;
};

export default function AdminProductEditor({ initialProducts = [], onProductsChange }: Props) {
  const [editableProducts, setEditableProducts] = useState<Product[]>(initialProducts);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [draft, setDraft] = useState<Product | null>(null);
  const [saved, setSaved] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const allCategories = Array.from(new Set([
    ...categories,
    ...editableProducts.map((product) => product.category).filter(Boolean),
  ])).sort();

  useEffect(() => { setEditableProducts(initialProducts); }, [initialProducts]);

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    const load = async () => {
      const { data, error } = await client.from("categories").select("name").order("name");
      if (error) setError(error.message);
      else setCategories((data ?? []).map(item => item.name));
    };
    void load();
    const channel = client.channel("admin-categories")
      .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, () => void load())
      .subscribe(status => { if (status === "SUBSCRIBED") void load(); });
    return () => { void client.removeChannel(channel); };
  }, []);

  const addCategory = async () => {
    const name = newCategory.trim();
    if (!name || !supabase) return;
    const { error } = await supabase.from("categories").insert({ name });
    if (error) { setError(error.message); return; }
    setError("");
    if (!error) {
      setCategories((current) => [...new Set([...current, name])].sort());
      setNewCategory("");
      setSaved(`${name} category added.`);
    }
  };

  const deleteCategory = async (name: string) => {
    if (editableProducts.some(product => product.category === name)) { setError("Move products to another category before deleting this category."); return; }
    if (!window.confirm(`Delete ${name} category?`)) return;
    if (!supabase) return;
    const { error } = await supabase.from("categories").delete().eq("name", name);
    if (error) { setError(error.message); return; }
    setError("");
    if (!error) {
      setCategories((current) => current.filter((category) => category !== name));
      setSaved(`${name} category deleted.`);
    }
  };

  useEffect(() => {
    if (!draft) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [draft]);

  const startEditing = (product: Product) => {
    setEditingSlug(product.slug);
    setDraft({ ...product });
    setSaved("");
    setError("");
  };

  const startAdding = () => {
    setEditingSlug("new-product");
    setDraft({ slug: "", name: "", category: "", color: "", price: 0, image: "", tag: "", description: "", details: [], stock: 0, gallery: [], sizeGuide: [], featured: false });
    setSaved("");
    setError("");
  };

  const updateDraft = <Key extends keyof Product>(key: Key, value: Product[Key]) => {
    setDraft((current) => current ? { ...current, [key]: value } : current);
  };

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !draft || !supabase || saving) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError("Choose a PNG, JPEG or WebP image smaller than 5 MB."); return;
    }
    setSaving(true);
    setError("");
    try {
      const extension = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
      const path = crypto.randomUUID() + "." + extension;
      const { error } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      updateDraft("image", data.publicUrl);
    } catch (cause) { setError((cause as { message?: string }).message || "Image upload failed."); }
    finally { setSaving(false); }
  };

  const saveProduct = async () => {
    if (!draft || saving) return;
    setError("");
    if (!supabase) { setError("Supabase is not configured."); return; }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug) || !draft.name.trim() || !draft.category.trim()) {
      setError("Enter a name, category and a URL slug using lowercase letters, numbers and hyphens."); return;
    }
    if (!Number.isSafeInteger(draft.price) || draft.price < 0 || !Number.isSafeInteger(draft.stock ?? 0) || (draft.stock ?? 0) < 0) {
      setError("Price and stock must be non-negative whole numbers."); return;
    }
    if (!draft.image || !/^(\/(?!\/)|https:\/\/|data:image\/(png|jpeg|webp);base64,)/.test(draft.image)) {
      setError("Choose an image, a local image path or an HTTPS image URL."); return;
    }
    setSaving(true);
    try {
      const isNew = editingSlug === "new-product";
      const payload = { ...draft, name: draft.name.trim(), stock: draft.stock ?? 0, gallery: draft.gallery, size_guide: draft.sizeGuide, featured: draft.featured, updated_at: new Date().toISOString() };
      const query = isNew
        ? supabase.from("products").insert(payload)
        : supabase.from("products").update(payload).eq("slug", editingSlug);
      const { error } = await query.select("slug").single();
      if (error) throw error;
      const next = isNew ? [...editableProducts, draft] : editableProducts.map(product => product.slug === editingSlug ? draft : product);
      setEditableProducts(next);
      onProductsChange?.(next);
      setSaved(draft.name + " saved to database.");
      setEditingSlug(null);
      setDraft(null);
    } catch (cause) {
      setError((cause as { message?: string }).message || "Product could not be saved.");
    } finally { setSaving(false); }
  };

  const deleteProduct = async (product: Product) => {
    if (saving || !window.confirm("Delete " + product.name + "?")) return;
    if (!supabase) { setError("Supabase is not configured."); return; }
    setSaving(true);
    setError("");
    try {
      const { error } = await supabase.from("products").delete().eq("slug", product.slug).select("slug").single();
      if (error) throw error;
      const next = editableProducts.filter(item => item.slug !== product.slug);
      setEditableProducts(next);
      onProductsChange?.(next);
      setSaved(product.name + " deleted from database.");
    } catch (cause) {
      setError((cause as { message?: string }).message || "Product could not be deleted.");
    } finally { setSaving(false); }
  };

  return (
    <div className="mt-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {editableProducts.map((product) => (
          <article key={product.slug} className="border border-black/10 bg-[#F4F1E9] p-4">
            <div className="relative aspect-[1.1] bg-[#E9E3D9]"><Image src={product.image} alt={product.name} fill sizes="30vw" className="object-contain p-[8%]" /></div>
            <div className="mt-4 flex items-start justify-between gap-3"><div><h3 className="text-xl text-[#20211e]">{product.name}</h3><p className="mt-1 text-[11px] text-black/45">{product.category} / {product.color}</p></div><span className="text-xs font-medium">Rs. {product.price.toLocaleString()}</span></div>
            <div className="mt-5 grid grid-cols-2 gap-2"><button type="button" onClick={() => startEditing(product)} className="flex items-center justify-center gap-2 border border-black/15 px-3 py-3 text-[10px] font-medium uppercase tracking-[0.1em] text-black/60 hover:border-[#4b5a42] hover:text-[#4b5a42]"><FiEdit3 size={14} /> Edit</button><button type="button" onClick={() => void deleteProduct(product)} className="border border-[#b66b4d]/30 px-3 py-3 text-[10px] font-medium uppercase tracking-[0.1em] text-[#b66b4d] hover:bg-[#b66b4d] hover:text-white">Delete</button></div>
          </article>
        ))}
      </div>

      <button type="button" onClick={startAdding} className="mt-5 flex items-center gap-2 bg-[#4b5a42] px-5 py-3 text-[10px] font-medium uppercase tracking-[0.14em] text-white hover:bg-[#b66b4d]"><FiPlus size={14} /> Add new product</button>

      {error && !draft && <p role="alert" className="mt-5 text-sm text-red-700">{error}</p>}
      {saved && <p className="mt-5 text-xs text-[#4b5a42]">{saved}</p>}

      <div className="mt-8 flex flex-col gap-3 border border-black/10 bg-[#F4F1E9] p-4 sm:flex-row sm:items-end">
        <label className="admin-field flex-1">Add category<input value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="e.g. Boots, Formal, Kids" /></label>
        <button type="button" onClick={() => void addCategory()} className="h-10 bg-[#20211e] px-5 text-[10px] font-medium uppercase tracking-[0.12em] text-white hover:bg-[#4b5a42]">Add category</button>
      </div>
      {allCategories.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{allCategories.map((category) => <span key={category} className="inline-flex items-center gap-2 border border-black/10 px-3 py-1.5 text-[10px] text-black/55">{category}{categories.includes(category) && <button type="button" onClick={() => void deleteCategory(category)} aria-label={`Delete ${category} category`} className="text-[#b66b4d] hover:text-black"><FiX size={12} /></button>}</span>)}</div>}

      {draft && editingSlug && <div role="dialog" aria-modal="true" aria-labelledby="product-editor-title" onClick={() => { setEditingSlug(null); setDraft(null); }} className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm sm:p-8">
        <div onClick={(event) => event.stopPropagation()} className="my-6 max-h-[calc(100vh-3rem)] w-full max-w-3xl overflow-y-auto bg-[#F8F6F1] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.25)] sm:p-7">
        <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[0.16em] text-black/40">{draft.slug ? "Editing product" : "New product"}</p><h3 id="product-editor-title" className="mt-2 text-3xl text-[#20211e]">{draft.name || "Add product"}</h3></div><button type="button" onClick={() => { setEditingSlug(null); setDraft(null); }} aria-label="Close product editor" className="flex h-9 w-9 items-center justify-center border border-black/10 hover:bg-black/5"><FiX size={16} /></button></div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="admin-field">URL slug<input value={draft.slug} disabled={editingSlug !== "new-product"} placeholder="e.g. leather-boot" onChange={(event) => updateDraft("slug", event.target.value.toLowerCase().replace(/\s+/g, "-"))} /></label>
          <label className="admin-field">Product name<input value={draft.name} onChange={(event) => updateDraft("name", event.target.value)} /></label>
          <label className="admin-field">Price (Rs.)<input type="number" min="0" value={draft.price} onChange={(event) => updateDraft("price", Number(event.target.value))} /></label>
          <label className="admin-field">Stock quantity<input type="number" min="0" value={draft.stock ?? 0} onChange={(event) => updateDraft("stock", Number(event.target.value))} /></label>
          <label className="admin-field">Colourway<input value={draft.color} onChange={(event) => updateDraft("color", event.target.value)} /></label>
          <label className="admin-field">Category<select value={draft.category} onChange={(event) => updateDraft("category", event.target.value)}><option value="">Select category</option>{Array.from(new Set([...allCategories, draft.category].filter(Boolean))).map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
          <label className="admin-field">Badge / tag<input value={draft.tag} onChange={(event) => updateDraft("tag", event.target.value)} /></label>
          <label className="admin-field flex-row items-center gap-3"><input type="checkbox" checked={draft.featured} onChange={(event) => updateDraft("featured", event.target.checked)} className="h-4 w-4 accent-[#4b5a42]" /> Featured product</label>
          <label className="admin-field">Image URL<input value={draft.image.startsWith("data:") ? "Uploaded image" : draft.image} onChange={(event) => updateDraft("image", event.target.value)} /></label>
          <label className="admin-field sm:col-span-2">Gallery URLs <span className="font-normal text-black/35">(one HTTPS URL per line)</span><textarea rows={3} value={draft.gallery.join("\n")} onChange={(event) => updateDraft("gallery", event.target.value.split("\n").map(value => value.trim()).filter(Boolean))} /></label>
          <label className="admin-field sm:col-span-2">Size guide <span className="font-normal text-black/35">(UK 6: 24cm, one per line)</span><textarea rows={3} value={draft.sizeGuide.map(item => `${item.size}: ${item.footLength}`).join("\n")} onChange={(event) => updateDraft("sizeGuide", event.target.value.split("\n").map(line => { const [size, footLength] = line.split(":"); return { size: (size ?? "").trim(), footLength: (footLength ?? "").trim() }; }).filter(item => item.size && item.footLength))} /></label>
          <label className="admin-field sm:col-span-2">Upload image<input type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadImage} className="file:mr-3 file:border-0 file:bg-[#4b5a42] file:px-3 file:py-2 file:text-white" /><span className="mt-1 text-[10px] text-black/40"><FiImage className="mr-1 inline" size={12} /> Use a product image or paste a public image URL.</span></label>
          <label className="admin-field sm:col-span-2">Product description<textarea rows={4} value={draft.description} onChange={(event) => updateDraft("description", event.target.value)} /></label>
          <label className="admin-field sm:col-span-2">Product details <span className="font-normal text-black/35">(one per line)</span><textarea rows={3} value={draft.details.join("\n")} onChange={(event) => updateDraft("details", event.target.value.split("\n").filter(Boolean))} /></label>
        </div>
        {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
        <button type="button" disabled={saving} onClick={() => void saveProduct()} className="mt-6 flex items-center gap-2 bg-[#4b5a42] px-5 py-3 text-[10px] font-medium uppercase tracking-[0.14em] text-white hover:bg-[#b66b4d]"><FiSave size={14} /> {saving ? "Saving..." : "Save changes"}</button>
        </div>
      </div>}
    </div>
  );
}
