import type { Order } from "./orders";

function escapeHtml(value: string | number) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ]!,
  );
}

export function orderDocument(order: Order, kind: "invoice" | "packing") {
  const invoice = kind === "invoice";
  const title = invoice ? "Invoice" : "Packing slip";
  const money = (amount: number) => `Rs. ${amount.toLocaleString("en-PK")}`;
  const subtotal = order.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const adjustment = order.total - subtotal;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${title} - ${escapeHtml(order.id)}</title><style>
    @page { size: A4; margin: 16mm; } * { box-sizing: border-box; } body { font: 13px/1.6 Arial,sans-serif; color:#243329; margin:0; }
    header { display:flex; justify-content:space-between; gap:24px; border-bottom:2px solid #243329; padding-bottom:20px; } h1 { font-size:24px; margin:0; } h2 { font-size:15px; } p { margin:4px 0; overflow-wrap:anywhere; }
    .muted { color:#666; } .address { white-space:pre-wrap; } section { margin-top:24px; } table { width:100%; border-collapse:collapse; margin-top:24px; table-layout:fixed; } th,td { padding:12px 6px; border-bottom:1px solid #ddd; text-align:left; overflow-wrap:anywhere; } th { background:#f1f4ec; } tr { break-inside:avoid; } thead { display:table-header-group; } .totals { margin:24px 0 0 auto; width:280px; break-inside:avoid; } .totals p { display:flex; justify-content:space-between; gap:16px; } footer { border-top:1px solid #ddd; margin-top:32px; padding-top:16px; font-size:11px; }
    </style></head><body><header><div><h1>LEGACY SOLE</h1><p class="muted">${title}</p></div><div><p><strong>${escapeHtml(order.id)}</strong></p><p>${escapeHtml(new Date(order.createdAt).toLocaleDateString("en-PK"))}</p><p>Status: ${escapeHtml(order.status)}</p></div></header>
    <section><h2>${invoice ? "Bill / ship to" : "Ship to"}</h2><p><strong>${escapeHtml(order.customer.name)}</strong></p><p class="address">${escapeHtml(order.customer.address)}</p><p>${escapeHtml(order.customer.city)} ${escapeHtml(order.customer.postalCode)}</p><p>${escapeHtml(order.customer.phone)}</p>${invoice ? `<p>${escapeHtml(order.customer.email)}</p>` : ""}</section>
    ${order.courier_name && order.tracking_number ? `<section><p>Courier: ${escapeHtml(order.courier_name)}</p><p>Tracking number: ${escapeHtml(order.tracking_number)}</p></section>` : ""}
    <table><thead><tr><th>Product / size / colour</th><th style="width:12%">Qty</th>${invoice ? '<th style="width:22%">Unit price</th><th style="width:22%">Amount</th>' : '<th style="width:15%">Packed</th>'}</tr></thead><tbody>${order.items.map((item) => `<tr><td><strong>${escapeHtml(item.name)}</strong><br>${escapeHtml(item.size)} / ${escapeHtml(item.color)}</td><td>${item.quantity}</td>${invoice ? `<td>${money(item.price)}</td><td>${money(item.price * item.quantity)}</td>` : "<td>&#9633;</td>"}</tr>`).join("")}</tbody></table>
    ${invoice ? `<div class="totals"><p><span>Items subtotal</span><span>${money(subtotal)}</span></p><p><span>${adjustment < 0 ? "Order adjustment" : "Delivery / other charges"}</span><span>${money(adjustment)}</span></p><p><strong>Order total</strong><strong>${money(order.total)}</strong></p></div>` : `<section><p>Total units: ${order.items.reduce((total, item) => total + item.quantity, 0)}</p><p>Packed by: ____________________</p></section>`}
    <footer>${invoice ? "Thank you for shopping with Legacy Sole. This invoice does not confirm payment received." : "Check every item and size before sealing the parcel."}</footer></body></html>`;
}
