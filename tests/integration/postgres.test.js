import test from "node:test";
import assert from "node:assert/strict";
import pg from "pg";

const { Client } = pg;
const url = process.env.DATABASE_URL;

test("connects to PostgreSQL and runs a query", async () => {
  assert.ok(url, "DATABASE_URL must be configured");
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    const result = await client.query("SELECT current_database() AS db, 1 AS ok");
    assert.equal(result.rows[0].ok, 1);
    assert.equal(result.rows[0].db, "app_test");
  } finally {
    await client.end();
  }
});
