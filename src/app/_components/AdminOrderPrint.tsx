"use client";

import { useState } from "react";
import type { Order } from "../_data/orders";
import { orderDocument } from "../_data/order-document";

export default function AdminOrderPrint({ order }: { order: Order }) {
  const [document, setDocument] = useState<{ html: string; id: number } | null>(
    null,
  );
  const [error, setError] = useState("");
  return (
    <div className="mt-5">
      <div className="flex flex-wrap gap-2">
        {(["invoice", "packing"] as const).map((kind) => (
          <button
            key={kind}
            type="button"
            onClick={() => {
              setError("");
              setDocument({ html: orderDocument(order, kind), id: Date.now() });
            }}
            className="rounded-xl border border-black/15 bg-white px-4 py-3 text-xs font-medium"
          >
            {kind === "invoice"
              ? "Print / save invoice PDF"
              : "Print packing slip"}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-black/50">
        Choose Save as PDF in the print window to download.
      </p>
      {error && (
        <p role="alert" className="mt-2 text-xs text-red-700">
          {error}
        </p>
      )}
      {document && (
        <iframe
          key={document.id}
          title="Order print document"
          aria-hidden="true"
          tabIndex={-1}
          srcDoc={document.html}
          className="fixed -left-[10000px] top-0 h-[297mm] w-[210mm] border-0"
          onLoad={(event) => {
            try {
              const frame = event.currentTarget.contentWindow;
              if (!frame) throw new Error();
              frame.focus();
              frame.print();
            } catch {
              setError(
                "The print window could not open. Please try again in your browser.",
              );
            }
          }}
        />
      )}
    </div>
  );
}
