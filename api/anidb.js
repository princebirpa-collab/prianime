const ANIDB_ENDPOINT = "http://api.anidb.net:9001/httpapi";
const ALLOWED_REQUESTS = new Set(["hotanime", "randomrecommendation", "anime"]);
const cache = new Map();
const CACHE_TTL = 15 * 60 * 1000;

function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=900, stale-while-revalidate=3600");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.end(JSON.stringify(payload));
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return send(res, 405, { error: "Method not allowed. Use GET." });
  }

  const request = String(req.query?.request || "hotanime").toLowerCase();
  if (!ALLOWED_REQUESTS.has(request)) {
    return send(res, 400, { error: "Unsupported AniDB request." });
  }

  const client = process.env.ANIDB_CLIENT || "prince birlaa";
  const clientver = Number(process.env.ANIDB_CLIENTVER || 1);
  const protover = 1;
  const aid = String(req.query?.aid || "");

  if (!client.trim() || !Number.isInteger(clientver) || clientver < 1) {
    return send(res, 503, { error: "AniDB client configuration is invalid." });
  }
  if (request === "anime" && !/^\\d{1,10}$/.test(aid)) {
    return send(res, 400, { error: "A valid numeric aid is required for anime detail." });
  }

  const cacheKey = request + ":" + (request === "anime" ? aid : "");
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) return send(res, 200, cached.value);
  if (cached) cache.delete(cacheKey);

  const url = new URL(ANIDB_ENDPOINT);
  url.search = new URLSearchParams({
    client,
    clientver: String(clientver),
    protover: String(protover),
    request,
    ...(request === "anime" ? { aid } : {}),
  }).toString();

  try {
    const upstream = await fetch(url, {
      headers: { Accept: "application/xml, text/xml;q=0.9, */*;q=0.8", "User-Agent": "PRI-ANIME/1.0" },
      signal: AbortSignal.timeout(10000),
    });
    const xml = await upstream.text();
    if (!upstream.ok) {
      return send(res, 502, { error: "AniDB request failed.", upstreamStatus: upstream.status });
    }
    if (!xml || /<\s*error\b/i.test(xml)) {
      return send(res, 502, { error: "AniDB rejected the request or returned no catalogue data.", xml: xml.slice(0, 1200) });
    }
    const payload = { source: "AniDB", request, fetchedAt: new Date().toISOString(), xml };
    if (cache.size > 80) cache.clear();
    cache.set(cacheKey, { value: payload, expires: Date.now() + CACHE_TTL });
    return send(res, 200, payload);
  } catch (error) {
    return send(res, 502, {
      error: error?.name === "TimeoutError" ? "AniDB request timed out." : "Could not reach AniDB.",
    });
  }
}
