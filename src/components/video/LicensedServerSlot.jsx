import { useMemo } from "react";
import { MonitorPlay, ShieldCheck } from "lucide-react";
import VideoPlayer from "@/components/video/VideoPlayer";

/**
 * Optional licensed direct-media source.
 * Configure VITE_LICENSED_MEDIA_URL_TEMPLATE with an authorized HTTPS media
 * URL template. Supported tokens: {tmdbId}, {season}, {episode}, {type}.
 * Example shape only: https://media.your-domain.example/{tmdbId}/{season}/{episode}.m3u8
 */
export default function LicensedServerSlot({ anime, match, season, episode, onSelect, onProgress }) {
  const template = import.meta.env.VITE_LICENSED_MEDIA_URL_TEMPLATE || "";

  const src = useMemo(() => {
    if (!template || !Number.isSafeInteger(Number(match?.tmdbId))) return "";
    const raw = template
      .replaceAll("{tmdbId}", encodeURIComponent(String(match.tmdbId)))
      .replaceAll("{season}", encodeURIComponent(String(season)))
      .replaceAll("{episode}", encodeURIComponent(String(episode)))
      .replaceAll("{type}", match.mediaType === "tv" ? "tv" : "movie");
    try {
      const url = new URL(raw);
      const supported = /\.(mp4|webm|ogg|ogv|m4v|mov|m3u8|mpd)([?#]|$)/i.test(url.pathname + url.search);
      return url.protocol === "https:" && supported ? url.toString() : "";
    } catch {
      return "";
    }
  }, [template, match?.tmdbId, match?.mediaType, season, episode]);

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#09090d] p-3 shadow-[0_20px_70px_rgba(0,0,0,.3)] sm:p-5" aria-label="Licensed alternate server">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.22em] text-rose-300">
            <MonitorPlay className="h-4 w-4" aria-hidden="true" />
            PRI-ANIME · SERVER 2
          </div>
          <h2 className="mt-1 text-lg font-extrabold text-white">Licensed Server</h2>
          <p className="mt-1 text-xs text-white/50">{anime?.display || "Selected anime"}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 text-[10px] text-emerald-300">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Authorized source slot
        </span>
      </div>

      {match?.mediaType === "tv" && (
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="text-xs text-white/60">Season
            <input type="number" min="1" max="9999" value={season} onChange={(event) => onSelect(Math.max(1, Number(event.target.value) || 1), episode)} className="ml-2 w-20 rounded-lg border border-white/10 bg-white/[.05] px-3 py-2 text-sm text-white" />
          </label>
          <label className="text-xs text-white/60">Episode
            <input type="number" min="1" max="9999" value={episode} onChange={(event) => onSelect(season, Math.max(1, Number(event.target.value) || 1))} className="ml-2 w-20 rounded-lg border border-white/10 bg-white/[.05] px-3 py-2 text-sm text-white" />
          </label>
        </div>
      )}

      <div className="mt-4">
        {src ? (
          <VideoPlayer
            key={src}
            src={src}
            poster={anime?.cover}
            title={anime?.display || "Licensed video"}
            onProgress={(position, duration) => onProgress?.(position, duration, { season, episode })}
          />
        ) : (
          <div className="grid aspect-video place-items-center rounded-2xl border border-white/10 bg-[radial-gradient(ellipse_at_50%_45%,rgba(159,18,57,.2),transparent_55%),linear-gradient(135deg,#171016,#08080b_62%)] p-6 text-center">
            <div className="max-w-md">
              <MonitorPlay className="mx-auto h-9 w-9 text-rose-300" aria-hidden="true" />
              <p className="mt-3 font-bold text-white">Server slot is ready</p>
              <p className="mt-2 text-sm leading-6 text-white/60">Playback will appear here after an authorized HTTPS direct-media template is configured. This slot does not scrape or extract streams from other sites.</p>
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-[.16em] text-amber-200/70">Waiting for licensed media source</p>
            </div>
          </div>
        )}
      </div>
      <p className="mt-3 text-[10px] text-white/40">16:9 responsive · Episode-aware · Progress saves through PRI-ANIME watch history when media metadata is available</p>
    </section>
  );
}
