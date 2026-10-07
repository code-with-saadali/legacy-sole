import type { Metadata } from "next";
import CustomerOrders from "../_components/CustomerOrders";

export const metadata: Metadata = { title: "My Orders | Legacy Sole" };

export default function OrdersPage() {
  return <CustomerOrders />;
}
