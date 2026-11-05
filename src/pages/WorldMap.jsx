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
            <div className="relative mb-8 overflow-hidden rounded-3xl border border-rose-200/15 bg-[#090d13] p-6 sm:p-9">
              <div aria-hidden="true" className="absolute inset-0 opacity-70" style={{ backgroundImage: "radial-gradient(circle at 18% 25%,rgba(176,52,70,.3),transparent 28%),radial-gradient(circle at 82% 80%,rgba(186,132,63,.16),transparent 30%),linear-gradient(120deg,transparent 30%,rgba(255,255,255,.035),transparent 70%)" }} />
              <div className="relative"><div className="flex items-center gap-2 text-rose-200/80"><Compass className="h-4 w-4" /><span className="text-[10px] tracking-[.28em]">THE HUNTER'S ATLAS</span></div>
                <h2 className="mt-4 max-w-2xl font-display text-3xl text-white sm:text-5xl">Six realms. <span className="text-rose-200">One journey.</span></h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300/70">Follow the ember trail and uncover each universe, one region at a time.</p>
                <div className="mt-6 flex items-center gap-2 text-xs text-amber-200/80"><Flame className="h-4 w-4" /> Scroll to reveal the map <Sparkles className="h-4 w-4" /></div>
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2">{worlds.map((world, index) => <RevealCard key={world.name} world={world} index={index} />)}</div>
          </>
        )}
      </div>
    </div>
  );
}
