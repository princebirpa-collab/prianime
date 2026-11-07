import { useMemo, useState } from "react";
import { ExternalLink, Play, Tv2, Youtube, ShieldCheck, ListVideo } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";

const MUSE_CHANNEL_ID = "UCYYhAzgWuxPauRXdPpLAX3Q";
const MUSE_CHANNEL = "https://www.youtube.com/channel/" + MUSE_CHANNEL_ID;
const MUSE_UPLOADS_PLAYLIST = "UUYYhAzgWuxPauRXdPpLAX3Q";
const PLUTO_URL = "https://pluto.tv/intl/";
const PARTNER_LINKS = [
  { name: "ThugTV", url: "https://thugtv.online/", label: "External destination", description: "Open the provider website directly. In-app playback is not enabled because an authorized embed/API interface has not been verified." },
  { name: "TheOGPirateBot", url: "https://theogpiratebot.online/", label: "External provider", description: "External destination only. An authorized public API or embed agreement is required before connecting an in-app episode player." },
  { name: "AnimeSalt", url: "https://animesalt.cx/", label: "External provider", description: "External destination only. An authorized public API or embed agreement is required before connecting an in-app episode player." },
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
      <PageHeader eyebrow="Official destinations · PRI-ANIME" title="Channels & servers" description="Watch official Muse India uploads through YouTube's own player and find authorized provider destinations." />
      <section className="mx-auto mt-8 w-full max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/50">
          <div className="flex flex-wrap items-end justify-between gap-4 bg-gradient-to-br from-red-950 via-rose-950 to-zinc-950 p-6 sm:p-8">
            <div><span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-1 text-[10px] uppercase tracking-[.2em] text-white/75"><Youtube className="h-3.5 w-3.5" /> Official YouTube uploads</span><h2 className="mt-4 font-display text-4xl text-white">Muse India</h2><p className="mt-2 max-w-xl text-sm text-white/70">Browse the channel's uploads inside PRI-ANIME using YouTube's official playlist player. Episodes remain subject to YouTube availability, ads and regional restrictions.</p></div>
            <a href={MUSE_CHANNEL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-semibold text-black">Open official channel <ExternalLink className="h-3.5 w-3.5" /></a>
          </div>
          <div className="p-3 sm:p-5">
            <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground"><ListVideo className="h-4 w-4 text-primary" /> Muse India channel uploads playlist</div>
            <div className="aspect-video overflow-hidden rounded-2xl bg-black"><iframe title="Muse India official YouTube uploads playlist" src={`https://www.youtube-nocookie.com/embed/videoseries?list=${MUSE_UPLOADS_PLAYLIST}`} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>
            <p className="mt-3 text-[11px] text-muted-foreground">This is the channel's uploads playlist, not a guarantee that every upload is a full anime episode. Videos removed by the publisher, blocked for India, or marked non-embeddable will remain unavailable.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 w-full max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="rounded-3xl border border-border/60 bg-card/45 p-5 sm:p-7"><div className="flex items-center gap-2"><Play className="h-4 w-4 text-primary" /><p className="text-[10px] uppercase tracking-[.2em] text-primary">YouTube video player</p></div><h2 className="mt-2 font-display text-2xl">Play a specific official video</h2><p className="mt-1 text-sm text-muted-foreground">Paste a public YouTube video URL that permits embedding.</p>
          <form onSubmit={playVideo} className="mt-4 flex flex-col gap-2 sm:flex-row"><label className="sr-only" htmlFor="official-youtube-url">YouTube video URL</label><input id="official-youtube-url" type="url" value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} placeholder="https://www.youtube.com/watch?v=…" className="min-w-0 flex-1 rounded-xl border border-border bg-background/70 px-4 py-3 text-sm outline-none focus:border-primary/60" /><button type="submit" disabled={!getYouTubeId(videoUrl.trim())} className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40">Load video</button></form>
          {videoId && <div className="mt-5 overflow-hidden rounded-2xl border border-border/60 bg-black"><div className="aspect-video"><iframe title="Official YouTube video" src={`https://www.youtube-nocookie.com/embed/${videoId}`} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div></div>}
        </div>
      </section>

      <section className="mx-auto mt-8 w-full max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="mb-4 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /><h2 className="font-display text-2xl">External server destinations</h2></div>
        <div className="grid gap-4 md:grid-cols-2">{PARTNER_LINKS.map((provider) => <article key={provider.name} className="rounded-2xl border border-border/60 bg-card/45 p-5"><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] uppercase tracking-[.18em] text-primary">{provider.label}</p><h3 className="mt-1 font-display text-xl">{provider.name}</h3></div><a href={provider.url} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-2 rounded-full border border-primary/40 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/10">Open site <ExternalLink className="h-3.5 w-3.5" /></a></div><p className="mt-3 text-xs leading-relaxed text-muted-foreground">{provider.description}</p></article>)}</div>
        <p className="mt-3 text-[11px] text-muted-foreground">In-site playback for these providers requires their authorized embed/API integration. VidStuck remains separate and unchanged.</p>
      </section>

      <section className="mx-auto mt-8 w-full max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="rounded-3xl border border-border/60 bg-card/45 p-5 sm:p-7"><div className="flex items-center gap-2"><Tv2 className="h-4 w-4 text-primary" /><p className="text-[10px] uppercase tracking-[.2em] text-primary">Official service</p></div><h2 className="mt-2 font-display text-2xl">Pluto TV</h2><p className="mt-1 max-w-2xl text-sm text-muted-foreground">Pluto TV's current terms prohibit embedding its player into a software application without its written authorization. PRI-ANIME therefore provides the official destination rather than an unauthorized in-app player.</p><a href={PLUTO_URL} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground">Open Pluto TV official site <ExternalLink className="h-3.5 w-3.5" /></a></div>
      </section>
    </div>
  );
}
