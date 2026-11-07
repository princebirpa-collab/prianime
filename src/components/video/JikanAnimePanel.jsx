import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Film, Loader2, PlayCircle, ChevronDown } from "lucide-react";

async function request(action, params = {}) {
  const query = new URLSearchParams({ action, ...params });
  const response = await fetch(`/api/jikan-anime?${query}`);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.ok) throw new Error(payload.error || "Anime metadata is temporarily unavailable.");
  return payload;
}

function normalize(value) {
  return String(value || "").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
}

export default function JikanAnimePanel({ title }) {
  const [record, setRecord] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState("");
  const [episodeError, setEpisodeError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [episodePage, setEpisodePage] = useState(1);
  const [hasMoreEpisodes, setHasMoreEpisodes] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      setEpisodeError("");
      setEpisodes([]);
      setEpisodePage(1);
      setHasMoreEpisodes(false);
      try {
        const searchPayload = await request("search", { q: title, page: "1" });
        if (!active) return;
        const wanted = normalize(title);
        const match = (searchPayload.data || []).find((item) =>
          [item.title, item.title_english, item.title_japanese, ...(item.title_synonyms || [])]
            .some((candidate) => normalize(candidate) === wanted)
        );
        if (!match?.mal_id) throw new Error("No exact title or alternate-title match was found in Jikan. This prevents an unrelated anime from being selected.");
        const [episodePayload, videoPayload] = await Promise.all([
          request("episodes", { id: String(match.mal_id), page: "1" }).catch(() => ({ data: [], pagination: null })),
          request("videos", { id: String(match.mal_id) }).catch(() => ({ data: {} })),
        ]);
        if (!active) return;
        setRecord(match);
        setEpisodes(Array.isArray(episodePayload.data) ? episodePayload.data : []);
        setHasMoreEpisodes(Boolean(episodePayload.pagination?.has_next_page));
        setVideos([...(videoPayload.data?.promo || []), ...(videoPayload.data?.music_videos || [])]);
      } catch (loadError) {
        if (active) setError(loadError.message || "Anime metadata is unavailable.");
      } finally {
        if (active) setLoading(false);
      }
    }
    if (title) load();
    return () => { active = false; };
  }, [title]);

  async function loadMoreEpisodes() {
    if (!record?.mal_id || loadingMore || !hasMoreEpisodes) return;
    const nextPage = episodePage + 1;
    setLoadingMore(true);
    setEpisodeError("");
    try {
      const payload = await request("episodes", { id: String(record.mal_id), page: String(nextPage) });
      setEpisodes((current) => {
        const seen = new Set(current.map((item) => item.mal_id || item.episode));
        const additions = (payload.data || []).filter((item) => !seen.has(item.mal_id || item.episode));
        return [...current, ...additions];
      });
      setEpisodePage(nextPage);
      setHasMoreEpisodes(Boolean(payload.pagination?.has_next_page));
    } catch (loadError) {
      setEpisodeError(loadError.message || "Could not load more episodes.");
    } finally {
      setLoadingMore(false);
    }
  }

  const trailer = useMemo(() => videos.find((item) => item?.trailer?.url || item?.trailer?.embed_url), [videos]);

  if (loading) return <div className="rounded-xl border border-border/60 bg-card/40 p-4 text-sm text-muted-foreground"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Loading anime details and episode catalogue…</div>;
  if (error) return <div className="rounded-xl border border-border/60 bg-card/40 p-4 text-sm text-muted-foreground">{error}</div>;

  return (
    <section className="space-y-4 rounded-2xl border border-border/60 bg-card/40 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="text-[10px] uppercase tracking-[0.22em] text-primary">Anime catalogue · Jikan metadata</p><h2 className="mt-1 font-display text-xl">{record?.title_english || record?.title}</h2><p className="mt-1 text-xs text-muted-foreground">{record?.episodes ? `${record.episodes} listed episodes` : "Episode count not confirmed"} · MAL ID {record?.mal_id}</p></div>
        {record?.url && <a href={record.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">Anime details <ExternalLink className="h-3 w-3" /></a>}
      </div>
      {trailer?.trailer?.embed_url && <a href={trailer.trailer.url || trailer.trailer.embed_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-primary/40 px-3 py-2 text-sm text-primary hover:bg-primary/10"><PlayCircle className="h-4 w-4" /> Watch trailer <ExternalLink className="h-3 w-3" /></a>}
      <div>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><Film className="h-4 w-4 text-primary" /> Episode catalogue</h3>
        {episodes.length ? <>
          <div className="grid max-h-80 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">{episodes.map((episode, index) => <div key={episode.mal_id || `${episode.episode}-${index}`} className="rounded-lg border border-border/50 bg-background/50 px-3 py-2"><p className="text-sm font-medium">Episode {episode.episode ?? index + 1}</p><p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{episode.title || "Episode title unavailable"}</p></div>)}</div>
          <p className="mt-2 text-xs text-muted-foreground">Showing {episodes.length}{record?.episodes ? ` of ${record.episodes}` : ""} listed episodes.</p>
          {episodeError && <p role="alert" className="mt-2 text-xs text-destructive">{episodeError}</p>}
          {hasMoreEpisodes && <button type="button" onClick={loadMoreEpisodes} disabled={loadingMore} className="mt-3 inline-flex items-center gap-2 rounded-full border border-border/70 px-4 py-2 text-xs font-semibold hover:border-primary/60 disabled:opacity-60">{loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronDown className="h-4 w-4" />} Load more episodes</button>}
        </> : <p className="text-xs text-muted-foreground">Jikan has no episode list for this title yet.</p>}
      </div>
      <p className="text-[11px] text-muted-foreground">This catalogue provides anime information and episode names. Actual episode playback requires an authorized video source.</p>
    </section>
  );
}
