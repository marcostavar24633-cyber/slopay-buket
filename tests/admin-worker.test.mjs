import test from "node:test";
import assert from "node:assert/strict";
import worker from "../worker.js";

const env = {
  ASSETS: { fetch: async () => new Response("static asset") },
};

test("static requests continue to use the assets binding", async () => {
  const response = await worker.fetch(new Request("https://example.com/"), env);
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "static asset");
});

test("admin API fails closed when Access is not configured", async () => {
  const response = await worker.fetch(new Request("https://example.com/api/session"), env);
  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), { error: "Server configuration or internal error" });
});

test("admin API rejects requests without an Access JWT", async () => {
  const configured = { ...env, ACCESS_TEAM_DOMAIN: "team.cloudflareaccess.com", ACCESS_AUD: "expected-audience" };
  const response = await worker.fetch(new Request("https://example.com/api/session"), configured);
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: "Authentication required" });
});

test("admin API rejects cross-origin requests", async () => {
  const configured = { ...env, ACCESS_TEAM_DOMAIN: "team.cloudflareaccess.com", ACCESS_AUD: "expected-audience" };
  const response = await worker.fetch(new Request("https://example.com/api/session", {
    headers: { Origin: "https://attacker.example" },
  }), configured);
  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), { error: "Origin not allowed" });
});
