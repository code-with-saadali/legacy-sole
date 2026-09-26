import { pageMetadata } from "../../lib/seo";
import Link from "next/link";
import CarePage, { CareSection } from "../_components/CarePage";
import { ShippingRates } from "../_components/CareSupport";

export const metadata = pageMetadata(
  "Shipping & Delivery | Legacy Sole",
  "View delivery charges and get help tracking your Legacy Sole order in Pakistan.",
  "/shipping-delivery",
);

export default function ShippingPage() {
  return (
    <CarePage
      title="Shipping & Delivery"
      href="/shipping-delivery"
      intro="Everything you need to know about delivery charges, your address and following your pair’s journey."
    >
      <CareSection title="Delivery charges">
        <ShippingRates />
      </CareSection>
      <CareSection title="Before you place your order">
        <p>
          Enter your complete street address, area, city and a reachable phone
          number at checkout. Check these details carefully so your parcel can
          reach you.
        </p>
        <p>
          Delivery timing depends on your location and courier availability.
          Contact us with your city if you need an estimated arrival date before
          ordering.
        </p>
      </CareSection>
      <CareSection title="Follow your delivery">
        <p>
          Use your order reference and checkout email to see the latest order
          status.
        </p>
        <Link
          href="/track-order"
          className="font-medium underline underline-offset-4"
        >
          Go to order tracking
        </Link>
        <p>
          If you need to correct an address or ask about a delayed parcel,
          contact us with your order reference. Address changes depend on
          whether the parcel has already been dispatched.
        </p>
      </CareSection>
    </CarePage>
  );
}
