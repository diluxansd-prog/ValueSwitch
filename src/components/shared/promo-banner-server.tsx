import { getActivePromos } from "@/lib/services/promo.service";
import { PromoBanner } from "./promo-banner";

/**
 * Server component wrapper — fetches active promos from the DB at request
 * time and hydrates the client banner only when there's something to show.
 * No banner = zero JS shipped on most pages.
 */
export async function PromoBannerServer() {
  const promos = await getActivePromos();
  if (promos.length === 0) return null;

  return (
    <PromoBanner
      promos={promos.map((p) => ({
        id: p.id,
        title: p.title,
        subtitle: p.subtitle,
        code: p.code,
        ctaLabel: p.ctaLabel,
        ctaUrl: p.ctaUrl,
        emoji: p.emoji,
        bgGradient: p.bgGradient,
        endsAt: p.endsAt.toISOString(),
      }))}
    />
  );
}
