const ANILIST = "https://graphql.anilist.co";
const KITSU = "https://kitsu.io/api/edge/anime";
const QUERY = `query ($page: Int!, $sort: [MediaSort]!) {
  Page(page: $page, perPage: 25) {
    pageInfo { total currentPage lastPage hasNextPage }
    media(type: ANIME, isAdult: false, sort: $sort) {
      id title { romaji english native } coverImage { large extraLarge } averageScore popularity episodes status format season seasonYear startDate { year month day }
    }
  }
}`;
function send(res, status, payload) {
  res.statusCode = status; res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=900");
  res.setHeader("X-Content-Type-Options", "nosniff"); res.end(JSON.stringify(payload));
}
async function fetchWithRetry(url, options = {}) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, { ...options, signal: AbortSignal.timeout(5000) });
      if (!response.ok) { lastError = new Error(`HTTP ${response.status}`); if (response.status < 500 && response.status !== 429) throw lastError; }
      else return response.json();
    } catch (error) { lastError = error; if (error.status && error.status < 500 && error.status !== 429) throw error; }
    if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 250 * (2 ** attempt)));
  }
  throw lastError || new Error("Provider unavailable");
}
function safeKitsu(entry) {
  const a = entry.attributes || {}, rating = String(a.ageRating || "").toUpperCase(), guide = String(a.ageRatingGuide || "").toUpperCase();
  if (a.nsfw === true || ["R", "R18", "R18+", "NC-17"].includes(rating) || /(18\\s*\\+|R18|NC-17|ADULT)/.test(guide)) return false;
  return true;
}
export default async function handler(req, res) {
  if (req.method !== "GET") { res.setHeader("Allow", "GET"); return send(res, 405, { error: "Method not allowed" }); }
  const page = Math.max(1, Math.min(100, Number(req.query?.page) || 1));
  const mode = String(req.query?.mode || "popular");
  const sort = mode === "top" ? ["SCORE_DESC"] : mode === "seasonal" ? ["POPULARITY_DESC"] : ["POPULARITY_DESC"];
  const kitsuParams = new URLSearchParams({ "page[limit]": "20", "page[offset]": String((page - 1) * 20), sort: mode === "top" ? "-averageRating" : "-userCount" });
  const [ani, kitsu] = await Promise.allSettled([
    fetchWithRetry(ANILIST, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ query: QUERY, variables: { page, sort } }) }),
    fetchWithRetry(`${KITSU}?${kitsuParams}`, { headers: { Accept: "application/vnd.api+json" } }),
  ]);
  const aniData = ani.status === "fulfilled" && !ani.value.errors?.length ? ani.value.data?.Page : null;
  const kitsuData = kitsu.status === "fulfilled" ? (kitsu.value.data || []).filter(safeKitsu) : [];
  if (!aniData && !kitsuData.length) return send(res, 200, { page, mode, anilist: [], kitsu: [], providers: { anilist: "unavailable", kitsu: "unavailable", jikan: "retired" }, degraded: true });
  return send(res, 200, {
    page, mode, anilist: aniData?.media || [], kitsu: kitsuData,
    providers: { anilist: aniData ? "ok" : "unavailable", kitsu: kitsu.status === "fulfilled" ? "ok" : "unavailable", jikan: "retired" },
    totals: { anilist: aniData?.pageInfo?.total || null, kitsu: kitsu.value?.meta?.count || null },
    hasNext: Boolean(aniData?.pageInfo?.hasNextPage) || (kitsu.status === "fulfilled" && page * 20 < Number(kitsu.value?.meta?.count || 0)),
  });
}
