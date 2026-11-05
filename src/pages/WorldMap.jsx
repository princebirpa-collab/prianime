import { useEffect, useRef, useState } from "react";
import { Lock, Map, Compass, Sparkles, Flame, Mountain, Trees, Castle } from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import { useProfile } from "@/lib/profile";
import { communityRequest } from "@/lib/communityApi";

const worlds = [
  { name: "Demon Slayer", type: "Taisho-era fantasy", detail: "Follow a lantern-lit mountain trail through misty forests, ancient shrines and a moonlit fortress.", nodes: ["Mountain Pass", "Wisteria Valley", "Moonlit Citadel"], symbol: "刃" },
  { name: "Jujutsu Kaisen", type: "Cursed-energy universe", detail: "Explore a supernatural atlas of hidden schools, sealed districts and mysterious gateways.", nodes: ["Hidden Academy", "Shibuya Crossing", "Barrier District"], symbol: "呪" },
  { name: "Naruto", type: "Shinobi nations", detail: "Travel between forest villages, desert borders and legendary training grounds.", nodes: ["Leaf Village", "Sand Frontier", "Valley Shrine"], symbol: "忍" },
  { name: "Dragon Ball", type: "Cosmic martial arts", detail: "Journey from quiet mountain homes to distant worlds and celestial arenas.", nodes: ["Earth", "Namek Wilds", "Celestial Realm"], symbol: "龍" },
  { name: "Black Clover", type: "Magic kingdoms", detail: "Discover enchanted kingdoms, ancient groves and the routes of wandering mage squads.", nodes: ["Clover Capital", "Heart Grove", "Witchwood"], symbol: "魔" },
  { name: "Solo Leveling", type: "Hunter gates", detail: "Trace hunter outposts, mysterious portals and sealed depths beneath the city.", nodes: ["Hunter HQ", "Double Gate", "Shadow Depths"], symbol: "影" }
];

