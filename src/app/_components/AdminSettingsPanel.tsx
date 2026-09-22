"use client";

import { useState } from "react";
import { FiTruck, FiGift, FiMessageCircle, FiSliders } from "react-icons/fi";
import DeliverySettings from "./DeliverySettings";
import CouponManager from "./CouponManager";
import MetricCard from "./MetricCard";
import { useStoreSettings } from "./StoreSettingsProvider";

export default function AdminSettingsPanel() {
  const [section, setSection] = useState("Delivery & support");
  const { settings } = useStoreSettings();
  return (
    <div className="mt-7 space-y-6">
      <div className="admin-welcome flex items-center justify-between gap-6 rounded-[28px] bg-[#20211e] p-6 text-white sm:p-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#E9E2D7]">
            The little details, taken care of
          </p>
          <h2 className="mt-3 text-2xl font-medium tracking-tight">
            Your store. Your way.
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">
            Fine-tune delivery, stay close to your customers and create offers
            that bring them back.
          </p>
        </div>
        <FiSliders
          size={36}
          className="hidden shrink-0 text-[#E9E2D7] sm:block"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <MetricCard
          label="Standard delivery"
          value={`Rs. ${settings.default_shipping.toLocaleString("en-PK")}`}
          icon={FiTruck}
          note="For cities without a custom rate"
        />
        <MetricCard
          label="Free delivery from"
          value={`Rs. ${settings.free_shipping_minimum.toLocaleString("en-PK")}`}
          icon={FiGift}
          note="Minimum order subtotal"
        />
        <MetricCard
          label="City overrides"
          value={String(Object.keys(settings.city_rates).length)}
          icon={FiSliders}
          note="Cities with a custom delivery charge"
        />
        <MetricCard
          label="Customer support"
          value={`+${settings.whatsapp}`}
          icon={FiMessageCircle}
          note="Store WhatsApp number"
        />
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="admin-panel rounded-[28px] border border-black/[0.06] p-5">
          <p className="mb-4 text-[10px] uppercase tracking-[0.16em] text-black/40">
            Store preferences
          </p>
          <nav aria-label="Settings sections" className="space-y-2">
            {[
              {
                label: "Delivery & support",
                icon: FiTruck,
                text: "Shipping rates and contact",
              },
              {
                label: "Discount coupons",
                icon: FiGift,
                text: "Offers and promotions",
              },
            ].map(({ label, icon: Icon, text }) => (
              <button
                key={label}
                type="button"
                onClick={() => setSection(label)}
                aria-pressed={section === label}
                className={`flex w-full gap-3 rounded-xl p-4 text-left ${section === label ? "bg-[#20211e] text-white" : "hover:bg-[#E9E2D7]"}`}
              >
                <Icon size={17} className="mt-0.5 shrink-0" />
                <span>
                  <span className="block text-xs font-medium">{label}</span>
                  <span
                    className={`mt-1 block text-[10px] ${section === label ? "text-white/50" : "text-black/40"}`}
                  >
                    {text}
                  </span>
                </span>
              </button>
            ))}
          </nav>
          <p className="mt-5 border-t border-black/10 pt-4 text-[11px] leading-5 text-black/45">
            Saved delivery settings apply to new checkouts. Existing order
            totals stay as placed.
          </p>
        </aside>
        <div className="min-w-0">
          {section === "Delivery & support" ? (
            <DeliverySettings />
          ) : (
            <CouponManager />
          )}
        </div>
      </div>
    </div>
  );
}
