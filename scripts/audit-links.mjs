import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
async function files(directory) {
  return (await Promise.all((await fs.readdir(directory, { withFileTypes: true })).map(entry => entry.isDirectory() ? files(path.join(directory, entry.name)) : path.join(directory, entry.name)))).flat();
}
const sourceFiles = (await files(path.join(root, "src"))).filter(file => /\.[jt]sx?$/.test(file));
const pageFiles = sourceFiles.filter(file => /[\\/]page\.tsx$/.test(file));
const routes = pageFiles.map(file => "/" + path.relative(path.join(root, "src/app"), path.dirname(file)).split(path.sep).filter(segment => segment && !segment.startsWith("(")).join("/"));
const patterns = routes.map(route => new RegExp("^" + route.split("/").map(segment => segment.startsWith("[") ? "[^/]+" : segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("/") + "/?$"));
const links = new Map();
for (const file of sourceFiles) {
  const text = await fs.readFile(file, "utf8");
  for (const match of text.matchAll(/(?:href\s*=\s*|href\s*:\s*)["'](\/[^"']*)["']/g)) {
    if (!links.has(match[1])) links.set(match[1], []);
    links.get(match[1]).push(path.relative(root, file));
  }
}
const missingRoutes = [];
for (const [href, sources] of links) {
  const pathname = href.split(/[?#]/)[0];
  if (!patterns.some(pattern => pattern.test(pathname)) && !pathname.startsWith("/api/") && !await fs.stat(path.join(root, "public", pathname)).catch(() => null)) missingRoutes.push({ href, sources });
}
const report = { checkedSourceLinks: links.size, routeCount: routes.length, missingRoutes, pages: [], externalLinks: [] };
if (process.argv.includes("--live")) {
  const base = process.env.AUDIT_BASE_URL || "http://127.0.0.1:3000";
  const queue = [...new Set(["/", ...routes.filter(route => !route.includes("[")), ...links.keys()])].filter(href => !/^\/(api|admin|dashboard|unsubscribe)(\/|\?|$)/.test(href));
  const visited = new Set();
  const external = new Set();
  async function worker() {
    while (queue.length) {
      const href = queue.shift();
      if (visited.has(href)) continue;
      visited.add(href);
      try {
        const response = await fetch(new URL(href, base), { signal: AbortSignal.timeout(60000) });
        const html = await response.text();
        const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] || "";
        const isHtml = response.headers.get("content-type")?.includes("text/html");
        const redirected = /NEXT_REDIRECT;/.test(html);
        const requiresBrowserCheck = /BAILOUT_TO_CLIENT_SIDE_RENDERING/.test(html);
        const failed = isHtml && (/Something went wrong|This page could not be found|Page not found/i.test(main) || (!/<h1[\s>]/.test(html) && !redirected && !requiresBrowserCheck) || /NEXT_HTTP_ERROR_FALLBACK;404/.test(html));
        report.pages.push({ href, status: response.status, errorPage: failed, requiresBrowserCheck });
        for (const anchor of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
          const target = anchor[1].replaceAll("&amp;", "&");
          if (target.startsWith("/") && !target.startsWith("//") && !/^\/(api|admin|dashboard|unsubscribe)(\/|\?|$)/.test(target) && !visited.has(target)) queue.push(target);
          if (/^https?:/.test(target)) external.add(target);
        }
      } catch (error) { report.pages.push({ href, error: error.message }); }
    }
  }
  await Promise.all([worker(), worker()]);
  report.externalLinks = [...external];
}
await fs.mkdir(path.join(root, ".next"), { recursive: true });
await fs.writeFile(path.join(root, ".next/link-audit.json"), JSON.stringify(report, null, 2));
const failedPages = report.pages.filter(page => page.error || page.status >= 400 || page.errorPage);
console.log(JSON.stringify({ sourceLinks: links.size, missingRoutes, testedPages: report.pages.length, failedPages, browserChecks: report.pages.filter(page => page.requiresBrowserCheck).map(page => page.href), externalLinks: report.externalLinks.length, report: ".next/link-audit.json" }, null, 2));
if (missingRoutes.length || failedPages.length) process.exitCode = 1;
