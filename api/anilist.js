const ANILIST_GRAPHQL = "https://graphql.anilist.co";

function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.end(JSON.stringify(payload));
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return send(res, 405, { errors: [{ message: "Method not allowed. Use POST." }] });
  }

  const query = typeof req.body?.query === "string" ? req.body.query : "";
  const variables = req.body?.variables && typeof req.body.variables === "object"
    ? req.body.variables
    : {};

  if (!query || query.length > 50000) {
    return send(res, 400, { errors: [{ message: "A valid GraphQL query is required." }] });
  }

  try {
    const upstream = await fetch(ANILIST_GRAPHQL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(12000),
    });
    const text = await upstream.text();
    let payload;
    try {
      payload = JSON.parse(text);
    } catch {
      return send(res, 502, { errors: [{ message: "AniList returned an unreadable response." }] });
    }
    if (!upstream.ok) {
      return send(res, upstream.status, payload?.errors
        ? payload
        : { errors: [{ message: `AniList upstream returned HTTP ${upstream.status}.` }] });
    }
    return send(res, 200, payload);
  } catch (error) {
    const status = error?.name === "TimeoutError" ? 504 : 502;
    return send(res, status, {
      errors: [{ message: status === 504 ? "AniList request timed out." : "Could not reach AniList." }],
    });
  }
}
