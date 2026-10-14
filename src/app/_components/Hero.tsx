"use client";

import Image from "./ProductImage";
import { useStoreSettings } from "./StoreSettingsProvider";

export default function Hero() {
  const { settings } = useStoreSettings();
  return (
    <section
      id="home"
      aria-labelledby="hero-title"
      className="relative aspect-[3172/1344] overflow-hidden bg-[#F4F1E9] lg:aspect-auto lg:h-[calc(100svh-112px)]"
    >
      <h1 id="hero-title" className="sr-only">
        Legacy Sole ? Made for every single day.
      </h1>
      <Image
        fill
        src={settings.hero_image || "/baner.jpeg"}
        priority
        sizes="100vw"
        alt=""
        className="object-contain lg:object-cover lg:object-center"
      />
    </section>
  );
}
