import { useMemo, useState } from "react";
import { ExternalLink, Play, Tv2, Youtube, ShieldCheck } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";

const MUSE_CHANNEL = "https://www.youtube.com/@MuseIndia";
const PLUTO_URL = "https://pluto.tv/intl/";
const PARTNER_LINKS = [
  { name: "TheOGPirateBot", url: "https://theogpiratebot.online/", label: "External provider", description: "Open the provider's own website. No private endpoints or unverified stream extraction are used." },
  { name: "AnimeSalt", url: "https://animesalt.cx/", label: "External provider", description: "Open the provider directly. An authorized embed/API is required before an in-app player can be connected." },
];

function getYouTubeId(value) {
  try {
    const url = new URL(value);
    if (url.hostname === "youtu.be") return url.pathname.slice(1).split("/")[0] || "";
    if (!["youtube.com", "www.youtube.com", "m.youtube.com"].includes(url.hostname)) return "";
    if (url.pathname === "/watch") return url.searchParams.get("v") || "";
    const parts = url.pathname.split("/").filter(Boolean);
    if (["embed", "shorts", "live"].includes(parts[0])) return parts[1] || "";
  } catch {}
  return "";
}

export default function Channels() {
  const [videoUrl, setVideoUrl] = useState("");
  const [submittedUrl, setSubmittedUrl] = useState("");
  const videoId = useMemo(() => getYouTubeId(submittedUrl), [submittedUrl]);
  const playVideo = (event) => {
    event.preventDefault();
    const id = getYouTubeId(videoUrl.trim());
    if (id) setSubmittedUrl("https://www.youtube.com/watch?v=" + id);
  };

  return (
    <div className="pb-16">
      <PageHeader eyebrow="Official destinations · PRI-ANIME" title="Channels & servers" description="Official YouTube playback and clearly separated external viewing destinations." />
      <div className="mx-auto grid w-full max-w-[1400px] gap-5 px-4 pt-8 sm:px-6 lg:grid-cols-2 lg:px-10">
        <section className="overflow-hidden rounded-3xl border border-border/60 bg-card/50">
          <div className="flex min-h-48 items-end bg-gradient-to-br from-red-950 via-rose-950 to-zinc-950 p-6"><div><span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-1 text-[10px] uppercase tracking-[.2em] text-white/75"><Youtube className="h-3.5 w-3.5" /> Official YouTube</span><h2 className="mt-4 font-display text-4xl text-white">Muse India</h2><p className="mt-2 max-w-md text-sm text-white/70">Open the publisher channel and play public videos using the official YouTube player below.</p></div></div>
          <div className="flex flex-wrap items-center justify-between gap-3 p-5"><p className="text-xs text-muted-foreground">Publisher uploads, playlists and regional availability are controlled by YouTube.</p><a href={MUSE_CHANNEL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground">Visit Muse India <ExternalLink className="h-3.5 w-3.5" /></a></div>
        </section>
        <section className="overflow-hidden rounded-3xl border border-border/60 bg-card/50">
          <div className="flex min-h-48 items-end bg-gradient-to-br from-indigo-950 via-violet-950 to-slate-950 p-6"><div><span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-1 text-[10px] uppercase tracking-[.2em] text-white/75"><Tv2 className="h-3.5 w-3.5" /> Official streaming</span><h2 className="mt-4 font-display text-4xl text-white">Pluto TV</h2><p className="mt-2 max-w-md text-sm text-white/70">Explore Pluto TV's official live channels and on-demand catalogue.</p></div></div>
          <div className="flex flex-wrap items-center justify-between gap-3 p-5"><p className="text-xs text-muted-foreground">Opens the provider's official player.</p><a href={PLUTO_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground">Open Pluto TV <ExternalLink className="h-3.5 w-3.5" /></a></div>
        </section>
      </div>

      <section className="mx-auto mt-8 w-full max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="mb-4 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /><h2 className="font-display text-2xl">Additional server destinations</h2></div>
        <div className="grid gap-4 md:grid-cols-2">{PARTNER_LINKS.map((provider) => <article key={provider.name} className="rounded-2xl border border-border/60 bg-card/45 p-5"><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] uppercase tracking-[.18em] text-primary">{provider.label}</p><h3 className="mt-1 font-display text-xl">{provider.name}</h3></div><a href={provider.url} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-2 rounded-full border border-primary/40 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/10">Open site <ExternalLink className="h-3.5 w-3.5" /></a></div><p className="mt-3 text-xs leading-relaxed text-muted-foreground">{provider.description}</p></article>)}</div>
        <p className="mt-3 text-[11px] text-muted-foreground">These are external destinations, not integrated episode servers. In-site playback requires provider-issued embed/API permission or a direct stream you own or are licensed to use. VidStuck remains separate and unchanged.</p>
      </section>

      <section className="mx-auto mt-8 w-full max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="rounded-3xl border border-border/60 bg-card/45 p-5 sm:p-7"><div className="flex items-center gap-2"><Play className="h-4 w-4 text-primary" /><p className="text-[10px] uppercase tracking-[.2em] text-primary">Official YouTube player</p></div><h2 className="mt-2 font-display text-2xl">Play a Muse India video</h2><p className="mt-1 text-sm text-muted-foreground">Paste a public YouTube video URL from Muse India or another publisher that permits embedding.</p>
          <form onSubmit={playVideo} className="mt-4 flex flex-col gap-2 sm:flex-row"><label className="sr-only" htmlFor="official-youtube-url">YouTube video URL</label><input id="official-youtube-url" type="url" value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} placeholder="https://www.youtube.com/watch?v=…" className="min-w-0 flex-1 rounded-xl border border-border bg-background/70 px-4 py-3 text-sm outline-none focus:border-primary/60" /><button type="submit" disabled={!getYouTubeId(videoUrl.trim())} className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40">Load video</button></form>
          {videoId && <div className="mt-5 overflow-hidden rounded-2xl border border-border/60 bg-black"><div className="aspect-video"><iframe title="Official YouTube video" src={`https://www.youtube-nocookie.com/embed/${videoId}`} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div></div>}
        </div>
      </section>
    </div>
  );
}
