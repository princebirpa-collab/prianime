import { Loader2, ExternalLink } from "lucide-react";
import VideoPlayer from "@/components/video/VideoPlayer";
import AnimeEpisodeControls from "@/components/video/AnimeEpisodeControls";
import useAnimePlayback from "@/components/video/useAnimePlayback";

export default function AnimePlayback({ anime, match }) {
  const playback = useAnimePlayback(anime, match);
  if (!playback.ready) return <div role="status" className="grid aspect-video place-items-center rounded-2xl bg-card"><Loader2 className="h-6 w-6 animate-spin text-primary" aria-label="Restoring playback" /></div>;
  const maxEpisode = playback.season === match.season && anime.episodes ? Math.max(1, anime.episodes + match.episodeOffset) : 9999;
  return (
    <div className="space-y-4">
      <VideoPlayer src={playback.src} poster={anime.cover} title={anime.display} startAt={playback.startAt} onProgress={playback.onProgress} />
      {match.mediaType === "tv" && <AnimeEpisodeControls season={playback.season} episode={playback.episode} maxEpisode={maxEpisode} onSelect={playback.selectEpisode} />}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>{match.mediaType === "tv" ? `Season ${playback.season} Â· Episode ${playback.episode}` : "Movie"}</span>
        <a href={match.tmdbUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline">TMDB {match.tmdbId} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a>
      </div>
      {playback.historyError && <p role="status" className="text-xs text-muted-foreground">Watch progress could not be restored or saved. Playback is still available.</p>}
      <p className="text-xs leading-relaxed text-muted-foreground">If playback stalls, switch to AnimeSalt Â· Backup above or reload the selected player. Each provider controls its own availability, quality and subtitles.</p>
    </div>
  );
}

================================================================================
