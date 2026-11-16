const ANILIST_QUERY = `query ($idMal: Int!) {
  Media(idMal: $idMal, type: ANIME) {
    id idMal title { romaji english native } coverImage { large extraLarge }
    description(asHtml: false) genres averageScore episodes duration status format
    startDate { year month day } endDate { year month day }
    studios(isMain: true) { nodes { name } }
  }
}`;
function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=900, stale-while-revalidate=3600");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.end(JSON.stringify(payload));
}
function isoDate(date) {
  if (!date?.year) return null;
  return [date.year, String(date.month || 1).padStart(2, "0"), String(date.day || 1).padStart(2, "0")].join("-");
}
async function fetchLegacyMal(id) {
  const response = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query: ANILIST_QUERY, variables: { idMal: Number(id) } }),
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error(`AniList HTTP ${response.status}`);
  const payload = await response.json();
  if (payload.errors?.length) throw new Error("AniList could not resolve this legacy MAL ID.");
  const media = payload.data?.Media;
  if (!media?.idMal) return null;
  return {
    mal_id: media.idMal,
    title: media.title?.romaji || media.title?.english || "Untitled anime",
    title_english: media.title?.english || media.title?.romaji || "",
    title_japanese: media.title?.native || "",
    title_synonyms: [],
    images: { webp: { large_image_url: media.coverImage?.extraLarge || media.coverImage?.large || "" } },
    synopsis: media.description || "",
    genres: (media.genres || []).map((name) => ({ name })),
    score: media.averageScore ? Number((media.averageScore / 10).toFixed(2)) : null,
    episodes: media.episodes || null,
    duration: media.duration || null,
    status: media.status || "",
    type: media.format || "TV",
    aired: { from: isoDate(media.startDate), to: isoDate(media.endDate) },
    studios: (media.studios?.nodes || []).map((studio) => ({ name: studio.name })),
    source: "anilist",
  };
}
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return send(res, 405, { error: "Method not allowed. Use GET." });
  }
  const source = String(req.query?.source || ""), id = String(req.query?.id || "");
  if (!["mal", "kitsu"].includes(source) || !/^\\d{1,12}$/.test(id)) {
    return send(res, 400, { error: "A valid catalogue source and numeric ID are required." });
  }
  try {
    if (source === "mal") {
      const data = await fetchLegacyMal(id);
      if (!data) return send(res, 404, { error: "This legacy MAL ID is not mapped in AniList." });
      return send(res, 200, { source: "mal", data });
    }
    const response = await fetch(`https://kitsu.io/api/edge/anime/${id}`, {
      headers: { Accept: "application/vnd.api+json" },
      signal: AbortSignal.timeout(7000),
    });
    if (!response.ok) return send(res, response.status === 404 ? 404 : 502, { error: "Kitsu detail is temporarily unavailable." });
    const payload = await response.json();
    if (!payload?.data?.id) return send(res, 502, { error: "Kitsu returned invalid detail data." });
    return send(res, 200, { source, data: payload.data });
  } catch (error) {
    return send(res, 502, { error: error?.message || "Backup catalogue request failed." });
  }
}
