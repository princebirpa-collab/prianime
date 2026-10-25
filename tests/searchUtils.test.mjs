import test from "node:test";
import assert from "node:assert/strict";
import { searchVariants, isRetryableFetchError, withRetries } from "../src/lib/searchUtils.js";

test("trims leading and trailing spaces from a search term", () => {
  assert.deepEqual(searchVariants("  Wind Breaker  "), ["Wind Breaker"]);
});

test("collapses internal whitespace runs", () => {
  assert.deepEqual(searchVariants("wind    breaker"), ["wind breaker"]);
});

test("handles uppercase and lowercase consistently (case-insensitive API)", () => {
  const lower = searchVariants("wind breaker");
  const upper = searchVariants("WIND BREAKER");
  const mixed = searchVariants("WiNd BrEaKeR");
  assert.equal(lower.length, upper.length);
  assert.equal(lower.length, mixed.length);
  assert.deepEqual(lower, ["wind breaker"]);
  assert.deepEqual(upper, ["WIND BREAKER"]);
});

test("adds a punctuation-stripped variant when punctuation is present", () => {
  assert.deepEqual(searchVariants("Wind Breaker!!"), ["Wind Breaker!!", "Wind Breaker"]);
  assert.deepEqual(searchVariants("Spy x Family (TV)"), ["Spy x Family (TV)", "Spy x Family TV"]);
});

test("adds an article-dropped variant when articles are present", () => {
  const variants = searchVariants("The Eminence in Shadow");
  assert.equal(variants[0], "The Eminence in Shadow");
  assert.ok(variants.includes("Eminence in Shadow"));
});

test("does not duplicate identical variants", () => {
  assert.equal(searchVariants("Wind Breaker").length, 1);
});

test("empty and whitespace-only input produce no variants (no request)", () => {
  assert.deepEqual(searchVariants(""), []);
  assert.deepEqual(searchVariants("   "), []);
  assert.deepEqual(searchVariants(null), []);
  assert.deepEqual(searchVariants(undefined), []);
});

test("network failures (TypeError) and timeouts are retryable", () => {
  assert.equal(isRetryableFetchError(new TypeError("failed to fetch")), true);
  const timeout = new Error("timed out");
  timeout.name = "TimeoutError";
  assert.equal(isRetryableFetchError(timeout), true);
  const abort = new Error("aborted");
  abort.name = "AbortError";
  assert.equal(isRetryableFetchError(abort), true);
});

test("rate limits and server errors are retryable; 4xx are not", () => {
  assert.equal(isRetryableFetchError(Object.assign(new Error("429"), { status: 429 })), true);
  assert.equal(isRetryableFetchError(Object.assign(new Error("502"), { status: 502 })), true);
  assert.equal(isRetryableFetchError(Object.assign(new Error("400"), { status: 400 })), false);
  assert.equal(isRetryableFetchError(Object.assign(new Error("403"), { status: 403 })), false);
  assert.equal(isRetryableFetchError(null), false);
});

test("explicit non-retryable marker wins over network-failure classification", () => {
  const forced = new TypeError("failed to fetch");
  forced.retryable = false;
  assert.equal(isRetryableFetchError(forced), false);
});

test("withRetries retries retryable failures with exponential backoff", async () => {
  const delays = [];
  let attempts = 0;
  const result = await withRetries(
    () => {
      attempts += 1;
      if (attempts < 3) {
        const error = new Error("502");
        error.status = 502;
        throw error;
      }
      return "ok";
    },
    { sleep: async (ms) => delays.push(ms) },
  );
  assert.equal(result, "ok");
  assert.equal(attempts, 3);
  assert.deepEqual(delays, [500, 1000]);
});

test("withRetries pauses longer after a rate limit", async () => {
  const delays = [];
  let attempts = 0;
  await withRetries(
    () => {
      attempts += 1;
      if (attempts < 2) {
        const error = new Error("rate limited");
        error.status = 429;
        throw error;
      }
      return "ok";
    },
    { sleep: async (ms) => delays.push(ms) },
  );
  assert.equal(attempts, 2);
  assert.deepEqual(delays, [1200]);
});

test("withRetries does not retry invalid (4xx) queries", async () => {
  let attempts = 0;
  const delays = [];
  await assert.rejects(
    withRetries(
      () => {
        attempts += 1;
        const error = new Error("validation failed");
        error.status = 400;
        throw error;
      },
      { sleep: async (ms) => delays.push(ms) },
    ),
  );
  assert.equal(attempts, 1);
  assert.deepEqual(delays, []);
});

test("withRetries throws after bounded retries and never retries forever", async () => {
  let attempts = 0;
  const delays = [];
  await assert.rejects(
    withRetries(
      () => {
        attempts += 1;
        const error = new Error("still down");
        error.status = 502;
        throw error;
      },
      { retries: 2, sleep: async (ms) => delays.push(ms) },
    ),
    /still down/,
  );
  assert.equal(attempts, 3);
  assert.deepEqual(delays, [500, 1000]);
});

test("out-of-order and duplicate terms produce stable variant sets", () => {
  assert.deepEqual(searchVariants("Wind Breaker"), searchVariants("Wind Breaker"));
  assert.deepEqual(searchVariants("  wind breaker "), searchVariants("wind breaker"));
});

================================================================================
