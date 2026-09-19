import Link from "next/link";
import { FiArrowUpRight, FiInstagram, FiFacebook } from "react-icons/fi";

const footerLinks = [
  { label: "Collections", href: "/#collections" },
  { label: "New Arrivals", href: "/#new-arrivals" },
  { label: "The Line-Up", href: "/#collection" },
  { label: "Our Story", href: "/#our-story" },
  { label: "Style Notes", href: "/#style-guide" },
  { label: "Track Order", href: "/track-order" },
];

export default function Footer() {
  return (
    <footer className="site-chrome bg-[#20211e] px-[5%] pb-6 pt-14 text-white lg:pt-18">
      <div className="grid gap-12 border-b border-white/10 pb-12 lg:grid-cols-[1fr_auto] lg:items-start lg:gap-20">
        <div>
          <Link
            href="/"
            aria-label="Legacy Sole home"
            className="inline-flex flex-col"
          >
            <div className="flex items-start">
              <span className="text-[38px] font-black leading-none tracking-[-2.4px] sm:text-[46px]">
                LEGACY SOLE
              </span>
              <span className="ml-1 mt-1 text-[9px] font-semibold text-white/55">
                ®
              </span>
            </div>

            <span className="mt-2 text-[8px] font-medium uppercase tracking-[0.45em] text-white/35">
              Everyday Footwear
            </span>
          </Link>

          <p className="mt-6 max-w-95 text-[12px] leading-6 text-white/45 sm:text-[13px]">
            Easy silhouettes, everyday comfort and pairs made to move naturally
            with the way you live.
          </p>

          <Link
            href="#collections"
            className="group mt-7 inline-flex items-center gap-3 text-[11px] font-medium text-white"
          >
            Explore the collection
            <FiArrowUpRight
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[220px_170px]">
          <div>
            <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/30">
              Explore
            </p>

            <nav aria-label="Footer navigation" className="mt-5 grid gap-3">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="w-fit text-[12px] text-white/55 transition-colors duration-300 hover:text-[#ed682c]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/30">
              Follow
            </p>

            <div className="mt-5 flex gap-2">
              <Link
                href="#"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/60 transition-all duration-300 hover:border-[#ed682c] hover:bg-[#ed682c] hover:text-white"
              >
                <FiInstagram size={15} />
              </Link>

              <Link
                href="#"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/60 transition-all duration-300 hover:border-[#ed682c] hover:bg-[#ed682c] hover:text-white"
              >
                <FiFacebook size={15} />
              </Link>
            </div>

            <p className="mt-7 max-w-45 text-[11px] leading-5 text-white/35">
              Follow the latest drops, styling notes and everyday favourites.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[9px] uppercase tracking-[0.16em] text-white/25">
          © {new Date().getFullYear()} Legacy Sole
        </p>

        <p className="text-[9px] uppercase tracking-[0.16em] text-white/25">
          Made for your everyday
        </p>
      </div>

      <div className="overflow-hidden border-t border-white/10 pt-4">
        <p className="select-none whitespace-nowrap text-center text-[clamp(54px,11vw,170px)] font-black leading-[0.8] tracking-[-0.08em] text-white/[0.035]">
          LEGACY SOLE
        </p>
      </div>
    </footer>
  );
}
