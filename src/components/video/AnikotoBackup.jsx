import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, X } from "lucide-react";

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

function normalizeTitle(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(season|cour|part)\s*\d+\b/g, " ")
    .replace(/\bs\s*\d+\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function findTitleMatch(items, wantedTitles) {
  const wanted = [...new Set(wantedTitles.map(normalizeTitle).filter(Boolean))];
  if (!wanted.length) return null;
  const exact = items.find((item) => wanted.includes(normalizeTitle(titleOf(item))));
  if (exact) return exact;
  const partial = items.filter((item) => {
    const candidate = normalizeTitle(titleOf(item));
    return candidate && candidate.length > 3 && wanted.some((name) => candidate.includes(name) || name.includes(candidate));
  });
  return partial.length === 1 ? partial[0] : null;
}

async function getJikanTitles(title) {
  const query = new URLSearchParams({ action: "search", q: title, page: "1" });
  const response = await fetch(`/api/jikan-anime?${query}`, { signal: AbortSignal.timeout(7000) });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.ok) return [title];
  const wanted = normalizeTitle(title);
  const exact = (payload.data || []).find((item) =>
    [item.title, item.title_english, item.title_japanese, ...(item.title_synonyms || [])]
      .some((candidate) => normalizeTitle(candidate) === wanted)
  );
  if (!exact) return [title];
  return [title, exact.title, exact.title_english, exact.title_japanese, ...(exact.title_synonyms || [])].filter(Boolean);
}

function rowsFrom(payload) {
  const data = payload?.data;
  const rows = Array.isArray(data) ? data : data?.anime || data?.results || data?.items || data?.data || [];
  return Array.isArray(rows) ? rows : [];
}

export default function AnikotoBackup({ title, season, episode, tmdbId }) {
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [seriesData, setSeriesData] = useState(null);
  const [episodeIndex, setEpisodeIndex] = useState("0");
  const [query, setQuery] = useState(title || "");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [seriesBusy, setSeriesBusy] = useState(false);
  const [seriesError, setSeriesError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setBusy(true);
    setError("");
    fetch("/api/anikoto?action=recent&page=1&per_page=50", { signal: AbortSignal.timeout(10000) })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || !payload?.ok) throw new Error(payload?.error || "AniKoto catalogue is unavailable.");
        return rowsFrom(payload);
      })
      .then(async (rows) => {
        if (cancelled) return;
        const unique = new Map();
        rows.forEach((item, index) => {
          const id = idOf(item);
          if (id && !unique.has(id)) unique.set(id, item);
          else if (!id) unique.set(`no-id-${index}-${titleOf(item)}`, item);
        });
        const list = [...unique.values()];
        setItems(list);
        const aliases = await getJikanTitles(title);
        if (cancelled) return;
        const match = findTitleMatch(list, aliases);
        if (match && idOf(match)) setSelectedId(idOf(match));
      })
      .catch((err) => { if (!cancelled) setError(err.message || "AniKoto is temporarily unavailable."); })
      .finally(() => { if (!cancelled) setBusy(false); });
    return () => { cancelled = true; };
  }, [title]);

  useEffect(() => {
    if (!selectedId) {
      setSeriesData(null);
      return;
    }
    let cancelled = false;
    setSeriesBusy(true);
    setSeriesError("");
    setSeriesData(null);
    fetch(`/api/anikoto?action=series&id=${encodeURIComponent(selectedId)}`, { signal: AbortSignal.timeout(10000) })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || !payload?.ok) throw new Error(payload?.error || "Could not load this AniKoto catalogue entry.");
        if (!cancelled) setSeriesData(payload.data);
      })
      .catch((err) => { if (!cancelled) setSeriesError(err.message || "Could not load episode metadata."); })
      .finally(() => { if (!cancelled) setSeriesBusy(false); });
    return () => { cancelled = true; };
  }, [selectedId]);

  const episodes = useMemo(() => episodesOf(seriesData), [seriesData]);
  useEffect(() => {
    if (!episodes.length) {
      setEpisodeIndex("0");
      return;
    }
    const requested = Number(episode);
    const index = episodes.findIndex((item, i) => Number(item?.number ?? item?.episode_number ?? item?.episode ?? i + 1) === requested);
    setEpisodeIndex(String(index >= 0 ? index : 0));
  }, [episodes, episode, season]);

  const filteredItems = useMemo(() => {
    const needle = normalizeTitle(query);
    return items.filter((item) => !needle || normalizeTitle(titleOf(item)).includes(needle));
  }, [items, query]);
  const selectedEpisode = episodes[Number(episodeIndex)] || null;

  return (
    <section className="space-y-3 rounded-xl border border-border/60 bg-card/40 p-4">
      <div>
        <p className="text-sm font-semibold">AniKoto catalogue · Extra source</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          TMDB match: {tmdbId ? `TV ID ${tmdbId}` : "not mapped"} · Season {season ?? 1} · Episode {episode ?? 1}. TMDB supplies title and episode mapping, not video files.
        </p>
      </div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search AniKoto catalogue…" autoComplete="off" className="w-full rounded-xl border border-border bg-background py-3 pl-9 pr-10 text-sm outline-none focus:border-primary" />
        {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>}
      </div>
      <label className="block text-xs text-muted-foreground">Anime title
        <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
          <option value="">Select from latest AniKoto entries</option>
          {filteredItems.map((item, index) => {
            const id = idOf(item);
            return id ? <option key={id} value={id}>{titleOf(item)}</option> : <option key={`missing-${index}`} value="" disabled>{titleOf(item)}</option>;
          })}
        </select>
      </label>
      <label className="block text-xs text-muted-foreground">Episode catalogue
        <select value={episodeIndex} onChange={(event) => setEpisodeIndex(event.target.value)} disabled={!episodes.length} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
          {episodes.map((item, index) => <option key={idOf(item) || index} value={String(index)}>Episode {episodeLabel(item, index)}</option>)}
        </select>
      </label>
      {(busy || seriesBusy) && <p role="status" className="text-xs text-muted-foreground"><Loader2 className="mr-1 inline h-3.5 w-3.5 animate-spin" /> Loading AniKoto metadata…</p>}
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
      {seriesError && <p role="alert" className="text-xs text-destructive">{seriesError}</p>}
      {!busy && !error && !items.length && <p className="text-xs text-muted-foreground">No AniKoto catalogue entries were returned.</p>}
      {!busy && !error && items.length > 0 && !filteredItems.length && <p className="text-xs text-muted-foreground">No match in the latest 50 entries. This catalogue endpoint does not provide a full-library search.</p>}
      {selectedEpisode && <p className="text-xs text-muted-foreground">Selected catalogue entry: {episodeLabel(selectedEpisode, Number(episodeIndex))}</p>}
      <p className="text-xs leading-5 text-muted-foreground">Episode names are catalogue metadata only. Video playback stays disabled until a provider supplies an authorized embed or media URL.</p>
    </section>
  );
}
