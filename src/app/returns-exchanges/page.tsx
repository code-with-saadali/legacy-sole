import { pageMetadata } from "../../lib/seo";
import CarePage, { CareSection } from "../_components/CarePage";

export const metadata = pageMetadata(
  "Return & Exchange | Legacy Sole",
  "Contact Legacy Sole for help with a return, exchange or an issue with your order.",
  "/returns-exchanges",
);

export default function ReturnsPage() {
  return (
    <CarePage
      title="Return & Exchange"
      href="/returns-exchanges"
      intro="Something not quite right with your pair? Let us know so we can review your order and explain the available options."
    >
      <CareSection title="Start with a message">
        <p>
          Contact us with your order reference, the pair you received and the
          reason for your request. For an incorrect item or a condition concern,
          include clear photos of the shoes, size label and packaging.
        </p>
        <p>
          Please contact us before sending a parcel back so we can confirm the
          next steps and return address.
        </p>
      </CareSection>
      <CareSection title="Keep your pair ready for review">
        <p>
          Keep the shoes and original packaging together, and avoid further wear
          while your request is being reviewed. Share any differences between
          the item received and its product listing.
        </p>
      </CareSection>
      <CareSection title="Confirm the options for your order">
        <p>
          Return eligibility, request deadlines, delivery costs and any refund
          or exchange arrangements need to be confirmed with our team for your
          order.
        </p>
        <p>
          Pre-loved pairs may have limited sizes and availability. Ask us to
          check stock before planning an exchange. If you need these details
          before purchasing, message us with the product link.
        </p>
      </CareSection>
    </CarePage>
  );
}
