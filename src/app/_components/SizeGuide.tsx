"use client";
import { useState } from "react";
import { FiMaximize2 } from "react-icons/fi";
import type { Product } from "../_data/products";
import Modal from "./Modal";
export default function SizeGuide({ product }: { product: Product }) {
  const [open,setOpen]=useState(false);
  return <><button type="button" onClick={()=>setOpen(true)} className="mt-6 inline-flex items-center gap-2 border-b border-black/20 pb-1 text-sm text-black/65"><FiMaximize2/> Find your fit · Size guide</button>{open&&<Modal title={`${product.name} · Size guide`} onClose={()=>setOpen(false)}><p className="text-sm leading-7 text-black/60">Stand on a sheet of paper with your heel against a wall. Mark your longest toe and measure the distance. Measure both feet and use the longer measurement.</p>{product.sizeGuide.length?<table className="mt-6 w-full text-left text-sm"><thead><tr className="border-b border-black/15"><th className="py-3">UK size</th><th>Foot length</th></tr></thead><tbody>{product.sizeGuide.map(row=><tr key={row.size} className="border-b border-black/10"><td className="py-3">{row.size}</td><td>{row.footLength}</td></tr>)}</tbody></table>:<p className="mt-5 rounded-xl bg-[#E9E2D7] p-4 text-sm">Measurements for this style are not available yet. Contact us before ordering if you are unsure about your size.</p>}</Modal>}</>;
}
