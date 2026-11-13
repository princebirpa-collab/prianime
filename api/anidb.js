import { gunzipSync } from "node:zlib";

const TITLE_DUMP_URL = "https://anidb.net/api/anime-titles.dat.gz";
const JIKAN_SEARCH_URL = "https://api.jikan.moe/v4/anime";
const CACHE_TTL = 12 * 60 * 60 * 1000;
let titleRowsPromise;
const responseCache = new Map();

function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=900, stale-while-revalidate=3600");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.end(JSON.stringify(payload));
}

function normalizeTitle(value) {
  return String(value || "").toLocaleLowerCase().normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

async function loadTitleRows() {
  if (titleRowsPromise) return titleRowsPromise;
  titleRowsPromise = (async () => {
    const response = await fetch(TITLE_DUMP_URL, {
      headers: { Accept: "application/gzip, application/octet-stream" },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error("AniDB title index is temporarily unavailable.");
    const compressed = Buffer.from(await response.arrayBuffer());
    const text = gunzipSync(compressed).toString("utf8");
    const rows = [];
    for (const line of text.split(/\r?\n/)) {
      if (!line || line.startsWith("#")) continue;
      const parts = line.split("|");
      if (parts.length < 4 || !/^\d+$/.test(parts[0])) continue;
      const title = parts.slice(3).join("|").trim();
      if (title) rows.push({ aid: parts[0], type: parts[1], lang: parts[2], title, normalized: normalizeTitle(title) });
    }
    if (!rows.length) throw new Error("AniDB title index contained no entries.");
    return rows;
  })().catch((error) => {
    titleRowsPromise = null;
    throw error;
  });
  return titleRowsPromise;
}

function findTitleAliases(rows, query) {
  const q = normalizeTitle(query);
  if (!q) return [];
  const tokens = q.split(" ").filter(Boolean);
  const byAid = new Map();
  for (const row of rows) {
    const title = row.normalized;
    if (!title) continue;
    let score = 0;
    if (title === q) score = 120;
    else if (title.startsWith(q)) score = 105;
    else if (title.includes(q) || q.includes(title)) score = 90;
    else {
      const matched = tokens.filter((token) => title.split(" ").some((part) => part.startsWith(token))).length;
      if (matched === tokens.length && tokens.length) score = 70 + matched;
    }
    if (score < 70) continue;
    const current = byAid.get(row.aid) || { aid: row.aid, score, titles: [] };
    current.score = Math.max(current.score, score);
    if (!current.titles.includes(row.title)) current.titles.push(row.title);
    byAid.set(row.aid, current);
  }
  return [...byAid.values()].sort((a, b) => b.score - a.score).slice(0, 6);
}

async function searchJikanByAliases(matches) {
  const found = new Map();
  for (const match of matches.slice(0, 3)) {
    const alias = match.titles[0];
    if (!alias) continue;
    try {
      const response = await fetch(`${JIKAN_SEARCH_URL}?q=${encodeURIComponent(alias)}&limit=8&sfw=true`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(5000),
      });
      if (response.ok) {
        const payload = await response.json();
        for (const item of payload?.data || []) {
          if (item?.mal_id) found.set(String(item.mal_id), item);
        }
      }
    } catch { /* continue with the next title alias */ }
  }
  return [...found.values()];
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return send(res, 405, { error: "Method not allowed. Use GET." });
  }
  const request = String(req.query?.request || "search").toLowerCase();
  if (request !== "search") {
    return send(res, 503, {
      error: "AniDB HTTP API recommendations/details need a registered AniDB client. Title search is available through the public title index.",
      code: "ANIDB_CLIENT_NOT_CONFIGURED",
    });
  }
  const query = typeof req.query?.q === "string" ? req.query.q.trim() : "";
  if (!query || query.length > 100) return send(res, 400, { error: "A search query between 1 and 100 characters is required." });
  const key = normalizeTitle(query);
  const cached = responseCache.get(key);
  if (cached && cached.expires > Date.now()) return send(res, 200, cached.value);
  try {
    const rows = await loadTitleRows();
    const matches = findTitleAliases(rows, query);
    const data = await searchJikanByAliases(matches);
    const payload = { source: "AniDB title index + Jikan SFW", query, data, matchedTitleGroups: matches.length };
    if (responseCache.size > 120) responseCache.clear();
    responseCache.set(key, { value: payload, expires: Date.now() + CACHE_TTL });
    return send(res, 200, payload);
  } catch (error) {
    return send(res, 502, { error: error?.message || "AniDB title search is temporarily unavailable.", data: [] });
  }
}
