const ANIME_TERMS = ["anime","manga","manhwa","otaku","animatic","anime edit","anime oc","original character","cosplay","amv","opening","ending","waifu","husbando","shonen","shojo","seinen","isekai","mecha","slice of life","madhouse","ufotable","toei","mappa","kyoto animation"];
export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); res.status(405).json({ ok: false, error: "Use POST" }); return; }
  const { title = "", description = "", tags = [], animeTitle = "" } = req.body || {};
  const text = [title, description, animeTitle, ...(Array.isArray(tags) ? tags : [])].join(" ").toLowerCase().slice(0, 1800);
  if (!String(title).trim() || !String(animeTitle).trim()) { res.status(400).json({ ok: false, error: "Add a reel title and the anime/series it relates to." }); return; }
  const keywordMatches = ANIME_TERMS.filter((term) => text.includes(term));
  let catalogueMatch = null;
  try {
    const response = await fetch("https://graphql.anilist.co", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ query: "query ($search: String) { Media(search: $search, type: ANIME, isAdult: false) { id title { romaji english } format genres } }", variables: { search: String(animeTitle).trim().slice(0, 100) } }), signal: AbortSignal.timeout(6500) });
    if (response.ok) { const payload = await response.json(); catalogueMatch = payload?.data?.Media || null; }
  } catch { /* allow text-based review when catalogue is unavailable */ }
  if (catalogueMatch) return res.status(200).json({ ok: true, category: "anime", confidence: "high", matchedTitle: catalogueMatch.title.english || catalogueMatch.title.romaji, tags: [...new Set(["anime", ...(catalogueMatch.genres || []).map((g) => g.toLowerCase()), ...keywordMatches])].slice(0, 10), note: "Series metadata matched. This checks text metadata only, not the video frames." });
  if (keywordMatches.length >= 2) return res.status(200).json({ ok: true, category: "anime-related-review", confidence: "medium", tags: [...new Set(["anime-related", ...keywordMatches])].slice(0, 10), note: "Anime-related wording detected. Human reports and moderation may still be needed." });
  return res.status(422).json({ ok: false, error: "Could not verify an anime connection. Add the exact anime/series name and relevant anime tags. Original anime-inspired work is allowed when clearly described." });
}
