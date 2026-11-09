import { useMemo, useState } from "react";
import { MonitorPlay, RefreshCw, ShieldCheck } from "lucide-react";

/**
 * Videasy's documented embed routes accept TMDB IDs:
 * movie: /embed/movie/{movie_id}
 * TV:    /embed/tv/{show_id}/{season}/{episode}
 *
 * This component only uses the verified TMDB match resolved for the anime.
 * It does not scrape or proxy provider streams.
 */
export default function VideasyPlayer({ anime, match }) {
  const isTv = match?.mediaType === "tv";
  const tmdbId = Number(match?.tmdbId);
  const [season, setSeason] = useState(Math.max(1, Number(match?.season) || 1));
  const [episode, setEpisode] = useState(Math.max(1, Number(match?.episode) || 1));
  const [reloadKey, setReloadKey] = useState(0);

  const embedUrl = useMemo(() => {
    if (!Number.isSafeInteger(tmdbId) || tmdbId <= 0) return "";
    const path = isTv
      ? `/embed/tv/${tmdbId}/${season}/${episode}?autonext=1`
      : `/embed/movie/${tmdbId}`;
    return `https://player.videasy.ws${path}`;
  }, [tmdbId, isTv, season, episode, reloadKey]);

  if (!embedUrl) return null;

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#09090d] p-3 shadow-[0_20px_70px_rgba(0,0,0,.35)] sm:p-5" aria-label="Videasy alternate video player">
      <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.24em] text-rose-300">
            <MonitorPlay className="h-4 w-4" aria-hidden="true" />
            PRI-ANIME · ALTERNATE SERVER
          </div>
          <h2 className="mt-1 truncate text-lg font-extrabold text-white">Videasy Player</h2>
          <p className="mt-1 truncate text-xs text-white/50">{anime?.display || "Selected anime"} · TMDB {tmdbId}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isTv && <>
            <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-3 py-2 text-xs text-white/70">
              Season
              <input
                aria-label="Season"
                type="number"
                min="1"
                max="99"
                value={season}
                onChange={(event) => setSeason(Math.min(99, Math.max(1, Number(event.target.value) || 1)))}
                className="w-12 bg-transparent text-center font-bold text-white outline-none"
              />
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-3 py-2 text-xs text-white/70">
              Episode
              <input
                aria-label="Episode"
                type="number"
                min="1"
                max="999"
                value={episode}
                onChange={(event) => setEpisode(Math.min(999, Math.max(1, Number(event.target.value) || 1)))}
                className="w-14 bg-transparent text-center font-bold text-white outline-none"
              />
            </label>
          </>}
          <button
            type="button"
            onClick={() => setReloadKey((value) => value + 1)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.05] px-3 py-2 text-xs font-bold text-white/75 transition hover:border-rose-300/40 hover:text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Reload
          </button>
        </div>
      </div>

      <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black">
        <iframe
          key={`${embedUrl}-${reloadKey}`}
          src={embedUrl}
          title={`Videasy player for ${anime?.display || "anime"}`}
          loading="lazy"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-white/45">
        <span>{isTv ? `Season ${season} · Episode ${episode}` : "Movie"} · Responsive 16:9</span>
        <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" /> Third-party player · VidStuck remains separate</span>
      </div>
    </section>
  );
}
