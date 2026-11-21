import FeaturedTrendingCarousel from "@/components/home/FeaturedTrendingCarousel";
import AiringRadar from "@/components/home/AiringRadar";
import ContinueWatching from "@/components/home/ContinueWatching";
import LiveCatalogue from "@/components/home/LiveCatalogue";
import RealmGrid from "@/components/home/RealmGrid";

export default function Home() {
  return (
    <div className="pb-8">
      <FeaturedTrendingCarousel />
      <AiringRadar />
      <ContinueWatching />
      <LiveCatalogue />
      <RealmGrid />
    </div>
  );
}
