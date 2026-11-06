import FeaturedTrendingCarousel from "@/components/home/FeaturedTrendingCarousel";
import ThemeRibbon from "@/components/home/ThemeRibbon";
import AiringRadar from "@/components/home/AiringRadar";
import ContinueWatching from "@/components/home/ContinueWatching";
import LiveCatalogue from "@/components/home/LiveCatalogue";
import RealmGrid from "@/components/home/RealmGrid";
import ExperiencePanel from "@/components/home/ExperiencePanel";

export default function Home() {
  return (
    <div className="pb-8">
      <FeaturedTrendingCarousel />
      <ThemeRibbon />
      <AiringRadar />
      <ContinueWatching />
      <LiveCatalogue />
      <RealmGrid />
      <ExperiencePanel />
    </div>
  );
}
