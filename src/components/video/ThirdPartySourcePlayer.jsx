import { useMemo, useState } from "react";
import { Play, Radio, ShieldCheck, Sparkles } from "lucide-react";
import EmbedIframe from "@/components/video/EmbedIframe";

const SOURCES = [
  { id: "thugtv", label: "ThugTV", eyebrow: "PRIMARY SOURCE", url: import.meta.env.VITE_THUGTV_EMBED_URL, description: "Main third-party player area" },
  { id: "anikoto", label: "AniKoto", eyebrow: "CATALOGUE", url: import.meta.env.VITE_ANIKOTO_EMBED_URL, description: "Additional provider slot" },
  { id: "videasy", label: "Videasy", eyebrow: "PLAYER SLOT", url: "", description: "Authorized embed endpoint required" },
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
  const [activeId, setActiveId] = useState("videasy");
  const active = sources.find((source) => source.id === activeId) || sources[0];

  return (
    <section className="relative isolate overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#09090d] p-3 shadow-[0_24px_90px_rgba(0,0,0,0.42)] sm:p-5" aria-label="Additional video servers">
      <div className="pointer-events-none absolute -right-24 -top-28 -z-10 h-72 w-72 rounded-full bg-rose-700/20 blur-[90px]" />
      <div className="pointer-events-none absolute -bottom-32 left-1/4 -z-10 h-64 w-64 rounded-full bg-amber-500/10 blur-[90px]" />

      <div className="flex flex-col gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-rose-300">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            PRI-ANIME · THEATRE
          </div>
          <h2 className="mt-2 text-xl font-black tracking-tight text-white sm:text-2xl">Server selection</h2>
          <p className="mt-1 truncate text-xs text-white/50">{animeTitle}</p>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Select video source">
          {sources.map((source) => {
            const selected = activeId === source.id;
            return (
              <button
                key={source.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setActiveId(source.id)}
                className={`group inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 ${selected ? "border-rose-400/70 bg-gradient-to-r from-rose-600/30 to-amber-500/10 text-white shadow-[0_0_24px_rgba(225,29,72,0.14)]" : "border-white/10 bg-white/[0.03] text-white/55 hover:border-white/25 hover:text-white"}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${selected ? "bg-rose-300 shadow-[0_0_10px_rgba(251,113,133,0.9)]" : "bg-white/25"}`} />
                {source.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-rose-300" aria-hidden="true" />
          <span className="text-sm font-semibold text-white">{active.label}</span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[9px] font-bold tracking-[0.16em] text-white/45">{active.eyebrow}</span>
        </div>
        <div className="inline-flex items-center gap-1.5 text-[10px] text-white/45">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
          Provider security restrictions respected
        </div>
      </div>

      <div className="mt-3">
        {active.embedUrl ? (
          <EmbedIframe key={active.id} src={active.embedUrl} title={`${active.label} player for ${animeTitle}`} />
        ) : (
          <div className="relative grid aspect-video w-full place-items-center overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(ellipse_at_50%_45%,rgba(159,18,57,0.22),transparent_55%),linear-gradient(135deg,#171016,#08080b_62%)] p-5 text-center">
            <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.25) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.25) 1px, transparent 1px)", backgroundSize: "34px 34px" }} />
            <div className="relative max-w-md">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-rose-300/20 bg-rose-500/10 text-rose-200 shadow-[0_0_40px_rgba(225,29,72,0.16)]">
                <Play className="ml-0.5 h-6 w-6" fill="currentColor" aria-hidden="true" />
              </div>
              <p className="mt-4 text-base font-extrabold text-white">{active.label} player slot</p>
              <p className="mt-2 text-sm leading-6 text-white/60">
                The in-page player layout is ready. Videasy player tab is added. Playback stays off until its provider documents an authorized HTTPS embed URL and required episode parameters. A generic player.html page does not establish a working episode embed.
              </p>
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-200/70">
                Awaiting verified embed configuration
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-white/40">
        <span>Responsive 16:9 · In-page playback area</span>
        <span>VidStuck is independent and unchanged</span>
      </div>
    </section>
  );
}
