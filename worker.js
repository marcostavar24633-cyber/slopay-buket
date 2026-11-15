const CONTENT_FILES = Object.freeze({
  site: "content/site.json",
  hero: "content/hero.json",
  products: "content/products.json",
  reviews: "content/reviews.json",
  faq: "content/faq.json",
  occasions: "content/occasions.json",
  seasons: "content/seasons.json",
  messages: "content/messages.json",
  page: "content/page.json",
});

const MAX_JSON_BYTES = 1024 * 1024;
const GITHUB_API = "https://api.github.com";
const GITHUB_REPO = "marcostavar24633-cyber/slopay-buket";
const GITHUB_BRANCH = "feature/admin-pro-foundation";
let jwksCache = { expires: 0, keys: null };

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      ...extra,
    },
  });
}

function b64urlDecode(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function decodeJsonPart(value) {
  return JSON.parse(new TextDecoder().decode(b64urlDecode(value)));
}

async function getJwks(teamDomain) {
  if (jwksCache.keys && jwksCache.expires > Date.now()) return jwksCache.keys;
  const response = await fetch(`https://${teamDomain}/cdn-cgi/access/certs`, {
    headers: { accept: "application/json" },
    cf: { cacheTtl: 300, cacheEverything: true },
  });
  if (!response.ok) throw new Error("Access signing keys unavailable");
  const data = await response.json();
  if (!Array.isArray(data.keys)) throw new Error("Invalid Access signing keys");
  jwksCache = { keys: data.keys, expires: Date.now() + 5 * 60 * 1000 };
  return data.keys;
}

async function verifyAccess(request, env) {
  const teamDomain = String(env.ACCESS_TEAM_DOMAIN || "").replace(/^https?:\/\//, "").replace(/\/$/, "");
  const audience = String(env.ACCESS_AUD || "");
  if (!teamDomain || !audience) throw new Error("Access configuration missing");

  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  let header, claims;
  try {
    header = decodeJsonPart(parts[0]);
    claims = decodeJsonPart(parts[1]);
  } catch {
    return false;
  }
  if (header.alg !== "RS256" || !header.kid) return false;

  const issuer = `https://${teamDomain}`;
  const now = Math.floor(Date.now() / 1000);
  if (claims.iss !== issuer || !Array.isArray(claims.aud) || !claims.aud.includes(audience)) return false;
  if (typeof claims.exp !== "number" || claims.exp <= now) return false;
  if (typeof claims.nbf === "number" && claims.nbf > now) return false;

  const keys = await getJwks(teamDomain);
  const jwk = keys.find((key) => key.kid === header.kid && key.kty === "RSA" && key.use === "sig");
  if (!jwk) return false;

  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const signed = new TextEncoder().encode(parts[0] + "." + parts[1]);
  return crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    b64urlDecode(parts[2]),
    signed,
  );
}

function sameOrigin(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return request.method === "GET" || request.method === "HEAD";
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

async function github(path, env, init = {}) {
  if (!env.GITHUB_TOKEN) throw new Error("GitHub token secret is not configured");
  const response = await fetch(GITHUB_API + path, {
    ...init,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${env.GITHUB_TOKEN}`,
      "x-github-api-version": "2022-11-28",
      "content-type": "application/json",
      ...init.headers,
    },
  });
  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { /* handled below */ }
  if (!response.ok) {
    const error = new Error("GitHub API request failed");
    error.status = response.status === 409 || response.status === 422 ? 409 : 502;
    throw error;
  }
  return data;
}

function decodeGitHubContent(value) {
  const clean = value.replace(/\n/g, "");
  const binary = atob(clean);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encodeGitHubContent(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary);
}

async function handleApi(request, env, url) {
  if (!sameOrigin(request)) return json({ error: "Origin not allowed" }, 403);
  if (!(await verifyAccess(request, env))) return json({ error: "Authentication required" }, 401);

  if (url.pathname === "/api/session" && request.method === "GET") {
    return json({ authenticated: true, email: claims.email || null });
  }
  if (url.pathname === "/api/health" && request.method === "GET") {
    return json({ ok: true, service: "slopay-buket-admin-api" });
  }

  const match = url.pathname.match(/^\/api\/content\/([a-z]+)$/);
  if (!match) return json({ error: "Not found" }, 404);
  const key = match[1];
  const path = CONTENT_FILES[key];
  if (!path) return json({ error: "Unknown content key" }, 404);

  const apiPath = `/repos/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`;
  if (request.method === "GET") {
    const file = await github(apiPath, env);
    if (!file.content || file.encoding !== "base64") {
      return json({ error: "Unexpected GitHub file format" }, 502);
    }
    let data;
    try { data = JSON.parse(decodeGitHubContent(file.content)); }
    catch { return json({ error: "Stored content is invalid JSON" }, 502); }
    return json({ data, sha: file.sha });
  }

  if (request.method === "PUT") {
    const length = Number(request.headers.get("Content-Length") || 0);
    if (length > MAX_JSON_BYTES) return json({ error: "Payload too large" }, 413);
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_JSON_BYTES) {
      return json({ error: "Payload too large" }, 413);
    }

    let body;
    try { body = JSON.parse(raw); }
    catch { return json({ error: "Invalid JSON" }, 400); }
    if (!body || typeof body !== "object" || !("data" in body) || typeof body.sha !== "string" || !body.sha) {
      return json({ error: "Expected data and current sha" }, 400);
    }

    // Require an object at the root; schema-level validation is added per content key in the next stage.
    if (Array.isArray(body.data) || body.data === null || typeof body.data !== "object") {
      return json({ error: "Content root must be a JSON object" }, 400);
    }

    try {
      const result = await github(`/repos/${GITHUB_REPO}/contents/${path}`, env, {
        method: "PUT",
        body: JSON.stringify({
          message: `admin: update ${key}`,
          content: encodeGitHubContent(JSON.stringify(body.data, null, 2) + "\n"),
          sha: body.sha,
          branch: GITHUB_BRANCH,
        }),
      });
      return json({ ok: true, sha: result.content?.sha || null, commit: result.commit?.sha || null });
    } catch (error) {
      if (error.status === 409) return json({ error: "Content changed; reload before saving" }, 409);
      throw error;
    }
  }

  return json({ error: "Method not allowed" }, 405, { allow: "GET, PUT" });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      try {
        return await handleApi(request, env, url);
      } catch (error) {
        const status = error.status || 500;
        return json({ error: status === 502 ? "Upstream service error" : "Server configuration or internal error" }, status);
      }
    }
    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    headers.set("x-content-type-options", "nosniff");
    headers.set("referrer-policy", "strict-origin-when-cross-origin");
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  },
};
