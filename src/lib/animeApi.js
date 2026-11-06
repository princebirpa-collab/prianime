import { base44 } from "@/api/base44Client";
import { searchVariants, scoreTitleMatch, withRetries } from "@/lib/searchUtils";

const DIRECT_URL = "/api/anilist";
const TTL = 5 * 60 * 1000;
const SERVER_KEY = "pri:anilist:server-mode";
const CATALOG_MODE_KEY = "pri-anime:catalog-source-mode";
const cache = new Map();

const CORE = `id title { romaji english native } synonyms coverImage { extraLarge large color } bannerImage description(asHtml: false) genres averageScore meanScore popularity episodes duration status format season seasonYear startDate { year month day } endDate { year month day } studios(isMain: true) { nodes { name } } trailer { id site } nextAiringEpisode { episode timeUntilAiring }`;

const LIST_QUERY = `query ($page: Int, $perPage: Int, $search: String, $genre: String, $season: MediaSeason, $seasonYear: Int, $sort: [MediaSort]) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { total currentPage lastPage hasNextPage }
    media(type: ANIME, isAdult: false, search: $search, genre: $genre, season: $season, seasonYear: $seasonYear, sort: $sort) { ${CORE} }
  }
}`;

const DETAIL_QUERY = `query ($id: Int) {
  Media(id: $id, type: ANIME) {
    ${CORE}
    airingSchedule(notYetAired: false, perPage: 100) { nodes { episode airingAt timeUntilAiring } }
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
    titleNative: media.title?.native || "",
    titleAliases: Array.isArray(media.synonyms) ? media.synonyms : [],
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
    startDate: media.startDate || null,
    endDate: media.endDate || null,
    airingSchedule: (media.airingSchedule?.nodes || []).map((entry) => ({ episode: entry.episode, airingAt: entry.airingAt, timeUntilAiring: entry.timeUntilAiring })),
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
    // NOT a genuine zero-results answer — it is a transient failure.
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
    // Preserve the Browse genre filter for popular/trending/top/seasonal
    // catalogue requests as well as the dedicated genre action.
    genre: body.genre || null,
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
    // AniList's fuzzy search can bury the canonical franchise entry beyond
    // the default small page. Search up to its supported page size; the UI
    // still paginates subsequent pages normally.
    variables.perPage = 50;
    variables.sort = ["SEARCH_MATCH"];
    if (body.genre) variables.genre = body.genre;
  }

  return variables;
}


function dateParts(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}
function normalizeExternalMedia(raw, source) {
  if (!raw) return null;
  if (source === "mal") {
    const id = Number(raw.mal_id);
    if (!id) return null;
    const airingSchedule = (raw.episodes_list || []).filter((ep) => ep.aired).map((ep) => ({ episode: ep.mal_id, airingAt: Math.floor(new Date(ep.aired).getTime() / 1000), timeUntilAiring: 0 })).filter((ep) => Number.isFinite(ep.airingAt));
    return { id: "mal-" + id, source: "mal", display: raw.title_english || raw.title || "Untitled anime", titleRomaji: raw.title || "", titleNative: raw.title_japanese || "", titleAliases: raw.title_synonyms || [], cover: raw.images?.webp?.large_image_url || raw.images?.jpg?.large_image_url || "", banner: raw.images?.webp?.large_image_url || "", description: raw.synopsis || "", genres: (raw.genres || []).map((g) => g.name), score: raw.score ? Math.round(raw.score * 10) : null, popularity: raw.members || 0, episodes: raw.episodes || null, duration: null, status: raw.status || "", format: raw.type || "TV", season: "", seasonYear: raw.year || dateParts(raw.aired?.from)?.year || null, startDate: dateParts(raw.aired?.from), endDate: dateParts(raw.aired?.to), airingSchedule, studios: (raw.studios || []).map((s) => s.name), trailer: null, nextEpisode: null, characters: [], relations: [], recommendations: [] };
  }
  const attrs = raw.attributes || raw, id = String(raw.id || attrs.id || "");
  if (!id) return null;
  const titles = attrs.titles || { en: raw.title_english || raw.title, ja_jp: raw.title_japanese };
  const poster = attrs.posterImage || { large: raw.images?.webp?.large_image_url || raw.images?.jpg?.large_image_url };
  return { id: "kitsu-" + id, source: "kitsu", display: titles.en || attrs.canonicalTitle || titles.en_jp || "Untitled anime", titleRomaji: titles.en_jp || attrs.canonicalTitle || raw.title || "", titleNative: titles.ja_jp || raw.title_japanese || "", titleAliases: [...new Set([...Object.values(titles), ...(raw.title_synonyms || [])].filter(Boolean))], cover: poster.large || poster.original || poster.medium || "", banner: poster.large || poster.original || "", description: attrs.synopsis || attrs.description || raw.synopsis || "", genres: [], score: attrs.averageRating ? Math.round(Number(attrs.averageRating)) : null, popularity: Number(attrs.userCount) || 0, episodes: attrs.episodeCount || null, duration: attrs.episodeLength || null, status: attrs.status || "", format: attrs.showType || "TV", season: "", seasonYear: dateParts(attrs.startDate)?.year || null, startDate: dateParts(attrs.startDate), endDate: dateParts(attrs.endDate), airingSchedule: [], studios: [], trailer: null, nextEpisode: null, characters: [], relations: [], recommendations: [] };
}
async function searchExternalCatalog(query) {
  try {
    const hits = await searchMalTitles(query);
    const source = hits.some((hit) => hit.kitsu_id) ? "kitsu" : "mal";
    return hits.map((hit) => normalizeExternalMedia(source === "kitsu" ? { ...hit, id: hit.kitsu_id } : hit, source)).filter(Boolean).map((item) => ({ item, score: titleSearchScore(item, query) })).filter(({ score }) => score >= 50).sort((x, y) => y.score - x.score).map(({ item }) => item);
  } catch { return []; }
}
async function fetchExternalDetail(id) {
  const source = String(id).startsWith("mal-") ? "mal" : String(id).startsWith("kitsu-") ? "kitsu" : "";
  if (!source) throw new Error("Unsupported catalogue ID.");
  const numericId = String(id).slice(source.length + 1);
  const response = await fetch("/api/catalog-detail?source=" + source + "&id=" + encodeURIComponent(numericId), { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(9000) });
  if (!response.ok) throw new Error("The backup catalogue detail is temporarily unavailable.");
  const payload = await response.json();
  const item = normalizeExternalMedia(payload.data, source);
  if (!item) throw new Error("The backup catalogue returned an invalid anime entry.");
  return item;
}

function titleSearchScore(anime, query) {
  return scoreTitleMatch(
    [anime?.display, anime?.titleRomaji, anime?.titleNative, ...(anime?.titleAliases || [])],
    query
  );
}

function rankSearchResults(items, query) {
  const unique = [...new Map((items || []).filter(Boolean).map((item) => [String(item.id), item])).values()];
  // AniList can return fuzzy, unrelated matches for short or ambiguous terms.
  // Do not display those as if they were the requested anime: require a real
  // title/token match, then rank the strongest match first.
  return unique
    .map((item) => ({ item, score: titleSearchScore(item, query) }))
    .filter(({ score }) => score >= 50)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}

async function searchMalTitles(query) {
  const response = await fetch(`/api/mal-search?q=${encodeURIComponent(query)}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) return [];
  const payload = await response.json();
  return Array.isArray(payload?.data) ? payload.data : [];
}

