"use client";
import Link from "next/link";
import {useCatalog} from "../_components/CatalogProvider";
import useProductList from "../_hooks/useProductList";
import {compareKey} from "../_data/product-lists";
import ProductCard from "../_components/ProductCard";
import {productSizes,sizeStock} from "../_data/inventory";
export default function ComparePage(){
 const {products,loading,error}=useCatalog();const {items,toggle}=useProductList(compareKey);const selected=items.flatMap(slug=>{const item=products.find(product=>product.slug===slug);return item?[item]:[];});
 return <main className="min-h-[70vh] bg-[#F4F1E9] px-[5%] py-14"><h1 className="text-5xl">Compare your favourites.</h1><p className="mt-4 text-sm text-black/50">Choose up to three pairs from the shop to see their differences.</p>{loading?<p role="status" className="mt-10">Loading products…</p>:error?<p role="alert" className="mt-10">Could not load the comparison. Please refresh.</p>:selected.length?<div className="mt-10 grid gap-8 md:grid-cols-3">{selected.map(product=><div key={product.slug}><ProductCard product={product}/><dl className="mt-6 space-y-5 border-t border-black/10 pt-5 text-sm"><div><dt className="text-black/45">Available sizes</dt><dd className="mt-2">{productSizes.filter(size=>sizeStock(product,size)>0).join(", ")||"Sold out"}</dd></div><div><dt className="text-black/45">Description</dt><dd className="mt-2 leading-6">{product.description||"Not specified"}</dd></div><div><dt className="text-black/45">Details</dt><dd className="mt-2 leading-6">{product.details.join(" · ")||"Not specified"}</dd></div></dl></div>)}</div>:<Link href="/shop" className="mt-10 inline-block rounded-full bg-[#20211e] px-6 py-3 text-sm text-white">Choose pairs to compare</Link>}{items.filter(slug=>!products.some(product=>product.slug===slug)).map(slug=><button key={slug} type="button" onClick={()=>toggle(slug)} className="mt-4 block text-xs underline">Remove unavailable product: {slug}</button>)}</main>;
}
