"use client";

import { useEffect } from "react";
import { rememberProduct } from "../_data/recently-viewed";

export default function RecentlyViewedTracker({ slug }: { slug: string }) {
  useEffect(() => {
    rememberProduct(slug);
  }, [slug]);

  return null;
}
