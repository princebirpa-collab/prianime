import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Play, Star, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { useAnimeList } from "@/hooks/useAnime";

export default function FeaturedTrendingCarousel() {
  const { items = [], loading, error } = useAnimeList({ action: "trending", perPage: 20 });
  const anime = useMemo(() => items.filter((item) => item?.id && item?.cover).slice(0, 7), [items]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (anime.length < 2) return undefined;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % anime.length), 8000);
    return () => window.clearInterval(timer);
  }, [anime.length]);

  useEffect(() => {
    if (active >= anime.length) setActive(0);
  }, [active, anime.length]);

  const featured = anime[active];
  const select = (index) => setActive((index + anime.length) % anime.length);

  return (
    <section className="relative isolate mx-auto my-5 w-full max-w-[1600px] overflow-hidden px-4 pt-5 sm:px-6 lg:px-10">
      <div className="relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#080808] text-white shadow-[0_28px_100px_rgba(0,0,0,.48)]">
        {featured && <div aria-hidden="true" className="absolute inset-0 scale-105 bg-cover bg-center opacity-35 blur-[2px] transition-all duration-1000" style={{ backgroundImage: `url("${featured.cover}")` }} />}
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.98)_0%,rgba(0,0,0,.88)_35%,rgba(0,0,0,.38)_72%,rgba(0,0,0,.72)_100%)]" />
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_78%_45%,rgba(255,255,255,.13),transparent_45%)]" />
        <div className="relative z-10 grid min-h-[430px] items-center gap-6 p-6 sm:min-h-[510px] sm:grid-cols-[1fr_300px] sm:px-12 sm:py-10 lg:grid-cols-[1fr_360px] lg:px-16">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.34em] text-white/65"><TrendingUp className="h-3.5 w-3.5"/> PRI-ANIME / TRENDING NOW</p>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-6xl">Trending <span className="text-white/55">Anime.</span></h1>
            <p className="mt-4 max-w-lg text-sm leading-7 text-white/65">Seven trending anime, rotating automatically every 8 seconds.</p>
            {error ? <p className="mt-5 text-sm text-white/60">{error}</p> : loading || !featured ? <p className="mt-7 text-sm text-white/55">Loading live anime posters…</p> : (
              <>
                <div className="mt-7 flex flex-wrap items-center gap-3 text-xs text-white/65">
                  <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5">#{active + 1} Trending</span>
                  {featured.score ? <span className="inline-flex items-center gap-1.5"><Star className="h-3.5 w-3.5 fill-white text-white"/>{(featured.score/10).toFixed(1)} AniList</span> : null}
                </div>
                <h2 key={featured.id} className="mt-4 max-w-xl animate-in fade-in slide-in-from-bottom-2 duration-500 font-display text-3xl leading-tight sm:text-4xl">{featured.display}</h2>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link to={`/anime/${featured.id}`} className="inline-flex items-center gap-3 rounded-full border border-white/25 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/85"><Play className="h-4 w-4 fill-current"/> Explore anime <ArrowUpRight className="h-4 w-4"/></Link>
                  <a href="#airing-radar" className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/30 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10">Airing schedule <ArrowUpRight className="h-4 w-4"/></a>
                </div>
              </>
            )}
          </div>
          {featured && <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[270px] lg:max-w-[310px]">
            <Link key={featured.id} to={`/anime/${featured.id}`} className="group relative mx-auto block overflow-hidden rounded-xl border border-white/35 bg-black shadow-[0_30px_80px_rgba(0,0,0,.8)] transition duration-700 hover:scale-[1.025]">
              <img src={featured.cover} alt={featured.display} loading="eager" className="aspect-[2/3] w-full object-cover"/>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent p-4 pt-16">
                <p className="text-[9px] font-bold uppercase tracking-[.28em] text-white/70">Featured poster · {active + 1}/7</p>
                <p className="mt-1 line-clamp-2 font-display text-xl text-white">{featured.display}</p>
              </div>
            </Link>
            <div className="mt-3 flex items-center justify-between">
              <button type="button" onClick={() => select(active - 1)} aria-label="Previous anime" className="rounded-full border border-white/20 p-2 text-white/80 hover:bg-white/10"><ChevronLeft className="h-4 w-4"/></button>
              <span className="text-[10px] tracking-[.25em] text-white/50">AUTO NEXT · 8 SEC</span>
              <button type="button" onClick={() => select(active + 1)} aria-label="Next anime" className="rounded-full border border-white/20 p-2 text-white/80 hover:bg-white/10"><ChevronRight className="h-4 w-4"/></button>
            </div>
          </div>}
        </div>
        {anime.length > 0 && <div className="relative z-10 grid grid-cols-4 gap-2 border-t border-white/10 bg-black/35 p-3 sm:grid-cols-7 sm:gap-3 sm:px-8 sm:py-4">
          {anime.map((item, index) => <button key={item.id} type="button" onClick={() => select(index)} aria-label={`Show trending anime ${index + 1}: ${item.display}`} aria-current={active === index ? "true" : undefined} className={`group relative overflow-hidden rounded-lg border transition-all duration-300 ${active === index ? "border-white shadow-[0_0_22px_rgba(255,255,255,.2)] opacity-100" : "border-white/10 opacity-55 hover:opacity-100"}`}>
            <img src={item.cover} alt={item.display} loading="lazy" className="aspect-[2/3] w-full object-cover transition duration-500 group-hover:scale-105"/>
            <span className="absolute inset-x-0 bottom-0 truncate bg-black/75 px-1.5 py-1 text-left text-[9px] text-white">{index + 1}. {item.display}</span>
          </button>)}
        </div>}
      </div>
    </section>
  );
}
