import FeaturedTrendingCarousel from "@/components/home/FeaturedTrendingCarousel";
import AiringRadar from "@/components/home/AiringRadar";
import ContinueWatching from "@/components/home/ContinueWatching";
import LiveCatalogue from "@/components/home/LiveCatalogue";
import RealmGrid from "@/components/home/RealmGrid";
import HomeRankings from "@/components/home/HomeRankings";

export default function Home() {
  return (
    <main className="pri-home pri-home-reborn pb-20">
      <div className="pri-home-ambient" aria-hidden="true" />
      <FeaturedTrendingCarousel />
      <HomeRankings />
      <div className="pri-home-content">
        <ContinueWatching />
        <div className="pri-home-section-intro pri-home-intro-reborn">
          <div className="pri-home-kicker"><span className="pri-home-dot" /> THE PRI-ANIME EXPERIENCE</div>
          <h2>One universe.<br/><span>Infinite stories.</span></h2>
          <p>Explore a world of anime, from timeless legends to the next big obsession.</p>
          <nav className="pri-home-shortcuts" aria-label="Homepage sections">
            <a href="#airing-radar">Airing radar <span>↗</span></a>
            <a href="#pri-realms">Explore genres <span>↗</span></a>
            <a href="#pri-catalogue">Full catalogue <span>↗</span></a>
          </nav>
        </div>
        <div id="pri-catalogue"><LiveCatalogue /></div>
        <div id="pri-realms"><RealmGrid /></div>
        <section id="airing-radar" className="pt-8">
          <AiringRadar />
        </section>
      </div>
    </main>
  );
}
