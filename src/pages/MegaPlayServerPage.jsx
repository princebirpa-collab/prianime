import { useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, Play, Server } from "lucide-react";

const PROVIDER_SERVERS = ["HD-1", "Vidstream-2", "Vidstream-1", "VidPlay"];

export default function MegaPlayServerPage() {
  const { episodeId, language = "sub" } = useParams();
  const [searchParams] = useSearchParams();
  const audio = language === "dub" ? "dub" : "sub";
  const server = searchParams.get("s") || "tcdn";
  const validId = /^\d{1,12}$/.test(String(episodeId || ""));
  const validServer = /^[a-z0-9-]{1,24}$/i.test(server);

  const embedUrl = useMemo(() => {
    if (!validId || !validServer) return "";
    const url = new URL(`https://megaplay.buzz/stream/s-2/${episodeId}/${audio}`);
    url.searchParams.set("s", server);
    return url.toString();
  }, [episodeId, audio, server, validId, validServer]);

  if (!embedUrl) {
    return <main className="mx-auto max-w-3xl px-4 py-20"><div className="rounded-2xl border border-border bg-card p-6"><h1 className="text-xl font-semibold">MegaPlay source unavailable</h1><p className="mt-2 text-sm text-muted-foreground">This episode ID or server value is not valid.</p><Link to="/browse" className="mt-5 inline-flex items-center gap-2 text-sm text-primary"><ArrowLeft className="h-4 w-4" /> Back to Browse</Link></div></main>;
  }

  return (
    <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-10">
      <Link to={-1} className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" /> Back</Link>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-[10px] uppercase tracking-[.24em] text-primary">PRI-ANIME · Separate server</p><h1 className="mt-1 text-2xl font-semibold">MegaPlay Player</h1><p className="mt-1 text-xs text-muted-foreground">Episode ID {episodeId} · {audio.toUpperCase()} · source {server}</p></div>
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary"><Server className="h-4 w-4" /> Independent server page</span>
      </div>
      <section className="overflow-hidden rounded-2xl border border-border/70 bg-black">
        <div className="aspect-video w-full">
          <iframe key={embedUrl} src={embedUrl} title={`MegaPlay ${audio.toUpperCase()} episode ${episodeId}`} className="h-full w-full border-0" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
        </div>
      </section>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto]">
        <section className="rounded-xl border border-border/70 bg-card/50 p-4">
          <h2 className="text-sm font-semibold">MegaPlay server options</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">The provider lists these server choices for SUB and DUB. Choose the server inside the MegaPlay player controls; this page keeps the provider's own server switching intact.</p>
          <div className="mt-3 flex flex-wrap gap-2">{PROVIDER_SERVERS.map((name) => <span key={name} className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground">{name}</span>)}</div>
        </section>
        <a href={embedUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-border px-4 py-3 text-xs font-semibold hover:border-primary/60"><ExternalLink className="h-4 w-4" /> Open MegaPlay directly</a>
      </div>
      <p className="mt-4 text-[10px] leading-5 text-muted-foreground">MegaPlay hosts the embedded player and controls its available sources. PRI-ANIME does not guarantee that every episode, audio track, or listed server is available.</p>
    </main>
  );
}
