const JIKAN_SEARCH = "https://api.jikan.moe/v4/anime";
const KITSU_SEARCH = "https://kitsu.io/api/edge/anime";

function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=180, stale-while-revalidate=600");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.end(JSON.stringify(payload));
}

async function searchJikan(query) {
  const response = await fetch(
    `${JIKAN_SEARCH}?q=${encodeURIComponent(query)}&limit=12&sfw=true`,
    { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(4500) },
  );
  if (!response.ok) return [];
  const payload = await response.json();
  return Array.isArray(payload?.data) ? payload.data : [];
}

// Kitsu is a separate catalog fallback, so search can still work when Jikan/MAL
// is slow. Results are used only as alternate titles, then resolved to AniList IDs.
async function searchKitsu(query) {
  const response = await fetch(
    `${KITSU_SEARCH}?filter[text]=${encodeURIComponent(query)}&page[limit]=5`,
    { headers: { Accept: "application/vnd.api+json" }, signal: AbortSignal.timeout(6500) },
  );
  if (!response.ok) return [];
  const payload = await response.json();
  return (Array.isArray(payload?.data) ? payload.data : []).filter((entry) => {\n    const rating = String(entry?.attributes?.ageRating || "").toUpperCase();\n    const guide = String(entry?.attributes?.ageRatingGuide || "").toUpperCase();\n    return !["R", "R18", "R18+", "NC-17"].includes(rating) && !/18\\s*\\+|R18|NC-17|ADULT/.test(guide);\n  }).map((entry) => {
    const attrs = entry?.attributes || {};
    const titles = attrs.titles || {};
    const synonyms = [
      ...Object.values(titles),
      ...(Array.isArray(attrs.abbreviatedTitles) ? attrs.abbreviatedTitles : []),
    ].filter((title) => typeof title === "string" && title.trim());
    return {
      kitsu_id: entry.id,
      images: { webp: { large_image_url: attrs.posterImage?.large || attrs.posterImage?.original || "" } },
      startDate: attrs.startDate, endDate: attrs.endDate, synopsis: attrs.synopsis || attrs.description,
      episodeCount: attrs.episodeCount, episodeLength: attrs.episodeLength, averageRating: attrs.averageRating, showType: attrs.showType, status: attrs.status,
      title: attrs.canonicalTitle || synonyms[0] || "",
      title_english: titles.en || attrs.canonicalTitle || "",
      title_japanese: titles.ja_jp || titles.en_jp || "",
      title_synonyms: [...new Set(synonyms)],
      source: "kitsu",
    };
  }).filter((entry) => entry.title);
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return send(res, 405, { error: "Method not allowed. Use GET." });
  }

  const query = typeof req.query?.q === "string" ? req.query.q.trim() : "";
  if (!query || query.length > 120) {
    return send(res, 400, { error: "A search query between 1 and 120 characters is required." });
  }

  // Do not let one slow upstream block the whole title-search fallback chain.
  try {
    const malData = await searchJikan(query);
    if (malData.length) return send(res, 200, { data: malData, source: "mal" });
  } catch {
    // Jikan can time out or be rate-limited; Kitsu is the next independent source.
  }

  try {
    const fallback = await searchKitsu(query);
    if (fallback.length) return send(res, 200, { data: fallback, source: "kitsu" });
    return send(res, 200, { data: [], source: "kitsu" });
  } catch {
    return send(res, 200, {
      data: [],
      source: "none",
      warning: "Catalog search providers are temporarily unavailable.",
    });
  }
}
