import { useNavigate } from "react-router-dom";
import { Play, ExternalLink } from "lucide-react";
import useAnimeSource from "@/components/video/useAnimeSource";

export default function AnimeStreamLink({ anime }) {
  const navigate = useNavigate();
  const animeId = String(anime?.id || "");
  const validCatalogueId = /^(?:[1-9]\d{0,8}|mal-[1-9]\d{0,11}|kitsu-[1-9]\d{0,11})$/.test(animeId);
  const source = useAnimeSource(validCatalogueId ? animeId : null);

  const openAnime = () => {
    if (!validCatalogueId) return;
    navigate(`/watch?anime=${encodeURIComponent(animeId)}`);
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={openAnime}
        disabled={!validCatalogueId}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Play className="h-4 w-4 fill-current" aria-hidden="true" />
        Watch anime
      </button>
      {source.data ? (
        <a href={source.data.tmdbUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary">
          TMDB {source.data.tmdbId} · Playback match <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      ) : validCatalogueId ? (
        <span className="text-[11px] text-muted-foreground">
          {source.isPending ? "Checking available playback servers…" : source.isError ? "Playback matching is temporarily unavailable. You can still open the player." : "Opening the player will check available playback matches."}
        </span>
      ) : (
        <span className="text-[11px] text-muted-foreground">No supported catalogue ID is available for this title.</span>
      )}
    </div>
  );
}
