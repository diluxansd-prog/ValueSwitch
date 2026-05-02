import Link from "next/link";

/**
 * Sitewide internal-link block — rendered at the top of the footer on
 * every page.  Designed for two things at once:
 *
 * 1. SEO — gives crawlers (Googlebot especially) high-density anchor
 *    text linking to programmatic landing pages.  The links flow PageRank
 *    from the home page (highest authority) to long-tail pages (lowest).
 * 2. UX — readers who got to the footer probably haven't found what they
 *    wanted; a curated set of category-anchored links saves them another
 *    search.
 *
 * Keep this list tight.  An exploded footer with 80 links dilutes the
 * crawl signal — each block here should have ~6-8 high-intent destinations.
 */

const BLOCKS = [
  {
    title: "Mobile by price",
    links: [
      { href: "/sim-only/under-10", label: "SIM-only under £10/mo" },
      { href: "/sim-only/under-15", label: "SIM-only under £15/mo" },
      { href: "/sim-only/unlimited", label: "Unlimited data SIMs" },
      { href: "/sim-only/100gb-plus", label: "100GB+ data SIMs" },
      { href: "/sim-only/30-day-rolling", label: "30-day rolling SIMs" },
      { href: "/mobile/contracts", label: "Phone contracts" },
      { href: "/refurbished", label: "Refurbished phones" },
    ],
  },
  {
    title: "Compare providers",
    links: [
      { href: "/compare/vodafone-vs-talkmobile", label: "Vodafone vs Talkmobile" },
      { href: "/compare/lebara-vs-talkmobile", label: "Lebara vs Talkmobile" },
      { href: "/compare/be-fibre-vs-bt-broadband", label: "Be Fibre vs BT" },
      { href: "/providers/vodafone", label: "Vodafone plans & reviews" },
      { href: "/providers/lebara", label: "Lebara plans & reviews" },
      { href: "/providers/talkmobile", label: "Talkmobile plans & reviews" },
      { href: "/providers/be-fibre", label: "Be Fibre plans & reviews" },
    ],
  },
  {
    title: "Top guides",
    links: [
      {
        href: "/guides/mobile/how-to-switch-mobile-network-uk-2026",
        label: "How to switch UK network",
      },
      {
        href: "/guides/mobile/best-10-pound-sim-only-uk-2026",
        label: "Best £10 SIM-only deals",
      },
      {
        href: "/guides/mobile/vodafone-vs-talkmobile-2026",
        label: "Vodafone vs Talkmobile 2026",
      },
      {
        href: "/guides/mobile/mid-contract-price-rises-uk-2026",
        label: "April 2026 price rises ranked",
      },
      {
        href: "/guides/mobile/best-sim-only-for-eu-travel-2026",
        label: "Best SIMs for EU travel",
      },
      {
        href: "/guides/broadband/cheapest-broadband-students-uk-2026",
        label: "Cheapest student broadband",
      },
      {
        href: "/guides/broadband/fibre-broadband-postcode-checker-uk-2026",
        label: "Fibre postcode checker guide",
      },
    ],
  },
  {
    title: "Brand pages",
    links: [
      { href: "/best-deals/iphone", label: "Best iPhone deals" },
      { href: "/best-deals/samsung", label: "Best Samsung deals" },
      { href: "/best-deals/google", label: "Best Pixel deals" },
      { href: "/best-deals/oneplus", label: "Best OnePlus deals" },
      { href: "/best-deals/xiaomi", label: "Best Xiaomi deals" },
      { href: "/best-deals/motorola", label: "Best Motorola deals" },
      { href: "/best-deals/nokia", label: "Best Nokia deals" },
    ],
  },
];

export function SeoLinkBlock() {
  return (
    <div className="border-b border-white/10 bg-[#0f243f]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
          {BLOCKS.map((block) => (
            <div key={block.title}>
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-white/50 mb-3">
                {block.title}
              </h3>
              <ul className="space-y-2">
                {block.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-white/70 hover:text-white hover:underline underline-offset-2 transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
