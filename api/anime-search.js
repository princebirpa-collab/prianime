const ANILIST = "https://graphql.anilist.co";
const KITSU = "https://kitsu.io/api/edge/anime";
const CORE = `id idMal title { romaji english native } synonyms coverImage { extraLarge large color } bannerImage description(asHtml: false) genres averageScore popularity episodes duration status format season seasonYear startDate { year month day } endDate { year month day } studios(isMain: true) { nodes { name } } trailer { id site } nextAiringEpisode { episode timeUntilAiring }`;
const SEARCH = `query ($search: String!, $page: Int!) { Page(page: $page, perPage: 50) { pageInfo { total currentPage lastPage hasNextPage } media(type: ANIME, isAdult: false, search: $search, sort: [SEARCH_MATCH]) { ${CORE} } } }`;

function send(res, status, data, cache = "public, s-maxage=60, stale-while-revalidate=300") {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", cache);
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.end(JSON.stringify(data));
}
function clean(value) {
  return String(value || "").trim().replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 100);
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function requestJson(url, options = {}) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, { ...options, headers: { Accept: "application/json", ...(options.headers || {}) }, signal: AbortSignal.timeout(5000) });
      if (!response.ok) {
        const error = new Error(`Upstream HTTP ${response.status}`);
        error.status = response.status;
        if (response.status < 500 && response.status !== 429) throw error;
        lastError = error;
        const retryAfter = Number(response.headers.get("retry-after")) * 1000;
        if (attempt < 2) await sleep(Math.min(retryAfter || 250 * (2 ** attempt), 1500));
        continue;
      }
      return await response.json();
    } catch (error) {
      lastError = error;
      if (error.status && error.status !== 429 && error.status < 500) throw error;
      if (attempt < 2) await sleep(250 * (2 ** attempt));
    }
  }
  throw lastError || new Error("Upstream unavailable");
}
async function aniList(query, page) {
  const payload = await requestJson(ANILIST, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: SEARCH, variables: { search: query, page } }),
  });
  if (payload.errors?.length) {
    const error = new Error(payload.errors[0].message || "AniList query failed");
    error.status = payload.errors[0].status || 502;
    throw error;
  }
  return { items: payload.data?.Page?.media || [], pageInfo: payload.data?.Page?.pageInfo || null };
}
function normalizeText(value) {
  return String(value || "").toLocaleLowerCase().normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}
async function kitsu(query) {
  const params = new URLSearchParams({ "filter[text]": query, "page[limit]": "20" });
  const payload = await requestJson(`${KITSU}?${params}`, {
    headers: { Accept: "application/vnd.api+json" },
  });
  const needle = normalizeText(query);
  const data = (payload.data || []).filter((entry) => {
    const a = entry.attributes || {};
    const rating = String(a.ageRating || "").toUpperCase();
    const guide = String(a.ageRatingGuide || "").toUpperCase();
    const titles = [a.canonicalTitle, ...Object.values(a.titles || {}), ...(a.abbreviatedTitles || [])].map(normalizeText).filter(Boolean);
    const match = needle.length >= 2 && titles.some((title) => title === needle || title.startsWith(needle) || (title.length >= 5 && needle.startsWith(title)));
    return match && a.nsfw !== true && !["R", "R18", "R18+", "NC-17"].includes(rating) && !/(18\s*\\+|R18|NC-17|ADULT)/.test(guide);
  });
  return data;
}
export default async function handler(req, res) {
  if (req.method !== "GET") { res.setHeader("Allow", "GET"); return send(res, 405, { error: "Method not allowed." }, "no-store"); }
  const query = clean(req.query?.q);
  const page = Math.min(Math.max(Number(req.query?.page) || 1, 1), 10);
  if (query.length < 2) return send(res, 200, { anilist: [], mal: [], kitsu: [], pageInfo: null, providers: { anilist: "skipped", jikan: "retired", kitsu: "skipped" } });

  const typoVariant = normalizeText(query).replace(/z$/i, "").trim();
  const [primaryAni, primaryKitsu] = await Promise.allSettled([aniList(query, page), kitsu(query)]);
  let aniResult = primaryAni.status === "fulfilled" ? primaryAni.value : { items: [], pageInfo: null };
  let kitsuResult = primaryKitsu.status === "fulfilled" ? primaryKitsu.value : [];
  let aniStatus = primaryAni.status === "fulfilled" ? "ok" : "unavailable";
  let kitsuStatus = primaryKitsu.status === "fulfilled" ? "ok" : "unavailable";

  // Only spend a second provider request when the exact search had no match.
  if (!aniResult.items.length && typoVariant && typoVariant !== normalizeText(query)) {
    try { aniResult = await aniList(typoVariant, page); if (aniResult.items.length) aniStatus = "ok"; } catch { /* preserve primary provider status */ }
  }
  if (!kitsuResult.length && typoVariant && typoVariant !== normalizeText(query)) {
    try { kitsuResult = await kitsu(typoVariant); if (kitsuResult.length) kitsuStatus = "ok"; } catch { /* preserve primary provider status */ }
  }
  const aniMap = new Map((aniResult.items || []).map((item) => [String(item.id), item]));
  const anyProvider = aniMap.size || kitsuResult.length;
  if (!anyProvider && aniStatus === "unavailable" && kitsuStatus === "unavailable") {
    return send(res, 200, { anilist: [], mal: [], kitsu: [], pageInfo: null, providers: { anilist: "unavailable", jikan: "retired", kitsu: "unavailable" }, degraded: true }, "public, s-maxage=15, stale-while-revalidate=60");
  }
  return send(res, 200, {
    anilist: [...aniMap.values()], mal: [], kitsu: kitsuResult, pageInfo: aniResult.pageInfo,
    providers: { anilist: aniStatus, jikan: "retired", kitsu: kitsuStatus },
    degraded: !anyProvider,
  });
}
