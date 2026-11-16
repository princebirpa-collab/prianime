const KITSU = "https://kitsu.io/api/edge/anime";
function send(res, status, payload) {
  res.statusCode = status; res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=180, stale-while-revalidate=600");
  res.setHeader("X-Content-Type-Options", "nosniff"); res.end(JSON.stringify(payload));
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function requestJson(url) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { Accept: "application/vnd.api+json" }, signal: AbortSignal.timeout(5000) });
      if (!response.ok) { lastError = new Error(`Kitsu HTTP ${response.status}`); if (response.status < 500 && response.status !== 429) throw lastError; }
      else return await response.json();
    } catch (error) { lastError = error; if (error.status && error.status < 500 && error.status !== 429) throw error; }
    if (attempt < 2) await sleep(250 * (2 ** attempt));
  }
  throw lastError || new Error("Kitsu unavailable");
}
export default async function handler(req, res) {
  if (req.method !== "GET") { res.setHeader("Allow", "GET"); return send(res, 405, { error: "Method not allowed. Use GET." }); }
  const query = typeof req.query?.q === "string" ? req.query.q.trim().slice(0, 120) : "";
  if (!query) return send(res, 400, { error: "A search query between 1 and 120 characters is required." });
  try {
    const params = new URLSearchParams({ "filter[text]": query, "page[limit]": "20" });
    const payload = await requestJson(`${KITSU}?${params}`);
    const needle = query.toLocaleLowerCase().normalize("NFKD").replace(/[\\u0300-\\u036f]/g, "");
    const data = (payload.data || []).filter((entry) => {
      const a = entry.attributes || {}, rating = String(a.ageRating || "").toUpperCase(), guide = String(a.ageRatingGuide || "").toUpperCase();
      const titles = [a.canonicalTitle, ...Object.values(a.titles || {}), ...(a.abbreviatedTitles || [])].filter(Boolean);
      return a.nsfw !== true && !["R", "R18", "R18+", "NC-17"].includes(rating) && !/(18\\s*\\+|R18|NC-17|ADULT)/.test(guide)
        && titles.some((title) => String(title).toLocaleLowerCase().normalize("NFKD").replace(/[\\u0300-\\u036f]/g, "").includes(needle));
    }).map((entry) => {
      const a = entry.attributes || {}, titles = a.titles || {};
      const synonyms = [...new Set([...Object.values(titles), ...(a.abbreviatedTitles || [])].filter((title) => typeof title === "string" && title.trim()))];
      return {
        kitsu_id: entry.id, images: { webp: { large_image_url: a.posterImage?.large || a.posterImage?.original || "" } },
        startDate: a.startDate, endDate: a.endDate, synopsis: a.synopsis || a.description, episodeCount: a.episodeCount,
        episodeLength: a.episodeLength, averageRating: a.averageRating, showType: a.showType, status: a.status,
        title: a.canonicalTitle || synonyms[0] || "", title_english: titles.en || a.canonicalTitle || "",
        title_japanese: titles.ja_jp || titles.en_jp || "", title_synonyms: synonyms, source: "kitsu",
      };
    }).filter((entry) => entry.title);
    return send(res, 200, { data, source: "kitsu", providers: { jikan: "retired", kitsu: "ok" } });
  } catch (error) {
    return send(res, 200, { data: [], source: "none", providers: { jikan: "retired", kitsu: "unavailable" }, warning: "Anime catalogue is temporarily unavailable." });
  }
}
