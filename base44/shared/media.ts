/**
 * Shared normalisation for metadata providers (AniList + MyAnimeList).
 * Both providers are metadata only â€” neither serves episode streams.
 */

export function normalizeAniList(media) {
  if (!media) return null;
  return {
    id: media.id,
    source: "anilist",
    title: {
      romaji: media.title?.romaji || "",
      english: media.title?.english || media.title?.romaji || "",
      native: media.title?.native || "",
    },
    display: media.title?.english || media.title?.romaji || "Untitled",
    cover: media.coverImage?.extraLarge || media.coverImage?.large || "",
    color: media.coverImage?.color || "",
    banner: media.bannerImage || media.coverImage?.extraLarge || "",
    description: (media.description || "").replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, ""),
    genres: media.genres || [],
    score: media.averageScore ?? null,
    meanScore: media.meanScore ?? null,
    popularity: media.popularity ?? 0,
    episodes: media.episodes ?? null,
    duration: media.duration ?? null,
    status: media.status || "",
    format: media.format || "",
    season: media.season || "",
    seasonYear: media.seasonYear ?? null,
    startDate: media.startDate || null,
    studios: (media.studios?.nodes || []).map((node) => node.name),
    trailer: media.trailer || null,
    nextEpisode: media.nextAiringEpisode || null,
  };
}

export function normalizeMal(anime) {
  if (!anime) return null;
  // Tolerates the official v2 shape, Jikan/RapidAPI variants and plain records.
  const mean = Number(
    anime.mean ?? anime.score ?? anime.rating ?? Number.NaN,
  );
  const cover =
    anime.main_picture?.large ||
    anime.main_picture?.medium ||
    anime.images?.jpg?.large_image_url ||
    anime.images?.jpg?.image_url ||
    anime.picture ||
    "";
  return {
    id: anime.id ?? anime.mal_id ?? null,
    source: "mal",
    display: anime.title || anime.name || "Untitled",
    title: {
      romaji: anime.alternative_titles?.en || anime.title || anime.name || "",
      english: anime.alternative_titles?.en || anime.title || anime.name || "",
      native: anime.alternative_titles?.ja || anime.title_japanese || "",
    },
    cover,
    description: anime.synopsis || anime.description || "",
    genres: (anime.genres || []).map((genre) => (typeof genre === "string" ? genre : genre.name)).filter(Boolean),
    score: Number.isFinite(mean) && mean > 0 ? Math.round(mean * 10) : null,
    malScore: Number.isFinite(mean) && mean > 0 ? mean : null,
    rank: anime.rank ?? null,
    popularity: anime.popularity ?? anime.members ?? 0,
    episodes: anime.num_episodes ?? anime.episodes ?? null,
    status: anime.status || "",
    format: anime.media_type || anime.type || "",
    seasonYear: anime.start_season?.year ?? anime.year ?? null,
    season: anime.start_season?.season ?? anime.season ?? "",
  };
}

export function currentSeason(date = new Date()) {
  const month = date.getUTCMonth();
  const season = month < 3 ? "WINTER" : month < 6 ? "SPRING" : month < 9 ? "SUMMER" : "FALL";
  return { season, year: date.getUTCFullYear() };
}

export function clampPage(value, fallback = 1, max = 200) {
  const page = Number.parseInt(value, 10);
  if (!Number.isFinite(page) || page < 1) return fallback;
  return Math.min(page, max);
}

export function clampPerPage(value, fallback = 20, max = 25) {
  const perPage = Number.parseInt(value, 10);
  if (!Number.isFinite(perPage) || perPage < 1) return fallback;
  return Math.min(perPage, max);
}
