import test from "node:test";
import assert from "node:assert/strict";
import { buildMegaPlayUrl, resolveMegaPlayUrl } from "../src/lib/megaplay.js";

test("builds the documented MegaPlay SUB and DUB episode URLs", () => {
  const episode = { episode_embed_id: "2142" };
  assert.equal(buildMegaPlayUrl(episode, "sub"), "https://megaplay.buzz/stream/s-2/2142/sub");
  assert.equal(buildMegaPlayUrl(episode, "dub"), "https://megaplay.buzz/stream/s-2/2142/dub");
});

test("prefers the API supplied MegaPlay URL and preserves its query string", () => {
  const episode = { episode_embed_id: "2142", embed_url: { sub: "https://megaplay.buzz/stream/s-2/2142/sub?s=tcdn" } };
  assert.equal(resolveMegaPlayUrl(episode, "sub"), episode.embed_url.sub);
});

test("does not trust non-MegaPlay embed origins", () => {
  const episode = { episode_embed_id: "2142", embed_url: { sub: "https://example.com/player" } };
  assert.equal(resolveMegaPlayUrl(episode, "sub"), "https://megaplay.buzz/stream/s-2/2142/sub");
});

test("rejects missing or malformed episode embed IDs", () => {
  assert.equal(buildMegaPlayUrl({ episode_embed_id: "../2142" }, "sub"), "");
  assert.equal(resolveMegaPlayUrl({}, "dub"), "");
});
