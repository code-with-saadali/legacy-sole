import Hero from "./_components/Hero";
import RecentlyViewed from "./_components/RecentlyViewed";
import ShopByCategory from "./_components/ShopByCategory";
import NewArrivals from "./_components/NewArrivals";
import ProductLineup from "./_components/ProductLineup";
import ClassicFeature from "./_components/ClassicFeature";
import BrandStory from "./_components/BrandStory";
import StyleGuide from "./_components/StyleGuide";

export default function Home() {
  return (
    <main>
      <Hero />
      <ShopByCategory />
      <BrandStory />
      <NewArrivals />
      <ProductLineup />
      <ClassicFeature />
      <StyleGuide />
      <RecentlyViewed />
    </main>
  );
}
