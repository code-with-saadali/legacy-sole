import type { Metadata } from "next";
import ShopClient from "../_components/ShopClient";

export const metadata: Metadata = {
  title: "The Shop | Legacy Sole",
  description: "Explore the Legacy Sole edit of everyday sneakers and runners.",
};

export default function ShopPage() {
  return <ShopClient />;
}
