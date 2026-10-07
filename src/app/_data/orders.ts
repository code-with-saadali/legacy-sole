import type { CartItem } from "../_components/ProductActions";

export const ordersKey = "legacy-sole-orders";

export type Order = {
  id: string;
  createdAt: string;
  status:
    | "Pending"
    | "Confirmed"
    | "Dispatched"
    | "Delivered"
    | "Cancelled"
    | "Returned";
  closure_reason?: string;
  stock_restored?: boolean;
  courier_name?: string;
  tracking_number?: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    area?: string;
    city: string;
    province?: string;
    postalCode: string;
  };
  items: CartItem[];
  total: number;
  subtotal?: number | null;
  shipping?: number | null;
  discount?: number;
  coupon_code?: string;
  loyalty_spent?: number;
};

export function saveOrderHistory(order: Order) {
  if (typeof window === "undefined") return;
  try {
    const saved = JSON.parse(
      localStorage.getItem(ordersKey) || "[]",
    ) as Order[];
    const next = [order, ...saved.filter((item) => item.id !== order.id)].slice(
      0,
      20,
    );
    localStorage.setItem(ordersKey, JSON.stringify(next));
    window.dispatchEvent(new Event("order-history-updated"));
  } catch {
    // Order confirmation remains available even when browser storage is disabled.
  }
}

export function readOrderHistory() {
  if (typeof window === "undefined") return [] as Order[];
  try {
    const saved = JSON.parse(
      localStorage.getItem(ordersKey) || "[]",
    ) as Order[];
    return saved.filter((order) => order?.id && Array.isArray(order.items));
  } catch {
    return [] as Order[];
  }
}

export function deleteOrderHistory(orderId: string) {
  if (typeof window === "undefined") return false;
  try {
    const saved = JSON.parse(
      localStorage.getItem(ordersKey) || "[]",
    ) as Order[];
    const next = saved.filter((order) => order.id !== orderId);
    localStorage.setItem(ordersKey, JSON.stringify(next));
    window.dispatchEvent(new Event("order-history-updated"));
    return true;
  } catch {
    return false;
  }
}
