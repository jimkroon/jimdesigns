import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the JimDesigns website", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="nl">/i);
  assert.match(html, /Meer dan een template\./);
  assert.match(html, /jimdesigns-hero-v2\.jpg/);
  assert.match(html, /Kennismaken/);
  assert.match(html, /JimDesigns \| Webdesign, development &amp; Shopify/);
  assert.doesNotMatch(html, /Berfume|berfume-home/i);
  assert.doesNotMatch(html, /codex-preview|Building your site|react-loading-skeleton/i);
});
