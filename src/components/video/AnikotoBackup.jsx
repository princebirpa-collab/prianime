import { useEffect, useMemo, useState } from "react";
import { ExternalLink, RotateCcw, Search, X } from "lucide-react";
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

function episodeNumber(item, index) {
  const value = item?.number ?? item?.episode_number ?? item?.episodeNumber ?? item?.episode ?? index + 1;
  const parsed = Number(String(value).match(/\d+(?:\.\d+)?/)?.[0]);
  return Number.isFinite(parsed) ? parsed : index + 1;
}

function episodeLabel(item, index) {
  return String(item?.title || item?.name || item?.episode_title || item?.number || item?.episode || index + 1);
}

function normalizeTitle(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\b(season|cour|part)\s*\d+\b/g, " ")
    .replace(/\bs\s*\d+\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function findTitleMatch(items, wantedTitle) {
  const wanted = normalizeTitle(wantedTitle);
  if (!wanted) return null;
  const exact = items.find((item) => normalizeTitle(titleOf(item)) === wanted);
  if (exact) return exact;
  return items.find((item) => {
    const candidate = normalizeTitle(titleOf(item));
    return candidate && (candidate.includes(wanted) || wanted.includes(candidate));
  }) || null;
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

export default function AnikotoBackup({ title, season, episode }) {
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
    Promise.all([1, 2, 3].map((page) =>
      fetch(`/api/anikoto?action=recent&page=${page}&per_page=50`)
        .then(async (response) => {
          const payload = await response.json().catch(() => ({}));
          if (!response.ok || !payload?.ok) throw new Error(payload?.error || "AniKoto list is unavailable.");
          const data = payload.data;
          const rows = Array.isArray(data) ? data : data?.anime || data?.results || data?.items || data?.data || [];
          if (!Array.isArray(rows)) throw new Error("AniKoto returned an unexpected anime list.");
          return rows;
        })
    ))
      .then((pages) => {
        if (cancelled) return;
        const unique = new Map();
        pages.flat().forEach((item, index) => {
          const id = idOf(item);
          if (id && !unique.has(id)) unique.set(id, item);
          else if (!id) unique.set(`no-id-${index}-${titleOf(item)}`, item);
        });
        const rows = [...unique.values()];
        setItems(rows);
        const match = findTitleMatch(rows, title);
        if (match && idOf(match)) setSelectedId(idOf(match));
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
        if (!cancelled) setSeriesData(payload.data);
      })
      .catch((err) => { if (!cancelled) setError(err.message || "Could not load episodes."); })
      .finally(() => { if (!cancelled) setBusy(false); });
    return () => { cancelled = true; };
  }, [selectedId]);

  const episodes = useMemo(() => episodesOf(seriesData), [seriesData]);

  useEffect(() => {
    if (!episodes.length) {
      setEpisodeIndex("0");
      return;
    }
    const requested = Number(episode);
    if (Number.isFinite(requested) && requested > 0) {
      const matchIndex = episodes.findIndex((item, index) => episodeNumber(item, index) === requested);
      setEpisodeIndex(String(matchIndex >= 0 ? matchIndex : 0));
    } else {
      setEpisodeIndex("0");
    }
  }, [episodes, episode, season]);

  const selectedEpisode = episodes[Number(episodeIndex)] || null;
  const src = selectedEpisode ? embedOf(selectedEpisode, language) : "";
  const filteredItems = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => !needle || titleOf(item).toLowerCase().includes(needle));
  }, [items, query]);

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">AniKoto · Extra backup. It tries to match the current title and episode; Vidstuck and AnimeSalt remain unchanged.</p>
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(180px,0.7fr)]">
        <div className="space-y-1.5">
          <label htmlFor="anikoto-search" className="block text-xs font-semibold text-foreground">Search anime</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input id="anikoto-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Type an anime title…" autoComplete="off" className="w-full rounded-xl border border-border bg-background py-3 pl-9 pr-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />
            {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear anime search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"><X className="h-4 w-4" aria-hidden="true" /></button>}
          </div>
          <p className="text-[11px] text-muted-foreground">Searches the anime currently loaded from AniKoto.</p>
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
      {!busy && !error && items.length > 0 && filteredItems.length === 0 && <p role="status" className="text-xs text-muted-foreground">No loaded anime matches “{query}”. Try another title or reload the list.</p>}
      {selectedEpisode && !src && <p role="status" className="text-xs text-muted-foreground">No {language === "sub" ? "sub" : "dub"} embed is available for this episode.</p>}
      {src && <EmbedIframe key={`${src}:${attempt}`} src={src} title={`AniKoto backup · ${titleOf(seriesData?.anime || seriesData)}`} />}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <button type="button" onClick={() => setAttempt((value) => value + 1)} className="inline-flex items-center gap-1.5 hover:text-primary"><RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Reload AniKoto</button>
        {src && <a href={src} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-primary">Open embed <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a>}
      </div>
    </div>
  );
}
