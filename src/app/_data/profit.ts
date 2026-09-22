export type FinancialOrder = {
  id: string;
  created_at: string;
  status: string;
  total: number;
  stock_restored: boolean;
  product_cost: number | null;
  delivery_cost: number | null;
  other_cost: number;
};

export function orderProfit(order: FinancialOrder) {
  const closed = ["Delivered", "Returned", "Cancelled"].includes(order.status);
  const revenue = order.status === "Delivered" ? order.total : 0;
  const consumesStock =
    order.status === "Delivered" ||
    (["Returned", "Cancelled"].includes(order.status) && !order.stock_restored);
  const productCost = consumesStock ? order.product_cost : 0;
  const complete =
    closed && productCost !== null && order.delivery_cost !== null;
  return {
    closed,
    revenue,
    productCost,
    complete,
    profit: complete
      ? revenue - productCost! - order.delivery_cost! - order.other_cost
      : null,
  };
}
