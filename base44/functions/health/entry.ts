import { secrets } from 'base44:runtime';

function readSecret(name) {
  try {
    const value = secrets.get(name);
    return value ? String(value).trim() : '';
  } catch {
    return '';
  }
}

// Readiness endpoint: reports which external services are connected WITHOUT
// ever returning a credential value.
export default async function () {
  const started = Date.now();
  const checks = {};

  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query: 'query { Page(page: 1, perPage: 1) { media(type: ANIME) { id } } }' }),
      signal: AbortSignal.timeout(8000),
    });
    checks.anilist = {
      ok: response.ok,
      status: response.status,
      label: 'AniList GraphQL',
      error: response.ok
        ? null
        : response.status === 403
          ? 'This server IP is blocked by AniList â€” the app falls back to querying AniList directly from the browser.'
          : `AniList responded ${response.status}.`,
    };
  } catch (error) {
    checks.anilist = { ok: false, status: 0, label: 'AniList GraphQL', error: error.message };
  }

  checks.ai = {
    ok: true,
    status: 200,
    label: 'PRI-ANIME AI atelier (built-in)',
    provider: 'base44',
  };

  const malRapid = readSecret('MAL_RAPIDAPI_KEY');
  const malOauth = Boolean(readSecret('MAL_CLIENT_ID')) || Boolean(readSecret('MAL_ACCESS_TOKEN'));
  const malReady = Boolean(malRapid) || malOauth;
  checks.myAnimeList = {
    ok: malReady,
    label: 'MyAnimeList API',
    status: malReady ? 200 : 0,
    provider: malRapid ? 'rapidapi' : malOauth ? 'oauth' : null,
    error: malReady ? null : 'MAL_RAPIDAPI_KEY (or MAL_CLIENT_ID) not set',
  };

  const videoProvider = readSecret('VIDEO_PROVIDER');
  const videoKey = readSecret('VIDEO_API_KEY');
  const videoUrl = readSecret('VIDEO_API_URL');
  checks.videoProvider = {
    ok: Boolean(videoProvider && videoKey && videoUrl),
    label: 'Video provider',
    provider: videoProvider || null,
    error: videoProvider && videoKey && videoUrl ? null : 'VIDEO_PROVIDER / VIDEO_API_URL / VIDEO_API_KEY not all set',
  };

  const failed = Object.values(checks).filter((check) => !check.ok).map((check) => check.label);

  return Response.json({
    ok: failed.length === 0,
    status: failed.length === 0 ? 'ready' : 'degraded',
    durationMs: Date.now() - started,
    environment: 'production',
    checks,
    note: 'Metadata is public; personalisation is stored on the device because this app runs without sign-in.',
  });
}
