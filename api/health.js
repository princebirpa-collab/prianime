const checks = [
  {
    name: "AniList",
    url: "https://graphql.anilist.co",
    run: async () => {
      const response = await fetch("https://graphql.anilist.co", {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ query: "query { Media(id: 1, type: ANIME) { id } }" }),
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      if (payload.errors?.length || !payload.data?.Media?.id) throw new Error("Invalid GraphQL response");
    },
  },
  {
    name: "Kitsu",
    url: "https://kitsu.io/api/edge/anime",
    run: async () => {
      const params = new URLSearchParams({ "filter[text]": "Naruto", "page[limit]": "1" });
      const response = await fetch(`https://kitsu.io/api/edge/anime?${params}`, {
        headers: { Accept: "application/vnd.api+json" }, signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      if (!Array.isArray(payload.data)) throw new Error("Invalid JSON:API response");
    },
  },
];
function send(res, status, payload) {
  res.statusCode = status; res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
  res.setHeader("X-Content-Type-Options", "nosniff"); res.end(JSON.stringify(payload));
}
export default async function handler(req, res) {
  if (req.method !== "GET") { res.setHeader("Allow", "GET"); return send(res, 405, { status: "method_not_allowed" }); }
  const results = await Promise.all(checks.map(async (provider) => {
    const started = Date.now();
    try {
      await provider.run();
      return { provider: provider.name, status: "ok", latencyMs: Date.now() - started };
    } catch (error) {
      return { provider: provider.name, status: "unavailable", latencyMs: Date.now() - started, reason: error?.message || "Request failed" };
    }
  }));
  results.push({ provider: "Jikan", status: "retired", note: "Public Jikan API was discontinued; not queried." });
  const active = results.filter((item) => item.provider !== "Jikan");
  const ok = active.filter((item) => item.status === "ok").length;
  return send(res, ok === active.length ? 200 : ok ? 200 : 503, {
    status: ok === active.length ? "healthy" : ok ? "degraded" : "unavailable",
    checkedAt: new Date().toISOString(), providers: results,
  });
}
