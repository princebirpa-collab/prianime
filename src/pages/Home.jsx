import HeroSection from "@/components/home/HeroSection";
import ThemeRibbon from "@/components/home/ThemeRibbon";
import ContinueWatching from "@/components/home/ContinueWatching";
import LiveCatalogue from "@/components/home/LiveCatalogue";
import RealmGrid from "@/components/home/RealmGrid";
import ExperiencePanel from "@/components/home/ExperiencePanel";

export default function Home() {
  return (
    <div className="pb-8">
      <HeroSection />
      <ThemeRibbon />
      <ContinueWatching />
      <LiveCatalogue />
      <RealmGrid />
      <ExperiencePanel />
    </div>
  );
}

================================================================================
