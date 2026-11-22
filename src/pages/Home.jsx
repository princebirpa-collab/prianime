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
        <div className="pri-home-discovery-grid">
          <div className="pri-home-discovery-main"><AiringRadar /></div>
          <aside className="pri-home-side-note">
            <span className="pri-home-side-icon">✦</span>
            <p className="pri-home-side-label">DISCOVER YOUR NEXT WORLD</p>
            <h3>Not sure<br/>what to watch?</h3>
            <p>Explore curated worlds, genre collections and seasonal picks.</p>
            <a href="#pri-realms">Explore realms <span>↗</span></a>
          </aside>
        </div>
        <ContinueWatching />
        <div id="pri-catalogue"><LiveCatalogue /></div>
        <div id="pri-realms"><RealmGrid /></div>
        <AiringRadar />
      </div>
    </main>
  );
}
