"use client";
import NewArrivalsSettingsPanel from "./NewArrivalsSettingsPanel";
import ClassicFeatureSettingsPanel from "./ClassicFeatureSettingsPanel";
import StyleGuideSettingsPanel from "./StyleGuideSettingsPanel";

import { useState } from "react";
import {
  FiTruck,
  FiGift,
  FiMessageCircle,
  FiSliders,
  FiImage,
  FiMenu,
  FiArrowUpRight,
} from "react-icons/fi";
import DeliverySettings from "./DeliverySettings";
import CouponManager from "./CouponManager";
import NavigationSettings from "./NavigationSettings";
import { useStoreSettings } from "./StoreSettingsProvider";

export default function AdminSettingsPanel() {
  const [section, setSection] = useState("Delivery & support");
  const { settings } = useStoreSettings();
  return (
    <div className="mt-7 space-y-6">
      <div className="border border-black/10 flex items-center justify-between gap-6 rounded-[28px] bg-[#E9E2D7] p-6 text-[#20211e] sm:p-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#796452]">
            Store preferences
          </p>
          <h2 className="mt-3 text-2xl font-medium tracking-tight">
            Make it yours.
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-black/55">
            Manage your homepage, menus, delivery and offers from one place.
          </p>
        </div>
        <FiSliders
          size={36}
          className="hidden shrink-0 text-[#796452] sm:block"
        />
      </div>
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            label: "Delivery fee",
            value: `Rs. ${settings.default_shipping.toLocaleString("en-PK")}`,
            icon: FiTruck,
          },
          {
            label: "Free delivery from",
            value: `Rs. ${settings.free_shipping_minimum.toLocaleString("en-PK")}`,
            icon: FiGift,
          },
          {
            label: "Custom city rates",
            value: String(Object.keys(settings.city_rates).length),
            icon: FiSliders,
          },
          {
            label: "WhatsApp support",
            value: `+${settings.whatsapp}`,
            icon: FiMessageCircle,
          },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="min-w-0 rounded-2xl border border-black/[0.07] bg-white p-4 sm:p-5"
          >
            <dt className="flex items-center gap-2 text-[10px] font-medium text-black/50 sm:text-xs">
              <Icon className="shrink-0 text-[#4b5b40]" size={15} />
              {label}
            </dt>
            <dd className="mt-3 break-words text-sm font-semibold tracking-tight text-[#20211e] sm:text-lg">
              {value}
            </dd>
          </div>
        ))}
      </dl>
      <div className="space-y-5">
        <aside className="rounded-[22px] border border-black/[0.07] bg-white p-3 sm:p-5">
          <p className="mb-4 px-2 text-[10px] uppercase tracking-[0.16em] text-black/40">
            Store preferences
          </p>
          <nav
            aria-label="Settings sections"
            className="grid grid-cols-2 gap-2 lg:grid-cols-4"
          >
            {[
              {
                label: "New arrivals",
                icon: FiImage,
                text: "Arrival image and content",
              },
              {
                label: "Classic feature",
                icon: FiImage,
                text: "Featured image and content",
              },
              {
                label: "Style guide",
                icon: FiImage,
                text: "Homepage images and text",
              },
              {
                label: "Navbar menu",
                icon: FiMenu,
                text: "Menu sections and links",
              },
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
                aria-controls="settings-content"
                className={`flex min-w-0 w-full flex-col gap-3 rounded-2xl border p-3 text-left transition-colors sm:p-4 ${section === label ? "border-[#4b5b40] bg-[#4b5b40] text-white shadow-sm" : "border-transparent bg-[#FAF9F6] text-[#20211e] hover:border-black/10 hover:bg-[#E9E2D7]"}`}
              >
                <span className="flex w-full items-center justify-between">
                  <Icon size={19} className="shrink-0" />
                  <FiArrowUpRight
                    aria-hidden="true"
                    className={section === label ? "opacity-100" : "opacity-30"}
                  />
                </span>
                <span>
                  <span className="block text-xs font-medium">{label}</span>
                  <span
                    className={`mt-1 block text-[10px] ${section === label ? "text-white/75" : "text-black/50"}`}
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
        <div
          id="settings-content"
          role="region"
          aria-label={section}
          className="min-w-0 [&_input:not([type=checkbox])]:rounded-xl [&_textarea]:rounded-xl [&_fieldset]:min-w-0"
        >
          {section === "New arrivals" ? (
            <NewArrivalsSettingsPanel />
          ) : section === "Classic feature" ? (
            <ClassicFeatureSettingsPanel />
          ) : section === "Style guide" ? (
            <StyleGuideSettingsPanel />
          ) : section === "Delivery & support" ? (
            <DeliverySettings />
          ) : section === "Navbar menu" ? (
            <NavigationSettings />
          ) : (
            <CouponManager />
          )}
        </div>
      </div>
    </div>
  );
}
