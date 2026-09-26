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
