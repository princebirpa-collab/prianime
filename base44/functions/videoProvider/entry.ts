import { secrets } from 'base44:runtime';
import { resolveAnimeStream } from '../../shared/animeStream.ts';

function readSecret(name) {
  try {
    const value = secrets.get(name);
    return value ? String(value).trim() : '';
  } catch {
    return '';
  }
}

const PROVIDERS = {
  cloudflare: { label: 'Cloudflare Stream', auth: 'bearer' },
  mux: { label: 'Mux', auth: 'basic' },
  generic: { label: 'Generic HLS', auth: 'bearer' },
};

export default async function (req) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || 'status');

    if (action === 'resolveAnime') {
      const animeId = Number(body.animeId);
      if (!Number.isSafeInteger(animeId) || animeId <= 0 || animeId > 100000000) {
        return Response.json({ ok: false, error: 'A valid AniList anime ID is required.' }, { status: 400 });
      }
      const match = await resolveAnimeStream(animeId);
      return Response.json({ ok: true, match });
    }

    const providerKey = readSecret('VIDEO_PROVIDER').toLowerCase();
    const apiUrl = readSecret('VIDEO_API_URL');
    const apiKey = readSecret('VIDEO_API_KEY');
    const playbackUrl = readSecret('VIDEO_PLAYBACK_URL');

    const provider = PROVIDERS[providerKey] ? providerKey : '';
    const missing = [];
    if (!provider) missing.push('VIDEO_PROVIDER');
    if (!apiUrl) missing.push('VIDEO_API_URL');
    if (!apiKey) missing.push('VIDEO_API_KEY');

    const configured = missing.length === 0;
    const status = {
      ok: true,
      configured,
      provider: provider || null,
      providerLabel: provider ? PROVIDERS[provider].label : null,
      playbackBaseConfigured: Boolean(playbackUrl),
      missing,
      reason: configured
        ? `Server-side ${PROVIDERS[provider].label} credentials detected.`
        : 'No video provider connected. Playback falls back to the video URLs stored on each record.',
    };

    if (action === 'status') return Response.json(status);

    if (action === 'playback') {
      const videoId = String(body.videoId || '').trim().slice(0, 128);
      if (!videoId) return Response.json({ ok: false, error: 'A videoId is required.' }, { status: 400 });
      if (!configured) return Response.json({ ...status, ok: false, error: 'Video provider not configured.' });

      const headers = {
        Authorization:
          PROVIDERS[provider].auth === 'basic'
            ? `Basic ${btoa(apiKey)}`
            : `Bearer ${apiKey}`,
      };

      let response;
      try {
        response = await fetch(`${apiUrl.replace(/\/$/, '')}/${encodeURIComponent(videoId)}`, {
          headers,
          signal: AbortSignal.timeout(12000),
        });
      } catch (networkError) {
        return Response.json({ ok: false, configured: true, error: `Provider unreachable: ${networkError.message}` }, { status: 502 });
      }

      if (response.status === 401 || response.status === 403) {
        return Response.json({ ok: false, configured: true, error: 'Provider rejected the credentials.' }, { status: 401 });
      }
      if (response.status === 404) {
        return Response.json({ ok: false, configured: true, error: 'Video not found at the provider.' }, { status: 404 });
      }
      if (!response.ok) {
        return Response.json({ ok: false, configured: true, error: `Provider returned ${response.status}.` }, { status: 502 });
      }

      const payload = await response.json();

      if (provider === 'cloudflare') {
        const playback = payload?.result?.playback || {};
        return Response.json({
          ok: true,
          provider,
          hls: playback.hls || '',
          dash: playback.dash || '',
          thumbnail: payload?.result?.thumbnail || '',
          ready: payload?.result?.status?.state === 'ready',
        });
      }
      if (provider === 'mux') {
        const playbackId = payload?.data?.playback_ids?.[0]?.id || '';
        return Response.json({
          ok: true,
          provider,
          hls: playbackId ? `${(playbackUrl || 'https://stream.mux.com').replace(/\/$/, '')}/${playbackId}.m3u8` : '',
          thumbnail: payload?.data?.playback_ids?.[0]?.id ? `${(playbackUrl || 'https://image.mux.com').replace(/\/$/, '')}/${playbackId}/thumbnail.jpg` : '',
          ready: payload?.data?.status === 'ready',
        });
      }

      return Response.json({ ok: true, provider, raw: { hls: payload?.hls || '', ready: Boolean(payload) } });
    }

    return Response.json({ ok: false, error: `Unknown action "${action}".` }, { status: 400 });
  } catch (error) {
    return Response.json({ ok: false, error: error.message || 'Provider check failed.' }, { status: 500 });
  }
}
