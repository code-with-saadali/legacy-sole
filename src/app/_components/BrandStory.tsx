import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";

const principles = [
  {
    number: "01",
    title: "Easy to wear",
    text: "Clean shapes and versatile tones that fit naturally into your wardrobe.",
  },
  {
    number: "02",
    title: "Comfort first",
    text: "Thoughtful details made for long days, slow mornings and everything between.",
  },
  {
    number: "03",
    title: "Made your way",
    text: "Dress them up, keep them casual or wear them exactly how you like.",
  },
];

export default function BrandStory() {
  return (
    <section
      id="our-story"
      aria-labelledby="story-title"
      className="scroll-mt-28 bg-[#F4F1E9] px-[5%] py-16"
    >
      <div className="flex items-center justify-between border-b border-black/10 pb-5">
        <div className="flex items-center gap-3">
          <span className="h-1.5 w-1.5 rounded-full bg-[#ed682c]" />

          <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-black/40 sm:text-[10px]">
            Legacy Sole / Our Story
          </p>
        </div>

        <span className="hidden text-[9px] uppercase tracking-[0.18em] text-black/25 sm:block">
          Est. 2026
        </span>
      </div>

      <div className="grid gap-12 py-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-end lg:gap-24 lg:py-14">
        <div>
          <h2
            id="story-title"
            className="max-w-225 text-[clamp(48px,6.6vw,96px)] font-medium leading-[0.87] tracking-[-0.07em] text-[#20211e]"
          >
            The pair you
            <br />
            reach for
            <br />
            <span className="font-serif font-normal italic tracking-tighter text-[#ed682c]">
              without thinking.
            </span>
          </h2>
        </div>

        <div className="max-w-140 lg:pb-2">
          <p className="text-[18px] font-medium leading-[1.45] tracking-tight text-[#20211e] sm:text-[21px]">
            We believe the best footwear becomes part of your routine before you
            even notice it.
          </p>

          <p className="mt-4 max-w-125 text-[12px] leading-6 text-black/45 sm:text-[13px]">
            Familiar silhouettes, understated details and easy comfort —
            designed to work with real wardrobes and real days.
          </p>

          <Link
            href="#collection"
            className="group mt-7 inline-flex items-center gap-3 text-[11px] font-medium text-[#20211e]"
          >
            Discover the collection
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 transition-all duration-300 group-hover:border-[#ed682c] group-hover:bg-[#ed682c] group-hover:text-white">
              <FiArrowUpRight
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </span>
          </Link>
        </div>
      </div>

      <div className="grid border-y border-black/10 md:grid-cols-3">
        {principles.map(({ number, title, text }, index) => (
          <article
            key={number}
            className={`group py-7 md:px-7 lg:px-9 lg:py-9 ${index !== 0 ? "border-t border-black/10 md:border-l md:border-t-0" : ""}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-medium text-[#ed682c]">
                {number}
              </span>

              <span className="h-px w-8 bg-black/10 transition-all duration-300 group-hover:w-12 group-hover:bg-[#ed682c]" />
            </div>

            <h3 className="mt-7 text-[19px] font-medium tracking-[-0.035em] text-[#20211e] sm:text-[21px]">
              {title}
            </h3>

            <p className="mt-3 max-w-[320px] text-[11px] leading-6 text-black/40 sm:text-[12px]">
              {text}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
