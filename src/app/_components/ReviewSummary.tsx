import type { Review } from "../_data/reviews";
import { reviewSummary } from "../_data/reviews";
import StarRating from "./StarRating";
export default function ReviewSummary({ reviews }: { reviews: Review[] }) {
  const { total, average, counts } = reviewSummary(reviews);
  return (
    <div className="rounded-3xl bg-[#20211e] p-6 text-white sm:p-8">
      <p className="text-xs uppercase tracking-[0.18em] text-white/50">
        Community rating
      </p>
      <div className="mt-5 flex items-end gap-3">
        <strong className="text-6xl font-medium tracking-tight">
          {total ? average.toFixed(1) : "—"}
        </strong>
        <span className="mb-2 text-sm text-white/45">/ 5</span>
      </div>
      <div className="mt-4">
        <StarRating value={average} />
      </div>
      <p className="mt-3 text-xs text-white/55">
        {total
          ? `Based on ${total} ${total === 1 ? "review" : "reviews"}`
          : "Be the first to share your experience"}
      </p>
      <div className="mt-7 space-y-3">
        {counts.map(({ rating, count }) => (
          <div key={rating} className="flex items-center gap-3 text-xs">
            <span className="w-3">{rating}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-[#d0a28c]"
                style={{ width: `${total ? (count / total) * 100 : 0}%` }}
              />
            </div>
            <span className="w-5 text-right text-white/45">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
