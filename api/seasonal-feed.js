const ANILIST = "https://graphql.anilist.co";
const KITSU = "https://kitsu.io/api/edge/anime";
const QUERY = `query ($season: MediaSeason!, $year: Int!, $page: Int!) {
  Page(page: $page, perPage: 30) {
    pageInfo { total currentPage lastPage hasNextPage }
    media(type: ANIME, isAdult: false, season: $season, seasonYear: $year, status: RELEASING, sort: [POPULARITY_DESC]) {
      id title { romaji english native } coverImage { large extraLarge } episodes status format season seasonYear nextAiringEpisode { episode timeUntilAiring } startDate { year month day }
    }
  }
}`;
function send(res, status, body, cache = "public, s-maxage=180, stale-while-revalidate=600") {
  res.statusCode = status; res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", cache); res.setHeader("X-Content-Type-Options", "nosniff"); res.end(JSON.stringify(body));
}
function seasonNow() {
  const month = new Date().getUTCMonth();
  return { season: month < 3 ? "WINTER" : month < 6 ? "SPRING" : month < 9 ? "SUMMER" : "FALL", year: new Date().getUTCFullYear() };
}
async function fetchJson(url, options = {}) {
  let error;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, { ...options, headers: { Accept: "application/json", ...(options.headers || {}) }, signal: AbortSignal.timeout(5000) });
      if (!response.ok) { error = new Error(`HTTP ${response.status}`); if (response.status < 500 && response.status !== 429) throw error; }
      else return await response.json();
    } catch (caught) { error = caught; if (caught.status && caught.status < 500 && caught.status !== 429) throw caught; }
    if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 250 * (2 ** attempt)));
  }
  throw error || new Error("Provider unavailable");
}
function normalizeKitsu(entry) {
  const a = entry?.attributes || {};
  const rating = String(a.ageRating || "").toUpperCase(), guide = String(a.ageRatingGuide || "").toUpperCase();
  if (!entry?.id || a.nsfw === true || ["R", "R18", "R18+", "NC-17"].includes(rating) || /(18\\s*\\+|R18|NC-17|ADULT)/.test(guide)) return null;
  const titles = a.titles || {};
  return {
    id: `kitsu-${entry.id}`, source: "kitsu", title: titles.en || a.canonicalTitle || titles.en_jp || "Untitled anime",
    image: a.posterImage?.large || a.posterImage?.original || a.posterImage?.medium || "",
    episodes: a.episodeCount || null, status: a.status || "current", format: a.showType || "TV",
    nextAiringEpisode: null, startDate: a.startDate || null,
  };
}
export default async function handler(req, res) {
  if (req.method !== "GET") { res.setHeader("Allow", "GET"); return send(res, 405, { error: "Method not allowed" }, "no-store"); }
  const action = String(req.query?.action || "seasonal");
  if (!["seasonal", "upcoming"].includes(action)) return send(res, 400, { error: "Use action=seasonal or action=upcoming" }, "no-store");
  const page = Math.min(Math.max(Number(req.query?.page) || 1, 1), 10);
  const { season, year } = seasonNow();
  const [ani, kitsu] = await Promise.allSettled([
    fetchJson(ANILIST, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: QUERY, variables: { season, year, page } }) }),
    (async () => {
      const params = new URLSearchParams({ "filter[status]": action === "upcoming" ? "upcoming" : "current", "page[limit]": "20", "page[offset]": String((page - 1) * 20), sort: "-userCount" });
      return fetchJson(`${KITSU}?${params}`, { headers: { Accept: "application/vnd.api+json" } });
    })(),
  ]);
  const aniItems = ani.status === "fulfilled" && !ani.value.errors?.length ? (ani.value.data?.Page?.media || []).map((m) => ({
    id: String(m.id), source: "anilist", title: m.title?.english || m.title?.romaji || "Untitled anime",
    image: m.coverImage?.extraLarge || m.coverImage?.large || "", episodes: m.episodes || null, status: m.status || "",
    format: m.format || "TV", nextAiringEpisode: m.nextAiringEpisode || null, startDate: m.startDate || null,
  })) : [];
  const kitsuItems = kitsu.status === "fulfilled" ? (kitsu.value.data || []).map(normalizeKitsu).filter(Boolean) : [];
  const seen = new Set(aniItems.map((item) => item.title.toLocaleLowerCase()));
  const merged = [...aniItems, ...kitsuItems.filter((item) => !seen.has(item.title.toLocaleLowerCase()))].slice(0, 36);
  const providers = { anilist: aniItems.length ? "ok" : "unavailable", kitsu: kitsuItems.length ? "ok" : kitsu.status === "fulfilled" ? "empty" : "unavailable", jikan: "retired" };
  return send(res, 200, { ok: true, data: merged, season, year, providers, degraded: !merged.length }, merged.length ? undefined : "public, s-maxage=30, stale-while-revalidate=120");
}
