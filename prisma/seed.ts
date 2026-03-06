import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

// ─── Helper to load JSON mock data ──────────────────────────────────
function loadJson<T>(filename: string): T {
  const filepath = join(__dirname, "mock-data", filename);
  const raw = readFileSync(filepath, "utf-8");
  return JSON.parse(raw) as T;
}

// ─── Type definitions for mock data ─────────────────────────────────
interface ProviderData {
  name: string;
  slug: string;
  logo: string | null;
  website: string | null;
  description: string | null;
  trustScore: number | null;
  reviewCount: number;
  isActive: boolean;
  categories: string;
}

interface PlanData {
  providerSlug: string;
  name: string;
  slug: string;
  category: string;
  subcategory?: string | null;
  description?: string | null;
  monthlyCost: number;
  annualCost?: number | null;
  setupFee?: number;
  contractLength?: number | null;
  features?: string | null;
  rating?: number | null;
  isPromoted?: boolean;
  isBestValue?: boolean;
  isPopular?: boolean;

  // Energy fields
  unitRate?: number | null;
  standingCharge?: number | null;
  greenEnergy?: boolean;
  tariffType?: string | null;

  // Broadband fields
  downloadSpeed?: number | null;
  uploadSpeed?: number | null;
  dataLimit?: string | null;
  includesTV?: boolean;
  tvChannels?: number | null;

  // Mobile fields
  dataAllowance?: string | null;
  minutes?: string | null;
  texts?: string | null;
  networkType?: string | null;
  includesHandset?: boolean;
  handsetModel?: string | null;

  // Insurance fields
  coverLevel?: string | null;
  excessAmount?: number | null;

  // Finance fields
  apr?: number | null;
  interestRate?: number | null;
  creditLimit?: number | null;
  balanceTransfer?: boolean;
  introRate?: number | null;
  introRatePeriod?: number | null;
}

interface GuideData {
  title: string;
  slug: string;
  category: string;
  excerpt?: string | null;
  content: string;
  author?: string | null;
  isPublished: boolean;
  readTime?: number | null;
  tags?: string | null;
}

// ─── Category definitions ───────────────────────────────────────────
const CATEGORIES = [
  {
    name: "Energy",
    slug: "energy",
    description: "Compare gas and electricity tariffs from leading UK energy suppliers",
    icon: "Zap",
    sortOrder: 1,
    subcategories: [
      { name: "Gas & Electricity", slug: "gas-electricity", description: "Dual fuel tariffs for gas and electricity", sortOrder: 1 },
      { name: "Electricity Only", slug: "electricity", description: "Electricity-only tariffs", sortOrder: 2 },
      { name: "Gas Only", slug: "gas", description: "Gas-only tariffs", sortOrder: 3 },
      { name: "Green Energy", slug: "green-energy", description: "Renewable and green energy tariffs", sortOrder: 4 },
    ],
  },
  {
    name: "Broadband",
    slug: "broadband",
    description: "Find the best broadband deals for your home including fibre, cable, and wireless",
    icon: "Wifi",
    sortOrder: 2,
    subcategories: [
      { name: "Fibre Broadband", slug: "fibre", description: "Fibre optic broadband deals", sortOrder: 1 },
      { name: "Broadband Only", slug: "broadband-only", description: "Standard and basic broadband packages", sortOrder: 2 },
      { name: "TV Packages", slug: "tv-packages", description: "Broadband bundled with TV services", sortOrder: 3 },
    ],
  },
  {
    name: "Mobile",
    slug: "mobile",
    description: "Compare SIM-only deals and phone contracts from all UK networks",
    icon: "Smartphone",
    sortOrder: 3,
    subcategories: [
      { name: "SIM Only", slug: "sim-only", description: "SIM-only plans without a handset", sortOrder: 1 },
      { name: "Phone Contracts", slug: "contracts", description: "Monthly contracts including a handset", sortOrder: 2 },
    ],
  },
  {
    name: "Insurance",
    slug: "insurance",
    description: "Compare car, home, pet, and travel insurance quotes from trusted UK providers",
    icon: "Shield",
    sortOrder: 4,
    subcategories: [
      { name: "Car Insurance", slug: "car", description: "Motor insurance from leading providers", sortOrder: 1 },
      { name: "Home Insurance", slug: "home", description: "Buildings and contents insurance", sortOrder: 2 },
      { name: "Pet Insurance", slug: "pet", description: "Insurance for cats, dogs, and other pets", sortOrder: 3 },
      { name: "Travel Insurance", slug: "travel", description: "Single trip and annual travel insurance", sortOrder: 4 },
    ],
  },
  {
    name: "Finance",
    slug: "finance",
    description: "Compare credit cards, loans, savings accounts, and mortgages",
    icon: "PiggyBank",
    sortOrder: 5,
    subcategories: [
      { name: "Credit Cards", slug: "credit-cards", description: "Balance transfer, purchase, and reward credit cards", sortOrder: 1 },
      { name: "Loans", slug: "loans", description: "Personal loans from leading lenders", sortOrder: 2 },
      { name: "Savings", slug: "savings", description: "Savings accounts and ISAs", sortOrder: 3 },
      { name: "Mortgages", slug: "mortgages", description: "Mortgage deals for homebuyers and remortgagers", sortOrder: 4 },
    ],
  },
  {
    name: "Business",
    slug: "business",
    description: "Compare business energy, broadband, insurance, and finance products",
    icon: "Building2",
    sortOrder: 6,
    subcategories: [
      { name: "Business Energy", slug: "business-energy", description: "Commercial gas and electricity tariffs", sortOrder: 1 },
      { name: "Business Broadband", slug: "business-broadband", description: "Business-grade broadband and connectivity", sortOrder: 2 },
      { name: "Business Insurance", slug: "business-insurance", description: "Commercial insurance products", sortOrder: 3 },
    ],
  },
];

