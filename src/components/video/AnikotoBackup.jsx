import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, X, Play, Languages, ExternalLink } from "lucide-react";
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
  const value = item?.number ?? item?.episode_number ?? item?.episode ?? item?.ep ?? index + 1;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : index + 1;
}
function episodeLabel(item, index) {
  return String(item?.title || item?.name || item?.episode_title || item?.number || item?.episode || index + 1);
}
function normalizeTitle(value) {
  return String(value || "").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(season|cour|part)\s*\d+\b/g, " ").replace(/\bs\s*\d+\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
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
  try {
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
  } catch {
    return [title];
  }
}
function rowsFrom(payload) {
  const candidates = [
    payload?.data,
    payload?.data?.anime,
    payload?.data?.results,
    payload?.data?.items,
    payload?.data?.data,
    payload?.anime,
    payload?.recent_anime,
    payload?.recentAnime,
    payload?.results,
    payload?.items,
  ];
  for (const value of candidates) {
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object" && (value.id || value.anime_id)) return [value];
  }
  return [];
}
async function searchAniListTitles(title) {
  const query = `query ($search: String) {
    Page(page: 1, perPage: 10) {
      media(type: ANIME, isAdult: false, search: $search, sort: SEARCH_MATCH) {
        id
        title { romaji english native }
      }
    }
  }`;
  const response = await fetch("/api/anilist", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables: { search: title } }),
    signal: AbortSignal.timeout(9000),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.errors?.length) throw new Error(payload?.errors?.[0]?.message || "Anime title search is temporarily unavailable.");
  return (payload?.data?.Page?.media || []).map((item) => ({
    id: item.id,
    titles: [item.title?.english, item.title?.romaji, item.title?.native].filter(Boolean),
  }));
}
export default function AnikotoBackup({ title, season = 1, episode = 1 }) {
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [seriesData, setSeriesData] = useState(null);
  const [episodeIndex, setEpisodeIndex] = useState("0");
  const [language, setLanguage] = useState("sub");
  const [query, setQuery] = useState(title || "");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [seriesBusy, setSeriesBusy] = useState(false);
  const [seriesError, setSeriesError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setBusy(true); setError("");
    (async () => {
      try {
        // AniKoto's recent endpoint is paginated. Search several pages so the
        // current title is not missed just because it is outside the first 50.
        const rows = [];
        for (let page = 1; page <= 3; page += 1) {
          const response = await fetch(`/api/anikoto?action=recent&page=${page}&per_page=50`, {
            signal: AbortSignal.timeout(10000),
          });
          const payload = await response.json().catch(() => ({}));
          if (!response.ok || !payload?.ok) {
            if (page === 1) throw new Error(payload?.error || "AniKoto catalogue is unavailable.");
            break;
          }
          const pageRows = rowsFrom(payload);
          rows.push(...pageRows);
          if (pageRows.length < 50) break;
        }
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
        let match = findTitleMatch(list, aliases);
        if (match && idOf(match)) {
          setSelectedId(idOf(match));
          return;
        }
        // Use AniList only to discover canonical spellings, then match those
        // spellings against actual AniKoto IDs. Never invent a series ID or
        // an embed URL when the provider has not returned one.
        if (title) {
          const catalogueTitles = await searchAniListTitles(title);
          if (cancelled) return;
          const canonicalNames = catalogueTitles.flatMap((item) => item.titles);
          match = findTitleMatch(list, [...aliases, ...canonicalNames]);
          if (match && idOf(match)) {
            setSelectedId(idOf(match));
            setQuery(titleOf(match));
          } else {
            setError(`"${title}" is not present in AniKoto's recent feed. AniKoto has not exposed a title-search endpoint here, so its series ID is still needed.`);
          }
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "AniKoto is temporarily unavailable.");
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => { cancelled = true; };
  }, [title]);

  useEffect(() => {
    if (!selectedId) { setSeriesData(null); return; }
    if (selectedId.startsWith("anilist:")) return;
    let cancelled = false;
    setSeriesBusy(true); setSeriesError(""); setSeriesData(null);
    fetch(`/api/anikoto?action=series&id=${encodeURIComponent(selectedId)}`, { signal: AbortSignal.timeout(10000) })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || !payload?.ok) throw new Error(payload?.error || "Could not load AniKoto episodes.");
        if (!cancelled) setSeriesData(payload.data?.data || payload.data);
      })
      .catch((err) => { if (!cancelled) setSeriesError(err.message || "Could not load episode metadata."); })
      .finally(() => { if (!cancelled) setSeriesBusy(false); });
    return () => { cancelled = true; };
  }, [selectedId]);

  const episodes = useMemo(() => episodesOf(seriesData), [seriesData]);
  useEffect(() => {
    if (!episodes.length) { setEpisodeIndex("0"); return; }
    const requested = Number(episode);
    let index = episodes.findIndex((item, i) => episodeNumber(item, i) === requested);
    if (index < 0 && Number(season) > 1) {
      index = episodes.findIndex((item) => Number(item?.season ?? item?.season_number ?? 1) === Number(season)
        && episodeNumber(item, 0) === requested);
    }
    setEpisodeIndex(String(index >= 0 ? index : 0));
  }, [episodes, episode, season]);

  const filteredItems = useMemo(() => {
    const needle = normalizeTitle(query);
    return items.filter((item) => !needle || normalizeTitle(titleOf(item)).includes(needle));
  }, [items, query]);
  const selectedEpisode = episodes[Number(episodeIndex)] || null;
  const embeds = episodeEmbeds(selectedEpisode);
  const activeEmbed = embeds[language] || embeds.sub || embeds.dub || "";
  const activeLanguage = embeds[language] ? language : embeds.sub ? "sub" : "dub";
  const selectedTitle = seriesData?.anime?.title || seriesData?.anime?.name || titleOf(items.find((item) => idOf(item) === selectedId) || {});
  const episodeNo = selectedEpisode ? episodeNumber(selectedEpisode, Number(episodeIndex)) : Number(episode);

  return (
    <section className="space-y-3 rounded-xl border border-border/60 bg-card/40 p-3 sm:p-4" aria-label="AniKoto video player">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">AniKoto · Extra video server</p>
          <p className="mt-1 text-xs text-muted-foreground">{selectedTitle || title} · Season {season} · Episode {episodeNo}</p>
        </div>
        <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-[10px] font-semibold text-primary">Responsive player</span>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find title in recent AniKoto entries…" autoComplete="off" className="w-full rounded-xl border border-border bg-background py-3 pl-9 pr-10 text-sm outline-none focus:border-primary" />
        {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>}
      </div>

      <label className="block text-xs text-muted-foreground">Anime
        <select value={selectedId} onChange={(event) => { setSeriesData(null); setSelectedId(event.target.value); }} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm">
          <option value="">Select anime from AniKoto recent list</option>
          {filteredItems.map((item, index) => {
            const id = idOf(item);
            return id ? <option key={id} value={id}>{titleOf(item)}</option> : <option key={`missing-${index}`} value="" disabled>{titleOf(item)}</option>;
          })}
        </select>
      </label>

      <label className="block text-xs text-muted-foreground">Episode
        <select value={episodeIndex} onChange={(event) => setEpisodeIndex(event.target.value)} disabled={!episodes.length} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm">
          {episodes.map((item, index) => <option key={idOf(item) || index} value={String(index)}>Episode {episodeLabel(item, index)}</option>)}
        </select>
      </label>

      {Object.values(embeds).some(Boolean) && (
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Audio language">
          <span className="mr-1 inline-flex items-center gap-1 text-xs text-muted-foreground"><Languages className="h-3.5 w-3.5" /> Audio</span>
          {["sub", "dub"].filter((key) => embeds[key]).map((key) => (
            <button key={key} type="button" aria-pressed={language === key} onClick={() => setLanguage(key)} className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase transition ${language === key ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:border-primary/60"}`}>{key}</button>
          ))}
        </div>
      )}

      {(busy || seriesBusy) && <p role="status" className="text-xs text-muted-foreground"><Loader2 className="mr-1 inline h-3.5 w-3.5 animate-spin" /> Loading AniKoto episodes…</p>}
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
      {seriesError && <p role="alert" className="text-xs text-destructive">{seriesError}</p>}
      {!busy && !error && !items.length && <p className="text-xs text-muted-foreground">AniKoto did not return any recent titles.</p>}
      {!busy && !error && items.length > 0 && !filteredItems.length && <p className="text-xs text-muted-foreground">No match in the latest 50 entries. Select another title or try again later.</p>}

      {activeEmbed ? (
        <div className="space-y-2">
          <EmbedIframe key={`${selectedId}-${episodeIndex}-${activeLanguage}-${activeEmbed}`} src={activeEmbed} title={`AniKoto ${activeLanguage.toUpperCase()} player · ${selectedTitle} episode ${episodeNo}`} />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] text-muted-foreground">AniKoto embed · {activeLanguage.toUpperCase()} · Episode {episodeNo}</p>
            <a href={activeEmbed} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">Open embed <ExternalLink className="h-3 w-3" /></a>
          </div>
        </div>
      ) : (
        <div className="grid aspect-video place-items-center rounded-xl border border-border bg-background p-5 text-center">
          <div className="max-w-md">
            <Play className="mx-auto mb-2 h-7 w-7 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">{selectedEpisode ? "No SUB / DUB embed listed for this episode" : "Choose an anime and episode"}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">The player appears when AniKoto returns an HTTPS embed URL for the selected episode.</p>
          </div>
        </div>
      )}
    </section>
  );
}
