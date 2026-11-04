import { Link } from "react-router-dom";
import { ArrowUpRight, Play, Star, TrendingUp } from "lucide-react";
import { useAnimeList } from "@/hooks/useAnime";

export default function FeaturedTrendingCarousel() {
  const { items = [], loading, error } = useAnimeList({ action: "trending", perPage: 18 });
  const featured = items.find((item) => item?.id && item?.cover);

  return (
    <section className="relative isolate mx-auto my-5 w-full max-w-[1600px] overflow-hidden px-4 pt-5 sm:px-6 lg:px-10">
      <div className="relative min-h-[420px] overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#080808] text-white shadow-[0_28px_100px_rgba(0,0,0,.48)] sm:min-h-[520px]">
        {featured && <div aria-hidden="true" className="absolute inset-0 scale-105 bg-cover bg-center opacity-35 blur-[2px]" style={{ backgroundImage: `url("${featured.cover}")` }} />}
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.98)_0%,rgba(0,0,0,.88)_35%,rgba(0,0,0,.38)_72%,rgba(0,0,0,.72)_100%)]" />
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_78%_45%,rgba(255,255,255,.13),transparent_45%)]" />
        <div className="relative z-10 grid min-h-[420px] items-center gap-8 p-6 sm:min-h-[520px] sm:grid-cols-[1fr_330px] sm:px-12 sm:py-10 lg:grid-cols-[1fr_390px] lg:px-16">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.34em] text-white/65"><TrendingUp className="h-3.5 w-3.5"/> PRI-ANIME / LIVE CHART</p>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-6xl">Trending <span className="text-white/55">Anime.</span></h1>
            <p className="mt-4 max-w-lg text-sm leading-7 text-white/65">The anime everyone is watching right now. A live spotlight refreshed from the AniList trending catalogue.</p>
            {error ? <p className="mt-5 text-sm text-white/60">{error}</p> : loading || !featured ? <p className="mt-7 text-sm text-white/55">Loading live anime poster…</p> : (
              <>
                <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-white/65">
                  <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5">#1 Trending</span>
                  {featured.score ? <span className="inline-flex items-center gap-1.5"><Star className="h-3.5 w-3.5 fill-white text-white"/>{(featured.score/10).toFixed(1)} AniList</span> : null}
                </div>
                <h2 className="mt-4 max-w-xl font-display text-3xl leading-tight sm:text-4xl">{featured.display}</h2>
                <Link to={`/anime/${featured.id}`} className="mt-7 inline-flex items-center gap-3 rounded-full border border-white/25 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/85"><Play className="h-4 w-4 fill-current"/> Explore anime <ArrowUpRight className="h-4 w-4"/></Link>
              </>
            )}
          </div>
          {featured && <Link to={`/anime/${featured.id}`} className="group relative mx-auto block w-[190px] rotate-[2deg] overflow-hidden rounded-xl border border-white/35 bg-black shadow-[0_30px_80px_rgba(0,0,0,.8)] transition duration-500 hover:rotate-0 hover:scale-[1.025] sm:w-[260px] lg:w-[300px]">
            <img src={featured.cover} alt={featured.display} loading="eager" className="aspect-[2/3] w-full object-cover"/>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent p-4 pt-16">
              <p className="text-[9px] font-bold uppercase tracking-[.28em] text-white/70">Featured poster</p>
              <p className="mt-1 line-clamp-2 font-display text-xl text-white">{featured.display}</p>
            </div>
          </Link>}
        </div>
      </div>
    </section>
  );
}