// ─── Main seed function ─────────────────────────────────────────────
async function main() {
  console.log("🌱 Starting ValueSwitch database seed...\n");

  // Load all mock data
  console.log("📂 Loading mock data files...");
  const providers = loadJson<ProviderData[]>("providers.json");
  const energyPlans = loadJson<PlanData[]>("energy-plans.json");
  const broadbandPlans = loadJson<PlanData[]>("broadband-plans.json");
  const mobilePlans = loadJson<PlanData[]>("mobile-plans.json");
  const insurancePlans = loadJson<PlanData[]>("insurance-plans.json");
  const financePlans = loadJson<PlanData[]>("finance-plans.json");
  const guides = loadJson<GuideData[]>("guides.json");

  const allPlans = [
    ...energyPlans,
    ...broadbandPlans,
    ...mobilePlans,
    ...insurancePlans,
    ...financePlans,
  ];

  console.log(`  Providers:       ${providers.length}`);
  console.log(`  Energy plans:    ${energyPlans.length}`);
  console.log(`  Broadband plans: ${broadbandPlans.length}`);
  console.log(`  Mobile plans:    ${mobilePlans.length}`);
  console.log(`  Insurance plans: ${insurancePlans.length}`);
  console.log(`  Finance plans:   ${financePlans.length}`);
  console.log(`  Total plans:     ${allPlans.length}`);
  console.log(`  Guides:          ${guides.length}`);
  console.log();

  // ── Step 1: Check if data already exists (skip seed on re-deploy) ──
  const existingProviders = await prisma.provider.count();
  if (existingProviders > 0) {
    console.log(`  Database already has ${existingProviders} providers. Skipping seed to preserve user data.\n`);
    console.log("✅ Seed skipped (data already exists).");
    return;
  }

  console.log("  Database is empty. Seeding fresh data...\n");

  // ── Step 2: Seed providers ────────────────────────────────────────
  console.log("🏢 Seeding providers...");
  const createdProviders = await prisma.$transaction(
    providers.map((p) =>
      prisma.provider.create({
        data: {
          name: p.name,
          slug: p.slug,
          logo: p.logo,
          website: p.website,
          description: p.description,
          trustScore: p.trustScore,
          reviewCount: p.reviewCount,
          isActive: p.isActive,
          categories: p.categories,
        },
      })
    )
  );

  // Build slug -> id map
  const providerMap = new Map<string, string>();
  for (const provider of createdProviders) {
    providerMap.set(provider.slug, provider.id);
  }
  console.log(`  Created ${createdProviders.length} providers.\n`);

  // ── Step 3: Seed plans ────────────────────────────────────────────
  console.log("📋 Seeding plans...");
  const planOperations = allPlans.map((plan) => {
    const providerId = providerMap.get(plan.providerSlug);
    if (!providerId) {
      throw new Error(
        `Provider slug "${plan.providerSlug}" not found in provider map for plan "${plan.name}"`
      );
    }

    return prisma.plan.create({
      data: {
        providerId,
        name: plan.name,
        slug: plan.slug,
        category: plan.category,
        subcategory: plan.subcategory ?? null,
        description: plan.description ?? null,
        monthlyCost: plan.monthlyCost,
        annualCost: plan.annualCost ?? null,
        setupFee: plan.setupFee ?? 0,
        contractLength: plan.contractLength ?? null,
        features: plan.features ?? null,
        rating: plan.rating ?? null,
        isPromoted: plan.isPromoted ?? false,
        isBestValue: plan.isBestValue ?? false,
        isPopular: plan.isPopular ?? false,

        // Energy
        unitRate: plan.unitRate ?? null,
        standingCharge: plan.standingCharge ?? null,
        greenEnergy: plan.greenEnergy ?? false,
        tariffType: plan.tariffType ?? null,

        // Broadband
        downloadSpeed: plan.downloadSpeed ?? null,
        uploadSpeed: plan.uploadSpeed ?? null,
        dataLimit: plan.dataLimit ?? null,
        includesTV: plan.includesTV ?? false,
        tvChannels: plan.tvChannels ?? null,

        // Mobile
        dataAllowance: plan.dataAllowance ?? null,
        minutes: plan.minutes ?? null,
        texts: plan.texts ?? null,
        networkType: plan.networkType ?? null,
        includesHandset: plan.includesHandset ?? false,
        handsetModel: plan.handsetModel ?? null,

        // Insurance
        coverLevel: plan.coverLevel ?? null,
        excessAmount: plan.excessAmount ?? null,

        // Finance
        apr: plan.apr ?? null,
        interestRate: plan.interestRate ?? null,
        creditLimit: plan.creditLimit ?? null,
        balanceTransfer: plan.balanceTransfer ?? false,
        introRate: plan.introRate ?? null,
        introRatePeriod: plan.introRatePeriod ?? null,
      },
    });
  });

  const createdPlans = await prisma.$transaction(planOperations);
  console.log(`  Created ${createdPlans.length} plans.`);
  console.log(
    `    - Energy:    ${energyPlans.length}`
  );
  console.log(
    `    - Broadband: ${broadbandPlans.length}`
  );
  console.log(
    `    - Mobile:    ${mobilePlans.length}`
  );
  console.log(
    `    - Insurance: ${insurancePlans.length}`
  );
  console.log(
    `    - Finance:   ${financePlans.length}`
  );
  console.log();

  // ── Step 4: Seed categories ───────────────────────────────────────
  console.log("📁 Seeding categories...");
  let categoryCount = 0;

  for (const cat of CATEGORIES) {
    const parent = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
    });
    categoryCount++;

    if (cat.subcategories) {
      const subOps = cat.subcategories.map((sub) =>
        prisma.category.create({
          data: {
            name: sub.name,
            slug: sub.slug,
            description: sub.description,
            parentId: parent.id,
            sortOrder: sub.sortOrder,
            isActive: true,
          },
        })
      );
      const subs = await prisma.$transaction(subOps);
      categoryCount += subs.length;
    }
  }
  console.log(`  Created ${categoryCount} categories (parents + subcategories).\n`);

  // ── Step 5: Seed guides ───────────────────────────────────────────
  console.log("📖 Seeding guides...");
  const guideOperations = guides.map((g) =>
    prisma.guide.create({
      data: {
        title: g.title,
        slug: g.slug,
        category: g.category,
        excerpt: g.excerpt ?? null,
        content: g.content,
        author: g.author ?? null,
        isPublished: g.isPublished,
        publishedAt: g.isPublished ? new Date() : null,
        readTime: g.readTime ?? null,
        tags: g.tags ?? null,
      },
    })
  );

  const createdGuides = await prisma.$transaction(guideOperations);
  console.log(`  Created ${createdGuides.length} guides.\n`);

  // ── Summary ───────────────────────────────────────────────────────
  console.log("✅ Seed complete!");
  console.log("─────────────────────────────────");
  console.log(`  Providers:    ${createdProviders.length}`);
  console.log(`  Plans:        ${createdPlans.length}`);
  console.log(`  Categories:   ${categoryCount}`);
  console.log(`  Guides:       ${createdGuides.length}`);
  console.log("─────────────────────────────────");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
