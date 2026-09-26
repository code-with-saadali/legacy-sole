import Image from "next/image";

export default function Hero() {
  return (
    <section
      id="home"
      aria-labelledby="hero-title"
      className="relative overflow-hidden bg-[#F4F1E9] min-h-full lg:h-[calc(100svh-128px)] lg:min-h-140"
    >
      <h1 id="hero-title" className="sr-only">
        Legacy Sole ? Made for every single day.
      </h1>
      <Image
        width={1500}
        height={1500}
        src="/baner.jpeg"
        priority
        sizes="100vw"
        alt=""
        className="w-full"
      />
    </section>
  );
}
