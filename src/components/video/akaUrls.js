const AKA_ORIGIN = "https://animesalt.cx";

export function parseAkaUrl(value) {
  if (typeof value !== "string" || !value.startsWith("https://")) return null;
  let url;
  try { url = new URL(value); } catch { return null; }
  if (url.origin !== AKA_ORIGIN || url.username || url.password) return null;
  const episode = url.pathname.match(/^\/episode\/([a-z0-9-]+?)-(\d+)x(\d+)\/?$/i);
  if (episode) return { url, kind: "episode", slug: episode[1], season: Number(episode[2]), episode: Number(episode[3]) };
  const page = url.pathname.match(/^\/([a-z0-9-]+)\/?$/i);
  if (page) return { url, kind: "page", slug: page[1] };
  return { url, kind: "page" };
}

export function buildAkaUrl({ slug, season = 1, episode = 1 }) {
  const clean = String(slug || "").trim().toLowerCase().replace(/^https?:\/\/animesalt\.cx\//, "").replace(/\/+$/, "");
  if (!clean || clean.includes("/")) return "";
  if (!Number.isInteger(Number(season)) || Number(season) < 1 || !Number.isInteger(Number(episode)) || Number(episode) < 1) return "";
  return `${AKA_ORIGIN}/episode/${clean}-${season}x${episode}/`;
}

export function resolveAkaBackupUrl(value, { mediaType, season, episode }) {
  const parsed = parseAkaUrl(value);
  if (!parsed || parsed.url.search || parsed.url.hash) return "";
  if (mediaType === "movie") return /^\/movies\/[a-z0-9-]+\/$/i.test(parsed.url.pathname) ? parsed.url.href : "";
  if (mediaType !== "tv") return "";
  const series = parsed.url.pathname.match(/^\/series\/([a-z0-9-]+)\/$/i);
  const slug = parsed.kind === "episode" ? parsed.slug : series?.[1];
  return slug ? buildAkaUrl({ slug, season, episode }) : "";
}

================================================================================
