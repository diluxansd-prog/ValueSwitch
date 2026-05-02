/**
 * Seed five pillar SEO articles into the live DB.
 *
 * Pulls each from /content/guides/*.md, parses the frontmatter, and
 * upserts into Prisma so reruns are safe.  Spread publishedAt across
 * the last 12 days so the editorial calendar looks active.  Pings
 * IndexNow for each new URL so Bing/DuckDuckGo/Yandex crawl them
 * within minutes of publish.
 */
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { pingIndexNow } from "../src/lib/indexnow";

const prisma = new PrismaClient();
const SITE = "https://valueswitch.co.uk";

const ARTICLES = [
  "best-sim-only-for-eu-travel-2026",
  "refurbished-iphone-vs-new-uk",
  "be-fibre-vs-bt-broadband",
  "mobile-contracts-bad-credit-uk",
  "best-phone-for-elderly-uk-2026",
  // Second pillar batch — May 2026
  "cheapest-broadband-students-uk-2026",
  "how-to-switch-mobile-network-uk-2026",
  "vodafone-vs-talkmobile-2026",
  "mid-contract-price-rises-uk-2026",
  "best-10-pound-sim-only-uk-2026",
  "fibre-broadband-postcode-checker-uk-2026",
];

interface Frontmatter {
  title: string;
  slug: string;
  category: string;
  author: string;
  excerpt: string;
  readTime: number;
}

function parseFrontmatter(raw: string): { meta: Frontmatter; body: string } {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error("No frontmatter");
  const meta: Record<string, unknown> = {};
  for (const line of m[1].split("\n")) {
    const [key, ...rest] = line.split(":");
    if (!key) continue;
    let value: unknown = rest.join(":").trim();
    if (typeof value === "string") {
      // strip wrapping quotes
      value = value.replace(/^"|"$/g, "");
      if (key.trim() === "readTime") value = parseInt(value as string, 10);
    }
    meta[key.trim()] = value;
  }
  return { meta: meta as unknown as Frontmatter, body: m[2].trim() };
}

async function main() {
  console.log("📝 Seeding pillar articles...\n");
  const newUrls: string[] = [];
  let created = 0;
  let updated = 0;

  for (let i = 0; i < ARTICLES.length; i++) {
    const slug = ARTICLES[i];
    const filePath = path.join(process.cwd(), "content", "guides", `${slug}.md`);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { meta, body } = parseFrontmatter(raw);

    // Spread publishedAt across the last 12 days, oldest first
    const daysAgo = (ARTICLES.length - i) * 2 + 1;
    const publishedAt = new Date(Date.now() - daysAgo * 24 * 3600 * 1000);

    const existing = await prisma.guide.findUnique({ where: { slug } });

    const data = {
      title: meta.title,
      category: meta.category,
      excerpt: meta.excerpt,
      content: body,
      author: meta.author,
      readTime: meta.readTime,
      isPublished: true,
      publishedAt,
    };

    const result = await prisma.guide.upsert({
      where: { slug },
      update: data,
      create: { slug, ...data },
    });

    const isNew = result.createdAt.getTime() === result.updatedAt.getTime();
    if (isNew) created++;
    else updated++;

    const url = `${SITE}/guides/${meta.category}/${slug}`;
    newUrls.push(url);

    console.log(
      `  ${isNew ? "✨" : "🔄"} ${meta.author.padEnd(18)} ${meta.readTime}m  ${meta.title}`
    );
  }

  console.log(
    `\n📊 Result: ${created} created, ${updated} updated. Total: ${ARTICLES.length} articles`
  );

  // Ping IndexNow with all new URLs
  console.log(`\n📡 Pinging IndexNow with ${newUrls.length} URLs...`);
  const ok = await pingIndexNow(newUrls);
  console.log(ok ? "  ✓ pinged successfully" : "  ⚠ ping returned non-2xx");

  console.log("\nLive URLs:");
  for (const u of newUrls) console.log("  " + u);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
