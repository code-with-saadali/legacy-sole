const careSteps = [
  {
    number: "01",
    title: "Brush it off",
    description:
      "Use a soft, dry brush to lift away everyday dust before it settles in.",
  },
  {
    number: "02",
    title: "Keep it gentle",
    description:
      "Spot clean with a damp cloth. Skip the washing machine and harsh cleaners.",
  },
  {
    number: "03",
    title: "Let them breathe",
    description:
      "Air dry away from direct heat and rotate your pairs between wears.",
  },
];

export default function ShoeCare() {
  return (
    <section
      id="shoe-care"
      aria-labelledby="care-title"
      className="scroll-mt-28 bg-[#F7F4EE] px-[5%] py-16 lg:py-24"
    >
      <div className="mb-10 flex flex-col gap-6 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ed682c]" />

            <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-black/40 sm:text-[10px]">
              Shoe Care / Legacy Sole
            </p>
          </div>

          <h2
            id="care-title"
            className="mt-4 max-w-180 text-[clamp(40px,5vw,68px)] font-medium leading-[0.95] tracking-[-0.055em] text-[#20211e]"
          >
            Keep the pairs
            <br />
            <span className="font-serif font-normal italic text-[#ed682c]">
              you love going longer.
            </span>
          </h2>
        </div>

        <p className="max-w-[320px] text-[12px] leading-6 text-black/45 sm:text-[13px]">
          Three simple habits to help your everyday footwear stay clean,
          comfortable and ready to wear.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {careSteps.map(({ number, title, description }) => (
          <article
            key={number}
            className="group relative min-h-75 overflow-hidden rounded-[28px] border border-black/6 bg-[#ECE6DC] p-6 transition-all duration-500 hover:-translate-y-1 hover:bg-[#E8E1D6] lg:min-h-85 lg:rounded-4xl lg:p-7"
          >
            <span className="pointer-events-none absolute -right-3 -top-8 text-[110px] font-semibold leading-none tracking-[-0.08em] text-black/2.5 lg:text-[140px]">
              {number}
            </span>

            <div className="relative z-10 flex h-full flex-col">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-[#F7F4EE] text-[10px] font-medium text-[#ed682c]">
                  {number}
                </span>

                <span className="h-px w-10 bg-black/15 transition-all duration-300 group-hover:w-16 group-hover:bg-[#ed682c]" />
              </div>

              <div className="mt-auto pt-16">
                <h3 className="text-[24px] font-medium tracking-[-0.04em] text-[#20211e] lg:text-[27px]">
                  {title}
                </h3>

                <p className="mt-4 max-w-77.5 text-[12px] leading-6 text-black/45">
                  {description}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-black/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[9px] uppercase tracking-[0.18em] text-black/30">
          Legacy Sole / Care Guide
        </p>

        <p className="text-[10px] text-black/35">Gentle care. Better wear.</p>
      </div>
    </section>
  );
}
