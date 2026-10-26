const MAPPING_URL = "https://raw.githubusercontent.com/Fribb/anime-lists/master/anime-list-full.json";

const verified = {
  141953: { mediaType: "tv", tmdbId: 280564, season: 1, episodeOffset: 0, source: "TMDB verified match", seasonVerified: true },
};

let registryCache;
let registryExpiresAt = 0;

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
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

async function getRegistry() {
  if (registryCache && Date.now() < registryExpiresAt) return registryCache;
  const response = await fetch(MAPPING_URL, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error("Anime ID registry is temporarily unavailable.");
  const rows = await response.json();
  if (!Array.isArray(rows)) throw new Error("Anime ID registry returned an invalid response.");
  registryCache = rows;
  registryExpiresAt = Date.now() + 60 * 60 * 1000;
  return rows;
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

    const animeId = Number(body.animeId);
    if (!Number.isSafeInteger(animeId) || animeId <= 0 || animeId > 100000000) {
      return json(res, 400, { ok: false, error: "A valid AniList anime ID is required." });
    }

    let match = verified[animeId] || null;
    if (!match) {
      const rows = await getRegistry();
      const row = rows.find((item) => Number(item.anilist_id) === animeId);
      match = normalizeRecord(row);
    }

    if (match) {
      match = {
        ...match,
        tmdbUrl: `https://www.themoviedb.org/${match.mediaType}/${match.tmdbId}`,
      };
    }

    return json(res, 200, { ok: true, match });
  } catch (error) {
    return json(res, 502, {
      ok: false,
      error: error?.message || "Anime source lookup failed.",
    });
  }
}
