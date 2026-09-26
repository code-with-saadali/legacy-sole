"use client";

type Props = {
  count: number;
  soundOn: boolean;
  onViewOrders: () => void;
  onToggleSound: () => void;
};

export default function AdminOrderNotifications({
  count,
  soundOn,
  onViewOrders,
  onToggleSound,
}: Props) {
  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white p-4">
      <p role="status" className="text-xs text-black/60">
        {count
          ? `${count} new orders received`
          : "Watching for new orders while this dashboard is open"}
      </p>
      <div className="flex flex-wrap gap-2">
        {count > 0 && (
          <button
            type="button"
            onClick={onViewOrders}
            className="rounded-full bg-[#20211e] px-4 py-2 text-xs text-white"
          >
            View new orders{" "}
            <span className="ml-2 rounded-full bg-[#4b5b40] px-2 py-0.5">
              {count}
            </span>
          </button>
        )}
        <button
          type="button"
          aria-pressed={soundOn}
          onClick={onToggleSound}
          className="rounded-full border border-black/15 px-4 py-2 text-xs"
        >
          Sound {soundOn ? "on" : "off"}
        </button>
      </div>
    </div>
  );
}
