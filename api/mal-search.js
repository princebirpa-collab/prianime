const JIKAN_SEARCH = "https://api.jikan.moe/v4/anime";

function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.end(JSON.stringify(payload));
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return send(res, 405, { error: "Method not allowed. Use GET." });
  }

  const query = typeof req.query?.q === "string" ? req.query.q.trim() : "";
  if (!query || query.length > 120) {
    return send(res, 400, { error: "A search query between 1 and 120 characters is required." });
  }

  try {
    const upstream = await fetch(
      `${JIKAN_SEARCH}?q=${encodeURIComponent(query)}&limit=5&sfw=true`,
      { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(8000) },
    );
    const text = await upstream.text();
    let payload;
    try {
      payload = JSON.parse(text);
    } catch {
      return send(res, 502, { error: "MyAnimeList search returned an unreadable response." });
    }
    if (!upstream.ok) {
      return send(res, upstream.status === 429 ? 503 : 502, {
        error: upstream.status === 429
          ? "MyAnimeList search is temporarily rate-limited."
          : "MyAnimeList search is temporarily unavailable.",
      });
    }
    return send(res, 200, { data: Array.isArray(payload?.data) ? payload.data : [] });
  } catch (error) {
    return send(res, error?.name === "TimeoutError" ? 504 : 502, {
      error: error?.name === "TimeoutError"
        ? "MyAnimeList search timed out."
        : "Could not reach MyAnimeList search.",
    });
  }
}
