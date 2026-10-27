import { useEffect, useMemo, useState } from "react";
import { ExternalLink, RotateCcw } from "lucide-react";
import EmbedIframe from "@/components/video/EmbedIframe";

function titleOf(item) {
  return String(item?.title || item?.name || item?.anime_title || item?.anime?.title || item?.anime?.name || "Untitled anime");
}

function idOf(item) {
  const value = item?.id ?? item?.anime_id ?? item?.animeId ?? item?.anime?.id;
  return value == null ? "" : String(value);
}

function episodesOf(payload) {
  const value = payload?.episodes ?? payload?.data?.episodes ?? payload?.series?.episodes ?? [];
  return Array.isArray(value) ? value : [];
}

function episodeLabel(item, index) {
  return String(item?.title || item?.name || item?.episode_title || item?.number || item?.episode || index + 1);
}

function embedOf(item, language) {
  const value = item?.embed_url?.[language] ?? item?.embedUrl?.[language] ?? item?.[language === "sub" ? "sub_url" : "dub_url"] ?? "";
  if (typeof value !== "string") return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

export default function AnikotoBackup({ title }) {
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [seriesData, setSeriesData] = useState(null);
  const [episodeIndex, setEpisodeIndex] = useState("0");
  const [language, setLanguage] = useState("sub");
  const [query, setQuery] = useState(title || "");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setBusy(true);
    setError("");
    fetch("/api/anikoto?action=recent&page=1&per_page=50")
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || !payload?.ok) throw new Error(payload?.error || "AniKoto list is unavailable.");
        const data = payload.data;
        const rows = Array.isArray(data) ? data : data?.anime || data?.results || data?.items || data?.data || [];
        if (!Array.isArray(rows)) throw new Error("AniKoto returned an unexpected anime list.");
        if (!cancelled) {
          setItems(rows);
          const needle = String(title || "").trim().toLowerCase();
          const match = rows.find((item) => needle && titleOf(item).toLowerCase() === needle);
          if (match && idOf(match)) setSelectedId(idOf(match));
        }
      })
      .catch((err) => { if (!cancelled) setError(err.message || "AniKoto is temporarily unavailable."); })
      .finally(() => { if (!cancelled) setBusy(false); });
    return () => { cancelled = true; };
  }, [attempt, title]);

  useEffect(() => {
    if (!selectedId) { setSeriesData(null); return; }
    let cancelled = false;
    setBusy(true);
    setError("");
    setSeriesData(null);
    fetch(`/api/anikoto?action=series&id=${encodeURIComponent(selectedId)}`)
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || !payload?.ok) throw new Error(payload?.error || "Could not load this series.");
        if (!cancelled) { setSeriesData(payload.data); setEpisodeIndex("0"); }
      })
      .catch((err) => { if (!cancelled) setError(err.message || "Could not load episodes."); })
      .finally(() => { if (!cancelled) setBusy(false); });
    return () => { cancelled = true; };
  }, [selectedId]);

  const episodes = useMemo(() => episodesOf(seriesData), [seriesData]);
  const selectedEpisode = episodes[Number(episodeIndex)] || null;
  const src = selectedEpisode ? embedOf(selectedEpisode, language) : "";
  const filteredItems = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => !needle || titleOf(item).toLowerCase().includes(needle));
  }, [items, query]);

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">AniKoto · Additional backup server. Vidstuck and your existing backup remain unchanged.</p>
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(180px,0.7fr)]">
        <div className="space-y-1.5">
          <label htmlFor="anikoto-search" className="block text-xs text-muted-foreground">Find anime in AniKoto's recent list</label>
          <input id="anikoto-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title…" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
            <option value="">Select anime</option>
            {filteredItems.map((item, index) => {
              const id = idOf(item);
              return id ? <option key={id} value={id}>{titleOf(item)}</option> : <option key={`missing-${index}`} value="" disabled>{titleOf(item)}</option>;
            })}
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="anikoto-episode" className="block text-xs text-muted-foreground">Episode</label>
          <select id="anikoto-episode" value={episodeIndex} onChange={(event) => setEpisodeIndex(event.target.value)} disabled={!episodes.length} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
            {episodes.map((item, index) => <option key={idOf(item) || index} value={String(index)}>Episode {episodeLabel(item, index)}</option>)}
          </select>
          <label htmlFor="anikoto-language" className="block text-xs text-muted-foreground">Audio / subtitles</label>
          <select id="anikoto-language" value={language} onChange={(event) => setLanguage(event.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
            <option value="sub">Sub</option>
            <option value="dub">Dub</option>
          </select>
        </div>
      </div>
      {busy && <p role="status" className="text-xs text-muted-foreground">Loading AniKoto data…</p>}
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
      {!busy && !error && !items.length && <p className="text-xs text-muted-foreground">No anime list was returned. Try reloading.</p>}
      {selectedEpisode && !src && <p role="status" className="text-xs text-muted-foreground">No {language === "sub" ? "sub" : "dub"} embed is available for this episode.</p>}
      {src && <EmbedIframe key={`${src}:${attempt}`} src={src} title={`AniKoto backup · ${titleOf(seriesData?.anime || seriesData)}`} />}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <button type="button" onClick={() => setAttempt((value) => value + 1)} className="inline-flex items-center gap-1.5 hover:text-primary"><RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Reload AniKoto</button>
        {src && <a href={src} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-primary">Open embed <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a>}
      </div>
    </div>
  );
}
