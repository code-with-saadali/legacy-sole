import type { Review } from "../_data/reviews";
import StarRating from "./StarRating";
import ProductImage from "./ProductImage";
export default function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="rounded-2xl border border-black/10 bg-[#F8F6F1] p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E9E2D7] text-sm font-medium"
          >
            {review.customer_name.slice(0, 1).toUpperCase()}
          </span>
          <div>
            <h3 className="break-words text-sm font-medium">
              {review.customer_name}
            </h3>
            {review.verified_purchase && (
              <span className="text-[10px] font-medium text-[#4b5a42]">
                Verified purchase
              </span>
            )}
            <time
              dateTime={review.created_at}
              className="mt-1 block text-xs text-black/45"
            >
              {new Date(review.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </time>
          </div>
        </div>
        <StarRating value={review.rating} />
      </div>
      <p className="mt-5 whitespace-pre-wrap break-words text-sm leading-7 text-black/65">
        {review.body}
      </p>
      {!!review.photos?.length && (
        <div className="mt-4 flex flex-wrap gap-2">
          {review.photos.map((photo, index) => (
            <a
              key={photo}
              href={photo}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open review photo ${index + 1}`}
              className="relative h-24 w-24 overflow-hidden rounded-xl"
            >
              <ProductImage
                src={photo}
                alt={`Customer photo of this pair, ${index + 1}`}
                fill
                sizes="96px"
                className="object-cover"
              />
            </a>
          ))}
        </div>
      )}
    </article>
  );
}
