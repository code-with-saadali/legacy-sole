import Hero from "./_components/Hero";
import Collections from "./_components/Collections";
import NewArrivals from "./_components/NewArrivals";
import ProductLineup from "./_components/ProductLineup";
import ClassicFeature from "./_components/ClassicFeature";
import ShoeCare from "./_components/ShoeCare";
import CallToAction from "./_components/CallToAction";
import BrandStory from "./_components/BrandStory";
import StyleGuide from "./_components/StyleGuide";
import Faq from "./_components/Faq";
import RecentlyViewed from "./_components/RecentlyViewed";

export default function Home() {
  return (
    <>
      <main id="home">
        <Hero />
        <Collections />
        <BrandStory />
        <NewArrivals />
        <ProductLineup />
        <ClassicFeature />
        <StyleGuide />
        <Faq />
        <ShoeCare />
        <CallToAction />
        <RecentlyViewed />
        </main>
    </>
  );
}