function RevealCard({ world, index }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || !("IntersectionObserver" in window)) { setVisible(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold: 0.14 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const icons = [Mountain, Trees, Castle];
  const Icon = icons[index % icons.length];
  return (
    <article ref={ref} style={{ transitionDelay: (index % 3) * 90 + "ms" }} className={"group relative isolate overflow-hidden rounded-3xl border border-white/10 bg-[#0c1017]/90 p-5 shadow-[0_18px_60px_rgba(0,0,0,.3)] transition-all duration-700 " + (visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0")}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_15%_10%,rgba(173,55,74,.24),transparent_55%),linear-gradient(145deg,rgba(255,255,255,.035),transparent_60%)]" />
      <div aria-hidden="true" className="absolute -right-5 -top-8 select-none font-display text-[130px] leading-none text-white/[.035] transition-transform duration-700 group-hover:rotate-6 group-hover:scale-110">{world.symbol}</div>
      <div className="flex items-center justify-between"><span className="text-[10px] tracking-[.25em] text-rose-300/80">{world.type.toUpperCase()}</span><Icon className="h-5 w-5 text-rose-200/70" /></div>
      <h2 className="mt-5 font-display text-2xl text-white">{world.name}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-300/70">{world.detail}</p>
      <div className="relative mt-6 flex flex-wrap items-center gap-2">
        {world.nodes.map((node) => <span key={node} className="inline-flex items-center gap-2 rounded-full border border-rose-200/15 bg-black/30 px-3 py-2 text-[11px] text-slate-200/80"><span className="h-1.5 w-1.5 rounded-full bg-rose-300 shadow-[0_0_10px_rgba(251,113,133,.8)]" />{node}</span>)}
      </div>
      <div aria-hidden="true" className="mt-5 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-rose-300/70 via-amber-200/30 to-transparent transition-transform duration-1000 group-hover:scale-x-100" />
    </article>
  );
}

export default function WorldMap() {
  const [profile] = useProfile();
  const [unlocked, setUnlocked] = useState(false);
  const [remaining, setRemaining] = useState(3);
  const [error, setError] = useState("");
  useEffect(() => {
    communityRequest("/bootstrap?profileId=" + encodeURIComponent(profile.id))
      .then((result) => { setUnlocked(result.missionCount >= 3); setRemaining(Math.max(0, 3 - result.missionCount)); })
      .catch((err) => setError(err.message));
  }, [profile.id]);
  return (
    <div className="pb-20">
      <PageHeader eyebrow="EXPLORE THE MULTIVERSE" title="Anime World Map" description="A cinematic atlas of connected worlds. Scroll to reveal each realm." />
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-10">
        {!unlocked ? (
          <div className="mx-auto max-w-xl rounded-3xl border border-primary/30 bg-card/60 p-8 text-center">
            <Lock className="mx-auto h-10 w-10 text-primary" /><h2 className="mt-4 font-display text-2xl">The atlas is sealed</h2>
            <p className="mt-2 text-sm text-muted-foreground">Complete {remaining} more missions to unlock all anime worlds.</p>
            <Link to="/missions" className="mt-5 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Open Hunter's Guild</Link>
            {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
          </div>
        ) : (
          <>
            <div className="group relative mb-8 isolate overflow-hidden rounded-[30px] border border-rose-200/20 bg-[#080711] p-5 shadow-[0_25px_90px_rgba(0,0,0,.55),0_0_55px_rgba(190,40,90,.12)] sm:p-9">
              <div aria-hidden="true" className="absolute inset-0 -z-10" style={{backgroundImage:"radial-gradient(ellipse at 12% 15%,rgba(190,40,90,.32),transparent 36%),radial-gradient(ellipse at 86% 80%,rgba(115,75,190,.25),transparent 38%),linear-gradient(135deg,rgba(255,255,255,.05),transparent 45%,rgba(245,158,11,.04))"}} />
              <div className="relative flex flex-wrap items-end justify-between gap-4"><div><div className="flex items-center gap-2 text-rose-200/80"><Compass className="h-4 w-4"/><span className="text-[10px] tracking-[.32em]">PRI-ANIME • MULTIVERSE ATLAS</span></div><h2 className="mt-4 font-display text-3xl text-white sm:text-5xl">Beyond the <span className="bg-gradient-to-r from-rose-200 via-fuchsia-200 to-amber-100 bg-clip-text text-transparent">known worlds.</span></h2><p className="mt-3 max-w-xl text-sm leading-6 text-slate-300/70">A hand-crafted realm chart. Trace the luminous paths and choose a universe to explore.</p></div><div className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-right backdrop-blur"><p className="text-[9px] tracking-[.24em] text-rose-200/70">DISCOVERED REALMS</p><p className="mt-1 font-display text-2xl text-white">06 <span className="text-xs text-slate-400">/ 06</span></p></div></div>
              <div className="relative mt-7 overflow-hidden rounded-2xl border border-white/10 bg-[#0c0b18]/80 p-2 sm:p-4">
                <svg viewBox="0 0 900 420" role="img" aria-label="Illustrated fantasy atlas connecting six anime-inspired realms" className="h-auto w-full">
                  <defs><linearGradient id="atlasTrail" x1="0" x2="1"><stop stopColor="#fb7185"/><stop offset=".5" stopColor="#c084fc"/><stop offset="1" stopColor="#fbbf24"/></linearGradient><radialGradient id="atlasLand"><stop stopColor="#4b315e"/><stop offset="1" stopColor="#171426"/></radialGradient><filter id="atlasGlow"><feGaussianBlur stdDeviation="5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
                  <path d="M60 145 115 85 225 65 285 95 350 55 455 75 520 48 625 90 710 68 830 145 805 250 735 300 650 280 575 355 470 330 390 375 275 320 190 345 105 275Z" fill="url(#atlasLand)" stroke="#a78bfa" strokeOpacity=".38" strokeWidth="2"/>
                  <path d="M90 205Q165 100 260 155T430 190T590 130T805 220M145 270Q260 210 350 260T535 250T735 285" fill="none" stroke="#c4b5fd" strokeOpacity=".14" strokeWidth="2"/>
                  <path d="M135 210Q220 95 330 145T485 235T650 135T775 235" fill="none" stroke="url(#atlasTrail)" strokeWidth="3" strokeDasharray="5 10" filter="url(#atlasGlow)"/>
                  {worlds.map((w,i)=>{const pts=[{x:135,y:210},{x:260,y:125},{x:390,y:255},{x:520,y:155},{x:650,y:135},{x:775,y:235}];const p=pts[i];return <g key={w.name}><circle cx={p.x} cy={p.y} r="34" fill={["#9f1239","#6d28d9","#b45309","#1d4ed8","#047857","#7c2d12"][i]} opacity=".34"/><circle cx={p.x} cy={p.y} r="13" fill="#120f20" stroke={["#fda4af","#c4b5fd","#fcd34d","#93c5fd","#6ee7b7","#fdba74"][i]} strokeWidth="3" filter="url(#atlasGlow)"/><text x={p.x} y={p.y+4} textAnchor="middle" fontSize="12" fill="#fff">{w.symbol}</text><text x={p.x} y={p.y+52} textAnchor="middle" fontSize="12" fill="#f8eaf0">{w.name}</text></g>})}
                  <g fill="#fbbf24" opacity=".65"><path d="m80 65 4 10 10 4-10 4-4 10-4-10-10-4 10-4Z"/><path d="m830 330 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z"/></g>
                </svg>
                <div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-2 text-[10px] tracking-[.15em] text-slate-400"><span>✦ THE EMBER ROUTE</span><span>6 WORLDS • 18 LOCATIONS</span></div>
              </div>
              <div className="relative mt-5 flex items-center gap-2 text-xs text-amber-100/80"><Flame className="h-4 w-4"/> Select a realm below to uncover its locations <Sparkles className="h-4 w-4"/></div>
            </div>
            <div className="grid gap-5 md:grid-cols-2">{worlds.map((world, index) => <RevealCard key={world.name} world={world} index={index} />)}</div>
          </>
        )}
      </div>
    </div>
  );
}
