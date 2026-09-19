"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { Review } from "../_data/reviews";
import CustomSelect from "./CustomSelect";
import ReviewSummary from "./ReviewSummary";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";
export default function ProductReviews({ slug }: { slug: string }) {
  const [reviews,setReviews]=useState<Review[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [sort,setSort]=useState("newest");
  const [rating,setRating]=useState("all");
  const [limit,setLimit]=useState(6);
  const load=useCallback(async()=>{
    if(!supabase){setError("Reviews are temporarily unavailable.");setLoading(false);return;}
    const {data,error}=await supabase.from("reviews").select("*").eq("product_slug",slug).eq("approved",true).order("created_at",{ascending:false});
    if(error)setError("Reviews could not be loaded. Please retry.");else{setReviews(data??[]);setError("");}setLoading(false);
  },[slug]);
  useEffect(()=>{void load();},[load]);
  const filtered=reviews.filter(review=>rating==="all"||review.rating===Number(rating)).sort((a,b)=>sort==="highest"?b.rating-a.rating:sort==="lowest"?a.rating-b.rating:Date.parse(b.created_at)-Date.parse(a.created_at));
  return <section className="mt-20 border-t border-black/10 pt-12" aria-labelledby="reviews-title">
    <p className="text-[10px] uppercase tracking-[0.22em] text-[#b66b4d]">Worn. Walked. Reviewed.</p><div className="mt-3 flex flex-wrap items-end justify-between gap-4"><h2 id="reviews-title" className="text-4xl text-[#20211e] sm:text-5xl">From our community.</h2><p className="max-w-sm text-sm leading-6 text-black/50">Real opinions on everyday comfort, fit and style.</p></div>
    <div className="mt-8 grid items-start gap-8 lg:grid-cols-[280px_1fr]"><ReviewSummary reviews={reviews}/><div className="min-w-0"><div className="mb-5 grid gap-3 sm:grid-cols-2"><CustomSelect label="Filter reviews by rating" value={rating} onChange={value=>{setRating(value);setLimit(6);}} options={[{value:"all",label:"All ratings"},...[5,4,3,2,1].map(value=>({value:String(value),label:value+" stars"}))]}/><CustomSelect label="Sort reviews" value={sort} onChange={setSort} options={[{value:"newest",label:"Most recent"},{value:"highest",label:"Highest rated"},{value:"lowest",label:"Lowest rated"}]}/></div>
    {loading?<p role="status" className="py-10 text-sm">Loading reviews?</p>:error?<div role="alert" className="py-8 text-sm">{error}<button type="button" onClick={()=>void load()} className="ml-3 underline">Retry</button></div>:filtered.length?<div className="space-y-4">{filtered.slice(0,limit).map(review=><ReviewCard key={review.id} review={review}/>)}</div>:<div className="rounded-2xl border border-dashed border-black/15 px-6 py-12 text-center"><h3 className="text-xl">{reviews.length?"No reviews with this rating yet.":"Your experience could be the first."}</h3><p className="mt-3 text-sm text-black/50">Share a few details to help someone find their next pair.</p></div>}
    {filtered.length>limit&&<button type="button" onClick={()=>setLimit(value=>value+6)} className="mt-5 rounded-full border border-black/20 px-5 py-3 text-sm">Show more reviews</button>}</div></div><div className="mt-8"><ReviewForm key={slug} slug={slug} onSubmitted={()=>void load()}/></div>
  </section>;
}
