"use client";
import { FiStar } from "react-icons/fi";
export default function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange?: (rating: number) => void;
}) {
  return (
    <div
      className="flex items-center gap-1"
      role={onChange ? "group" : "img"}
      aria-label={onChange ? "Choose your rating" : `${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) =>
        onChange ? (
          <button
            key={star}
            type="button"
            aria-label={`${star} ${star === 1 ? "star" : "stars"}`}
            aria-pressed={value === star}
            onClick={() => onChange(star)}
            className="rounded-lg p-2 text-[#b66b4d] transition hover:bg-[#E9E2D7] focus-visible:outline-2"
          >
            <FiStar size={23} className={star <= value ? "fill-current" : ""} />
          </button>
        ) : (
          <FiStar
            key={star}
            aria-hidden
            size={15}
            className={`text-[#b66b4d] ${star <= Math.round(value) ? "fill-current" : ""}`}
          />
        ),
      )}
    </div>
  );
}
