"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import NavbarSearch from "./NavbarSearch";
import NavigationMenu from "./NavigationMenu";
import useCart from "../_hooks/useCart";
import {
  FiArrowUpRight,
  FiHeart,
  FiMenu,
  FiSearch,
  FiShoppingBag,
  FiX,
} from "react-icons/fi";
import Image from "next/image";

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { items } = useCart();
  const cartCount = items.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 18);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
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
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <>
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
          <div className="flex flex-1 items-center gap-2">
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="main-menu"
              onClick={() => {
                setSearchOpen(false);
                setMenuOpen((prev) => !prev);
              }}
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
              aria-expanded={searchOpen}
              aria-controls="product-search"
              onClick={() => {
                setMenuOpen(false);
                setSearchOpen((prev) => !prev);
              }}
              className="group flex h-10 w-10 items-center justify-center gap-2 rounded-full text-[#20211e] transition-all duration-300 hover:bg-white/60 sm:h-11 sm:w-auto sm:px-3"
            >
              <FiSearch
                size={18}
                className="transition-transform duration-300 group-hover:scale-105"
              />
              <span className="hidden text-lg sm:inline">
                Search
              </span>
            </button>
          </div>

          <Link
            href="/"
            onClick={closeMenu}
            aria-label="Legacy Sole home"
            className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2"
          >
            <Image width={110} height={50} src="/logo-black.svg" alt="" />
          </Link>

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
          </div>
        </div>
        {searchOpen && <NavbarSearch onClose={() => setSearchOpen(false)} />}
      </header>

      <NavigationMenu menuOpen={menuOpen} closeMenu={closeMenu} />
    </>
  );
}
