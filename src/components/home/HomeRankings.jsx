import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAnimeList } from "@/hooks/useAnime";

const panels = [
  { title: "Top Airing", body: { action: "trending", perPage: 25 }, filter: (x) => x.status === "RELEASING" },
  { title: "Most Popular", body: { action: "popular", perPage: 25 } },
  { title: "Most Favourite", body: { action: "top", perPage: 25 } },
  { title: "Latest Completed", body: { action: "popular", perPage: 25 }, filter: (x) => x.status === "FINISHED", sort: true },
];
function Panel({ panel }) {
  const { items = [], loading } = useAnimeList(panel.body);
  const list = useMemo(() => {
    let data = panel.filter ? items.filter(panel.filter) : items;
    if (panel.sort) data = data.sort((a,b) => (b.endDate?.year||0)-(a.endDate?.year||0) || (b.endDate?.month||0)-(a.endDate?.month||0));
    return data.slice(0,5);
  }, [items]);
  return <section className="rounded-2xl border border-white/[.10] bg-[#101014]/85 p-4 sm:p-5">
    <h3 className="mb-4 text-sm font-bold text-white">{panel.title}</h3>
    {loading && !items.length ? <div className="space-y-3">{Array.from({length:5},(_,i)=><div key={i} className="h-14 animate-pulse rounded bg-white/[.04]"/>)}</div> :
    <ol className="space-y-3">{list.map((anime,i)=><li key={anime.id} className="flex min-w-0 items-center gap-3">
      <span className="w-4 shrink-0 text-xs text-white/40">{i+1}</span>
      <Link to={`/anime/${anime.id}`} className="flex min-w-0 flex-1 items-center gap-3 group">
        <img src={anime.cover} alt="" loading="lazy" className="h-[62px] w-[46px] shrink-0 rounded-md object-cover"/>
        <span className="min-w-0"><span className="block line-clamp-2 text-xs font-semibold leading-5 text-white group-hover:text-rose-300">{anime.display}</span><span className="mt-1 block text-[10px] text-white/45">{anime.episodes ? `Episode count · ${anime.episodes}` : anime.format || "Anime"} {anime.score ? ` · ★ ${(anime.score/10).toFixed(1)}` : ""}</span></span>
      </Link>
    </li>)}</ol>}
    {!loading && !list.length && <p className="text-xs text-white/45">No titles available right now.</p>}
  </section>;
}
export default function HomeRankings() {
  return <section className="mx-auto w-full max-w-[1800px] px-4 pt-8 sm:px-6 lg:px-10"><div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">{panels.map((panel)=><Panel key={panel.title} panel={panel}/>)}</div></section>;
}