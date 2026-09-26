"use client";

import { useStoreSettings } from "./StoreSettingsProvider";
import { supportLink } from "../_data/store-settings";

export default function CareSupport() {
  const { settings } = useStoreSettings();
  const phone = settings.whatsapp.replace(/\D/g, "");
  const label = phone.replace(/^(92)(\d{3})(\d{4})(\d{3})$/, "+$1 $2 $3 $4");
  return (
    <section className="rounded-2xl bg-[#e9e2d7] p-6 sm:p-8">
      <h2 className="text-xl font-medium">Let’s help you out.</h2>
      <p className="mt-3 text-sm leading-7 text-black/65">
        Have a question about a pair or an order? Send us the product link or
        your order reference so we can help.
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <a
          href={supportLink(
            phone,
            "Assalam o Alaikum, I need help with Legacy Sole.",
          )}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-[#20211e] px-6 py-3 text-sm font-medium text-white hover:bg-[#3d3f38]"
        >
          Chat on WhatsApp
        </a>
        <a
          href={`tel:+${phone}`}
          className="text-sm underline underline-offset-4"
        >
          {label}
        </a>
      </div>
    </section>
  );
}

export function ShippingRates() {
  const { settings } = useStoreSettings();
  const money = (value: number) => `PKR ${value.toLocaleString("en-PK")}`;
  return (
    <div className="space-y-4">
      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-black/5 p-4">
          <dt>Standard delivery</dt>
          <dd className="mt-1 text-lg font-semibold text-[#20211e]">
            {money(settings.default_shipping)}
          </dd>
        </div>
        <div className="rounded-xl bg-black/5 p-4">
          <dt>Free delivery on orders from</dt>
          <dd className="mt-1 text-lg font-semibold text-[#20211e]">
            {money(settings.free_shipping_minimum)}
          </dd>
        </div>
      </dl>
      {Object.keys(settings.city_rates).length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <caption className="pb-3 text-left font-medium">
              City-specific delivery rates
            </caption>
            <thead>
              <tr className="border-b border-black/10">
                <th scope="col" className="py-2">
                  City
                </th>
                <th scope="col" className="py-2">
                  Delivery fee
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(settings.city_rates).map(([city, rate]) => (
                <tr key={city} className="border-b border-black/10">
                  <th scope="row" className="py-2 font-normal">
                    {city}
                  </th>
                  <td className="py-2">{money(rate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p>
        Your final delivery fee is calculated at checkout using your city and
        order subtotal.
      </p>
    </div>
  );
}
