import assert from "node:assert/strict";

const base = process.env.AUDIT_BASE_URL || "http://127.0.0.1:3000";
const production = "https://valueswitch.co.uk";
const indexed = ["/", "/mobile", "/mobile/contracts", "/mobile/sim-only", "/offers", "/best/iphone-18-deals-uk", "/providers/mozillion", "/guides"];
const utility = ["/search?q=iphone", "/login", "/compare", "/mobile/compare"];
for (const route of [...indexed, ...utility]) {
  const response = await fetch(base + route);
  assert.equal(response.status, 200, route);
  const html = await response.text();
  assert(!html.includes("NEXT_HTTP_ERROR_FALLBACK;404"), `${route}: not found`);
  assert(!html.includes('<h1>Something went wrong'), `${route}: error page`);
  if (indexed.includes(route)) {
    const canonical = [...html.matchAll(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/g)];
    assert.equal(canonical.length, 1, `${route}: canonical count`);
    assert.equal(new URL(canonical[0][1]).href, new URL(production + route).href, `${route}: canonical`);
    assert(/property="og:image"/.test(html), `${route}: share image`);
    assert(/<h1[\s>]/.test(html), `${route}: main heading`);
  } else {
    assert(/name="robots"[^>]+content="[^"]*noindex/.test(html), `${route}: noindex`);
  }
  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(match[1]);
  if (route === "/") {
    for (const model of ["iphone-18-pro-max", "iphone-18-pro"]) {
      const links = [...html.matchAll(/href="(https:\/\/www\.awin1\.com\/cread\.php[^\"]+)"/g)].map(match => new URL(match[1].replaceAll("&amp;", "&")));
      const link = links.find(url => url.searchParams.get("clickref") === `offers_mozillion-${model}`);
      assert(link, `Awin ${model} action`);
      assert.equal(link.searchParams.get("awinmid"), "31539");
      assert.equal(link.searchParams.get("awinaffid"), "2798806");
      assert.equal(link.searchParams.get("ued"), `https://www.mozillion.com/bundle/apple/${model}`);
    }
  }
  console.log(`PASS ${route}`);
}
const sitemap = await (await fetch(base + "/sitemap.xml")).text();
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
assert(urls.length > 10, "sitemap populated");
assert.equal(new Set(urls).size, urls.length, "unique sitemap URLs");
assert(!urls.some(url => /\/(search|login|admin|dashboard)(\/|\?|$)/.test(url) || /\/(mobile|broadband|energy)\/compare$/.test(url)), "utility pages excluded from sitemap");
assert(!sitemap.includes("<lastmod>"), "no fabricated modification dates");
const robots = await (await fetch(base + "/robots.txt")).text();
assert(robots.includes(`Sitemap: ${production}/sitemap.xml`));
assert.equal((robots.match(/User-Agent:/gi) || []).length, 1, "consistent crawler restrictions");
console.log(`PASS sitemap (${urls.length} unique URLs), robots and promotion tracking`);
