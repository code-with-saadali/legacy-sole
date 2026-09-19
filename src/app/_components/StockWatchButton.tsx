"use client";
import Link from "next/link";
import {FiBell} from "react-icons/fi";
import useProductList from "../_hooks/useProductList";
import {watchKey} from "../_data/product-lists";
export default function StockWatchButton({slug}:{slug:string}){
 const {items,toggle,error}=useProductList(watchKey); const saved=items.includes(slug);
 return <div className="mt-4 rounded-xl bg-[#E9E2D7] p-4 text-sm"><button type="button" aria-pressed={saved} onClick={()=>toggle(slug)} className="flex items-center gap-2 font-medium"><FiBell/>{saved?"Watching this pair · Remove":"Watch for restock"}</button><p className="mt-2 text-xs leading-5 text-black/55">Check availability in your <Link href="/watchlist" className="underline">restock watchlist</Link> whenever you visit. Saved in this browser.</p>{error&&<p role="alert" className="mt-2 text-xs">{error}</p>}</div>;
}
