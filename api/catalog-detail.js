function send(res, status, payload) {
  res.statusCode = status; res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=3600"); res.setHeader("X-Content-Type-Options", "nosniff");
  res.end(JSON.stringify(payload));
}
export default async function handler(req, res) {
  if (req.method !== "GET") { res.setHeader("Allow", "GET"); return send(res, 405, { error: "Method not allowed. Use GET." }); }
  const source = String(req.query?.source || ""), id = String(req.query?.id || "");
  if (!["mal", "kitsu"].includes(source) || !/^\d{1,12}$/.test(id)) return send(res, 400, { error: "A valid catalogue source and numeric ID are required." });
  try {
    if (source === "mal") {
      const response = await fetch(`https://api.jikan.moe/v4/anime/${id}/full`, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(7000) });
      if (!response.ok) return send(res, response.status === 404 ? 404 : 502, { error: "MyAnimeList detail is temporarily unavailable." });
      const payload = await response.json(), data = payload?.data;
      if (!data?.mal_id) return send(res, 502, { error: "MyAnimeList returned invalid detail data." });
      await new Promise((resolve) => setTimeout(resolve, 380));
      try {
        const ep = await fetch(`https://api.jikan.moe/v4/anime/${id}/episodes?page=1`, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(5000) });
        if (ep.ok) { const p = await ep.json(); data.episodes_list = (p?.data || []).map((e) => ({ mal_id: e.mal_id, aired: e.aired, title: e.title })); }
      } catch { /* optional episode dates */ }
      return send(res, 200, { source, data });
    }
    const response = await fetch(`https://kitsu.io/api/edge/anime/${id}`, { headers: { Accept: "application/vnd.api+json" }, signal: AbortSignal.timeout(7000) });
    if (!response.ok) return send(res, response.status === 404 ? 404 : 502, { error: "Kitsu detail is temporarily unavailable." });
    const payload = await response.json();
    if (!payload?.data?.id) return send(res, 502, { error: "Kitsu returned invalid detail data." });
    return send(res, 200, { source, data: payload.data });
  } catch (error) { return send(res, 502, { error: error?.message || "Backup catalogue request failed." }); }
}
