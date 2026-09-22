export type StoreSettings = {
  whatsapp: string;
  default_shipping: number;
  free_shipping_minimum: number;
  city_rates: Record<string, number>;
};
export const defaultSettings: StoreSettings = {
  whatsapp: "923023898785",
  default_shipping: 250,
  free_shipping_minimum: 10000,
  city_rates: {},
};
export function deliveryCharge(
  subtotal: number,
  city: string,
  settings: StoreSettings,
) {
  if (subtotal >= settings.free_shipping_minimum) return 0;
  const entry = Object.entries(settings.city_rates).find(
    ([name]) => name.trim().toLowerCase() === city.trim().toLowerCase(),
  );
  return entry?.[1] ?? settings.default_shipping;
}
export function supportLink(phone: string, message: string) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
export const pakistanCities = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Sialkot",
  "Gujranwala",
  "Hyderabad",
  "Bahawalpur",
  "Sargodha",
  "Sukkur",
  "Abbottabad",
];
