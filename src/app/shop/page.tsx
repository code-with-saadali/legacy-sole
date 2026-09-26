import { pageMetadata } from "../../lib/seo";
import ShopClient from "../_components/ShopClient";
import RecentlyViewed from "../_components/RecentlyViewed";
import { Suspense } from "react";

export const metadata = pageMetadata(
  "The Shop | Legacy Sole",
  "Explore the Legacy Sole edit of everyday sneakers and runners.",
  "/shop",
);

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#F4F1E9] px-[5%] py-16" role="status">
          Loading shop...
        </main>
      }
    >
      <ShopClient />
      <RecentlyViewed />
    </Suspense>
  );
}
