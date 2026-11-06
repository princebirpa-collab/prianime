import { Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAnimeDetail } from "@/hooks/useAnime";
import useAnimeSource from "@/components/video/useAnimeSource";
import AnimePlayback from "@/components/video/AnimePlayback";
import VidstuckSource from "@/components/video/VidstuckSource";
import JikanAnimePanel from "@/components/video/JikanAnimePanel";
import EmptyState from "@/components/common/EmptyState";

export default function AnimeScreening({ animeId }) {
  const anime = useAnimeDetail(animeId);
  const source = useAnimeSource(animeId);
  if (anime.loading || source.isPending) return <div role="status" className="grid min-h-[60vh] place-items-center"><span className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin text-primary" /> Matching anime playerâ€¦</span></div>;
  const error = anime.error || source.error?.message;
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-8 sm:px-6 lg:px-10">
      <nav className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
        <Link to={`/anime/${animeId}`} className="inline-flex items-center gap-2 hover:text-primary"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Anime details</Link>
        <Link to="/watch" className="hover:text-primary">All screenings</Link>
      </nav>
      {error ? <EmptyState title="The anime player could not be opened" body={error} actionLabel="Try again" onAction={() => { anime.reload(); source.refetch(); }} /> : <>
        <header><p className="text-[11px] uppercase tracking-[0.26em] text-primary">Anime theatre</p><h1 className="mt-2 font-display text-3xl sm:text-4xl">{anime.item?.display}</h1></header>
        {source.data && anime.item ? <AnimePlayback anime={anime.item} match={source.data} /> : <>
          <EmptyState title="No verified TMDB match found" body="This anime is not yet linked to a TMDB title. No unrelated stream has been substituted." />
          <a href={`https://www.themoviedb.org/search?query=${encodeURIComponent(anime.item?.display || "")}`} target="_blank" rel="noopener noreferrer" className="inline-block text-sm text-primary hover:underline">Search for this anime on TMDB</a>
          <VidstuckSource />
          <div className="rounded-xl border border-border/60 bg-card/40 p-4"><h2 className="font-display text-lg">Official viewing options</h2><p className="mt-1 text-xs text-muted-foreground">Check licensed availability on official services. A listing does not guarantee regional availability.</p><div className="mt-3 flex flex-wrap gap-3 text-sm"><a className="text-primary hover:underline" href="https://www.crunchyroll.com/" target="_blank" rel="noopener noreferrer">Crunchyroll</a><a className="text-primary hover:underline" href="https://www.netflix.com/" target="_blank" rel="noopener noreferrer">Netflix</a><a className="text-primary hover:underline" href="https://www.primevideo.com/" target="_blank" rel="noopener noreferrer">Prime Video</a></div></div>
        </>}
        {anime.item?.display && <JikanAnimePanel title={anime.item.display} />}
      </>}
    </div>
  );
}
