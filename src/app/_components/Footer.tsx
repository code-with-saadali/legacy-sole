"use client";

import Link from "next/link";
import { FiInstagram } from "react-icons/fi";
import { FaFacebookF, FaTiktok, FaWhatsapp } from "react-icons/fa";
import { useStoreSettings } from "./StoreSettingsProvider";
import { supportLink } from "../_data/store-settings";
import { careLinks } from "../_data/customer-care";

const shopLinks = [
  { label: "All Shoes", href: "/shop" },
  { label: "Men’s Collection", href: "/shop" },
  { label: "New Arrivals", href: "/#collections" },
  { label: "Best Sellers", href: "/#collection" },
];

const socialIcons = [
  { label: "Instagram", Icon: FiInstagram },
  { label: "Facebook", Icon: FaFacebookF },
  { label: "TikTok", Icon: FaTiktok },
];

const linkStyle =
  "w-fit rounded-sm transition-opacity hover:opacity-65 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current";

export default function Footer() {
  const { settings } = useStoreSettings();
  const phone = settings.whatsapp.replace(/\D/g, "");
  const displayPhone = phone.replace(
    /^(92)(\d{3})(\d{4})(\d{3})$/,
    "+$1 $2 $3 $4",
  );
  const whatsappHref = supportLink(
    phone,
    "Assalam o Alaikum, I need help with Legacy Sole.",
  );

  return (
    <footer className="site-chrome rounded-t-[28px] bg-[#f26924] px-6 pb-4 pt-14 text-[#171717] sm:px-10 lg:px-[3.57%] lg:pt-39.5">
      <div className="mx-auto grid max-w-360 grid-cols-2 items-start gap-x-8 gap-y-10 lg:min-h-67.5 lg:grid-cols-[minmax(0,2.8fr)_minmax(0,.85fr)_minmax(0,.95fr)_minmax(0,1.03fr)] lg:gap-x-10">
        <div className="col-span-2 lg:col-span-1">
          <Link
            href="/"
            aria-label="Legacy Sole home"
            className={`inline-flex flex-col ${linkStyle}`}
          >
            <svg
              width="65"
              height="35"
              viewBox="265 0 270 146"
              aria-hidden="true"
              className="mb-2"
            >
              <image href="/logo-black.svg" width="800" height="336" />
            </svg>
            <span className="text-[25px] font-bold leading-7.5 tracking-[.02em]">
              LEGACY SOLE
            </span>
            <span className="mt-0.5 text-[8px] leading-3 tracking-[.35em]">
              EVERY PAIR, A LEGACY.
            </span>
          </Link>
          <div className="mb-3.75 mt-3 h-px w-full max-w-70.5 bg-black/35" />
          <p className="max-w-100 text-[14px] leading-4.25">
            Curated thrift footwear for those who value unique style, quality,
            and character. Discover original pre-loved pairs, carefully selected
            for Pakistan.
          </p>
        </div>

        <nav aria-label="Footer shop" className="lg:pt-1">
          <h2 className="mb-1 text-[18px] font-medium leading-7">Shop</h2>
          <ul className="space-y-0.5 text-[14px] leading-4.75">
            {shopLinks.map(({ label, href }) => (
              <li key={label}>
                <Link href={href} className={linkStyle}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Customer care" className="lg:pt-1">
          <h2 className="mb-1 text-[18px] font-medium leading-7">
            Customer Care
          </h2>
          <ul className="space-y-0.5 text-[14px] leading-4.75">
            {careLinks.map(({ label, href }) => (
              <li key={label}>
                <Link href={href} className={linkStyle}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="col-span-2 sm:col-span-1 lg:pt-1">
          <h2 className="mb-1 text-[18px] font-medium leading-7">Contact Us</h2>
          <a
            href={`tel:+${phone}`}
            className={`${linkStyle} inline-block text-[14px] leading-4.75`}
          >
            {displayPhone}
          </a>
          <div className="mb-2 mt-2.5 h-px w-27.25 bg-black/55" />
          <h2 className="text-[18px] font-medium leading-7">Follow Us:</h2>
          <div className="-ml-2 flex items-center gap-1">
            {socialIcons.map(({ label, Icon }) => (
              <span
                key={label}
                title={`${label} profile coming soon`}
                role="img"
                aria-label={`${label} profile coming soon`}
                className="flex size-8 items-center justify-center"
              >
                <Icon size={17} aria-hidden="true" />
              </span>
            ))}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              aria-label="Chat on WhatsApp"
              className={`${linkStyle} flex size-8 items-center justify-center`}
            >
              <FaWhatsapp size={17} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
      <p className="mt-14 text-center text-[12px] leading-5 sm:text-[14px] lg:mt-4">
        © {new Date().getFullYear()} Legacy Sole. All rights reserved.
      </p>
    </footer>
  );
}
