import type { Metadata } from "next";
import { Suspense } from "react";
import OrderTracker from "../_components/OrderTracker";

export const metadata: Metadata = { title: "Track Order | Legacy Sole" };
export default function TrackOrderPage() {
  return (
    <Suspense fallback={<main className="min-h-[70vh] bg-[#F4F1E9]" />}>
      <OrderTracker />
    </Suspense>
  );
}
