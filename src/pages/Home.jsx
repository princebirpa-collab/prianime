import FeaturedTrendingCarousel from "@/components/home/FeaturedTrendingCarousel";
import ContinueWatching from "@/components/home/ContinueWatching";
import LiveCatalogue from "@/components/home/LiveCatalogue";
import AiringRadar from "@/components/home/AiringRadar";
import { Link } from "react-router-dom";
import { Gamepad2, Music2, Compass } from "lucide-react";
export default function Home(){return <main className="pri-simple-home pb-24"><section className="pri-home-hero-wrap"><FeaturedTrendingCarousel/></section><section className="pri-home-quicklinks"><Link to="/browse"><Compass/><span>Discover anime</span><small>Browse the catalogue</small></Link><Link to="/games"><Gamepad2/><span>Play</span><small>Anime quiz & games</small></Link><Link to="/music"><Music2/><span>Listen</span><small>Anime music</small></Link></section><div className="pri-home-main-content"><ContinueWatching/><section className="pri-home-heading-simple"><span>YOUR NEXT WATCH</span><h2>Find your <em>next favourite.</em></h2><p>Explore popular anime and discover something new.</p></section><LiveCatalogue/><section className="pri-home-airing-simple"><AiringRadar/></section></div></main>}