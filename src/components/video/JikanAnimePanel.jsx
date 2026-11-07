import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Film, Loader2, PlayCircle } from "lucide-react";

async function request(action, params = {}) {
  const query = new URLSearchParams({ action, ...params });
  const response = await fetch(`/api/jikan-anime?${query}`);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.ok) throw new Error(payload.error || "Anime metadata is temporarily unavailable.");
  return payload.data;
}

function normalize(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

export default function JikanAnimePanel({ title }) {
  const [record, setRecord] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [videos, setVideos] = useState([]);
  const [services, setServices] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const results = await request("search", { q: title });
        if (!active) return;
        const wanted = normalize(title);
        const match = (results || []).find((item) =>
          [item.title, item.title_english, item.title_japanese, ...(item.title_synonyms || [])]
            .some((candidate) => normalize(candidate) === wanted)
        );
        if (!match?.mal_id) throw new Error("No exact title or alternate-title match was found in Jikan. This prevents an unrelated anime from being selected.");
        const [episodeData, videoData, serviceData] = await Promise.all([
          request("episodes", { id: String(match.mal_id) }).catch(() => []),
          request("videos", { id: String(match.mal_id) }).catch(() => ({})),
          request("streaming", { id: String(match.mal_id) }).catch(() => []),
        ]);
        if (!active) return;
        setRecord(match);
        setEpisodes(Array.isArray(episodeData) ? episodeData : []);
        setVideos([...(videoData?.promo || []), ...(videoData?.music_videos || [])]);
        setServices(Array.isArray(serviceData) ? serviceData : []);
      } catch (loadError) {
        if (active) setError(loadError.message || "Anime metadata is unavailable.");
      } finally {
        if (active) setLoading(false);
      }
    }
    if (title) load();
    return () => { active = false; };
  }, [title]);

  const trailer = useMemo(() => videos.find((item) => item?.trailer?.url || item?.trailer?.embed_url), [videos]);

  if (loading) return <div className="rounded-xl border border-border/60 bg-card/40 p-4 text-sm text-muted-foreground"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Loading episode guide and official viewing listings…</div>;
  if (error) return <div className="rounded-xl border border-border/60 bg-card/40 p-4 text-sm text-muted-foreground">{error}</div>;

  return (
    <section className="space-y-4 rounded-2xl border border-border/60 bg-card/40 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="text-[10px] uppercase tracking-[0.22em] text-primary">Jikan · MyAnimeList metadata</p><h2 className="mt-1 font-display text-xl">{record?.title_english || record?.title}</h2><p className="mt-1 text-xs text-muted-foreground">{record?.episodes ? `${record.episodes} listed episodes` : "Episode count not confirmed"} · MAL ID {record?.mal_id}</p></div>
        {record?.url && <a href={record.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">MAL details <ExternalLink className="h-3 w-3" /></a>}
      </div>
      {trailer?.trailer?.embed_url && <a href={trailer.trailer.url || trailer.trailer.embed_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-primary/40 px-3 py-2 text-sm text-primary hover:bg-primary/10"><PlayCircle className="h-4 w-4" /> Watch official trailer <ExternalLink className="h-3 w-3" /></a>}
      <div>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><Film className="h-4 w-4 text-primary" /> Episode guide</h3>
        {episodes.length ? <div className="grid max-h-64 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">{episodes.map((episode) => <div key={episode.mal_id || episode.episode} className="rounded-lg border border-border/50 bg-background/50 px-3 py-2"><p className="text-sm font-medium">Episode {episode.mal_id || episode.episode}</p><p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{episode.title || "Episode title unavailable"}</p></div>)}</div> : <p className="text-xs text-muted-foreground">Jikan has no episode list for this title yet.</p>}
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold">Listed streaming services</h3>
        {services.length ? <div className="flex flex-wrap gap-2">{services.map((service, index) => <a key={`${service.name}-${index}`} href={service.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full border border-border/60 px-3 py-1.5 text-xs hover:border-primary/60 hover:text-primary">{service.name || "Streaming service"} <ExternalLink className="h-3 w-3" /></a>)}</div> : <p className="text-xs text-muted-foreground">No streaming listings returned. Availability depends on your region.</p>}
      </div>
      <p className="text-[11px] text-muted-foreground">Jikan provides anime metadata and external listings, not episode video streams. Playback requires a supported, authorized video source.</p>
    </section>
  );
}
