import test from "node:test";
import assert from "node:assert/strict";

test("CI Node test runner is operational", () => {
  assert.equal(1 + 1, 2);
});
