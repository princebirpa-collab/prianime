const MEGAPLAY_ORIGINS = new Set(["megaplay.buzz", "www.megaplay.buzz"]);

function safeMegaPlayUrl(value) {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" && MEGAPLAY_ORIGINS.has(url.hostname.toLowerCase())
      ? url.toString()
      : "";
  } catch {
    return "";
  }
}

export function buildMegaPlayUrl(episode, language = "sub") {
  const id = String(episode?.episode_embed_id ?? episode?.embed_id ?? episode?.embedId ?? "").trim();
  if (!/^\d{1,12}$/.test(id)) return "";
  const audio = language === "dub" ? "dub" : "sub";
  return `https://megaplay.buzz/stream/s-2/${id}/${audio}`;
}

export function resolveMegaPlayUrl(episode, language = "sub") {
  if (!episode || typeof episode !== "object") return "";
  const urls = episode.embed_url || episode.embedUrl || episode.embeds || episode.data?.embed_url || {};
  const candidates = [
    urls?.[language],
    urls?.[language.toUpperCase()],
    episode[`${language}_embed_url`],
    episode[`${language}EmbedUrl`],
    episode.url,
    episode.embed,
    episode.stream_url,
    episode.data?.url,
    episode.data?.embed,
  ];
  for (const candidate of candidates) {
    const safe = safeMegaPlayUrl(typeof candidate === "object" ? candidate?.url || candidate?.src : candidate);
    if (safe) return safe;
  }
  return buildMegaPlayUrl(episode, language);
}


export function buildMegaPlayAniListUrl(anilistId, episodeNumber, language = "sub") {
  const id = String(anilistId ?? "").trim();
  const episode = Number(episodeNumber);
  if (!/^\\d{1,12}$/.test(id) || !Number.isInteger(episode) || episode < 1 || episode > 10000) return "";
  const audio = language === "dub" ? "dub" : "sub";
  return `https://megaplay.buzz/stream/ani/${id}/${episode}/${audio}`;
}
