"use client";
import {useState} from "react";
export default function CheckoutCoupon({code,onChange,disabled}:{code:string;onChange:(value:string)=>void;disabled:boolean}){
 const [draft,setDraft]=useState(code);
 return <div className="mt-6 rounded-xl border border-black/10 p-4"><label htmlFor="coupon-code" className="text-xs font-medium">Have a discount code?</label><div className="mt-2 flex gap-2"><input id="coupon-code" value={draft} maxLength={30} disabled={disabled} onChange={event=>setDraft(event.target.value.toUpperCase())} placeholder="Enter code" className="min-w-0 flex-1 rounded-lg border border-black/15 bg-white px-3 py-2 text-xs"/><button type="button" disabled={disabled||!draft.trim()} onClick={()=>onChange(draft.trim())} className="rounded-lg bg-[#20211e] px-3 py-2 text-xs text-white disabled:opacity-40">Apply</button></div>{code&&<button type="button" disabled={disabled} onClick={()=>{setDraft("");onChange("");}} className="mt-3 text-xs underline">Remove {code}</button>}</div>;
}
