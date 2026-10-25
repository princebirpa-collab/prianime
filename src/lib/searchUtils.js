/**
 * Pure helpers for the anime search pipeline: query variants, retryable
 * error classification and bounded exponential-backoff retries.
 * No platform imports â€” safe to unit-test in isolation.
 */

/**
 * Builds normalized variants of a search term (used in order, first match wins).
 * Trims whitespace, collapses runs of spaces, strips punctuation and drops
 * leading articles â€” the original term is always the first variant.
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
 * with exponential backoff (500ms, 1000ms, â€¦) and a longer, respectful pause
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
