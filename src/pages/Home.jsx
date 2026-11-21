import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import FeaturedTrendingCarousel from "@/components/home/FeaturedTrendingCarousel";
import AiringRadar from "@/components/home/AiringRadar";
import ContinueWatching from "@/components/home/ContinueWatching";
import LiveCatalogue from "@/components/home/LiveCatalogue";
import RealmGrid from "@/components/home/RealmGrid";

function ModernHero() {
  return <section className="pri-modern-hero">
    <div className="pri-hero-orb pri-hero-orb-a" /><div className="pri-hero-orb pri-hero-orb-b" />
    <div className="pri-hero-grid" />
    <div className="pri-hero-content"><span className="pri-hero-eyebrow"><Sparkles size={13}/> YOUR ANIME UNIVERSE</span>
      <h1>Find your next<br/><em>obsession.</em></h1>
      <p>Explore worlds, follow stories, and keep every journey in one place.</p>
      <div className="pri-hero-actions"><Link to="/browse" className="pri-hero-primary"><Play size={16} fill="currentColor"/> Explore anime <ArrowRight size={16}/></Link><Link to="/library" className="pri-hero-secondary">Open your library</Link></div>
      <div className="pri-hero-index"><span>01</span><span className="pri-hero-line"/><span>DISCOVER · TRACK · EXPLORE</span></div>
    </div>
    <div className="pri-hero-art" aria-hidden="true"><div className="pri-art-ring pri-ring-one"/><div className="pri-art-ring pri-ring-two"/><div className="pri-art-monogram">P<span>✦</span>A</div><div className="pri-art-label">PRI / ANIME</div></div>
  </section>;
}
export default function Home() {
  const [modern, setModern] = useState(() => { try { return localStorage.getItem("prianime-experience") !== "classic"; } catch { return true; } });
  useEffect(() => { const sync = () => { try { setModern(localStorage.getItem("prianime-experience") !== "classic"); } catch {} }; window.addEventListener("storage", sync); window.addEventListener("prianime-experience-change", sync); return () => { window.removeEventListener("storage", sync); window.removeEventListener("prianime-experience-change", sync); }; }, []);
  return <div className={modern ? "pri-modern-home pb-10" : "pb-8"}>{modern && <ModernHero/>}<FeaturedTrendingCarousel/><AiringRadar/><ContinueWatching/><LiveCatalogue/><RealmGrid/></div>;
}
