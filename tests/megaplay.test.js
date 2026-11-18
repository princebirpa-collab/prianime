import test from "node:test";
import assert from "node:assert/strict";
import { buildMegaPlayUrl, resolveMegaPlayUrl } from "../src/lib/megaplay.js";

test("builds documented MegaPlay SUB and DUB episode URLs", () => {
  const episode = { episode_embed_id: "2142" };
  assert.equal(buildMegaPlayUrl(episode, "sub"), "https://megaplay.buzz/stream/s-2/2142/sub");
  assert.equal(buildMegaPlayUrl(episode, "dub"), "https://megaplay.buzz/stream/s-2/2142/dub");
});

test("uses a MegaPlay API url and preserves its query string", () => {
  const episode = { url: "https://megaplay.buzz/stream/s-2/136197/dub?s=tcdn" };
  assert.equal(resolveMegaPlayUrl(episode, "dub"), episode.url);
});

test("resolves a nested API embed object", () => {
  const episode = { embed_url: { sub: { url: "https://www.megaplay.buzz/stream/s-2/2142/sub" } } };
  assert.equal(resolveMegaPlayUrl(episode, "sub"), episode.embed_url.sub.url);
});

test("rejects non-MegaPlay origins and falls back to a validated episode ID", () => {
  const episode = { episode_embed_id: "2142", embed_url: { sub: "https://example.com/player" } };
  assert.equal(resolveMegaPlayUrl(episode, "sub"), "https://megaplay.buzz/stream/s-2/2142/sub");
});

test("rejects missing or malformed episode embed IDs", () => {
  assert.equal(buildMegaPlayUrl({ episode_embed_id: "../2142" }, "sub"), "");
  assert.equal(resolveMegaPlayUrl({}, "dub"), "");
});
