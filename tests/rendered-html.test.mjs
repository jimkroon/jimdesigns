import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
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
  assert.match(html, /Websites met karakter\./);
  assert.match(html, /jimdesigns-hero-editorial-v3\.png/);
  assert.match(html, /Bespreek je website/);
  assert.match(html, /jimdesigns-logo\.svg/);
  assert.match(html, /Bekijk portfolio/);
  assert.match(html, /JimDesigns \| Webdesign, development &amp; Shopify/);
  assert.doesNotMatch(html, /Berfume|berfume-home/i);
  assert.doesNotMatch(html, /codex-preview|Building your site|react-loading-skeleton/i);
});

test("server-renders the portfolio page", async () => {
  const response = await render("/portfolio");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Mijn werk, in het echt\./);
  assert.match(html, /Berfume\.nl/);
  assert.match(html, /berfume-macbook-higgsfield\.png/);
  assert.match(html, /https:\/\/berfume\.nl/);
  assert.match(html, /info@jimdesigns\.nl/);
});
