import type { Metadata } from "next";
import OrderTracker from "../_components/OrderTracker";

export const metadata: Metadata = { title: "Track Order | Legacy Sole" };
export default function TrackOrderPage() {
  return <OrderTracker />;
}
