"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function LoyaltyBalance({
  reference,
  email,
}: {
  reference: string;
  email: string;
}) {
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    if (!supabase) return;
    void supabase
      .rpc("loyalty_balance", {
        order_reference: reference,
        customer_email: email,
      })
      .then(({ data, error }) => {
        if (active) {
          setBalance(error ? null : Number(data));
          setError(
            error
              ? "Points could not be loaded. Please track your order again."
              : "",
          );
        }
      });
    return () => {
      active = false;
    };
  }, [reference, email]);
  return (
    <div className="mt-6 rounded-xl bg-[#E9E2D7] p-5">
      <h3 className="text-lg">Your loyalty points</h3>
      <p className="mt-2 text-sm">
        {error ||
          (balance === null
            ? "Loading points..."
            : `${balance.toLocaleString()} points available = Rs. ${balance.toLocaleString()} off your next order.`)}
      </p>
      <p className="mt-2 text-xs leading-5 text-black/60">
        New orders earn 1 point per Rs. 100 of merchandise paid after delivery.
        Use this order reference and email at checkout. Returns reverse earned
        points.
      </p>
      <Link href="/shop" className="mt-3 inline-block text-sm underline">
        Find your next pair
      </Link>
    </div>
  );
}
