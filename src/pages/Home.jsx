import FeaturedTrendingCarousel from "@/components/home/FeaturedTrendingCarousel";
import AiringRadar from "@/components/home/AiringRadar";
import ContinueWatching from "@/components/home/ContinueWatching";
import LiveCatalogue from "@/components/home/LiveCatalogue";
import RealmGrid from "@/components/home/RealmGrid";

export default function Home() {
  return (
    <main className="pri-home pb-12">
      <div className="pri-home-ambient" aria-hidden="true" />
      <FeaturedTrendingCarousel />
      <div className="pri-home-content">
        <div className="pri-home-section-intro">
          <div className="pri-home-kicker"><span className="pri-home-dot" /> YOUR ANIME UNIVERSE</div>
          <h2>Find your <span>next obsession.</span></h2>
          <p>Fresh discoveries, returning favorites, and stories worth staying up for.</p>
        </div>
        <AiringRadar />
        <ContinueWatching />
        <LiveCatalogue />
        <RealmGrid />
      </div>
    </main>
  );
}
