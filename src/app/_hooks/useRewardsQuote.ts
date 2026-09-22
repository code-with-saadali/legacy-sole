"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { CartItem } from "../_data/cart";

type Quote = {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  coupon_code: string;
  loyalty_discount: number;
};
export default function useRewardsQuote(
  items: CartItem[],
  city: string,
  coupon: string,
  email: string,
  reference: string,
  points: number,
) {
  const key = JSON.stringify({
    items: items.map(({ slug, size, quantity, price }) => ({
      slug,
      size,
      quantity,
      price,
    })),
    city,
    coupon,
    email,
    reference,
    points,
  });
  const [result, setResult] = useState<{
    key: string;
    quote: Quote | null;
    error: string;
  }>({ key: "", quote: null, error: "" });
  useEffect(() => {
    let active = true;
    const request = JSON.parse(key) as {
      items: CartItem[];
      city: string;
      coupon: string;
      email: string;
      reference: string;
      points: number;
    };
    if (!request.items.length) return;
    const timer = setTimeout(async () => {
      try {
        if (!supabase) throw new Error("Checkout is temporarily unavailable.");
        const { data, error } = await supabase.rpc("checkout_rewards_quote", {
          cart_items: request.items.map(({ slug, size, quantity }) => ({
            slug,
            size,
            quantity,
          })),
          delivery_city: request.city,
          promo_code: request.coupon,
          customer_email: request.email,
          reward_reference: request.reference,
          reward_points: request.points,
        });
        if (error) throw error;
        if (active) setResult({ key, quote: data, error: "" });
      } catch (cause) {
        if (active)
          setResult({
            key,
            quote: null,
            error:
              (cause as { message?: string }).message ??
              "Unable to update checkout. Please retry.",
          });
      }
    }, 200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [key]);
  return {
    quote: result.key === key ? result.quote : null,
    quoteError: result.key === key ? result.error : "",
    quoting: result.key !== key && items.length > 0,
  };
}
