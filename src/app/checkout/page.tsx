import type { Metadata } from "next";
import CheckoutView from "../_components/CheckoutView";

export const metadata: Metadata = {
  title: "Checkout | Legacy Sole",
  description: "Complete your Legacy Sole footwear order.",
};

export default function CheckoutPage() {
  return <CheckoutView />;
}
