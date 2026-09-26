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
  const title = invoice ? "Order invoice" : "Packing slip";
  const money = (amount: number) => `Rs. ${amount.toLocaleString("en-PK")}`;
  const subtotal =
    order.subtotal ??
    order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = order.discount ?? 0;
  const rewards = order.loyalty_spent ?? 0;
  const units = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const row = (label: string, value: string) =>
    `<div class="sum-row"><span>${escapeHtml(label)}</span><span>${escapeHtml(value)}</span></div>`;
  const shipping =
    order.shipping == null
      ? row(
          "Delivery / adjustments (legacy order)",
          money(order.total - subtotal + discount + rewards),
        )
      : row("Delivery", order.shipping === 0 ? "Free" : money(order.shipping));
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${title} - ${escapeHtml(order.id)}</title><style>
    @page { size:A4; margin:10mm; }
    * { box-sizing:border-box; }
    body { margin:0; font:11px/1.4 Arial,sans-serif; color:#20211e; }
    header { display:flex; justify-content:space-between; align-items:start; gap:20px; padding-bottom:12px; border-bottom:2px solid #20211e; }
    h1 { margin:0; font-size:23px; letter-spacing:2px; } h2 { margin:0 0 6px; font-size:10px; text-transform:uppercase; letter-spacing:1px; }
    p { margin:3px 0; overflow-wrap:anywhere; } .muted { color:#666; } .reference { font:10px/1.5 monospace; }
    .meta { text-align:right; max-width:55%; } .badge { display:inline-block; border:1px solid #999; border-radius:4px; padding:2px 7px; margin-top:4px; }
    .details { display:grid; grid-template-columns:1.2fr 1fr; gap:18px; padding:12px 0; } .details section { min-width:0; } .address { white-space:pre-wrap; }
    table { border-collapse:collapse; width:100%; table-layout:fixed; margin:4px 0 0; } th { background:#eee9df; border-top:1px solid #aaa; border-bottom:1px solid #aaa; font-size:9px; text-transform:uppercase; letter-spacing:.4px; }
    th,td { padding:7px 6px; text-align:left; vertical-align:top; overflow-wrap:anywhere; } td { border-bottom:1px solid #ddd; }
    .number { text-align:right; } .item-meta { font-size:9px; color:#555; margin-top:2px; } thead { display:table-header-group; } tr { break-inside:avoid; page-break-inside:avoid; }
    .bottom { display:flex; justify-content:space-between; align-items:start; gap:20px; margin-top:12px; break-inside:avoid; } .notes { flex:1; font-size:10px; } .totals { width:260px; } .sum-row { display:flex; justify-content:space-between; gap:14px; padding:3px 0; } .grand { border-top:2px solid #20211e; margin-top:6px; padding-top:6px; font-weight:bold; font-size:13px; }
    footer { margin-top:14px; border-top:1px solid #bbb; padding-top:7px; color:#555; font-size:9px; break-inside:avoid; }
    @media print { th { print-color-adjust:exact; -webkit-print-color-adjust:exact; } }
  </style></head><body>
    <header><div><h1>LEGACY SOLE</h1><p class="muted">${title}</p></div><div class="meta"><p class="reference">${escapeHtml(order.id)}</p><p>${escapeHtml(new Date(order.createdAt).toLocaleString("en-PK", { timeZone: "Asia/Karachi", dateStyle: "medium", timeStyle: "short" }))} PKT</p><span class="badge">${escapeHtml(order.status)}</span></div></header>
    <div class="details"><section><h2>Customer / delivery address</h2><p><strong>${escapeHtml(order.customer.name)}</strong></p><p class="address">${escapeHtml(order.customer.address)}</p>${order.customer.area ? `<p>Area: ${escapeHtml(order.customer.area)}</p>` : ""}<p>${escapeHtml(order.customer.city)} ${escapeHtml(order.customer.postalCode)}</p><p>Phone: ${escapeHtml(order.customer.phone)}</p><p>Email: ${escapeHtml(order.customer.email)}</p></section>
    <section><h2>Order / dispatch details</h2><p>Payment method: Cash on delivery</p><p>${order.items.length} item line(s) / ${units} unit(s)</p><p>Courier: ${escapeHtml(order.courier_name || "Not assigned")}</p><p>Tracking: ${escapeHtml(order.tracking_number || "Not assigned")}</p>${order.closure_reason ? `<p>Closure reason: ${escapeHtml(order.closure_reason)}</p>` : ""}</section></div>
    <table><thead><tr><th style="width:5%">#</th><th>Product / details</th><th class="number" style="width:8%">Qty</th>${invoice ? '<th class="number" style="width:17%">Unit price</th><th class="number" style="width:18%">Amount</th>' : '<th class="number" style="width:12%">Packed</th>'}</tr></thead><tbody>${order.items.map((item, index) => `<tr><td>${index + 1}</td><td><strong>${escapeHtml(item.name)}</strong><div class="item-meta">${escapeHtml(item.size)} / ${escapeHtml(item.color)}<br>SKU: ${escapeHtml(item.slug)}</div></td><td class="number">${item.quantity}</td>${invoice ? `<td class="number">${money(item.price)}</td><td class="number">${money(item.price * item.quantity)}</td>` : '<td class="number">&#9633;</td>'}</tr>`).join("")}</tbody></table>
    <div class="bottom"><div class="notes"><p><strong>${invoice ? "Order notes" : "Packing checklist"}</strong></p><p>${invoice ? "Cash on delivery. This invoice is not proof of payment." : "Check quantities, sizes and colours before sealing."}</p>${!invoice ? '<p style="margin-top:12px">Packed by: ____________________</p>' : ""}</div>${invoice ? `<div class="totals">${row("Items subtotal", money(subtotal))}${shipping}${discount ? row(`Discount${order.coupon_code ? ` (${order.coupon_code})` : ""}`, `- ${money(discount)}`) : ""}${rewards ? row("Loyalty points redeemed", `- ${money(rewards)}`) : ""}<div class="sum-row grand"><span>Order total</span><span>${money(order.total)}</span></div></div>` : ""}</div>
    <footer>Thank you for choosing Legacy Sole. Keep the order reference for tracking and support.</footer>
  </body></html>`;
}
