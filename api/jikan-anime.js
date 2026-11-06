const JIKAN_BASE = "https://api.jikan.moe/v4";
const ID_MAX = 100000000;
const SEARCH_MAX = 80;

function send(res, status, body, cache = "public, s-maxage=300, stale-while-revalidate=900") {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", cache);
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.end(JSON.stringify(body));
}

function validId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 && id <= ID_MAX ? id : null;
}

function cleanQuery(value) {
  return String(value || "").trim().replace(/[\u0000-\u001f\u007f]/g, "").slice(0, SEARCH_MAX);
}

async function jikan(path) {
  const response = await fetch(`${JIKAN_BASE}${path}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(7000),
  });
  if (response.status === 429) {
    const error = new Error("Jikan rate limit reached. Please retry shortly.");
    error.status = 429;
    throw error;
  }
  if (!response.ok) {
    const error = new Error(`Jikan request failed (HTTP ${response.status}).`);
    error.status = response.status >= 500 ? 502 : response.status;
    throw error;
  }
  return response.json();
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return send(res, 405, { ok: false, error: "Method not allowed. Use GET." }, "no-store");
  }

  const action = String(req.query?.action || "search");
  try {
    if (action === "search") {
      const q = cleanQuery(req.query?.q);
      if (q.length < 2) return send(res, 200, { ok: true, data: [] });
      const page = Math.min(Math.max(Number(req.query?.page) || 1, 1), 10);
      const payload = await jikan(`/anime?q=${encodeURIComponent(q)}&page=${page}&limit=20&sfw=true`);
      return send(res, 200, { ok: true, data: payload.data || [], pagination: payload.pagination || null });
    }

    const id = validId(req.query?.id);
    if (!id) return send(res, 400, { ok: false, error: "A valid MAL anime ID is required." }, "no-store");

    const suffixes = {
      detail: "",
      episodes: "/episodes",
      videos: "/videos",
      streaming: "/streaming",
    };
    if (!(action in suffixes)) {
      return send(res, 400, { ok: false, error: "Supported actions: search, detail, episodes, videos, streaming." }, "no-store");
    }

    const payload = await jikan(`/anime/${id}${suffixes[action]}`);
    return send(res, 200, { ok: true, data: payload.data || null, pagination: payload.pagination || null });
  } catch (error) {
    const status = Number.isInteger(error.status) ? error.status : 502;
    return send(res, status, { ok: false, error: error.message || "Jikan metadata is temporarily unavailable." }, "no-store");
  }
}
