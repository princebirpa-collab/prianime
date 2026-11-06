function send(res, status, payload) {
  res.statusCode = status; res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400"); res.setHeader("X-Content-Type-Options", "nosniff");
  res.end(JSON.stringify(payload));
}
export default async function handler(req, res) {
  if (req.method !== "GET") { res.setHeader("Allow", "GET"); return send(res, 405, { error: "Method not allowed. Use GET." }); }
  const query = typeof req.query?.q === "string" ? req.query.q.trim().slice(0, 120) : "";
  if (!query) return send(res, 400, { error: "A title query is required." });
  const result = { wikipedia: null, imdbUrl: `https://www.imdb.com/find/?q=${encodeURIComponent(query)}` };
  try {
    const searchUrl = new URL("https://en.wikipedia.org/w/api.php");
    searchUrl.search = new URLSearchParams({ action: "query", list: "search", srsearch: query, format: "json", utf8: "1", srlimit: "1" });
    const response = await fetch(searchUrl, { headers: { Accept: "application/json", "User-Agent": "PRI-ANIME/1.0 (metadata reference)" }, signal: AbortSignal.timeout(5000) });
    if (response.ok) {
      const payload = await response.json(), title = payload?.query?.search?.[0]?.title;
      if (title) {
        const summaryResponse = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`, { headers: { Accept: "application/json", "User-Agent": "PRI-ANIME/1.0 (metadata reference)" }, signal: AbortSignal.timeout(5000) });
        if (summaryResponse.ok) { const summary = await summaryResponse.json(); result.wikipedia = { title: summary.title || title, extract: String(summary.extract || "").slice(0, 900), url: summary.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}` }; }
      }
    }
  } catch { /* optional reference source */ }
  return send(res, 200, result);
}
