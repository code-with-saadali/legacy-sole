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
  {
    label: "Instagram",
    Icon: FiInstagram,
    href: "https://instagram.com/legacysole_com?dlrf=MTAzYWM3djV4bGYwcg%3D%3D",
  },
  {
    label: "Facebook",
    Icon: FaFacebookF,
    href: "https://www.facebook.com/share/19qsJyrAZK/",
  },
  { label: "TikTok", Icon: FaTiktok, href: "https://tiktok.com/@legacy.sole0" },
];

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current";

// Text link with animated underline
const linkStyle = `relative w-fit rounded-sm ${focusRing} after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100`;

// Round icon button
const iconButtonStyle = `flex size-10 items-center justify-center rounded-full border border-black/30 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#171717] hover:bg-[#171717] hover:text-[#f26924] ${focusRing}`;

const headingStyle =
  "mb-4 text-[13px] font-semibold uppercase tracking-[.18em]";

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
    <footer className="site-chrome rounded-t-[28px] bg-[#f26924] px-[5%] pb-6 pt-14 text-[#171717] lg:pt-20">
      <div className="grid grid-cols-2 items-start gap-x-8 gap-y-12 lg:flex lg:items-start lg:justify-between lg:gap-8">
        {/* Brand */}
        <div className="col-span-2 lg:w-[38%] lg:shrink-0">
          <Link
            href="/"
            aria-label="Legacy Sole home"
            className={`inline-flex flex-col rounded-sm transition-opacity hover:opacity-80 ${focusRing}`}
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
            <span className="text-[26px] font-bold leading-8 tracking-[.02em]">
              LEGACY SOLE
            </span>
            <span className="mt-1 text-[8px] leading-3 tracking-[.35em]">
              EVERY PAIR, A LEGACY.
            </span>
          </Link>

          <div className="my-5 h-px w-full max-w-72 bg-black/35" />

          <p className="max-w-md text-[14px] leading-6 text-black/80">
            Curated thrift footwear for those who value unique style, quality,
            and character. Discover original pre-loved pairs, carefully selected
            for Pakistan.
          </p>
        </div>

        {/* Shop */}
        <nav aria-label="Footer shop" className="shrink-0">
          <h2 className={headingStyle}>Shop</h2>
          <ul className="space-y-2.5 text-[14px] leading-5">
            {shopLinks.map(({ label, href }) => (
              <li key={label}>
                <Link href={href} className={linkStyle}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Customer Care */}
        <nav aria-label="Customer care" className="shrink-0">
          <h2 className={headingStyle}>Customer Care</h2>
          <ul className="space-y-2.5 text-[14px] leading-5">
            {careLinks.map(({ label, href }) => (
              <li key={label}>
                <Link href={href} className={linkStyle}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact + Social */}
        <div className="col-span-2 shrink-0 sm:col-span-1">
          <h2 className={headingStyle}>Contact Us</h2>
          <Link
            href={`tel:+${phone}`}
            className={`${linkStyle} inline-block text-[15px] font-medium leading-5`}
          >
            {displayPhone}
          </Link>

          <div className="my-6 h-px w-28 bg-black/45" />

          <h2 className={headingStyle}>Follow Us</h2>
          <div className="flex items-center gap-2.5">
            {socialIcons.map(({ label, Icon, href }) => (
              <Link
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={`Visit us on ${label}`}
                className={iconButtonStyle}
              >
                <Icon size={17} aria-hidden="true" />
              </Link>
            ))}
            <Link
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              aria-label="Chat on WhatsApp"
              className={iconButtonStyle}
            >
              <FaWhatsapp size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-14 border-t border-black/25 pt-5">
        <p className="text-center text-[12px] leading-5 text-black/75 sm:text-[13px]">
          © {new Date().getFullYear()} Legacy Sole. All rights reserved.
        </p>
      </div>
    </footer>
  );
}