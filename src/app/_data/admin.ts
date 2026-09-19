import type { Order } from "./orders";
import type { Product } from "./products";

export const lowStockThreshold = 5;

export function stockAlerts(products: Product[]) {
  return products
    .filter((product) => (product.stock ?? 0) <= lowStockThreshold)
    .sort(
      (a, b) => (a.stock ?? 0) - (b.stock ?? 0) || a.name.localeCompare(b.name),
    );
}

export function whatsappPhone(phone: string): string | null {
  const trimmed = phone.trim();
  if (!/^[+\d\s().-]+$/.test(trimmed)) return null;
  let digits = trimmed.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (/^03\d{9}$/.test(digits)) digits = `92${digits.slice(1)}`;
  else if (/^3\d{9}$/.test(digits)) digits = `92${digits}`;
  if (!/^[1-9]\d{7,14}$/.test(digits)) return null;
  if (digits.startsWith("92") && !/^923\d{9}$/.test(digits)) return null;
  if (
    !digits.startsWith("92") &&
    !trimmed.startsWith("+") &&
    !trimmed.startsWith("00")
  )
    return null;
  return digits;
}

export function orderMessage(order: Order) {
  const update =
    order.status === "Confirmed"
      ? "Your order has been confirmed."
      : order.status === "Cancelled"
        ? "Your order has been cancelled."
        : order.status === "Returned"
          ? "Your order return has been recorded."
          : order.status === "Dispatched"
            ? "Your order has been dispatched."
            : order.status === "Delivered"
              ? "Your order is marked as delivered. Thank you for shopping with us!"
              : "We have received your order and it is awaiting confirmation.";
  const shipment =
    order.courier_name && order.tracking_number
      ? `\nCourier: ${order.courier_name}\nTracking number: ${order.tracking_number}`
      : "";
  return `Assalam o Alaikum ${order.customer.name},\n\n${update}\nOrder: ${order.id}\n${order.items.map((item) => `${item.name} (${item.size}) x ${item.quantity}`).join("\n")}\nTotal: Rs. ${order.total.toLocaleString("en-PK")}${shipment}\n\nLegacy Sole`;
}

export function searchProducts(products: Product[], query: string) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return products.filter((product) => {
    const text =
      `${product.name} ${product.slug} ${product.category} ${product.color}`.toLowerCase();
    return terms.every((term) => text.includes(term));
  });
}

export function validateShipment(
  courier: string,
  tracking: string,
  status: Order["status"],
) {
  if (courier.trim().length > 80 || tracking.trim().length > 100)
    return "Courier must be 80 characters or fewer, and tracking number 100 or fewer.";
  if (Boolean(courier.trim()) !== Boolean(tracking.trim()))
    return "Enter both the courier name and tracking number.";
  if (status === "Dispatched" && (!courier.trim() || !tracking.trim()))
    return "Save a courier name and tracking number before marking this order dispatched.";
  return "";
}
