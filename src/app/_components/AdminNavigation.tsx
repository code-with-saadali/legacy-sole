import Link from "next/link";
import Image from "next/image";
import {
  FiArrowUpRight,
  FiTrendingUp,
  FiBox,
  FiShoppingBag,
  FiPackage,
  FiUsers,
  FiSettings,
} from "react-icons/fi";

export type AdminTab =
  "Overview" | "Orders" | "Products" | "Customers" | "Profit" | "Settings";

export default function AdminNavigation({
  tab,
  setTab,
  connection,
}: {
  tab: AdminTab;
  setTab: (tab: AdminTab) => void;
  connection: string;
}) {
  return (
    <>
      {" "}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-black/10 bg-white px-5 py-8 text-[#20211e] lg:flex lg:flex-col">
        <Link href="/" className="border-b border-black/8 pb-8">
          <Image
            width={110}
            height={50}
            src="/logo-black.svg"
            alt="Legacy Sole home"
          />
          <span className="mt-2 block text-[9px] uppercase tracking-[0.24em] text-black/45">
            Admin workspace
          </span>
        </Link>
        <p className="mt-10 text-[9px] uppercase tracking-[0.2em] text-black/45">
          Manage store
        </p>
        <nav className="mt-4 space-y-2" aria-label="Dashboard sections">
          {(
            [
              "Overview",
              "Orders",
              "Products",
              "Customers",
              "Profit",
              "Settings",
            ] as AdminTab[]
          ).map((item) => {
            const Icon =
              item === "Overview"
                ? FiBox
                : item === "Orders"
                  ? FiShoppingBag
                  : item === "Customers"
                    ? FiUsers
                    : item === "Settings"
                      ? FiSettings
                      : item === "Profit"
                        ? FiTrendingUp
                        : FiPackage;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                aria-current={tab === item ? "page" : undefined}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm font-medium transition-colors ${tab === item ? "bg-[#20211e] text-white" : "text-black/60 hover:bg-[#F4F3EF] hover:text-black"}`}
              >
                <Icon size={18} />{" "}
                {item === "Overview"
                  ? "Dashboard"
                  : item === "Products"
                    ? "Products & stock"
                    : item}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-black/8 pt-6">
          <p className="text-[9px] uppercase tracking-[0.18em] text-black/45">
            Store connection
          </p>
          <p className="mt-2 flex items-center gap-2 text-xs text-black/60">
            <span
              className={`h-1.5 w-1.5 rounded-full ${connection === "Live" ? "bg-emerald-500" : "bg-amber-400"}`}
            />{" "}
            {connection === "Live" ? "Connected" : connection}
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-black/60 hover:text-black"
          >
            View storefront <FiArrowUpRight size={13} />
          </Link>
        </div>
      </aside>
      <div className="border-b border-black/10 bg-white px-5 pb-4 pt-6 text-[#20211e] lg:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 pr-24">
          <span className="text-sm font-black tracking-[-0.8px]">
            LEGACY SOLE
          </span>
          <span className="text-[9px] uppercase tracking-[0.16em] text-black/45">
            Admin workspace
          </span>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {(
            [
              "Overview",
              "Orders",
              "Products",
              "Customers",
              "Profit",
              "Settings",
            ] as AdminTab[]
          ).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              aria-current={tab === item ? "page" : undefined}
              className={`min-h-11 shrink-0 rounded-xl px-4 py-2 text-xs font-medium ${tab === item ? "bg-[#20211e] text-white" : "bg-[#F4F3EF] text-black/60"}`}
            >
              {item === "Overview"
                ? "Dashboard"
                : item === "Products"
                  ? "Products & stock"
                  : item}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
