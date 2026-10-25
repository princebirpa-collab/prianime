import { normalizeAniList, currentSeason, clampPage, clampPerPage } from '../../shared/media.ts';

const ENDPOINT = 'https://graphql.anilist.co';
const TTL = 5 * 60 * 1000;
const cache = new Map();

const CORE = `id title { romaji english native } coverImage { extraLarge large color } bannerImage description(asHtml: false) genres averageScore meanScore popularity episodes duration status format season seasonYear startDate { year month day } studios(isMain: true) { nodes { name } } trailer { id site } nextAiringEpisode { episode timeUntilAiring }`;

const LIST_QUERY = `query ($page: Int, $perPage: Int, $search: String, $genre: String, $season: MediaSeason, $seasonYear: Int, $sort: [MediaSort]) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { total currentPage lastPage hasNextPage }
    media(type: ANIME, isAdult: false, search: $search, genre: $genre, season: $season, seasonYear: $seasonYear, sort: $sort) { ${CORE} }
  }
}`;

const DETAIL_QUERY = `query ($id: Int) {
  Media(id: $id, type: ANIME) {
    ${CORE}
    duration
    source
    countryOfOrigin
    characters(sort: [ROLE, RELEVANCE], perPage: 8) { nodes { id name { full } image { large } } }
    relations { edges { relationType node { id type title { romaji english } coverImage { large } } } }
    recommendations(perPage: 8, sort: RATING_DESC) { nodes { mediaRecommendation { id title { romaji english } coverImage { large extraLarge } averageScore } } }
  }
}`;

const USER_AGENT = 'PRI-ANIME/1.0 (+https://fierce-prime-anime-core.base44.app)';
const RETRY_DELAYS = [600, 1500];

async function gqlOnce(query, variables) {
  const key = JSON.stringify({ query, variables });
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    // Identify the app explicitly â€” bare server-side clients get flagged.
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent': USER_AGENT,
    },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(12000),
  });

  if (response.status === 429) {
    const error = new Error('AniList rate limit reached â€” try again in a minute.');
    error.code = 429;
    throw error;
  }
  if (!response.ok) {
    const text = await response.text();
    const error = new Error(`AniList returned ${response.status}: ${text.slice(0, 160)}`);
    error.code = response.status;
    throw error;
  }

  const payload = await response.json();
  if (payload.errors && payload.errors.length) {
    const error = new Error(payload.errors[0].message || 'AniList rejected the query');
    error.code = 400;
    throw error;
  }
  if (!payload.data) {
    const error = new Error('AniList returned no data for this query');
    error.code = 502;
    throw error;
  }

  if (cache.size > 240) cache.clear();
  // Genuinely empty pages cache briefly only â€” a provider hiccup must never
  // stick as "zero results" for the full TTL. Failures are never cached.
  const ttl = payload.data?.Page?.media?.length ? TTL : 30 * 1000;
  cache.set(key, { value: payload.data, expires: Date.now() + ttl });
  return payload.data;
}

// Bounded retries with exponential backoff for rate limits, server errors and
// network hiccups; invalid queries and provider rejections fail fast.
async function gql(query, variables) {
  let lastError;
  for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt += 1) {
    try {
      return await gqlOnce(query, variables);
    } catch (error) {
      lastError = error;
      const retryable = Number(error.code) === 429 || Number(error.code) >= 500;
      if (attempt === RETRY_DELAYS.length || !retryable) break;
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS[attempt]));
    }
  }
  throw lastError;
}

export default async function (req) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || 'trending');
    const page = clampPage(body.page, 1, 60);
    const perPage = clampPerPage(body.perPage, 20, 25);

    if (action === 'by_id') {
      const id = Number.parseInt(body.id, 10);
      if (!Number.isFinite(id) || id <= 0) {
        return Response.json({ ok: false, error: 'A numeric anime id is required.' }, { status: 400 });
      }
      const data = await gql(DETAIL_QUERY, { id });
      if (!data?.Media) return Response.json({ ok: false, error: 'Anime not found.' }, { status: 404 });
      const media = data.Media;
      return Response.json({
        ok: true,
        item: {
          ...normalizeAniList(media),
          characters: (media.characters?.nodes || []).map((node) => ({
            id: node.id,
            name: node.name?.full || '',
            image: node.image?.large || '',
          })),
          relations: (media.relations?.edges || [])
            .filter((edge) => edge.node?.type === 'ANIME')
            .slice(0, 8)
            .map((edge) => normalizeAniList({ ...edge.node, description: '' })),
          recommendations: (media.recommendations?.nodes || [])
            .map((node) => node.mediaRecommendation)
            .filter(Boolean)
            .map((item) => normalizeAniList(item)),
        },
      });
    }

    let sort = ['POPULARITY_DESC'];
    const variables = { page, perPage, search: null, genre: null, season: null, seasonYear: null, sort };

    if (action === 'trending') sort = ['TRENDING_DESC'];
    else if (action === 'popular') sort = ['POPULARITY_DESC'];
    else if (action === 'top') sort = ['SCORE_DESC'];
    else if (action === 'seasonal') {
      const now = currentSeason();
      variables.season = (body.season || now.season).toUpperCase();
      variables.seasonYear = Number.parseInt(body.year, 10) || now.year;
    } else if (action === 'genre') {
      if (!body.genre) return Response.json({ ok: false, error: 'A genre is required.' }, { status: 400 });
      variables.genre = String(body.genre).slice(0, 40);
    } else if (action === 'search') {
      const search = String(body.q || '').trim().slice(0, 80);
      if (!search) return Response.json({ ok: true, items: [], pageInfo: null });
      variables.search = search;
      sort = ['SEARCH_MATCH'];
      if (body.genre) variables.genre = String(body.genre).slice(0, 40);
    } else if (action !== 'browse') {
      return Response.json({ ok: false, error: `Unknown action "${action}".` }, { status: 400 });
    }

    variables.sort = sort;
    const data = await gql(LIST_QUERY, variables);
    const items = (data?.Page?.media || []).map(normalizeAniList).filter(Boolean);

    return Response.json({ ok: true, items, pageInfo: data?.Page?.pageInfo || null });
  } catch (error) {
    const status = Number.isFinite(error.code) && error.code >= 400 ? error.code : 502;
    return Response.json({ ok: false, error: error.message || 'AniList request failed.' }, { status });
  }
}

================================================================================
