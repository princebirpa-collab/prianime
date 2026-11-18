import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, Loader2, Play, Tv, Languages } from "lucide-react";
import { saveProgress } from "@/lib/library";

const QUERY = `query ($id: Int!) {
  Media(id: $id, type: ANIME) {
    id
    title { romaji english native }
    description(asHtml: false)
    episodes
    duration
    status
    format
    coverImage { extraLarge large }
    bannerImage
    streamingEpisodes { title thumbnail url site }
    externalLinks { site url type }
  }
}`;

function episodeNumber(title, index) {
  const match = String(title || "").match(/(?:episode|ep\.?|#)\s*(\d+)/i);
  return match ? Number(match[1]) : index + 1;
}

export default function AniListPlayer() {
  const { id } = useParams();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    fetch("/api/anilist", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query: QUERY, variables: { id: Number(id) } }),
      signal: AbortSignal.timeout(10000),
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload?.errors?.length) {
          throw new Error(payload?.errors?.[0]?.message || "AniList could not load this anime.");
        }
        const item = payload?.data?.Media;
        if (!item) throw new Error("Anime not found in AniList.");
        if (active) setAnime(item);
      })
      .catch((err) => { if (active) setError(err.message || "Unable to load anime."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  const episodes = useMemo(() => {
    const rows = Array.isArray(anime?.streamingEpisodes) ? anime.streamingEpisodes : [];
    return rows.map((row, index) => ({ ...row, episode: episodeNumber(row.title, index) }))
      .filter((row) => /^https?:\/\//i.test(row.url || ""));
  }, [anime]);

  const current = episodes[selected] || null;
  const title = anime?.title?.english || anime?.title?.romaji || anime?.title?.native || "Anime";

  useEffect(() => {
    if (!anime) return;
    saveProgress({
      kind: "anime",
      ref_id: String(anime.id),
      title,
      cover: anime.coverImage?.extraLarge || anime.coverImage?.large || "",
      episode: current?.episode || 0,
      actualEpisode: current?.episode || 0,
      season: 1,
      position: 0,
      duration: 0,
      link: `/anilist-player/${anime.id}${current ? `?episode=${current.episode}` : ""}`,
    }).catch(() => {});
  }, [anime, title, current]);

  if (loading) return <div className="grid min-h-[60vh] place-items-center"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;
  if (error || !anime) return <div className="mx-auto max-w-3xl px-4 py-24"><div className="rounded-2xl border border-border bg-card p-7"><p className="text-lg font-semibold">AniList Player unavailable</p><p className="mt-2 text-sm text-muted-foreground">{error || "Anime not found."}</p><Link to="/browse" className="mt-5 inline-flex items-center gap-2 text-sm text-primary"><ArrowLeft className="h-4 w-4" /> Back to Browse</Link></div></div>;

  const streamingSites = (anime.externalLinks || []).filter((item) => item?.url && item?.type === "STREAMING");

  return (
    <main className="mx-auto w-full max-w-[1500px] px-4 py-7 sm:px-6 lg:px-10">
      <Link to={`/anime/${anime.id}`} className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-primary"><ArrowLeft className="h-4 w-4" /> Anime details</Link>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
        <section className="min-w-0">
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-border/60 bg-black">
            {current?.thumbnail ? <img src={current.thumbnail} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" /> : anime.bannerImage ? <img src={anime.bannerImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" /> : null}
            <div className="absolute inset-0 grid place-items-center bg-gradient-to-t from-black/90 via-black/45 to-black/30 p-6 text-center">
              <div className="max-w-xl">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-primary/50 bg-primary/15 text-primary"><Play className="ml-1 h-6 w-6" /></span>
                <p className="mt-4 text-xl font-semibold text-white">{current?.title || "Official streaming sources"}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{current ? "This episode is listed by AniList. Open the provider's official page to watch." : "AniList provides anime metadata and official streaming references, not video files. Select an available episode or provider."}</p>
                {current?.url && <a href={current.url} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90">Open episode on {current.site || "provider"} <ExternalLink className="h-4 w-4" /></a>}
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
            <div><p className="text-[10px] uppercase tracking-[.24em] text-primary">PRI-ANIME · AniList Player</p><h1 className="mt-2 text-2xl font-semibold sm:text-3xl">{title}</h1><p className="mt-2 text-xs text-muted-foreground">{anime.format || "Anime"} · {anime.status || "Status unknown"} · {anime.episodes || "?"} episodes</p></div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-xs text-muted-foreground"><Tv className="h-4 w-4 text-primary" /> Separate player</span>
          </div>
          {anime.description && <p className="mt-4 max-w-4xl text-sm leading-7 text-muted-foreground">{anime.description.replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/&#039;/g, "'")}</p>}
        </section>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-border/70 bg-card/60 p-4">
            <h2 className="font-semibold">Episode list</h2>
            <p className="mt-1 text-xs text-muted-foreground">{episodes.length ? `${episodes.length} official episode links listed by AniList` : "No episode-level streaming links listed by AniList for this title."}</p>
            {episodes.length > 0 && <label className="mt-4 block text-xs text-muted-foreground">Select episode<select value={selected} onChange={(event) => setSelected(Number(event.target.value))} className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-3 text-sm text-foreground">{episodes.map((item, index) => <option key={item.url + index} value={index}>Episode {item.episode} · {item.site || "Provider"}</option>)}</select></label>}
            {episodes.length > 0 && <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">{episodes.map((item, index) => <button key={item.url + index} type="button" onClick={() => setSelected(index)} className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left text-xs transition ${selected === index ? "border-primary/60 bg-primary/10 text-primary" : "border-border/60 hover:border-primary/40"}`}><span className="min-w-0 truncate">Episode {item.episode} · {item.site || "Provider"}</span><Play className="h-3.5 w-3.5 shrink-0" /></button>)}</div>}
          </div>
          <div className="rounded-2xl border border-border/70 bg-card/60 p-4">
            <div className="flex items-center gap-2"><Languages className="h-4 w-4 text-primary" /><h2 className="font-semibold">Audio & providers</h2></div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">AniList does not report Hindi audio tracks. Hindi Dub is not labelled unless a provider explicitly confirms it.</p>
            {streamingSites.length > 0 ? <div className="mt-3 space-y-2">{streamingSites.map((site, index) => <a key={site.url + index} href={site.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 rounded-xl border border-border/60 px-3 py-3 text-xs transition hover:border-primary/50"><span>{site.site || "Official streaming service"}</span><ExternalLink className="h-3.5 w-3.5 shrink-0" /></a>)}</div> : <p className="mt-3 text-xs text-muted-foreground">No official streaming provider links are listed for this title.</p>}
          </div>
          <p className="px-1 text-[10px] leading-5 text-muted-foreground">Metadata and listed streaming references are supplied by AniList. Video playback is handled on the provider's own page. This player is separate from VidStuck.</p>
        </aside>
      </div>
    </main>
  );
}
