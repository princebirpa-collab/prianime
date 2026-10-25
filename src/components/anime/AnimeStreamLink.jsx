import { Link } from "react-router-dom";
import { Play, ExternalLink } from "lucide-react";
import useAnimeSource from "@/components/video/useAnimeSource";

export default function AnimeStreamLink({ anime }) {
  const source = useAnimeSource(anime.id);
  return (
    <div className="flex flex-col items-start gap-2">
      <Link to={`/watch?anime=${anime.id}`} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110">
        <Play className="h-4 w-4 fill-current" aria-hidden="true" /> Watch anime
      </Link>
      {source.data ? <a href={source.data.tmdbUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary">TMDB {source.data.tmdbId} Â· Vidstuck <ExternalLink className="h-3 w-3" aria-hidden="true" /></a> : <span className="text-[11px] text-muted-foreground">{source.isPending ? "Finding TMDB matchâ€¦" : source.isError ? "Source lookup unavailable â€” open player to retry" : "No verified TMDB match yet"}</span>}
    </div>
  );
}
