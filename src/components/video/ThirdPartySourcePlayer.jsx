import { useMemo, useState } from "react";
import EmbedIframe from "@/components/video/EmbedIframe";

const SOURCES = [
  { id: "thugtv", label: "ThugTV", url: import.meta.env.VITE_THUGTV_EMBED_URL },
  { id: "anikoto", label: "AniKoto", url: import.meta.env.VITE_ANIKOTO_EMBED_URL },
];

function safeEmbedUrl(value) {
  if (!value) return "";
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" ? parsed.toString() : "";
  } catch {
    return "";
  }
}

export default function ThirdPartySourcePlayer({ animeTitle = "Selected anime" }) {
  const sources = useMemo(
    () => SOURCES.map((source) => ({ ...source, embedUrl: safeEmbedUrl(source.url) })),
    []
  );
  const [activeId, setActiveId] = useState("thugtv");
  const active = sources.find((source) => source.id === activeId) || sources[0];

  return (
    <section className="space-y-3 rounded-2xl border border-border/60 bg-card/50 p-3 sm:p-5" aria-label="Additional third-party players">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-primary">Additional sources</p>
          <h2 className="mt-1 text-lg font-semibold">Watch inside PRI-ANIME</h2>
          <p className="mt-1 text-xs text-muted-foreground">{animeTitle}</p>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Select video source">
          {sources.map((source) => (
            <button key={source.id} type="button" aria-pressed={activeId === source.id}
              onClick={() => setActiveId(source.id)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${activeId === source.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/60"}`}>
              {source.label}
            </button>
          ))}
        </div>
      </div>
      {active.embedUrl ? (
        <EmbedIframe key={active.id} src={active.embedUrl} title={`${active.label} player for ${animeTitle}`} />
      ) : (
        <div className="grid aspect-video w-full place-items-center rounded-xl border border-dashed border-border bg-black/80 p-5 text-center">
          <div className="max-w-lg">
            <p className="font-semibold text-white">{active.label} player is ready for configuration</p>
            <p className="mt-2 text-sm leading-6 text-white/70">
              No verified HTTPS embed URL is configured. Add {active.id === "thugtv" ? "VITE_THUGTV_EMBED_URL" : "VITE_ANIKOTO_EMBED_URL"} in Vercel environment variables using an embed URL the provider authorizes. Jikan/TMDB metadata cannot generate a video stream.
            </p>
            <p className="mt-2 text-xs text-white/50">If the provider blocks iframe embedding with its own security policy, this player will respect that restriction.</p>
          </div>
        </div>
      )}
      <p className="text-[11px] text-muted-foreground">Responsive 16:9 player · stays on this page · VidStuck remains separate</p>
    </section>
  );
}
