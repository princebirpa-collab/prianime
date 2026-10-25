const MAPPING_URL = 'https://raw.githubusercontent.com/Fribb/anime-lists/master/anime-list-full.json';
const cache = new Map();
const pending = new Map();

// Verified against https://www.themoviedb.org/tv/280564-false-memory.
// This recent title is not yet mapped in the community registry.
const verified = {
  141953: { mediaType: 'tv', tmdbId: 280564, season: 1, episodeOffset: 0, source: 'TMDB verified match' },
};

async function findRecord(animeId) {
  const response = await fetch(MAPPING_URL, { signal: AbortSignal.timeout(15000) });
  if (!response.ok || !response.body) throw new Error('The anime ID registry is temporarily unavailable.');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let depth = 0;
  let quoted = false;
  let escaped = false;
  let record = '';
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) return null;
      for (const char of decoder.decode(value, { stream: true })) {
        if (depth === 0) {
          if (char === '{') { depth = 1; record = '{'; }
          continue;
        }
        record += char;
        if (quoted) {
          if (escaped) escaped = false;
          else if (char === '\\') escaped = true;
          else if (char === '"') quoted = false;
          continue;
        }
        if (char === '"') quoted = true;
        else if (char === '{') depth += 1;
        else if (char === '}') depth -= 1;
        if (depth === 0) {
          const row = JSON.parse(record);
          record = '';
          if (Number(row.anilist_id) === animeId) {
            await reader.cancel();
            return row;
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

function normalizeRecord(row) {
  if (!row) return null;
  const movies = row.themoviedb_id?.movie || [];
  const mediaType = row.type === 'MOVIE' && movies.length === 1 ? 'movie' : row.themoviedb_id?.tv ? 'tv' : null;
  const tmdbId = Number(mediaType === 'movie' ? movies[0] : row.themoviedb_id?.tv);
  if (!mediaType || !Number.isSafeInteger(tmdbId) || tmdbId <= 0) return null;
  const season = Number(row.season?.tmdb ?? 1);
  const episodeOffset = Number(row.episode_offset?.tmdb ?? 0);
  if (!Number.isInteger(season) || season < 0 || !Number.isInteger(episodeOffset)) return null;
  return { mediaType, tmdbId, season, episodeOffset, source: 'Fribb anime-lists', seasonVerified: row.season?.tmdb != null };
}

export async function resolveAnimeStream(animeId) {
  const decorate = (match) => match ? { ...match, tmdbUrl: `https://www.themoviedb.org/${match.mediaType}/${match.tmdbId}` } : null;
  if (verified[animeId]) return decorate(verified[animeId]);
  const hit = cache.get(animeId);
  if (hit && hit.expires > Date.now()) return hit.value;
  if (pending.has(animeId)) return pending.get(animeId);
  const lookup = findRecord(animeId).then((row) => {
    const value = decorate(normalizeRecord(row));
    if (cache.size >= 500) cache.clear();
    cache.set(animeId, { value, expires: Date.now() + (value ? 43200000 : 3600000) });
    return value;
  }).finally(() => pending.delete(animeId));
  pending.set(animeId, lookup);
  return lookup;
}

================================================================================
