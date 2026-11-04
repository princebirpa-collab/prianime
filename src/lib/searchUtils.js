/**
 * Pure helpers for the anime search pipeline: query variants, retryable
 * error classification and bounded exponential-backoff retries.
 * No platform imports — safe to unit-test in isolation.
 */

/**
 * Builds normalized variants of a search term (used in order, first match wins).
 * Trims whitespace, collapses runs of spaces, strips punctuation and drops
 * leading articles — the original term is always the first variant.
 */
export function searchVariants(rawQuery) {
  const trimmed = String(rawQuery || "").trim();
  if (!trimmed) return [];
  const collapsed = trimmed.replace(/\s+/g, " ");
  const variants = [collapsed];
  const noPunctuation = collapsed
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
  if (noPunctuation && !variants.includes(noPunctuation)) variants.push(noPunctuation);
  const withoutArticles = collapsed
    .replace(/\b(the|a|an)\b\s*/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  if (withoutArticles && !variants.includes(withoutArticles)) variants.push(withoutArticles);

  // Recover a common joined final-letter spelling such as "ballz" -> "ball z".
  // Keep the user's exact query first; this is only a fallback API variant.
  const splitTrailingZ = collapsed.replace(/\\b([\\p{L}]{3,})z\\b/giu, "$1 z");
  if (splitTrailingZ !== collapsed && !variants.includes(splitTrailingZ)) {
    variants.push(splitTrailingZ);
  }
  return variants;
}

/**
 * Decides whether a failed API call is worth retrying. Explicit markers win;
 * network failures, timeouts, rate limits and server errors retry, while
 * invalid queries and provider rejections (4xx) do not.
 */
export function isRetryableFetchError(error) {
  if (!error) return false;
  if (error.retryable === false) return false;
  if (error.retryable === true) return true;
  if (error.name === "TypeError") return true; // fetch network failure
  if (error.name === "TimeoutError" || error.name === "AbortError") return true;
  if (Number.isFinite(error.status)) return error.status === 429 || error.status >= 500;
  return false;
}

const defaultSleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Runs `run(attempt)` with bounded retries. Only retryable failures retry,
 * with exponential backoff (500ms, 1000ms, …) and a longer, respectful pause
 * after rate limits. Non-retryable errors fail fast; retries are never
 * infinite.
 */
export async function withRetries(run, { retries = 2, sleep = defaultSleep } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await run(attempt);
    } catch (error) {
      lastError = error;
      if (attempt === retries || !isRetryableFetchError(error)) break;
      await sleep(error.status === 429 ? 1200 : 500 * 2 ** attempt);
    }
  }
  throw lastError;
}


/**
 * Scores a catalogue title against a user's query without requiring exact
 * spacing. Supports merged/split tokens and one-character typos while
 * requiring most meaningful query tokens to match.
 */
export function scoreTitleMatch(titleValues, rawQuery) {
  const clean = (value) => String(value || "").toLocaleLowerCase().normalize("NFKD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .replace(/[^\\p{L}\\p{N}]+/gu, " ")
    .trim();
  const query = clean(rawQuery);
  if (!query) return 0;

  const titles = [...new Set((Array.isArray(titleValues) ? titleValues : [titleValues])
    .map(clean).filter(Boolean))];
  if (!titles.length) return 0;

  const compactQuery = query.replace(/\\s+/g, "");
  const queryTokens = query.split(/\\s+/).filter(Boolean);

  const editDistanceAtMostOne = (a, b) => {
    if (a === b) return true;
    if (Math.abs(a.length - b.length) > 1) return false;
    if (a.length === b.length) {
      let differences = 0;
      for (let i = 0; i < a.length; i += 1) {
        if (a[i] !== b[i] && ++differences > 1) return false;
      }
      return true;
    }
    const shorter = a.length < b.length ? a : b;
    const longer = a.length < b.length ? b : a;
    let i = 0;
    let j = 0;
    let skipped = false;
    while (i < shorter.length && j < longer.length) {
      if (shorter[i] === longer[j]) { i += 1; j += 1; }
      else if (skipped) return false;
      else { skipped = true; j += 1; }
    }
    return true;
  };

  let best = 0;
  for (const title of titles) {
    if (title === query) return 120;
    const compactTitle = title.replace(/\\s+/g, "");
    if (compactTitle === compactQuery) best = Math.max(best, 115);
    else if (compactTitle.includes(compactQuery) || compactQuery.includes(compactTitle)) best = Math.max(best, 95);
    else if (title.includes(query) || query.includes(title)) best = Math.max(best, 90);

    const titleTokens = title.split(/\\s+/).filter(Boolean);
    const matched = queryTokens.filter((token) => {
      if (titleTokens.some((candidate) =>
        candidate === token ||
        candidate.startsWith(token) ||
        (token.length >= 4 && editDistanceAtMostOne(candidate, token))
      )) return true;

      // Also match a misspelled/merged query token against adjacent title
      // tokens, e.g. "ballz" against "ball z".
      return titleTokens.some((_, index) => {
        const joined = titleTokens.slice(index, index + 2).join("");
        return joined.length >= 4 && editDistanceAtMostOne(joined, token);
      });
    }).length;
    const coverage = matched / Math.max(queryTokens.length, 1);
    if (coverage === 1) best = Math.max(best, 80 + matched);
    else if (coverage >= 0.75) best = Math.max(best, 55 + matched);
  }
  return best;
}
