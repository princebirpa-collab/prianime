import { secrets } from 'base44:runtime';
import { normalizeMal } from '../../shared/media.ts';

const TOKEN_URL = 'https://myanimelist.net/v1/oauth2/token';
const API_BASE = 'https://api.myanimelist.net/v2';
const JIKAN_BASE = 'https://api.jikan.moe/v4';
const FIELDS = 'id,title,main_picture,alternative_titles,start_date,end_date,synopsis,mean,rank,popularity,num_list_users,num_scoring_users,nsfw,genres,media_type,status,num_episodes,start_season,broadcast,average_episode_duration,rating,pictures,background,related_anime,recommendations';

let cachedToken = null;
const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000;

function readSecret(name) {
  try {
    const value = secrets.get(name);
    return value ? String(value).trim() : '';
  } catch {
    return '';
  }
}

function config() {
  return {
    rapidKey: readSecret('MAL_RAPIDAPI_KEY'),
    rapidHost: readSecret('MAL_RAPIDAPI_HOST'),
    clientId: readSecret('MAL_CLIENT_ID'),
    clientSecret: readSecret('MAL_CLIENT_SECRET'),
    accessToken: readSecret('MAL_ACCESS_TOKEN'),
    refreshToken: readSecret('MAL_REFRESH_TOKEN'),
  };
}

function oauthReady(cfg) {
  return Boolean(cfg.clientId && (cfg.accessToken || (cfg.refreshToken && cfg.clientSecret)));
}

function cached(key) {
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;
  cache.delete(key);
  return null;
}

function remember(key, value) {
  if (cache.size > 300) cache.clear();
  cache.set(key, { value, expires: Date.now() + CACHE_TTL });
  return value;
}

/** RapidAPI listings wrap records in varying envelopes â€” unwrap them all. */
function entriesFrom(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  const list = payload.data || payload.results || payload.anime || payload.items;
  if (Array.isArray(list)) return list.map((entry) => entry?.node ?? entry);
  return [];
}

function firstRecord(payload) {
  if (!payload) return null;
  if (Array.isArray(payload)) return payload[0] ?? null;
  if (Array.isArray(payload.data)) return payload.data[0]?.node ?? payload.data[0] ?? null;
  if (payload.data && typeof payload.data === 'object') return payload.data;
  if (payload.node) return payload.node;
  if (Array.isArray(payload.results)) return payload.results[0] ?? null;
  if (payload.id || payload.mal_id || payload.title) return payload;
  return null;
}

async function getJson(url, headers = {}, timeout = 12000) {
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(timeout) });
  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }
  return { status: response.status, ok: response.ok, payload, text };
}

/* ---------------- RapidAPI (keyed) ---------------- */

// A keyed host that answers 404/403 for every path is misconfigured; stop
// paying for it after the first miss in this instance.
let rapidUnavailable = false;

async function rapidSearch(cfg, query, limit) {
  if (rapidUnavailable) return null;
  const encoded = encodeURIComponent(query);
  const result = await getJson(
    `https://${cfg.rapidHost}/anime?q=${encoded}&limit=${limit}&nsfw=false`,
    { 'X-RapidAPI-Key': cfg.rapidKey, 'X-RapidAPI-Host': cfg.rapidHost, Accept: 'application/json' },
    3500,
  ).catch(() => null);
  if (!result) {
    rapidUnavailable = true;
    return null;
  }
  if (!result.ok) {
    if (result.status !== 429) rapidUnavailable = true;
    return null;
  }
  const items = entriesFrom(result.payload).map(normalizeMal).filter(Boolean);
  return items.length ? items : null;
}

async function rapidItem(cfg, id) {
  if (rapidUnavailable) return null;
  const result = await getJson(
    `https://${cfg.rapidHost}/anime/${id}`,
    { 'X-RapidAPI-Key': cfg.rapidKey, 'X-RapidAPI-Host': cfg.rapidHost, Accept: 'application/json' },
    3500,
  ).catch(() => null);
  if (!result || !result.ok) {
    if (result && result.status !== 429) rapidUnavailable = true;
    return null;
  }
  const record = firstRecord(result.payload);
  return record ? normalizeMal(record) : null;
}

/* ---------------- Jikan (key-free MyAnimeList data) ---------------- */

