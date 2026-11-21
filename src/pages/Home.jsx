import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Play, Sparkles, Users, Trophy, BookOpen, Compass, Clapperboard, Radio, Wand2, Library, Flame } from "lucide-react";
import FeaturedTrendingCarousel from "@/components/home/FeaturedTrendingCarousel";
import AiringRadar from "@/components/home/AiringRadar";
import ContinueWatching from "@/components/home/ContinueWatching";
import LiveCatalogue from "@/components/home/LiveCatalogue";
import RealmGrid from "@/components/home/RealmGrid";

const features = [
 {title:"Explore Anime",desc:"Discover series, seasonal releases and hidden gems.",to:"/browse",icon:Compass,tag:"DISCOVERY"},
 {title:"Community",desc:"Find your people, share discussions and reactions.",to:"/community",icon:Users,tag:"SOCIAL"},
 {title:"Missions",desc:"Follow platform challenges and track your progress.",to:"/missions",icon:Trophy,tag:"PROGRESS"},
 {title:"Manhwa",desc:"Explore the reading side of your anime universe.",to:"/manhwa",icon:BookOpen,tag:"READ"},
 {title:"Reels",desc:"Short anime moments and creator content.",to:"/reels",icon:Clapperboard,tag:"CLIPS"},
 {title:"AI Studio",desc:"Explore creative tools and anime-inspired ideas.",to:"/studio",icon:Wand2,tag:"CREATE"},
 {title:"Watch Party",desc:"Plan shared viewing sessions with friends.",to:"/watch-party",icon:Radio,tag:"TOGETHER"},
 {title:"Your Library",desc:"Keep your favourites and personal collection together.",to:"/library",icon:Library,tag:"COLLECTION"}
];
function ModernHero(){return <section className="pri-modern-hero">
 <div className="pri-hero-orb pri-hero-orb-a"/><div className="pri-hero-orb pri-hero-orb-b"/><div className="pri-hero-grid"/>
 <div className="pri-hero-content"><span className="pri-hero-eyebrow"><Sparkles size={13}/> THE ANIME UNIVERSE</span><h1>Stories that<br/><em>stay with you.</em></h1>
 <p>Your space to discover anime, follow your journey, and connect with the fandom.</p>
 <div className="pri-hero-actions"><Link to="/browse" className="pri-hero-primary"><Play size={16} fill="currentColor"/> Explore anime <ArrowUpRight size={16}/></Link><Link to="/library" className="pri-hero-secondary">My collection</Link></div>
 <div className="pri-hero-index"><span>PRI / 01</span><span className="pri-hero-line"/><span>DISCOVER · TRACK · CONNECT</span></div></div>
 <div className="pri-hero-art" aria-hidden="true"><div className="pri-art-ring pri-ring-one"/><div className="pri-art-ring pri-ring-two"/><div className="pri-art-monogram">P<span>✦</span>A</div><div className="pri-art-label">PRI / ANIME</div></div>
 </section>}
function FeatureHub(){return <section className="pri-feature-hub"><div className="pri-section-heading"><div><span className="pri-hub-eyebrow"><Flame size={14}/> YOUR UNIVERSE</span><h2>Explore <em>everything.</em></h2></div><Link to="/browse" className="pri-hub-all">Explore catalogue <ArrowUpRight size={15}/></Link></div><div className="pri-feature-grid">{features.map(({title,desc,to,icon:Icon,tag})=><Link key={to} to={to} className="pri-feature-card"><span className="pri-feature-tag">{tag}</span><span className="pri-feature-icon"><Icon size={20}/></span><div><h3>{title}</h3><p>{desc}</p></div><ArrowUpRight className="pri-feature-arrow" size={17}/></Link>)}</div></section>}
export default function Home(){
 const [modern,setModern]=useState(()=>{try{return localStorage.getItem("prianime-experience")!=="classic"}catch{return true}});
 useEffect(()=>{const sync=()=>{try{setModern(localStorage.getItem("prianime-experience")!=="classic")}catch{}};window.addEventListener("storage",sync);window.addEventListener("prianime-experience-change",sync);return()=>{window.removeEventListener("storage",sync);window.removeEventListener("prianime-experience-change",sync)}},[]);
 return <div className={modern?"pri-modern-home pb-10":"pb-8"}>{modern&&<><ModernHero/><FeatureHub/></>}<FeaturedTrendingCarousel/><AiringRadar/><ContinueWatching/><LiveCatalogue/><RealmGrid/></div>;
}
