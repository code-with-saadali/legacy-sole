"use client";
import {useState} from "react";
import {supabase} from "../../lib/supabase";
import type {Review} from "../_data/reviews";
import useAdminRows from "../_hooks/useAdminRows";
import CustomSelect from "./CustomSelect";
import ReviewCard from "./ReviewCard";
export default function ReviewModeration(){
 const {rows,error,setError,loading,reload}=useAdminRows<Review>("reviews");const [filter,setFilter]=useState("pending");const [busy,setBusy]=useState(false);
 const update=async(review:Review)=>{if(!supabase||busy)return;setBusy(true);const {error}=await supabase.from("reviews").update({approved:!review.approved}).eq("id",review.id).select("id").single();if(error)setError(error.message);else await reload();setBusy(false);};
 const visible=rows.filter(review=>filter==="all"||(filter==="pending"?!review.approved:review.approved));
 return <section className="rounded-3xl border border-black/10 bg-white p-6"><div className="flex flex-wrap items-center justify-between gap-4"><h2 className="text-2xl">Review moderation</h2><CustomSelect label="Review approval filter" value={filter} onChange={setFilter} options={[{value:"pending",label:"Awaiting approval"},{value:"published",label:"Published"},{value:"all",label:"All reviews"}]}/></div>{error&&<p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}<div className="mt-5 space-y-5">{visible.map(review=><div key={review.id}><p className="mb-2 text-xs text-black/50">Product: {review.product_slug}</p><ReviewCard review={review}/><button type="button" disabled={busy} onClick={()=>void update(review)} className="mt-3 rounded-full border border-black/15 px-4 py-2 text-xs">{review.approved?"Hide review":"Approve & publish"}</button></div>)}{!visible.length&&<p className="text-sm text-black/50">{loading?"Loading reviews…":"No reviews in this view."}</p>}</div></section>;
}
