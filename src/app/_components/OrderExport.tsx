"use client";
import { FiDownload } from "react-icons/fi";
import type { Order } from "../_data/orders";
import { downloadCsv } from "../_data/csv";
export default function OrderExport({ orders }: { orders: Order[] }) {
  return (
    <button
      type="button"
      disabled={!orders.length}
      onClick={() =>
        downloadCsv(
          `legacy-sole-orders-${new Date().toISOString().slice(0, 10)}.csv`,
          [
            [
              "Reference",
              "Date",
              "Status",
              "Customer",
              "City",
              "Area",
              "Items",
              "Total (Rs.)",
              "Courier",
              "Tracking",
            ],
            ...orders.map((order) => [
              order.id,
              order.createdAt,
              order.status,
              order.customer.name,
              order.customer.city,
              order.customer.area ?? "",
              order.items.reduce((sum, item) => sum + item.quantity, 0),
              order.total,
              order.courier_name,
              order.tracking_number,
            ]),
          ],
        )
      }
      className="inline-flex items-center gap-2 rounded-xl border border-black/15 px-4 py-3 text-xs disabled:opacity-40"
    >
      <FiDownload /> Export {orders.length} orders (CSV)
    </button>
  );
}
