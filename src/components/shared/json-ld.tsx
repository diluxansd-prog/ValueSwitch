import { siteConfig } from "@/config/seo";
import { COMPANY } from "@/lib/constants";

interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: siteConfig.name,
        legalName: COMPANY.legalName,
        url: siteConfig.url,
        logo: `${siteConfig.url}/favicon.ico`,
        description: siteConfig.description,
        identifier: COMPANY.companyNumber,
        taxID: COMPANY.companyNumber,
        foundingDate: "2026-03-23",
        address: {
          "@type": "PostalAddress",
          streetAddress: COMPANY.address.street,
          addressLocality: COMPANY.address.city,
          addressRegion: COMPANY.address.country,
          postalCode: COMPANY.address.postcode,
          addressCountry: "GB",
        },
        contactPoint: {
          "@type": "ContactPoint",
          telephone: COMPANY.phone.display,
          email: COMPANY.email.support,
          contactType: "customer service",
          areaServed: "GB",
          availableLanguage: "English",
        },
        sameAs: [
          "https://twitter.com/valueswitch",
          "https://www.facebook.com/valueswitch",
          "https://www.linkedin.com/company/valueswitch",
        ],
      }}
    />
  );
}

export function WebSiteJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: siteConfig.name,
        url: siteConfig.url,
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteConfig.url}/energy/compare?postcode={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

export function FAQPageJsonLd({
  faqs,
}: {
  faqs: { question: string; answer: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}

export function ArticleJsonLd({
  title,
  description,
  url,
  author,
  publishedAt,
  updatedAt,
  imageUrl,
}: {
  title: string;
  description?: string;
  url: string;
  author?: string | null;
  publishedAt?: string | Date | null;
  updatedAt?: string | Date | null;
  imageUrl?: string | null;
}) {
  const pub = publishedAt ? new Date(publishedAt).toISOString() : undefined;
  const upd = updatedAt ? new Date(updatedAt).toISOString() : undefined;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description,
        image: imageUrl ? [imageUrl] : [`${url.split("/").slice(0, 3).join("/")}/opengraph-image`],
        author: author
          ? [
              {
                "@type": "Person",
                name: author,
                url: `${url.split("/").slice(0, 3).join("/")}/about`,
              },
            ]
          : undefined,
        publisher: {
          "@type": "Organization",
          name: "ValueSwitch",
          logo: {
            "@type": "ImageObject",
            url: `${url.split("/").slice(0, 3).join("/")}/icon`,
          },
        },
        datePublished: pub,
        dateModified: upd || pub,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
      }}
    />
  );
}

export function ProductJsonLd({
  name,
  description,
  provider,
  price,
  category,
  url,
}: {
  name: string;
  description?: string;
  provider: string;
  price: number;
  category: string;
  url: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name,
        description: description ?? `${name} from ${provider}`,
        brand: { "@type": "Brand", name: provider },
        category,
        offers: {
          "@type": "Offer",
          price: price.toFixed(2),
          priceCurrency: "GBP",
          availability: "https://schema.org/InStock",
          url,
          priceValidUntil: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        },
      }}
    />
  );
}

export function LocalBusinessJsonLd({
  name,
  description,
  url,
  trustScore,
  reviewCount,
}: {
  name: string;
  description?: string;
  url?: string;
  trustScore?: number | null;
  reviewCount?: number;
}) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    description: description ?? `${name} - trusted UK service provider`,
    ...(url && { url }),
  };
  if (trustScore != null && reviewCount) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: trustScore.toFixed(1),
      bestRating: "5",
      ratingCount: reviewCount,
    };
  }
  return <JsonLd data={data} />;
}
