import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Play, Star, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { useAnimeList } from "@/hooks/useAnime";

export default function FeaturedTrendingCarousel() {
  const { items = [], loading, error } = useAnimeList({ action: "trending", perPage: 20 });
  const anime = useMemo(() => {
    const today = new Date();
    return items.filter((item) => {
      if (!item?.id || !item?.cover || item.status === "NOT_YET_RELEASED") return false;
      const start = item.startDate;
      if (start?.year && start?.month && start?.day) {
        const release = new Date(Date.UTC(start.year, start.month - 1, start.day));
        if (release > today) return false;
      }
      return ["FINISHED", "RELEASING", "HIATUS", "CANCELLED"].includes(item.status);
    }).slice(0, 7);
  }, [items]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (anime.length < 2) return undefined;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % anime.length), 8000);
    return (
    <section className="relative isolate w-full overflow-hidden">
      {featured && (
        <div className="absolute inset-0">
          <img src={featured.banner || featured.cover} alt="" aria-hidden="true" className="h-full w-full scale-110 object-cover object-center opacity-45 blur-[2px]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,8,.98)_0%,rgba(5,5,8,.86)_36%,rgba(5,5,8,.34)_72%,rgba(5,5,8,.68)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,#050508_0%,transparent_42%,rgba(5,5,8,.18)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_40%,rgba(196,92,145,.22),transparent_48%)]" />
        </div>
      )}
      <div className="relative mx-auto grid min-h-[min(760px,88vh)] w-full max-w-[1800px] items-center gap-8 px-5 py-14 sm:grid-cols-[1fr_ minmax(280px,420px)] sm:px-10 lg:grid-cols-[1fr_460px] lg:px-20">
        <div className="relative z-10 max-w-3xl">
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.38em] text-white/65"><TrendingUp className="h-3.5 w-3.5"/> PRI-ANIME ORIGINALS <span className="text-rose-300">/</span> TRENDING NOW</p>
          <h1 className="mt-6 font-display text-5xl font-semibold leading-[.98] tracking-tight text-white sm:text-7xl lg:text-8xl">Stories that<br/><span className="text-rose-200">stay with you.</span></h1>
          {error ? <p className="mt-6 text-sm text-white/65">{error}</p> : loading || !featured ? <p className="mt-7 text-sm text-white/55">Curating the latest anime…</p> : (
            <>
              <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-white/65">
                <span className="rounded-full border border-white/20 bg-black/25 px-3 py-1.5">TRENDING #{active + 1}</span>
                {featured.score ? <span className="inline-flex items-center gap-1.5"><Star className="h-3.5 w-3.5 fill-rose-200 text-rose-200"/>{(featured.score/10).toFixed(1)} rating</span> : null}
                {featured.status === "RELEASING" ? <span className="rounded-full border border-emerald-300/30 px-3 py-1.5 text-emerald-200">NOW AIRING</span> : null}
              </div>
              <h2 key={featured.id} className="mt-5 max-w-2xl font-display text-4xl font-semibold leading-tight text-white sm:text-6xl">{featured.display}</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/65">{featured.description || "Discover the anime everyone is talking about."}</p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link to={`/anime/${featured.id}`} className="inline-flex items-center gap-3 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:bg-rose-100"><Play className="h-4 w-4 fill-current"/> Explore title <ArrowUpRight className="h-4 w-4"/></Link>
                <a href="#airing-radar" className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/25 px-6 py-3.5 text-sm text-white transition hover:bg-white/10">Airing schedule <ArrowUpRight className="h-4 w-4"/></a>
              </div>
            </>
          )}
        </div>
        {featured && (
          <div className="relative z-10 mx-auto w-full max-w-[min(78vw,390px)] sm:max-w-[340px] lg:max-w-[390px]">
            <Link key={featured.id} to={`/anime/${featured.id}`} className="group relative block overflow-hidden rounded-2xl border border-white/25 bg-black shadow-[0_35px_100px_rgba(0,0,0,.72)] transition duration-700 hover:-translate-y-2 hover:scale-[1.02]">
              <img src={featured.cover} alt={`${featured.display} poster`} loading="eager" className="aspect-[2/3] max-h-[590px] w-full object-cover"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/10"/>
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="text-[9px] font-semibold uppercase tracking-[.3em] text-rose-200/85">Featured selection · {active + 1}/{anime.length}</p>
                <p className="mt-2 font-display text-2xl text-white">{featured.display}</p>
              </div>
            </Link>
            <div className="mt-4 flex items-center justify-between text-[10px] tracking-[.24em] text-white/55">
              <button type="button" onClick={() => select(active - 1)} aria-label="Previous anime" className="rounded-full border border-white/20 p-2.5 text-white hover:bg-white/10"><ChevronLeft className="h-4 w-4"/></button>
              <span>DISCOVER · {String(active + 1).padStart(2,"0")} / {String(anime.length).padStart(2,"0")}</span>
              <button type="button" onClick={() => select(active + 1)} aria-label="Next anime" className="rounded-full border border-white/20 p-2.5 text-white hover:bg-white/10"><ChevronRight className="h-4 w-4"/></button>
            </div>
          </div>
        )}
      </div>
      {anime.length > 1 && (
        <div className="relative z-10 mx-auto flex w-full max-w-[1800px] items-center gap-3 overflow-x-auto px-5 pb-7 sm:px-10 lg:px-20">
          {anime.map((item,index) => (
            <button key={item.id} type="button" onClick={() => select(index)} aria-label={`Feature ${item.display}`} aria-current={active === index ? "true" : undefined} className={`group relative h-[76px] w-[54px] shrink-0 overflow-hidden rounded-lg border transition-all duration-500 sm:h-[92px] sm:w-[66px] ${active === index ? "border-rose-200 opacity-100 ring-2 ring-rose-200/30" : "border-white/15 opacity-55 hover:opacity-100"}`}>
              <img src={item.cover} alt="" loading="lazy" className="h-full w-full object-cover"/>
            </button>
          ))}
          <span className="ml-2 shrink-0 text-[9px] tracking-[.3em] text-white/40">TRENDING COLLECTION</span>
        </div>
      )}
    </section>
  );
}
