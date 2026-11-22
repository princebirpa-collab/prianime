import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Play, Star } from "lucide-react";
import { useAnimeList } from "@/hooks/useAnime";

export default function FeaturedTrendingCarousel() {
  const { items = [], loading, error } = useAnimeList({ action: "trending", perPage: 10 });
  const anime = useMemo(() => items.filter((item) => item?.id && item?.cover && item.status !== "NOT_YET_RELEASED").slice(0, 10), [items]);
  const [active, setActive] = useState(0);
  const featured = anime[active] || anime[0];
  const select = (index) => anime.length && setActive((index + anime.length) % anime.length);
  useEffect(() => {
    if (anime.length < 2) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % anime.length), 8000);
    return () => window.clearInterval(timer);
  }, [anime.length]);
  useEffect(() => { if (active >= anime.length) setActive(0); }, [active, anime.length]);

  return (
    <section className="pri-showcase relative isolate w-full overflow-hidden min-h-[680px] sm:min-h-[760px]">
      {featured && <div className="absolute inset-0 -z-10">
        <img src={featured.banner || featured.cover} alt="" className="h-full w-full object-cover object-center opacity-40 blur-[1px]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,5,10,.52),rgba(8,5,10,.7)_50%,#100710_100%)]"/>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(240,120,190,.16),transparent_58%)]"/>
      </div>}
      <div className="relative mx-auto flex min-h-[680px] max-w-[1600px] flex-col items-center px-4 pt-8 sm:min-h-[760px] sm:px-8 sm:pt-12">
        <div className="flex w-full items-center justify-between text-[10px] font-medium tracking-[.24em] text-white/60"><span className="text-sky-300">— FEATURED · {String(active+1).padStart(2,"0")}</span><span>{anime.length || 10} TOTAL</span></div>
        {error ? <p className="mt-24 text-sm text-white/60">{String(error)}</p> : loading && !featured ? <p className="mt-24 text-sm text-white/60">Loading featured anime…</p> : featured && <>
          <div className="pri-cover-deck relative mt-7 flex h-[270px] w-full max-w-[760px] items-center justify-center sm:mt-10 sm:h-[330px]">
            {anime.map((item,index) => {
              const delta = index-active;
              const visible = Math.abs(delta)<=3;
              return visible ? <Link key={item.id} to={`/anime/${item.id}`} aria-label={item.display || item.title} className={`pri-deck-card absolute block overflow-hidden rounded-2xl border border-white/20 shadow-2xl transition-all duration-700 ${delta===0?"z-20 h-[250px] w-[170px] sm:h-[330px] sm:w-[220px]":"z-10 h-[205px] w-[140px] sm:h-[270px] sm:w-[180px] opacity-65"}`} style={{transform:`translateX(${delta*78}px) rotate(${delta*8}deg) scale(${delta===0?1:0.88})`,zIndex:20-Math.abs(delta),opacity:delta===0?1:Math.max(.24,1-Math.abs(delta)*.22),filter:delta===0?"none":"brightness(.65)"}}>
                <img src={item.cover} alt="" loading="lazy" className="h-full w-full object-cover"/>
              </Link> : null;
            })}
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-[11px] tracking-wider text-white/60"><span className="rounded border border-sky-300/35 px-2 py-1 text-sky-300">{featured.format || "TV"}</span>{featured.score && <span><Star className="inline h-3 w-3 fill-rose-300 text-rose-300"/> {(featured.score/10).toFixed(1)}</span>}{featured.episodes && <span>{featured.episodes} EP</span>}{featured.startDate?.year && <span>{featured.startDate.year}</span>}</div>
          <h1 key={featured.id} className="mt-4 max-w-4xl text-center font-mono text-3xl font-bold leading-tight text-white sm:text-5xl">{featured.display || featured.title || featured.name}</h1>
          <p className="mt-3 max-w-2xl line-clamp-2 text-center text-sm text-white/55">{featured.description || "Explore the featured anime."}</p>
          <div className="mt-5 flex items-center gap-3"><Link to={`/anime/${featured.id}`} className="inline-flex items-center gap-2 rounded-full bg-rose-300 px-5 py-3 text-sm font-semibold text-black hover:bg-rose-200"><Play className="h-4 w-4 fill-current"/> Explore anime</Link><button onClick={()=>select(active-1)} className="rounded-full border border-white/25 p-3 text-white hover:bg-white/10" aria-label="Previous"><ChevronLeft/></button><button onClick={()=>select(active+1)} className="rounded-full border border-white/25 p-3 text-white hover:bg-white/10" aria-label="Next"><ChevronRight/></button></div>
          <div className="mt-6 flex max-w-full gap-2 overflow-x-auto pb-2">{anime.map((item,index)=><button key={item.id} onClick={()=>select(index)} className={`h-12 w-9 shrink-0 overflow-hidden rounded border transition ${active===index?"border-rose-300 ring-1 ring-rose-300/40":"border-white/15 opacity-55 hover:opacity-100"}`} aria-label={item.display || item.title}><img src={item.cover} alt="" className="h-full w-full object-cover"/></button>)}</div>
        </>}
      </div>
    </section>
  );
}
