import Link from "next/link";
import Image from "next/image";
import {
  FiArrowUpRight,
  FiBox,
  FiShoppingBag,
  FiPackage,
  FiUsers,
  FiSettings,
} from "react-icons/fi";

export type AdminTab = "Overview" | "Orders" | "Products" | "Customers" | "Settings";

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
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-black/10 bg-[#20211e] px-6 py-8 text-white lg:flex lg:flex-col">
        <Link href="/" className="border-b border-white/10 pb-8">
          <Image
            width={110}
            height={50}
            src="/logo-white.svg"
            alt="Legacy Sole home"
          />
          <span className="mt-2 block text-[9px] uppercase tracking-[0.24em] text-white/35">
            Admin workspace
          </span>
        </Link>
        <p className="mt-10 text-[9px] uppercase tracking-[0.2em] text-white/30">
          Manage store
        </p>
        <nav className="mt-4 space-y-2" aria-label="Dashboard sections">
          {(["Overview", "Orders", "Products", "Customers", "Settings"] as AdminTab[]).map((item) => {
            const Icon =
              item === "Overview"
                ? FiBox
                : item === "Orders"
                  ? FiShoppingBag
                  : item === "Customers" ? FiUsers : item === "Settings" ? FiSettings : FiPackage;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                aria-current={tab === item ? "page" : undefined}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-[11px] font-medium uppercase tracking-[0.12em] transition-colors ${tab === item ? "bg-[#E9E2D7] text-[#20211e]" : "text-white/50 hover:bg-white/5 hover:text-white"}`}
              >
                <Icon size={16} /> {item}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-white/10 pt-6">
          <p className="text-[9px] uppercase tracking-[0.18em] text-white/30">
            Live connection
          </p>
          <p className="mt-2 flex items-center gap-2 text-xs text-white/70">
            <span
              className={`h-1.5 w-1.5 rounded-full ${connection === "Live" ? "bg-[#ed682c]" : "bg-amber-400"}`}
            />{" "}
            {connection === "Live" ? "Supabase connected" : connection}
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-white/45 hover:text-white"
          >
            View storefront <FiArrowUpRight size={13} />
          </Link>
        </div>
      </aside>
      <div className="border-b border-black/10 bg-[#20211e] px-5 pb-4 pt-6 pr-28 text-white lg:hidden">
        <div className="flex items-center justify-between">
          <span className="text-sm font-black tracking-[-0.8px]">
            LEGACY SOLE
          </span>
          <span className="text-[9px] uppercase tracking-[0.16em] text-white/45">
            Admin workspace
          </span>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {(["Overview", "Orders", "Products", "Customers", "Settings"] as AdminTab[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              aria-current={tab === item ? "page" : undefined}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-[10px] uppercase tracking-[0.1em] ${tab === item ? "bg-[#E9E2D7] text-[#20211e]" : "text-white/50"}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
