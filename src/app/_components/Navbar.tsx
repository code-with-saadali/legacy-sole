"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiArrowUpRight,
  FiHeart,
  FiMenu,
  FiSearch,
  FiShoppingBag,
  FiUser,
  FiX,
} from "react-icons/fi";

const menuColumns = [
  {
    title: "Shop",
    caption: "Explore all footwear",
    links: [
      { label: "Running", href: "/shop?category=Running" },
      { label: "Casual", href: "/shop?category=Everyday" },
      { label: "Boots", href: "/shop?category=Boots" },
      { label: "Sneakers", href: "/shop?category=Sneakers" },
      { label: "View All", href: "/shop" },
    ],
  },
  {
    title: "Collections",
    caption: "Curated seasonal edits",
    links: [
      { label: "New Season", href: "/#collections" },
      { label: "Best Sellers", href: "/#best-sellers" },
      { label: "Essentials", href: "/#essentials" },
      { label: "Limited Edition", href: "/#limited" },
    ],
  },
  {
    title: "Shoes",
    caption: "Find your everyday pair",
    links: [
      { label: "Sneakers", href: "/shop?category=Sneakers" },
      { label: "Running", href: "/shop?category=Running" },
      { label: "Boots", href: "/shop?category=Boots" },
      { label: "Everyday", href: "/shop?category=Everyday" },
    ],
  },
  {
    title: "Discover",
    caption: "More from Legacy Sole",
    links: [
      { label: "New Arrivals", href: "/#new-arrivals" },
      { label: "Best Sellers", href: "/#best-sellers" },
      { label: "The Line-Up", href: "/#collection" },
      { label: "Shoe Care", href: "/#shoe-care" },
    ],
  },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 18);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    document.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    const updateCartCount = () => {
      try {
        const stored = window.localStorage.getItem("legacy-sole-cart");
        const items = stored ? JSON.parse(stored) : [];

        setCartCount(
          items.reduce(
            (
              total: number,
              item: {
                quantity?: number;
              }
            ) => total + (item.quantity ?? 0),
            0
          )
        );
      } catch {
        setCartCount(0);
      }
    };

    updateCartCount();

    window.addEventListener("cart-updated", updateCartCount);

    return () => {
      window.removeEventListener("cart-updated", updateCartCount);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <>
      {/* =====================================================
          TOP ANNOUNCEMENT BAR
      ===================================================== */}
      <div className="site-chrome relative z-70 bg-[#11110f]">
        <div className="mx-auto flex min-h-10 items-center justify-center px-5 sm:justify-between sm:px-[5%]">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/85 sm:text-[11px]">
            Good Shoes. Great Days.
          </p>

          <Link
            href="/#new-arrivals"
            className="group hidden items-center gap-2 text-[11px] font-medium text-white/50 transition-colors duration-300 hover:text-white sm:flex"
          >
            New season styles now available

            <FiArrowUpRight
              size={13}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>
      </div>

      {/* =====================================================
          NAVBAR
      ===================================================== */}
      <header
        className={`site-chrome sticky top-0 z-70 w-full transition-all duration-500 ${
          menuOpen
            ? "bg-[#F4F1E9] shadow-none"
            : scrolled
              ? "bg-[#F4F1E9]/95 shadow-[0_10px_35px_rgba(0,0,0,0.045)] backdrop-blur-xl"
              : "bg-[#F4F1E9]"
        }`}
      >
        <div
          className={`relative mx-auto flex items-center justify-between px-[5%] transition-all duration-500 ${
            scrolled ? "h-18 lg:h-19.5" : "h-19.5 lg:h-22"
          }`}
        >
          {/* LEFT */}
          <div className="flex flex-1 items-center gap-2">
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="main-menu"
              onClick={() => setMenuOpen((prev) => !prev)}
              className={`group flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 sm:h-11 sm:w-11 ${
                menuOpen
                  ? "border-black/15 bg-[#20211e] text-white shadow-[0_8px_20px_rgba(0,0,0,0.14)]"
                  : "border-black/8 bg-white/45 text-[#20211e] hover:border-black/[0.14] hover:bg-white"
              }`}
            >
              {menuOpen ? (
                <FiX
                  size={18}
                  className="transition-transform duration-300 group-hover:rotate-90"
                />
              ) : (
                <FiMenu size={18} />
              )}
            </button>

            <button
              type="button"
              aria-label="Search"
              className="group flex h-10 w-10 items-center justify-center rounded-full text-[#20211e] transition-all duration-300 hover:bg-white/60 sm:h-11 sm:w-11"
            >
              <FiSearch
                size={18}
                className="transition-transform duration-300 group-hover:scale-105"
              />
            </button>
          </div>

          {/* CENTER LOGO */}
          <Link
            href="/"
            onClick={closeMenu}
            aria-label="Legacy Sole home"
            className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-start whitespace-nowrap"
          >
            <span className="text-[24px] font-black leading-none tracking-[-1.7px] text-[#20211e] sm:text-[31px] lg:text-[33px]">
              LEGACY SOLE
            </span>

            <span className="ml-1 mt-0.5 text-[8px] font-semibold text-[#20211e]">
              ®
            </span>
          </Link>

          {/* RIGHT */}
          <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2">
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="group hidden h-10 w-10 items-center justify-center rounded-full text-[#20211e] transition-all duration-300 hover:bg-white/60 sm:flex sm:h-11 sm:w-11"
            >
              <FiHeart
                size={18}
                className="transition-all duration-300 group-hover:scale-105 group-hover:text-[#b66b4d]"
              />
            </Link>

            <Link
              href="/cart"
              aria-label="Shopping bag"
              className="group relative flex h-10 w-10 items-center justify-center rounded-full text-[#20211e] transition-all duration-300 hover:bg-white/60 sm:h-11 sm:w-11"
            >
              <FiShoppingBag
                size={18}
                className="transition-transform duration-300 group-hover:scale-105"
              />

              <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#b66b4d] px-1 text-[8px] font-semibold leading-none text-white">
                {cartCount}
              </span>
            </Link>

            <Link
              href="/account"
              aria-label="Account"
              className="group hidden h-10 w-10 items-center justify-center rounded-full text-[#20211e] transition-all duration-300 hover:bg-white/60 sm:flex sm:h-11 sm:w-11"
            >
              <FiUser
                size={18}
                className="transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
          </div>
        </div>
      </header>

      {/* =====================================================
          BACKDROP
      ===================================================== */}
      <div
        onClick={closeMenu}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-[#0e0e0c]/35 backdrop-blur-xs transition-all duration-500 ${
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* =====================================================
          PREMIUM MEGA MENU
      ===================================================== */}
      <div
        id="main-menu"
        role="dialog"
        aria-modal="true"
        aria-hidden={!menuOpen}
        className={`fixed inset-x-3 top-31 z-50 mx-auto w-auto max-w-365 origin-top overflow-hidden rounded-[22px] border border-black/5.5 bg-[#F4F1E9] shadow-[0_40px_120px_rgba(0,0,0,0.22)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:inset-x-6 sm:top-32 lg:top-34.5 ${
          menuOpen
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-3 scale-[0.985] opacity-0"
        }`}
        style={{
          maxHeight: "calc(100dvh - 150px)",
        }}
      >
        {/* ===================================================
            SCROLLABLE CONTENT
        =================================================== */}
        <div className="scrollbar-hidden relative max-h-[calc(100dvh-150px)] overflow-y-auto overscroll-contain">
          {/* AMBIENT BACKGROUND */}
          <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-white/70 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-20 right-10 h-64 w-64 rounded-full bg-[#e7ddd1]/60 blur-3xl" />

          {/* TOP LINE */}
          <div className="absolute left-0 top-0 h-px w-full bg-black/8" />

          <div
            className={`absolute left-6 top-0 h-0.5 bg-[#20211e] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:left-8 ${
              menuOpen ? "w-16" : "w-0"
            }`}
          />

          {/* =================================================
              TOP INFO AREA
          ================================================= */}
          <div
            className={`relative flex items-start justify-between gap-5 border-b border-black/[0.07] px-5 pb-5 pt-6 transition-all duration-500 sm:px-7 sm:pb-6 sm:pt-7 lg:px-10 lg:pb-7 lg:pt-8 ${
              menuOpen
                ? "translate-y-0 opacity-100"
                : "translate-y-3 opacity-0"
            }`}
          >
            <div className="max-w-xl">
              <div className="flex items-center gap-3">
                <span className="h-px w-5 bg-[#20211e]/35 sm:w-6" />

                <p className="text-[8px] font-medium uppercase tracking-[0.25em] text-black/35 sm:text-[9px]">
                  Explore Legacy Sole
                </p>
              </div>

              <h3 className="mt-2.5 text-[20px] font-medium tracking-[-0.035em] text-[#20211e] sm:text-[24px] lg:text-[27px]">
                Find your next pair.
              </h3>

              <p className="mt-1.5 max-w-125 text-[11px] leading-5 text-black/45 sm:text-[12px] lg:text-[13px]">
                Everyday essentials, seasonal edits and timeless footwear
                designed to move with you.
              </p>
            </div>

            <button
              type="button"
              onClick={closeMenu}
              aria-label="Close menu"
              className="group flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/8 bg-white/65 text-black/55 shadow-[0_6px_18px_rgba(0,0,0,0.04)] transition-all duration-300 hover:border-black/15 hover:bg-[#20211e] hover:text-white sm:h-10 sm:w-10"
            >
              <FiX
                size={16}
                className="transition-transform duration-300 group-hover:rotate-90"
              />
            </button>
          </div>

          {/* =================================================
              MENU COLUMNS
          ================================================= */}
          <div className="relative grid grid-cols-2 gap-y-8 px-5 py-6 sm:px-7 sm:py-7 md:grid-cols-4 md:gap-y-0 lg:px-10 lg:py-8">
            {menuColumns.map((column, columnIndex) => (
              <div
                key={column.title}
                className={`relative min-w-0 transition-all duration-500 ${
                  columnIndex % 2 === 0
                    ? "pr-4"
                    : "border-l border-black/6 pl-4"
                } md:border-l md:border-black/[0.07] md:px-6 md:first:border-l-0 md:first:pl-0 md:last:pr-0 ${
                  menuOpen
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0"
                }`}
                style={{
                  transitionDelay: menuOpen
                    ? `${100 + columnIndex * 65}ms`
                    : "0ms",
                }}
              >
                {/* COLUMN HEADER */}
                <div className="mb-4 sm:mb-5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full border border-black/8 bg-white/45 px-1.5 text-[8px] font-medium tabular-nums text-black/35">
                      0{columnIndex + 1}
                    </span>

                    <h4 className="truncate text-[13px] font-semibold tracking-[-0.02em] text-[#252622] sm:text-[14px] lg:text-[15px]">
                      {column.title}
                    </h4>
                  </div>

                  <p className="mt-1.5 pl-7 text-[9px] leading-4 text-black/35 sm:text-[10px] lg:text-[11px]">
                    {column.caption}
                  </p>
                </div>

                {/* LINKS */}
                <div className="flex flex-col">
                  {column.links.map((item) => (
                    <Link
                      key={`${column.title}-${item.label}`}
                      href={item.href}
                      onClick={closeMenu}
                      className="group relative flex min-h-9 items-center justify-between gap-2 rounded-lg px-0 text-[12px] text-black/60 transition-all duration-300 hover:px-2 hover:text-black sm:text-[13px] lg:text-[14px]"
                    >
                      <span className="relative truncate">
                        {item.label}

                        <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#20211e] transition-all duration-300 group-hover:w-full" />
                      </span>

                      <FiArrowUpRight
                        size={12}
                        className="shrink-0 -translate-x-1 translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100"
                      />

                      <span className="pointer-events-none absolute inset-0 -z-10 rounded-lg bg-white/0 transition-colors duration-300 group-hover:bg-white/45" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* =================================================
              BOTTOM BAR
          ================================================= */}
          <div
            className={`relative flex flex-col gap-4 border-t border-black/[0.07] bg-[#ece7dd]/65 px-5 py-4 transition-all duration-500 sm:px-7 md:flex-row md:items-center md:justify-between lg:px-10 ${
              menuOpen
                ? "translate-y-0 opacity-100"
                : "translate-y-2 opacity-0"
            }`}
            style={{
              transitionDelay: menuOpen ? "320ms" : "0ms",
            }}
          >
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#20211e]" />

                <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-black/40 sm:text-[10px]">
                  Legacy Sole
                </p>
              </div>

              <span className="hidden h-3 w-px bg-black/10 sm:block" />

              <p className="text-[10px] text-black/45 sm:text-[11px]">
                Everyday comfort, refined.
              </p>

              <span className="hidden h-3 w-px bg-black/10 md:block" />

              <p className="hidden text-[11px] text-black/45 md:block">
                Based in Pakistan
              </p>
            </div>

            <Link
              href="/#new-arrivals"
              onClick={closeMenu}
              className="group inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-black/10 bg-white/50 px-4 py-2 text-[10px] font-medium text-[#20211e] transition-all duration-300 hover:border-black/20 hover:bg-[#20211e] hover:text-white sm:text-[11px]"
            >
              Discover new arrivals

              <FiArrowUpRight
                size={13}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}