async function jikanSearch(query, limit) {
  const result = await getJson(
    `${JIKAN_BASE}/anime?q=${encodeURIComponent(query)}&limit=${limit}&sfw=true&order_by=members&sort=desc`,
  );
  if (!result.ok) throw new Error(`MyAnimeList lookup failed (${result.status}).`);
  return entriesFrom(result.payload).map(normalizeMal).filter(Boolean);
}

async function jikanItem(id) {
  const result = await getJson(`${JIKAN_BASE}/anime/${id}/full`);
  if (!result.ok) throw new Error(`MyAnimeList lookup failed (${result.status}).`);
  const record = firstRecord(result.payload);
  return record ? normalizeMal(record) : null;
}

/* ---------------- Official MAL OAuth ---------------- */

async function resolveToken(cfg) {
  if (cachedToken && cachedToken.expires > Date.now()) return cachedToken.value;
  if (cfg.accessToken) return cfg.accessToken;
  if (!cfg.clientId || !cfg.clientSecret || !cfg.refreshToken) return '';

  const body = new URLSearchParams({
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    grant_type: 'refresh_token',
    refresh_token: cfg.refreshToken,
  });

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error(`MyAnimeList token refresh failed (${response.status}).`);
  const payload = await response.json();
  cachedToken = { value: payload.access_token, expires: Date.now() + Math.max(60, (payload.expires_in || 3600) - 60) * 1000 };
  return cachedToken.value;
}

async function oauthSearch(cfg, query, limit) {
  const token = await resolveToken(cfg);
  if (!token) throw new Error('No usable MyAnimeList access token.');
  const result = await getJson(
    `${API_BASE}/anime?q=${encodeURIComponent(query)}&limit=${limit}&nsfw=false&fields=${FIELDS}`,
    { Authorization: `Bearer ${token}` },
  );
  if (result.status === 401) {
    cachedToken = null;
    throw new Error('MyAnimeList rejected the credentials.');
  }
  if (!result.ok) throw new Error(`MyAnimeList returned ${result.status}.`);
  return (result.payload?.data || []).map((entry) => normalizeMal(entry.node)).filter(Boolean);
}

export default async function (req) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || 'status');
    const cfg = config();

    const rapidReady = Boolean(cfg.rapidKey && cfg.rapidHost);
    const mode = rapidReady ? 'rapidapi' : oauthReady(cfg) ? 'oauth' : 'jikan';

    if (action === 'status') {
      return Response.json({
        ok: true,
        configured: true,
        mode,
        source: mode === 'jikan' ? 'MyAnimeList data via Jikan (key-free)' : mode === 'rapidapi' ? `RapidAPI ${cfg.rapidHost}` : 'Official MyAnimeList OAuth',
        reason: 'MyAnimeList ratings are live.',
      });
    }

    if (action === 'by_id') {
      const id = Number.parseInt(body.id, 10);
      if (!Number.isFinite(id) || id <= 0) {
        return Response.json({ ok: false, error: 'A numeric MAL id is required.' }, { status: 400 });
      }
      const key = `id:${id}`;
      const hit = cached(key);
      if (hit) return Response.json({ ok: true, item: hit, mode });

      const item = (rapidReady ? await rapidItem(cfg, id).catch(() => null) : null) || (await jikanItem(id));
      if (!item) return Response.json({ ok: false, error: 'MyAnimeList has no record for that id.' });
      return Response.json({ ok: true, item: remember(key, item), mode });
    }

    const query = String(body.q || '').trim().slice(0, 80);
    if (!query) return Response.json({ ok: false, error: 'A search query is required.' }, { status: 400 });
    const limit = Math.min(Math.max(Number.parseInt(body.limit, 10) || 10, 1), 20);

    const key = `q:${query.toLowerCase()}:${limit}`;
    const hit = cached(key);
    if (hit) return Response.json({ ok: true, items: hit, mode });

    let items = rapidReady ? await rapidSearch(cfg, query, limit).catch(() => null) : null;
    if (!items || !items.length) {
      items = await jikanSearch(query, limit);
    }
    if (!items.length) return Response.json({ ok: false, error: 'MyAnimeList has no matches for that title.', mode });
    return Response.json({ ok: true, items: remember(key, items), mode });
  } catch (error) {
    return Response.json({ ok: false, error: error.message || 'MyAnimeList request failed.' }, { status: 502 });
  }
}

================================================================================
