import type { Metadata } from "next";
import Link from "next/link";
import CarePage, { CareSection } from "../_components/CarePage";

export const metadata: Metadata = {
  title: "Size Guide | Legacy Sole",
  description:
    "Learn how to measure your feet and use the size guide for your chosen pair.",
};

export default function SizeGuidePage() {
  return (
    <CarePage
      title="Size Guide"
      href="/size-guide"
      intro="Find a fit that feels right. Start with your measurements, then check the sizing details for the exact pair you love."
    >
      <CareSection title="Measure your feet">
        <ol className="list-decimal space-y-3 pl-5">
          <li>Put on the socks you plan to wear with your shoes.</li>
          <li>
            Place a sheet of paper on a flat floor against a wall. Stand on it
            with your heel gently touching the wall.
          </li>
          <li>
            Mark the end of your longest toe, then measure from the edge at the
            wall to the mark in centimetres.
          </li>
          <li>Repeat for your other foot and use the longer measurement.</li>
        </ol>
      </CareSection>
      <CareSection title="Check the guide for your pair">
        <p>
          Open the product page and select “Find your fit · Size guide” to see
          the available UK sizes and foot-length measurements for that style.
        </p>
        <p>
          Size labels and fit can vary between brands and styles. Use the
          measurements provided for the product instead of assuming the same
          size fits across every brand.
        </p>
        <p>
          If measurements are unavailable, or you are between sizes, send us the
          product link and your foot length before ordering.
        </p>
        <Link href="/shop" className="font-medium underline underline-offset-4">
          Browse shoes and available sizes
        </Link>
      </CareSection>
      <CareSection title="Buying pre-loved footwear">
        <p>
          Check the listed size, condition notes and photos for the individual
          pair. Tell us if you prefer a roomier fit or usually need a wider shoe
          so we can help you assess the available details.
        </p>
      </CareSection>
    </CarePage>
  );
}
