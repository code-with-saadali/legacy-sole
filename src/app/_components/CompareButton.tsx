"use client";
import Link from "next/link";
import {FiColumns} from "react-icons/fi";
import useProductList from "../_hooks/useProductList";
import {compareKey} from "../_data/product-lists";
export default function CompareButton({slug}:{slug:string}){
 const {items,toggle,error}=useProductList(compareKey);const selected=items.includes(slug);
 return <div className="mt-3 text-xs"><div className="flex flex-wrap items-center gap-3"><button type="button" aria-pressed={selected} onClick={()=>toggle(slug,3)} className="inline-flex items-center gap-2 rounded-full border border-black/15 px-3 py-2 hover:bg-[#E9E2D7]"><FiColumns/>{selected?"Remove comparison":"Compare"}</button>{items.length>0&&<Link href="/compare" className="underline underline-offset-4">Compare ({items.length})</Link>}</div>{error&&<p role="status" className="mt-2 text-red-700">{error}</p>}</div>;
}
