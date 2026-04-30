/**
 * Smoke-test affiliate URLs across every active merchant — sample 3
 * deals per merchant, follow each Awin redirect to its destination,
 * report HTTP status.  Anything 4xx/5xx is flagged for repair.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

interface Result {
  merchant: string;
  status: number;
  finalUrl: string;
  affiliateUrl: string;
  planName: string;
}

async function check(url: string): Promise<{ status: number; finalUrl: string }> {
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "User-Agent": UA },
      redirect: "follow",
      signal: AbortSignal.timeout(20000),
    });
    return { status: res.status, finalUrl: res.url };
  } catch (err) {
    return {
      status: 0,
      finalUrl: err instanceof Error ? err.message : "fetch error",
    };
  }
}

async function main() {
  const providers = await prisma.provider.findMany({
    where: { isActive: true },
    select: {
      slug: true,
      name: true,
      affiliateUrl: true,
      _count: { select: { plans: true } },
    },
    orderBy: { name: "asc" },
  });

  console.log("Health-checking affiliate links...\n");

  const results: Result[] = [];

  for (const pr of providers) {
    // Provider homepage link
    if (pr.affiliateUrl) {
      const r = await check(pr.affiliateUrl);
      results.push({
        merchant: pr.slug,
        status: r.status,
        finalUrl: r.finalUrl,
        affiliateUrl: pr.affiliateUrl,
        planName: "(provider homepage)",
      });
    }

    // Sample up to 3 actual plans
    if (pr._count.plans > 0) {
      const plans = await prisma.plan.findMany({
        where: {
          provider: { slug: pr.slug },
          affiliateUrl: { not: null },
        },
        select: { name: true, affiliateUrl: true },
        take: 3,
        orderBy: { monthlyCost: "asc" },
      });
      for (const p of plans) {
        const r = await check(p.affiliateUrl!);
        results.push({
          merchant: pr.slug,
          status: r.status,
          finalUrl: r.finalUrl,
          affiliateUrl: p.affiliateUrl!,
          planName: p.name.substring(0, 60),
        });
      }
    }
  }

  // Report
  console.log("\n" + "=".repeat(80));
  console.log("Status".padEnd(8) + "Merchant".padEnd(16) + "Plan".padEnd(40) + "Final URL");
  console.log("-".repeat(80));
  let okCount = 0;
  let badCount = 0;
  const badLinks: Result[] = [];
  for (const r of results) {
    const isOk = r.status >= 200 && r.status < 400;
    if (isOk) okCount++;
    else {
      badCount++;
      badLinks.push(r);
    }
    const icon = isOk ? "✅" : "❌";
    console.log(
      `${icon} ${String(r.status).padEnd(5)}` +
        r.merchant.padEnd(16) +
        r.planName.padEnd(40) +
        r.finalUrl.substring(0, 60)
    );
  }
  console.log("-".repeat(80));
  console.log(`Total: ${results.length}  |  OK: ${okCount}  |  Failed: ${badCount}`);

  if (badLinks.length > 0) {
    console.log("\n❌ Failed links to investigate:");
    for (const b of badLinks) {
      console.log(`  ${b.merchant} — ${b.planName}`);
      console.log(`    ${b.affiliateUrl.substring(0, 120)}`);
      console.log(`    HTTP ${b.status} → ${b.finalUrl}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
