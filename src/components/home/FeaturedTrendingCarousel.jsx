import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Play, Star, Sparkles } from "lucide-react";
import { useAnimeList } from "@/hooks/useAnime";

export default function FeaturedTrendingCarousel() {
  const { items = [], loading, error } = useAnimeList({ action: "trending", perPage: 10 });
  const anime = useMemo(() => items.filter((item) => item?.id && item?.cover && item.status !== "NOT_YET_RELEASED").slice(0, 10), [items]);
  const [active, setActive] = useState(0);
  const featured = anime[active] || anime[0];
  const select = (index) => anime.length && setActive((index + anime.length) % anime.length);
  useEffect(() => { if (anime.length < 2) return; const timer = window.setInterval(() => setActive((v) => (v + 1) % anime.length), 8000); return () => window.clearInterval(timer); }, [anime.length]);
  useEffect(() => { if (active >= anime.length) setActive(0); }, [active, anime.length]);

  return (
    <section className="relative isolate w-full overflow-hidden rounded-[28px] border border-pink-300/10 bg-[#100a13]">
      {featured && <div className="absolute inset-0 -z-10"><img src={featured.banner || featured.cover} alt="" className="h-full w-full object-cover opacity-25 blur-[2px]"/><div className="absolute inset-0 bg-gradient-to-r from-[#100a13] via-[#100a13]/90 to-[#100a13]/30"/><div className="absolute inset-0 bg-gradient-to-t from-[#100a13] via-transparent to-[#100a13]/40"/><div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_35%,rgba(236,72,153,.22),transparent_55%)]"/></div>}
      <div className="relative mx-auto grid min-h-[620px] max-w-[1600px] grid-cols-1 items-center gap-8 px-5 py-10 sm:px-10 lg:grid-cols-[1.05fr_.95fr] lg:px-16 lg:py-14">
        <div className="order-2 flex flex-col items-start lg:order-1">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-pink-300/20 bg-pink-300/10 px-3 py-1.5 text-[10px] font-semibold tracking-[.22em] text-pink-200"><Sparkles className="h-3.5 w-3.5"/> PRI-ANIME · SPOTLIGHT</div>
          {error ? <p className="text-white/60">{String(error)}</p> : loading && !featured ? <p className="text-white/60">Loading spotlight…</p> : featured && <>
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-white/60"><span className="rounded-full border border-pink-300/30 px-3 py-1 text-pink-200">{featured.format || "ANIME"}</span>{featured.score && <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300"/> {(featured.score/10).toFixed(1)}</span>}{featured.episodes && <span>{featured.episodes} episodes</span>}{featured.startDate?.year && <span>{featured.startDate.year}</span>}</div>
            <h1 key={featured.id} className="max-w-2xl text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-6xl xl:text-7xl">{featured.display || featured.title || featured.name}</h1>
            <p className="mt-5 max-w-xl line-clamp-4 text-sm leading-7 text-white/65 sm:text-base">{featured.description || "Discover your next anime obsession."}</p>
            <div className="mt-7 flex flex-wrap items-center gap-3"><Link to={`/anime/${featured.id}`} className="inline-flex items-center gap-2 rounded-full bg-pink-300 px-6 py-3.5 text-sm font-bold text-[#190c17] shadow-lg shadow-pink-500/20 transition hover:bg-pink-200 hover:scale-[1.02]"><Play className="h-4 w-4 fill-current"/> Discover anime</Link><button onClick={()=>select(active-1)} className="rounded-full border border-white/15 bg-white/5 p-3 text-white transition hover:bg-white/10" aria-label="Previous"><ChevronLeft/></button><button onClick={()=>select(active+1)} className="rounded-full border border-white/15 bg-white/5 p-3 text-white transition hover:bg-white/10" aria-label="Next"><ChevronRight/></button><span className="text-xs tracking-widest text-white/40">{String(active+1).padStart(2,"0")} / {String(anime.length).padStart(2,"0")}</span></div>
          </>}
        </div>
        {featured && <div className="order-1 flex justify-center lg:order-2 lg:justify-end"><Link to={`/anime/${featured.id}`} key={featured.id} className="group relative w-full max-w-[360px] sm:max-w-[440px]"><div className="absolute -inset-5 rounded-[36px] bg-pink-500/15 blur-3xl transition group-hover:bg-pink-500/25"/><img src={featured.cover || featured.banner} alt={featured.display || featured.title || featured.name} loading="lazy" onError={(event) => { const image = event.currentTarget; if (featured.banner && image.src !== featured.banner) { image.src = featured.banner; } else { image.onerror = null; image.src = "/avatar-default.svg"; } }} className="relative aspect-[3/4] w-full rounded-[24px] object-cover shadow-2xl ring-1 ring-white/15 transition duration-700 group-hover:-translate-y-1 group-hover:rotate-1"/><div className="absolute inset-x-0 bottom-0 rounded-b-[24px] bg-gradient-to-t from-black/80 to-transparent p-5"><div className="text-xs font-semibold tracking-[.2em] text-pink-200">FEATURED PICK</div><div className="mt-1 line-clamp-2 text-lg font-bold text-white">{featured.display || featured.title || featured.name}</div></div></Link></div>}
      </div>
      {anime.length>0 && <div className="relative flex gap-3 overflow-x-auto border-t border-white/10 px-5 py-4 sm:px-10 lg:px-16">{anime.map((item,index)=><button key={item.id} onClick={()=>select(index)} className={`group flex shrink-0 items-center gap-2 rounded-xl border p-1.5 pr-3 transition ${active===index?"border-pink-300/60 bg-pink-300/10":"border-white/10 bg-white/[.03] opacity-60 hover:opacity-100"}`}><img src={item.cover || item.banner} alt={item.display || item.title || item.name || "Anime poster"} loading="lazy" onError={(event) => { const image = event.currentTarget; if (item.banner && image.src !== item.banner) { image.src = item.banner; } else { image.onerror = null; image.src = "/avatar-default.svg"; } }} className="h-14 w-10 rounded-lg object-cover"/><span className="max-w-[120px] text-left text-xs font-medium text-white/80 line-clamp-2">{item.display || item.title || item.name}</span></button>)}</div>}
    </section>
  );
}
