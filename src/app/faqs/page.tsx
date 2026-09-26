import type { Metadata } from "next";
import Link from "next/link";
import CarePage from "../_components/CarePage";

export const metadata: Metadata = {
  title: "FAQs | Legacy Sole",
  description:
    "Answers to common questions about Legacy Sole footwear, sizing, shipping and orders.",
};

const questions = [
  {
    question: "Are the shoes pre-loved?",
    answer:
      "Legacy Sole curates pre-loved footwear. Check the photos, condition notes and details on each product page, and contact us if you would like to know more about a specific pair.",
    href: "/shop",
    label: "Explore the collection",
  },
  {
    question: "How do I choose my size?",
    answer:
      "Measure both feet and use the longer measurement. Check the size guide on the product page for that style. If you are unsure or measurements are missing, ask us before ordering.",
    href: "/size-guide",
    label: "Read the size guide",
  },
  {
    question: "How much does delivery cost?",
    answer:
      "Delivery charges depend on your city and order subtotal. The delivery page lists current rates, and checkout shows the final charge for your order.",
    href: "/shipping-delivery",
    label: "View delivery details",
  },
  {
    question: "When will my order arrive?",
    answer:
      "Timing depends on your location and courier availability. Contact us with your city or order reference for help with an estimated arrival date.",
    href: "/contact",
    label: "Contact our team",
  },
  {
    question: "How can I track my order?",
    answer:
      "Enter your order reference and the email you used at checkout on the tracking page to see your order status.",
    href: "/track-order",
    label: "Track your order",
  },
  {
    question: "Can I return or exchange a pair?",
    answer:
      "Contact us with your order reference and the reason for your request. Our team will confirm eligibility and the available options before you send anything back.",
    href: "/returns-exchanges",
    label: "Get return and exchange help",
  },
  {
    question: "Can I change my delivery address?",
    answer:
      "Contact us as soon as possible with your order reference and corrected address. Whether an address can be changed depends on the dispatch status.",
    href: "/contact",
    label: "Ask for order help",
  },
];

export default function FaqPage() {
  return (
    <CarePage
      title="Frequently Asked Questions"
      href="/faqs"
      intro="From finding your fit to following your delivery, here are answers to the questions we hear most."
    >
      <div className="divide-y divide-black/10 overflow-hidden rounded-2xl border border-black/10 bg-[#faf8f3]">
        {questions.map(({ question, answer, href, label }) => (
          <details key={question} className="group p-6 sm:p-8">
            <summary className="cursor-pointer text-base font-medium focus-visible:outline-2 focus-visible:outline-offset-4">
              {question}
            </summary>
            <p className="mt-4 text-sm leading-7 text-black/70">{answer}</p>
            <Link
              href={href}
              className="mt-3 inline-block text-sm font-medium underline underline-offset-4"
            >
              {label}
            </Link>
          </details>
        ))}
      </div>
    </CarePage>
  );
}
