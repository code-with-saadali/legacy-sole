"use client";

import { useEffect } from "react";
import { rememberProduct } from "./RecentlyViewed";

export default function RecentlyViewedTracker({ slug }: { slug: string }) {
  useEffect(() => {
    rememberProduct(slug);
  }, [slug]);

  return null;
}
