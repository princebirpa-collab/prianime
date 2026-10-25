import { base44 } from "@/api/base44Client";
import { searchVariants, withRetries } from "@/lib/searchUtils";

const DIRECT_URL = "https://graphql.anilist.co";
const TTL = 5 * 60 * 1000;
const SERVER_KEY = "pri:anilist:server-mode";
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
    characters(sort: [ROLE, RELEVANCE], perPage: 8) { nodes { id name { full } image { large } } }
    relations { edges { relationType node { id type title { romaji english } coverImage { large } } } }
    recommendations(perPage: 8, sort: RATING_DESC) { nodes { mediaRecommendation { id title { romaji english } coverImage { large extraLarge } averageScore } } }
  }
}`;

export function currentSeason(date = new Date()) {
  const month = date.getUTCMonth();
  const season = month < 3 ? "WINTER" : month < 6 ? "SPRING" : month < 9 ? "SUMMER" : "FALL";
  return { season, year: date.getUTCFullYear() };
}

export function normalize(media) {
  if (!media) return null;
  return {
    id: media.id,
    source: "anilist",
    display: media.title?.english || media.title?.romaji || "Untitled",
    titleRomaji: media.title?.romaji || "",
    cover: media.coverImage?.extraLarge || media.coverImage?.large || "",
    accent: media.coverImage?.color || "",
    banner: media.bannerImage || media.coverImage?.extraLarge || "",
    description: (media.description || "").replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, ""),
    genres: media.genres || [],
    score: media.averageScore ?? null,
    popularity: media.popularity ?? 0,
    episodes: media.episodes ?? null,
    duration: media.duration ?? null,
    status: media.status || "",
    format: media.format || "",
    season: media.season || "",
    seasonYear: media.seasonYear ?? null,
    studios: (media.studios?.nodes || []).map((node) => node.name),
    trailer: media.trailer || null,
    nextEpisode: media.nextAiringEpisode || null,
    characters: (media.characters?.nodes || []).map((node) => ({
      id: node.id,
      name: node.name?.full || "",
      image: node.image?.large || "",
    })),
    relations: (media.relations?.edges || [])
      .filter((edge) => edge.node?.type === "ANIME")
      .slice(0, 8)
      .map((edge) => normalize({ ...edge.node, description: "" })),
    recommendations: (media.recommendations?.nodes || [])
      .map((node) => node.mediaRecommendation)
      .filter(Boolean)
      .map((item) => normalize(item)),
  };
}

let serverMode = typeof sessionStorage !== "undefined" && sessionStorage.getItem(SERVER_KEY) !== "off";

async function tryServer(body) {
  if (!serverMode) return null;
  try {
    const response = await base44.functions.invoke("anilist", body);
    if (response?.data?.ok) return response.data;
    serverMode = false;
    sessionStorage.setItem(SERVER_KEY, "off");
    return null;
  } catch {
    serverMode = false;
    sessionStorage.setItem(SERVER_KEY, "off");
    return null;
  }
}

async function fetchGraphQL(query, variables) {
  const response = await fetch(DIRECT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(12000),
  });
  // HTTP errors and GraphQL errors are classified separately, and every
  // failure carries whether it is safe to retry.
  if (response.status === 429) {
    const error = new Error("AniList is temporarily limiting requests. Try again shortly.");
    error.status = 429;
    error.retryable = true;
    throw error;
  }
  if (!response.ok) {
    const error = new Error(`AniList responded ${response.status}.`);
    error.status = response.status;
    error.retryable = response.status >= 500;
    throw error;
  }
  let payload;
  try {
    payload = await response.json();
  } catch {
    // An HTTP 200 with an unreadable body (e.g. a proxy/CDN interstitial) is
    // NOT a genuine zero-results answer â€” it is a transient failure.
    const error = new Error("AniList returned an unreadable response.");
    error.retryable = true;
    throw error;
  }
  if (payload.errors?.length) {
    const error = new Error(payload.errors[0].message || "AniList rejected the query.");
    error.status = 400;
    error.retryable = false;
    throw error;
  }
  if (!payload.data) {
    const error = new Error("AniList returned no data for this query.");
    error.retryable = true;
    throw error;
  }
  return payload.data;
}

// An HTTP success does not mean the query succeeded: validate the payload
// shape, retry transient failures with bounded backoff, and time out hung
// requests so they can never masquerade as an empty catalogue.
async function graphql(query, variables) {
  return withRetries(() => fetchGraphQL(query, variables));
}

function buildListVariables(body) {
  const action = body.action || "trending";
  const variables = {
    page: Math.min(Math.max(Number(body.page) || 1, 1), 50),
    perPage: Math.min(Math.max(Number(body.perPage) || 20, 1), 25),
    search: null,
    genre: null,
    season: null,
    seasonYear: null,
    sort: ["POPULARITY_DESC"],
  };

  if (action === "trending") variables.sort = ["TRENDING_DESC"];
  else if (action === "top") variables.sort = ["SCORE_DESC"];
  else if (action === "seasonal") {
    const now = currentSeason();
    variables.season = (body.season || now.season).toUpperCase();
    variables.seasonYear = Number(body.year) || now.year;
    variables.sort = ["POPULARITY_DESC"];
  } else if (action === "genre") {
    variables.genre = body.genre || "Action";
    variables.sort = ["POPULARITY_DESC"];
  } else if (action === "search") {
    variables.search = (body.q || "").trim() || null;
    if (!variables.search) return null;
    variables.sort = ["SEARCH_MATCH"];
    if (body.genre) variables.genre = body.genre;
  }

  return variables;
}

export async function callAniList(body) {
  const key = JSON.stringify(body);
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;

  const serverResult = await tryServer(body);
  let result;
  // A server search that comes back empty is NOT trusted as final â€” AniList
  // intermittently serves empty pages to valid queries â€” so it falls through
  // to the validated direct search with variants below.
  if (serverResult && (serverResult.items?.length || body.action !== "search")) {
    result = {
      items: (serverResult.items || []).map(normalize),
      item: serverResult.item ? normalize(serverResult.item) : null,
      pageInfo: serverResult.pageInfo || null,
    };
    if (serverResult.item) {
      result.item = {
        ...normalize(serverResult.item),
        characters: serverResult.item.characters || [],
        relations: serverResult.item.relations || [],
        recommendations: (serverResult.item.recommendations || []).map(normalize),
      };
    }
  } else if (body.action === "by_id") {
    const id = Number(body.id);
    if (!id) throw new Error("A numeric anime id is required.");
    const data = await graphql(DETAIL_QUERY, { id });
    if (!data?.Media) throw new Error("That anime could not be found.");
    result = { item: normalize(data.Media), items: [], pageInfo: null };
  } else if (body.action === "search") {
    const variables = buildListVariables(body);
    if (!variables) return { items: [], pageInfo: null, item: null };
    // AniList's search intermittently answers a valid query with an empty
    // page. Each attempt is validated (payload.data.Page), then normalized
    // variants of the same term are tried before accepting a genuine
    // zero-result search. Same provider, same filters â€” no ID mismatch.
    result = { items: [], pageInfo: null, item: null };
    const variants = searchVariants(variables.search);
    // The original term gets one extra attempt (AniList can empty a single
    // valid query), then normalized variants are explored â€” at most 3 calls.
    const attempts = variants.length > 1 ? [variants[0], ...variants] : [variants[0], variants[0]];
    for (const variant of attempts) {
      const data = await graphql(LIST_QUERY, { ...variables, search: variant });
      const items = (data?.Page?.media || []).map(normalize).filter(Boolean);
      if (items.length > 0) {
        result = { items, pageInfo: data?.Page?.pageInfo || null, item: null };
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  } else {
    const variables = buildListVariables(body);
    if (!variables) return { items: [], pageInfo: null, item: null };
    const data = await graphql(LIST_QUERY, variables);
    if (!data?.Page) throw new Error("AniList returned an invalid catalogue response.");
    result = {
      items: (data.Page.media || []).map(normalize).filter(Boolean),
      pageInfo: data.Page.pageInfo || null,
      item: null,
    };
  }

  if (cache.size > 200) cache.clear();
  // A genuinely empty list is cached only briefly, so a transient provider
  // hiccup can never stick as "zero results" for the full TTL. Failures are
  // never cached at all (the throw above bypasses this line).
  const ttl = result.items?.length ? TTL : 30 * 1000;
  cache.set(key, { value: result, expires: Date.now() + ttl });
  return result;
}

const malCache = new Map();

// MyAnimeList ratings come from Jikan (public MyAnimeList data, no key in the
// browser) with the keyed backend as a fallback.
async function jikanRating(title) {
  const response = await fetch(
    `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}&limit=1&sfw=true`,
    { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(6000) },
  );
  if (!response.ok) return null;
  const payload = await response.json();
  const hit = payload?.data?.[0];
  if (!hit?.score) return null;
  return { score: hit.score, rank: hit.rank ?? null, id: hit.mal_id ?? null };
}

export async function fetchMalRating(title) {
  if (!title) return null;
  if (malCache.has(title)) return malCache.get(title);

  let rating = null;
  try {
    rating = await jikanRating(title);
  } catch {
    rating = null;
  }

  if (!rating) {
    try {
      const response = await base44.functions.invoke("mal", { action: "search", q: title, limit: 3 });
      const data = response?.data;
      rating = data?.ok && data.items?.[0]
        ? { score: data.items[0].malScore, rank: data.items[0].rank, id: data.items[0].id }
        : null;
    } catch {
      rating = null;
    }
  }

  malCache.set(title, rating);
  return rating;
}

export async function fetchProviderStatus() {
  try {
    const response = await base44.functions.invoke("videoProvider", { action: "status" });
    return response?.data || null;
  } catch {
    return null;
  }
}
