"use client";

import { FiBox, FiPackage, FiShoppingBag, FiDollarSign } from "react-icons/fi";
import type { Product } from "../_data/products";
import type { Order } from "../_data/orders";
import MetricCard from "./MetricCard";

type Props = {
  products: Product[];
  orders: Order[];
};

export default function AdminMetrics({ products, orders }: Props) {
  const metrics = [
    {
      label: "Total products",
      value: products.length.toString().padStart(2, "0"),
      icon: FiBox,
      note: "Products in your store",
    },
    {
      label: "Collections",
      value: new Set(products.map((product) => product.category)).size
        .toString()
        .padStart(2, "0"),
      icon: FiPackage,
      note: "Product categories",
    },
    {
      label: "Pending orders",
      value: orders
        .filter((order) => order.status === "Pending")
        .length.toString()
        .padStart(2, "0"),
      icon: FiShoppingBag,
      note: "Awaiting your attention",
    },
    {
      label: "Order value",
      value: `Rs. ${orders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}`,
      icon: FiDollarSign,
      note: "Across all placed orders",
    },
  ];
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard key={metric.label} {...metric} />
      ))}
    </div>
  );
}
