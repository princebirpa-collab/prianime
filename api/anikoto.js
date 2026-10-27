const BASE_URL = "https://anikotoapi.site";

function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.end(JSON.stringify(payload));
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return send(res, 405, { ok: false, error: "Method not allowed. Use GET." });
  }

  const action = String(req.query?.action || "recent");
  let path;

  if (action === "recent") {
    const page = Math.max(1, Math.min(1000, Number(req.query?.page) || 1));
    const perPage = Math.max(1, Math.min(50, Number(req.query?.per_page) || 50));
    path = `/recent-anime?page=${page}&per_page=${perPage}`;
  } else if (action === "series") {
    const id = String(req.query?.id || "");
    if (!/^\d{1,12}$/.test(id)) {
      return send(res, 400, { ok: false, error: "A valid AniKoto series ID is required." });
    }
    path = `/series/${encodeURIComponent(id)}`;
  } else {
    return send(res, 400, { ok: false, error: "Unknown action. Use recent or series." });
  }

  try {
    const upstream = await fetch(`${BASE_URL}${path}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });
    const data = await upstream.json().catch(() => null);
    if (!upstream.ok || !data || data.ok === false) {
      return send(res, upstream.status >= 400 && upstream.status < 600 ? upstream.status : 502, {
        ok: false,
        error: data?.message || "AniKoto is temporarily unavailable.",
      });
    }
    return send(res, 200, { ok: true, data });
  } catch (error) {
    return send(res, 502, {
      ok: false,
      error: error?.name === "TimeoutError" ? "AniKoto request timed out." : "Could not reach AniKoto right now.",
    });
  }
}
