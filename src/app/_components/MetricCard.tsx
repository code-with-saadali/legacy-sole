"use client";

import type { IconType } from "react-icons";

type Props = {
  label: string;
  value: string;
  icon: IconType;
  note: string;
};

export default function MetricCard({ label, value, icon, note }: Props) {
  const Icon = icon;
  return (
    <div className="admin-metric min-w-0 rounded-[28px] border border-black/[0.06] bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.16em] text-black/45">
          {label}
        </p>
        <span className="rounded-xl bg-[#E9E2D7] p-2.5">
          <Icon className="text-[#b66b4d]" size={17} />
        </span>
      </div>
      <p className="mt-5 break-words text-2xl font-semibold tracking-tight text-[#20211e]">
        {value}
      </p>
      <p className="mt-2 text-[11px] text-black/40">{note}</p>
    </div>
  );
}
