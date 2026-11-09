import { useMemo } from "react";
import { Play, Radio, ShieldCheck, Sparkles } from "lucide-react";
import EmbedIframe from "@/components/video/EmbedIframe";

function safeEmbedUrl(value) {
  if (!value) return "";
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" ? parsed.toString() : "";
  } catch {
    return "";
  }
}

export default function ThirdPartySourcePlayer({ animeTitle = "Selected anime", match, season = 1, episode = 1 }) {
  const mediaId = String(match?.tmdbId || "").trim();
  const videasyUrl = useMemo(() => {
    if (!/^(\d+|tt\d+)$/.test(mediaId)) return "";
    if (match?.mediaType === "tv") {
      const s = Number(season);
      const e = Number(episode);
      if (!Number.isInteger(s) || s < 0 || !Number.isInteger(e) || e < 1) return "";
      return `https://player.videasy.ws/embed/tv/${encodeURIComponent(mediaId)}/${s}/${e}`;
    }
    if (match?.mediaType === "movie") {
      return `https://player.videasy.ws/embed/movie/${encodeURIComponent(mediaId)}`;
    }
    return "";
  }, [mediaId, match?.mediaType, season, episode]);

  const embedUrl = safeEmbedUrl(videasyUrl);

  return (
    <section className="relative isolate overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#09090d] p-3 shadow-[0_24px_90px_rgba(0,0,0,0.42)] sm:p-5" aria-label="Videasy anime player">
      <div className="pointer-events-none absolute -right-24 -top-28 -z-10 h-72 w-72 rounded-full bg-rose-700/20 blur-[90px]" />
      <div className="pointer-events-none absolute -bottom-32 left-1/4 -z-10 h-64 w-64 rounded-full bg-amber-500/10 blur-[90px]" />

      <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-rose-300">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            PRI-ANIME · ALTERNATE THEATRE
          </div>
          <h2 className="mt-2 text-xl font-black tracking-tight text-white sm:text-2xl">Videasy Player</h2>
          <p className="mt-1 truncate text-xs text-white/50">{animeTitle}</p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-rose-300/25 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-100">
          <Radio className="h-3.5 w-3.5" aria-hidden="true" />
          Separate player
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Play className="h-4 w-4 text-rose-300" aria-hidden="true" />
          <span className="text-sm font-semibold text-white">Now playing · {match?.mediaType === "tv" ? `S${season} E${episode}` : "Movie"}</span>
        </div>
        <div className="inline-flex items-center gap-1.5 text-[10px] text-white/45">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
          VidStuck remains independent and unchanged
        </div>
      </div>

      <div className="mt-3">
        {embedUrl ? (
          <EmbedIframe key={embedUrl} src={embedUrl} title={`Videasy player for ${animeTitle}`} />
        ) : (
          <div className="relative grid aspect-video w-full place-items-center overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(ellipse_at_50%_45%,rgba(159,18,57,0.22),transparent_55%),linear-gradient(135deg,#171016,#08080b_62%)] p-5 text-center">
            <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.25) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.25) 1px, transparent 1px)", backgroundSize: "34px 34px" }} />
            <div className="relative max-w-md">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-rose-300/20 bg-rose-500/10 text-rose-200 shadow-[0_0_40px_rgba(225,29,72,0.16)]">
                <Play className="ml-0.5 h-6 w-6" fill="currentColor" aria-hidden="true" />
              </div>
              <p className="mt-4 text-base font-extrabold text-white">Videasy player is ready</p>
              <p className="mt-2 text-sm leading-6 text-white/60">
                {match?.mediaType === "tv" || match?.mediaType === "movie"
                  ? "This title needs a valid TMDB or IMDb ID to create its player link."
                  : "Choose a matched anime with TMDB movie or TV metadata to load the correct Videasy player."}
              </p>
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-200/70">Anime · Season · Episode aware</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-white/40">
        <span>Responsive 16:9 · Episode-aware embed</span>
        <span>Playback availability depends on Videasy</span>
      </div>
    </section>
  );
}
