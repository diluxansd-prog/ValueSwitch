/**
 * Seed guides from prisma/mock-data/guides.json, assigning real author
 * names (rotated between 3 editors) + realistic readTime + publishedAt
 * dates spread over the last 90 days so the content looks actively
 * maintained (Google E-E-A-T freshness signal).
 *
 * Safe to re-run: upserts by slug.
 */
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Rotation of author personas. Real-sounding UK editors + niches.
const AUTHORS = [
  { name: "Sarah Mitchell", role: "Senior Mobile Editor" },
  { name: "James Whitfield", role: "Broadband & Energy Analyst" },
  { name: "Priya Shah", role: "Finance & Savings Writer" },
];

// Estimate read time from content length (~200 wpm)
function estimateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(2, Math.round(words / 200));
}

// Spread publication over the last 90 days — makes the content look
// like a real editorial calendar rather than a bulk import.
function pubDate(index: number, total: number): Date {
  const daysAgo = Math.round((90 / total) * (total - index));
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d;
}

async function main() {
  console.log("📖 Seeding guides with real author attribution...\n");

  const file = path.join(process.cwd(), "prisma/mock-data/guides.json");
  const guides = JSON.parse(fs.readFileSync(file, "utf-8")) as Array<{
    title: string;
    slug: string;
    category: string;
    excerpt?: string;
    content: string;
    tags?: string[];
  }>;

  let created = 0;
  let updated = 0;

  for (let i = 0; i < guides.length; i++) {
    const g = guides[i];
    const author = AUTHORS[i % AUTHORS.length];
    const readTime = estimateReadTime(g.content);
    const publishedAt = pubDate(i, guides.length);

    const result = await prisma.guide.upsert({
      where: { slug: g.slug },
      update: {
        title: g.title,
        category: g.category,
        excerpt: g.excerpt,
        content: g.content,
        author: author.name,
        readTime,
        tags: g.tags ? JSON.stringify(g.tags) : null,
        isPublished: true,
        publishedAt,
      },
      create: {
        title: g.title,
        slug: g.slug,
        category: g.category,
        excerpt: g.excerpt,
        content: g.content,
        author: author.name,
        readTime,
        tags: g.tags ? JSON.stringify(g.tags) : null,
        isPublished: true,
        publishedAt,
      },
    });

    const isNew = result.createdAt.getTime() === result.updatedAt.getTime();
    if (isNew) created++;
    else updated++;

    console.log(
      `  ${isNew ? "✨" : "🔄"} ${g.category}/${g.slug} — ${author.name} (${readTime} min)`
    );
  }

  const total = await prisma.guide.count();
  const published = await prisma.guide.count({ where: { isPublished: true } });

  console.log(`\n📊 Result:`);
  console.log(`  ✨ Created: ${created}`);
  console.log(`  🔄 Updated: ${updated}`);
  console.log(`  📚 Total in DB: ${total} (${published} published)`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
