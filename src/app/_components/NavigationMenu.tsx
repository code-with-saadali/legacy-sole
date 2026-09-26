"use client";

import Link from "next/link";
import { FiArrowUpRight, FiX } from "react-icons/fi";
import { useStoreSettings } from "./StoreSettingsProvider";

export default function NavigationMenu({
  menuOpen,
  closeMenu,
}: {
  menuOpen: boolean;
  closeMenu: () => void;
}) {
  const { settings } = useStoreSettings();
  const menuColumns = settings.menu_columns;
  return (
    <>
      <div
        onClick={closeMenu}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-[#0e0e0c]/35 backdrop-blur-xs transition-all duration-500 ${
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      <div
        id="main-menu"
        role="dialog"
        aria-modal="true"
        aria-hidden={!menuOpen}
        aria-label="Main navigation"
        inert={!menuOpen}
        className={`fixed inset-x-3 top-31 z-50 mx-auto w-auto max-w-365 origin-top overflow-hidden rounded-[22px] border border-black/5.5 bg-[#F4F1E9] shadow-[0_40px_120px_rgba(0,0,0,0.22)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:inset-x-6 sm:top-32 lg:top-34.5 ${
          menuOpen
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-3 scale-[0.985] opacity-0"
        }`}
        style={{
          maxHeight: "calc(100dvh - 150px)",
        }}
      >
        <div className="[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0 relative max-h-[calc(100dvh-150px)] overflow-y-auto overscroll-contain">
          <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-white/70 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-20 right-10 h-64 w-64 rounded-full bg-[#e7ddd1]/60 blur-3xl" />

          <div className="absolute left-0 top-0 h-px w-full bg-black/8" />

          <div
            className={`absolute left-6 top-0 h-0.5 bg-[#20211e] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:left-8 ${
              menuOpen ? "w-16" : "w-0"
            }`}
          />

          <div
            className={`relative flex items-start justify-between gap-5 border-b border-black/[0.07] px-5 pb-5 pt-6 transition-all duration-500 sm:px-7 sm:pb-6 sm:pt-7 lg:px-10 lg:pb-7 lg:pt-8 ${
              menuOpen ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
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

          <div
            className={`relative flex flex-col gap-4 border-t border-black/[0.07] bg-[#ece7dd]/65 px-5 py-4 transition-all duration-500 sm:px-7 md:flex-row md:items-center md:justify-between lg:px-10 ${
              menuOpen ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
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
          </div>
        </div>
      </div>
    </>
  );
}