function expandedSearchVariants(query) {
  const base = searchVariants(query);
  const normalized = String(query || "").toLocaleLowerCase().normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  const knownAliases = {
    "tokyo revenge": ["Tokyo Revengers"],
    "tokyo revenger": ["Tokyo Revengers"],
    "dragon ballz": ["Dragon Ball Z"],
    "boku no hero": ["Boku no Hero Academia", "My Hero Academia"],
    "my hero": ["My Hero Academia"],
    "kimetsu no yaiba": ["Demon Slayer Kimetsu no Yaiba"],
    "shingeki no kyojin": ["Attack on Titan"],
  };
  // Keep the user's exact spelling first, then put a known canonical title
  // immediately after it. This prevents generic punctuation/stem variants
  // from pushing important aliases (e.g. "Tokyo Revenge" -> "Tokyo Revengers")
  // out of the request budget and keeps quick search responsive.
  const canonical = knownAliases[normalized] || [];
  return [...new Set([base[0], ...canonical, ...base.slice(1)])].slice(0, 2);
}

export async function callAniList(body) {
  const key = JSON.stringify(body);
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;

  let result;
  // Use the same-origin Vercel AniList proxy consistently for every catalog
  // request. The legacy Base44 "anilist" function is not a catalog source.
  if (body.action === "by_id" && /^(mal|kitsu)-/.test(String(body.id))) {
    result = { item: await fetchExternalDetail(body.id), items: [], pageInfo: null };
  } else if (body.action === "by_id") {
    const id = Number(body.id);
    if (!id) throw new Error("A numeric anime id is required.");
    const data = await graphql(DETAIL_QUERY, { id });
    if (!data?.Media) throw new Error("That anime could not be found.");
    result = { item: normalize(data.Media), items: [], pageInfo: null };
  } else if (body.action === "search") {
    const variables = buildListVariables(body);
    if (!variables) return { items: [], pageInfo: null, item: null };
    // Search every distinct spelling variant and MERGE the matching results.
    // Previously the loop stopped after the first non-empty response, which
    // could hide the requested title when AniList's fuzzy ranking returned
    // an incomplete first page for the original spelling.
    result = { items: [], pageInfo: null, item: null };
    const variants = expandedSearchVariants(variables.search);
    const merged = new Map();
    const pageInfos = [];
    for (const variant of variants) {
      try {
        const data = await graphql(LIST_QUERY, { ...variables, search: variant });
        const page = data?.Page;
        if (!page) continue;
        if (page.pageInfo) pageInfos.push(page.pageInfo);
        for (const anime of (page.media || []).map(normalize).filter(Boolean)) {
          const score = titleSearchScore(anime, variables.search);
          if (score >= 50) merged.set(String(anime.id), anime);
        }
      } catch {
        // A failed spelling variant must not prevent other variants from
        // returning useful matches or trigger a false "no anime found".
      }
      // AniList rate-limits aggressively. A short 180ms pause caused
      // fallback title variants to be throttled, leaving only the first
      // fuzzy result (for example, a Dragon Ball Z special) on screen.
      // Space variant requests by about one second so the canonical franchise
      // search can complete reliably.
      if (variants.length > 1 && variant !== variants[variants.length - 1]) {
        await new Promise((resolve) => setTimeout(resolve, 1100));
      }
    }
    const ranked = rankSearchResults([...merged.values()], variables.search);
    if (ranked.length) {
      const bestPageInfo = pageInfos.sort((a, b) => (b.total || 0) - (a.total || 0))[0] || null;
      result = {
        items: ranked,
        pageInfo: bestPageInfo ? {
          ...bestPageInfo,
          total: Math.max(...pageInfos.map((info) => info.total || 0)),
          hasNextPage: pageInfos.some((info) => Boolean(info.hasNextPage)),
        } : null,
        item: null,
      };
    }

    // MAL/Jikan is a title-discovery fallback only. Resolve any discovered
    // MAL titles back through AniList so the UI keeps AniList IDs/routes and
    // playback identity; never pass a MAL ID into an AniList watch route.
    const catalogMode = typeof localStorage !== "undefined" ? localStorage.getItem(CATALOG_MODE_KEY) || "automatic" : "automatic";
    if (result.items.length === 0 && catalogMode === "automatic") {
      try {
        const malHits = await searchMalTitles(variables.search);
        const aliases = [...new Set(malHits.flatMap((hit) =>
          [hit.title, hit.title_english, hit.title_japanese, ...(hit.title_synonyms || [])]
            .filter(Boolean)
        ))]
          // MAL/Kitsu fallback may return unrelated fuzzy entries. Only query
          // aliases that actually correspond to the user's typed title.
          .filter((alias) => titleSearchScore({
            display: alias, titleRomaji: alias, titleNative: alias,
          }, variables.search) >= 50)
          .slice(0, 4);
        for (const alias of aliases) {
          try {
            const data = await graphql(LIST_QUERY, { ...variables, search: alias });
            const normalizedAliasResults = (data?.Page?.media || []).map(normalize).filter(Boolean);
            // Keep results tied to the original query; never trust the
            // fallback provider's fuzzy alias as proof of relevance.
            const items = rankSearchResults(normalizedAliasResults, variables.search);
            if (items.length) {
              result = { items, pageInfo: data?.Page?.pageInfo || null, item: null };
              break;
            }
          } catch {
            // A failed alias lookup should not hide other MAL-discovered names.
          }
        }
      } catch {
        // MAL is an optional secondary metadata source; retain AniList's
        // valid empty result rather than turning an upstream outage into error.
      }
    }
    if (result.items.length === 0 && catalogMode === "automatic") {
      const externalItems = await searchExternalCatalog(variables.search);
      if (externalItems.length) result = { items: externalItems, pageInfo: { total: externalItems.length, currentPage: 1, lastPage: 1, hasNextPage: false }, item: null };
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
  return { score: hit.score, rank: hit.rank ?? null, id: hit.mal_id ?? null, source: "MAL" };
}

export async function fetchMalRating(title) {
  if (!title) return null;
  const cached = malCache.get(title);
  if (cached && cached.expires > Date.now()) return cached.value;
  if (cached) malCache.delete(title);

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
        ? { score: data.items[0].malScore, rank: data.items[0].rank, id: data.items[0].id, source: "MAL" }
        : null;
    } catch {
      rating = null;
    }
  }

  // Never substitute AniList's score for a MyAnimeList rating.
  // If MAL/Jikan cannot supply a rating, the UI truthfully shows unavailable.
  // Cache a missing result briefly only; upstream outages should self-recover.
  malCache.set(title, { value: rating, expires: Date.now() + (rating ? TTL : 30 * 1000) });
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
