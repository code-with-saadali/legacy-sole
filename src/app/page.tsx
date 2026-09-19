import Hero from "./_components/Hero";
import ShopByCategory from "./_components/ShopByCategory";
import BestSellers from "./_components/BestSellers";
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
      <BestSellers />
      <BrandStory />
      <NewArrivals />
      <ProductLineup />
      <ClassicFeature />
      <StyleGuide />
    </main>
  );
}
