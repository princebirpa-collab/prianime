export function parseVidstuckUrl(value) {
  if (typeof value !== "string" || !value.startsWith("https://")) return null;
  let url;
  try { url = new URL(value); } catch { return null; }
  if (url.origin !== "https://vidstuck.cc" || url.username || url.password) return null;
  const movie = url.pathname.match(/^\/embed\/movie\/([1-9]\d*)\/?$/);
  const tv = url.pathname.match(/^\/embed\/tv\/([1-9]\d*)\/(\d+)\/([1-9]\d*)\/?$/);
  if (!movie && !tv) return null;
  return { url, mediaType: movie ? "movie" : "tv", tmdbId: Number((movie || tv)[1]), season: tv ? Number(tv[2]) : 1, episode: tv ? Number(tv[3]) : 1 };
}

export function buildVidstuckUrl({ mediaType, tmdbId, season = 1, episode = 1 }) {
  if (!Number.isSafeInteger(Number(tmdbId)) || Number(tmdbId) <= 0) return "";
  if (!["movie", "tv"].includes(mediaType)) return "";
  if (!Number.isInteger(Number(season)) || Number(season) < 0 || !Number.isInteger(Number(episode)) || Number(episode) < 1) return "";
  const path = mediaType === "movie" ? `movie/${tmdbId}` : `tv/${tmdbId}/${season}/${episode}`;
  const url = new URL(`/embed/${path}`, "https://vidstuck.cc");
  url.searchParams.set("branding", "PRI-ANIME");
  url.searchParams.set("subtitle", "english");
  return url.href;
}
