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

import { validateContent } from "../worker.js";

test("content validators accept the current content formats", () => {
  const fixtures = {
    site: { brand: "Brand", city: "City", reviewsCount: 1 },
    hero: { title: "Title", titleAccent: "Accent", subtitle: "Text", quizButton: "CTA", photoProduct: "item-1" },
    products: { items: [{ id: "p-1", cat: "berry", name: "Name", desc: "Description", price: 100, image: "/img/p.webp", show: true, hit: false, hitLabel: false }] },
    reviews: { reviews: [{ name: "A", date: "Today", item: "Gift", text: "Good" }], quotes: [{ name: "A", item: "Gift", text: "Good" }] },
    faq: { items: [{ q: "Question", a: "Answer" }] },
    occasions: { items: [{ title: "Holiday", text: "Text", image: "/img/a.webp", target: "berry" }] },
    seasons: { seasons: [{ from: "2026-01-01", until: "2026-01-02", text: "Text", href: "#catalog" }] },
    messages: { header: "Hello", order: "Order" },
    page: { blocks: [{ type: "builtin", section: "catalog", show: true }, { type: "text", title: "Title", body: "Body" }] },
  };
  for (const [key, data] of Object.entries(fixtures)) {
    assert.equal(validateContent(key, data), null, key + " should be accepted");
  }
});

test("content validators reject malformed records and unknown block types", () => {
  assert.match(validateContent("products", { items: [{ id: "p-1", price: "100" }] }), /Структура данных/);
  assert.match(validateContent("reviews", { reviews: [{ name: 3 }], quotes: [] }), /Структура данных/);
  assert.match(validateContent("page", { blocks: [{ type: "script", body: "bad" }] }), /Структура данных/);
  assert.match(validateContent("messages", { header: 123 }), /Структура данных/);
  assert.match(validateContent("unknown", {}), /Неизвестный раздел/);
});
