import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Play, Star } from "lucide-react";
import { useAnimeList } from "@/hooks/useAnime";

export default function FeaturedTrendingCarousel() {
  const { items = [], loading, error } = useAnimeList({ action: "trending", perPage: 18 });
  const [active, setActive] = useState(0);
  const safeItems = useMemo(() => items.filter((item) => item?.id && item?.cover), [items]);
  const current = safeItems[active];
  const move = (direction) => setActive((index) => (index + direction + safeItems.length) % safeItems.length);

  return (
    <section className="relative isolate my-8 overflow-hidden rounded-[2rem] border border-white/10 bg-[#09070d] px-4 py-8 text-white shadow-[0_30px_100px_rgba(0,0,0,.38)] sm:px-8 sm:py-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_70%,rgba(225,54,105,.20),transparent_58%),linear-gradient(120deg,rgba(20,12,24,.96),rgba(5,5,10,.98))]" />
      <div className="mx-auto flex max-w-6xl items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.34em] text-rose-300">Featured / Live ranking</p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl">Trending anime</h2>
          <p className="mt-2 text-xs text-white/50 sm:text-sm">A rotating spotlight from the live AniList trending chart</p>
        </div>
        <Link to="/browse?sort=trending" className="hidden rounded-full border border-white/15 px-4 py-2 text-xs text-white/70 transition hover:border-rose-300/60 hover:text-white sm:block">View all</Link>
      </div>

      {error ? <p className="mx-auto mt-10 max-w-4xl rounded-xl border border-rose-300/20 bg-rose-400/10 p-4 text-sm text-white/70">{error}</p> : loading || !current ? (
        <div className="mt-8 flex h-[390px] items-center justify-center text-sm text-white/45">Loading trending titles…</div>
      ) : (
        <div className="relative mx-auto mt-8 flex h-[410px] max-w-5xl items-center justify-center overflow-hidden sm:h-[470px]">
          <div className="pointer-events-none absolute inset-x-0 bottom-2 h-28 bg-rose-500/10 blur-3xl" />
          {[-3,-2,-1,1,2,3].map((offset) => {
            const index = (active + offset + safeItems.length) % safeItems.length;
            const item = safeItems[index];
            const distance = Math.abs(offset);
            return (
              <button key={item.id} type="button" onClick={() => setActive(index)} aria-label={`Feature ${item.display}`}
                className="absolute top-1/2 hidden w-[150px] -translate-y-1/2 overflow-hidden rounded-2xl border border-white/15 bg-black/40 shadow-2xl transition-all duration-500 sm:block sm:w-[185px]"
                style={{ left: `calc(50% + ${offset * 13.5}%)`, transform: `translate(-50%,-50%) perspective(900px) rotateY(${offset < 0 ? 18 : -18}deg) scale(${1-distance*.13})`, opacity: distance === 3 ? .28 : distance === 2 ? .48 : .72, zIndex: 10-distance }}>
                <img src={item.cover} alt="" loading="lazy" className="aspect-[2/3] w-full object-cover" />
              </button>
            );
          })}
          <Link to={`/anime/${current.id}`} className="group absolute left-1/2 top-1/2 z-30 w-[190px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[1.35rem] border border-rose-200/50 bg-black shadow-[0_25px_80px_rgba(0,0,0,.7),0_0_45px_rgba(244,63,94,.22)] transition duration-500 hover:scale-[1.035] sm:w-[245px]">
            <img src={current.cover} alt={current.display} className="aspect-[2/3] w-full object-cover transition duration-700 group-hover:scale-105" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/75 to-transparent p-4 pt-16">
              <div className="mb-2 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.2em] text-rose-200"><span className="rounded-full border border-rose-200/30 px-2 py-1"># {active + 1} Trending</span>{current.score ? <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-amber-300 text-amber-300"/>{(current.score/10).toFixed(1)}</span> : null}</div>
              <h3 className="line-clamp-2 font-display text-lg leading-tight text-white sm:text-xl">{current.display}</h3>
              <span className="mt-3 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.18em] text-white/75"><Play className="h-3 w-3 fill-current"/> Explore anime</span>
            </div>
          </Link>
          <button type="button" onClick={() => move(-1)} aria-label="Previous trending anime" className="absolute left-0 top-1/2 z-40 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/55 text-white backdrop-blur transition hover:border-rose-300 hover:text-rose-200 sm:left-4"><ChevronLeft/></button>
          <button type="button" onClick={() => move(1)} aria-label="Next trending anime" className="absolute right-0 top-1/2 z-40 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/55 text-white backdrop-blur transition hover:border-rose-300 hover:text-rose-200 sm:right-4"><ChevronRight/></button>
          <div className="absolute bottom-0 left-1/2 z-40 flex -translate-x-1/2 gap-1.5">{safeItems.slice(0,Math.min(9,safeItems.length)).map((item,index)=><button key={item.id} onClick={()=>setActive(index)} aria-label={`Go to trending anime ${index+1}`} className={`h-1.5 rounded-full transition-all ${index===active ? "w-7 bg-rose-300" : "w-1.5 bg-white/30"}`}/>)}</div>
        </div>
      )}
    </section>
  );
}
