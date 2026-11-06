export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=7200");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "GET") { res.setHeader("Allow", "GET"); res.status(405).json({ error: "Method not allowed" }); return; }
  const q = typeof req.query?.q === "string" ? req.query.q.trim().slice(0, 120) : "";
  if (!q) { res.status(400).json({ error: "Title required" }); return; }
  try {
    const url = new URL("https://kitsu.io/api/edge/anime");
    url.search = new URLSearchParams({ "filter[text]": q, "page[limit]": "5" });
    const response = await fetch(url, { headers: { Accept: "application/vnd.api+json" }, signal: AbortSignal.timeout(6500) });
    if (!response.ok) throw new Error("Kitsu temporarily unavailable");
    const payload = await response.json();
    const normalized = String(q).toLocaleLowerCase();
    const rows = (payload.data || []).map((entry) => {
      const a = entry.attributes || {};
      const title = a.titles?.en || a.titles?.en_jp || a.canonicalTitle || "";
      return { id: entry.id, title, rating: a.averageRating ? Number(a.averageRating) : null, url: "https://kitsu.io/anime/" + encodeURIComponent(entry.id) };
    }).filter((row) => row.title && row.rating && Number.isFinite(row.rating))
      .sort((a,b) => (a.title.toLocaleLowerCase() === normalized ? -1 : 0) - (b.title.toLocaleLowerCase() === normalized ? -1 : 0));
    res.status(200).json({ source: "Kitsu", ratings: rows.slice(0, 3) });
  } catch (error) { res.status(502).json({ error: error?.message || "Rating source unavailable", ratings: [] }); }
}
