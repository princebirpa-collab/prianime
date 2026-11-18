const MEGAPLAY_ORIGIN = "https://megaplay.buzz";

export function buildMegaPlayUrl(episode, language = "sub") {
  const id = String(episode?.episode_embed_id ?? episode?.embed_id ?? "").trim();
  if (!/^\d{1,12}$/.test(id)) return "";
  const audio = language === "dub" ? "dub" : "sub";
  return `${MEGAPLAY_ORIGIN}/stream/s-2/${id}/${audio}`;
}

export function resolveMegaPlayUrl(episode, language = "sub") {
  const urls = episode?.embed_url || episode?.embedUrl || episode?.embeds || {};
  const candidate = urls?.[language] || urls?.[language.toUpperCase()]
    || episode?.[`${language}_embed_url`] || episode?.[language];
  if (typeof candidate === "string" && candidate.trim()) {
    try {
      const url = new URL(candidate);
      if (url.protocol === "https:" && url.hostname === "megaplay.buzz") return url.toString();
    } catch {
      // Fall through to the documented episode-ID endpoint.
    }
  }
  return buildMegaPlayUrl(episode, language);
}
