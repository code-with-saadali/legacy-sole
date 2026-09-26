import Hero from "./_components/Hero";
import ShopByCategory from "./_components/ShopByCategory";
import NewArrivals from "./_components/NewArrivals";
import ProductLineup from "./_components/ProductLineup";
import ClassicFeature from "./_components/ClassicFeature";
import StyleGuide from "./_components/StyleGuide";
import RecentlyViewed from "./_components/RecentlyViewed";
import { pageMetadata, siteUrl, jsonLd } from "../lib/seo";

export const metadata = pageMetadata(
  "Legacy Sole | Shoes & Sneakers in Pakistan",
  "Shop sneakers, boots, formal shoes, gym and running footwear at Legacy Sole. Explore colours, available sizes and delivery across Pakistan.",
  "/",
);
export default function Home() {
  return (
    <main>
      {siteUrl && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Legacy Sole",
              url: siteUrl,
            }),
          }}
        />
      )}
      <Hero />
      <ShopByCategory />
      <NewArrivals />
      <ProductLineup />
      <ClassicFeature />
      <StyleGuide />
      <RecentlyViewed />
    </main>
  );
}
