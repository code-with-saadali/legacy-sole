"use client";

import Lenis from "lenis";
import { useEffect } from "react";

export default function LenisScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      autoResize: true,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
    });

    let rafId = 0;

    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };

    const pause = () => {
      lenis.stop();
    };

    const resume = () => {
      lenis.start();
      lenis.resize();
    };

    const handleVisibility = () => {
      if (!document.hidden) {
        lenis.start();
        lenis.resize();
      }
    };

    const handlePageShow = () => {
      lenis.start();
      lenis.resize();
    };

    window.addEventListener("store-menu-open", pause);
    window.addEventListener("store-menu-close", resume);
    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibility);

    rafId = requestAnimationFrame(raf);

    return () => {
      window.removeEventListener("store-menu-open", pause);
      window.removeEventListener("store-menu-close", resume);
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibility);

      cancelAnimationFrame(rafId);

      lenis.stop();
      lenis.destroy();
    };
  }, []);

  return null;
}