const MAPPING_URL = "https://raw.githubusercontent.com/Fribb/anime-lists/master/anime-list-full.json";

const verified = {
  141953: { mediaType: "tv", tmdbId: 280564, season: 1, episodeOffset: 0, source: "TMDB verified match", seasonVerified: true },
};

// Keep a warm in-instance index and serve stale data if a refresh fails.
let registryIndex = null;
let registryExpiresAt = 0;
let registryRefresh = null;

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.end(JSON.stringify(body));
}

function normalizeRecord(row) {
  if (!row) return null;
  const movies = row.themoviedb_id?.movie || [];
  const mediaType = row.type === "MOVIE" && movies.length === 1
    ? "movie"
    : row.themoviedb_id?.tv
      ? "tv"
      : null;
  const tmdbId = Number(mediaType === "movie" ? movies[0] : row.themoviedb_id?.tv);
  if (!mediaType || !Number.isSafeInteger(tmdbId) || tmdbId <= 0) return null;

  const season = Number(row.season?.tmdb ?? 1);
  const episodeOffset = Number(row.episode_offset?.tmdb ?? 0);
  if (!Number.isInteger(season) || season < 0 || !Number.isInteger(episodeOffset)) return null;

  return {
    mediaType,
    tmdbId,
    season,
    episodeOffset,
    source: "Fribb anime-lists",
    seasonVerified: row.season?.tmdb != null,
  };
}

async function refreshRegistry() {
  if (registryRefresh) return registryRefresh;
  registryRefresh = (async () => {
    const response = await fetch(MAPPING_URL, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error("Anime ID registry is temporarily unavailable.");
    const rows = await response.json();
    if (!Array.isArray(rows)) throw new Error("Anime ID registry returned an invalid response.");

    const nextIndex = new Map();
    const addExternalIds = (source, value, match) => {
      const values = Array.isArray(value) ? value : [value];
      for (const entry of values) {
        const raw = typeof entry === "object" && entry ? (entry.id ?? entry.mal_id ?? entry.kitsu_id) : entry;
        const externalId = String(raw ?? "").trim();
        if (/^[1-9]\d{0,11}$/.test(externalId)) {
          const key = source + "-" + externalId;
          if (!nextIndex.has(key)) nextIndex.set(key, match);
        }
      }
    };
    for (const row of rows) {
      const id = Number(row?.anilist_id);
      if (!Number.isSafeInteger(id) || id <= 0) continue;
      const match = normalizeRecord(row);
      if (!match) continue;
      if (!nextIndex.has(String(id))) nextIndex.set(String(id), match);
      addExternalIds("mal", row?.mal_id, match);
      addExternalIds("kitsu", row?.kitsu_id, match);
    }
    registryIndex = nextIndex;
    registryExpiresAt = Date.now() + 6 * 60 * 60 * 1000;
    return registryIndex;
  })();

  try {
    return await registryRefresh;
  } finally {
    registryRefresh = null;
  }
}

async function getRegistryMatch(animeId) {
  const key = String(animeId);
  if (registryIndex && Date.now() < registryExpiresAt) {
    return registryIndex.get(key) || null;
  }

  try {
    const index = await refreshRegistry();
    return index.get(key) || null;
  } catch (error) {
    // A previously loaded registry remains useful during upstream outages.
    if (registryIndex) return registryIndex.get(key) || null;
    throw error;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { ok: false, error: "Method not allowed. Use POST." });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const action = String(body.action || "resolveAnime");

    if (action !== "resolveAnime") {
      return json(res, 400, { ok: false, error: `Unknown action "${action}".` });
    }

    const animeId = String(body.animeId || "").trim();
    const validId = /^(?:[1-9]\d{0,8}|mal-[1-9]\d{0,11}|kitsu-[1-9]\d{0,11})$/.test(animeId);
    if (!validId) {
      return json(res, 400, { ok: false, error: "A valid AniList, MyAnimeList, or Kitsu anime ID is required." });
    }

    const match = verified[Number(animeId)] || await getRegistryMatch(animeId);
    const result = match
      ? { ...match, tmdbUrl: `https://www.themoviedb.org/${match.mediaType}/${match.tmdbId}` }
      : null;

    return json(res, 200, { ok: true, match: result });
  } catch (error) {
    return json(res, 502, {
      ok: false,
      error: error?.message || "Anime source lookup failed.",
    });
  }
}
