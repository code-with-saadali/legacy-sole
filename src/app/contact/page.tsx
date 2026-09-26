import { pageMetadata } from "../../lib/seo";
import Link from "next/link";
import CarePage, { CareSection } from "../_components/CarePage";

export const metadata = pageMetadata(
  "Contact Us | Legacy Sole",
  "Get help with footwear, sizing and your Legacy Sole order.",
  "/contact",
);

export default function ContactPage() {
  return (
    <CarePage
      title="Contact Us"
      href="/contact"
      intro="A little help finding your next pair, or a hand with an order. Get in touch with Legacy Sole."
    >
      <CareSection title="Questions about a pair?">
        <p>
          Share the product link and tell us what you would like to know about
          its condition, size or fit. If you need sizing help, include your
          usual shoe size and your foot length in centimetres.
        </p>
        <Link
          href="/size-guide"
          className="font-medium underline underline-offset-4"
        >
          Find your fit with our size guide
        </Link>
      </CareSection>
      <CareSection title="Help with your order">
        <p>
          Keep your order reference and checkout email handy. For a delivery
          update, you can check your order status online.
        </p>
        <Link
          href="/track-order"
          className="font-medium underline underline-offset-4"
        >
          Track your order
        </Link>
        <p>
          If something is wrong with your delivery, send us your order
          reference, a description of the issue and clear photos of the pair and
          packaging.
        </p>
      </CareSection>
    </CarePage>
  );
}
