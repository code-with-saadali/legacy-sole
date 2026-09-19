"use client";
import {useEffect,useState} from "react";
import {supabase} from "../../lib/supabase";
import type {CartItem} from "../_data/cart";
export type CheckoutQuote={subtotal:number;shipping:number;discount:number;total:number;coupon_code:string};
export default function useCheckoutQuote(items:CartItem[],city:string,coupon:string){
 const key=JSON.stringify({items:items.map(({slug,size,quantity,price})=>({slug,size,quantity,price})),city,coupon});
 const [result,setResult]=useState<{key:string;quote:CheckoutQuote|null;error:string}>({key:"",quote:null,error:""});
 useEffect(()=>{let active=true;const request=JSON.parse(key) as {items:CartItem[];city:string;coupon:string};if(!request.items.length)return;const timer=setTimeout(async()=>{if(!supabase){if(active)setResult({key,quote:null,error:"Checkout is temporarily unavailable."});return;}const {data,error}=await supabase.rpc("checkout_quote",{cart_items:request.items.map(({slug,size,quantity})=>({slug,size,quantity})),delivery_city:request.city,promo_code:request.coupon});if(active)setResult({key,quote:error?null:data,error:error?.message??""});},200);return()=>{active=false;clearTimeout(timer);};},[key]);
 return {quote:result.key===key?result.quote:null,quoteError:result.key===key?result.error:"",quoting:result.key!==key&&items.length>0};
}
