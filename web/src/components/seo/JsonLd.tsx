// Owned by Camille (SEO/GEO). JSON-LD helpers, rendered server-side in the initial HTML.
import { PLANS, CURRENCY } from "@/lib/pricing";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, SAME_AS, OG_IMAGE, absoluteUrl } from "@/lib/seo";

type Thing = Record<string, unknown>;

/** Renders one or more schema.org objects. `<` is escaped so content can never close the script tag. */
export function JsonLd({ data }: { data: Thing | Thing[] }) {
  const json = JSON.stringify(Array.isArray(data) ? data.map(withContext) : withContext(data)).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

const withContext = (d: Thing) => ({ "@context": "https://schema.org", ...d });

const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;
const APP_ID = `${SITE_URL}/#software`;

// ponytail: the OG image doubles as logo until brand ships a square logo (Google wants >= 112x112).
export const organizationLd = (): Thing => ({
  "@type": "Organization",
  "@id": ORG_ID,
  name: SITE_NAME,
  url: SITE_URL,
  logo: absoluteUrl(OG_IMAGE),
  description: SITE_DESCRIPTION,
  ...(SAME_AS.length ? { sameAs: SAME_AS } : {}),
});

export const websiteLd = (): Thing => ({
  "@type": "WebSite",
  "@id": SITE_ID,
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: "en",
  publisher: { "@id": ORG_ID },
});

/** Offers come straight from src/lib/pricing.ts, so schema prices can never drift from the pricing page. */
export const softwareApplicationLd = (): Thing => ({
  "@type": "SoftwareApplication",
  "@id": APP_ID,
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "AI onboarding guide",
  operatingSystem: "Web",
  publisher: { "@id": ORG_ID },
  offers: PLANS.flatMap((p) => [
    {
      "@type": "Offer",
      name: `${p.name} (monthly)`,
      price: p.monthly,
      priceCurrency: CURRENCY,
      url: absoluteUrl("/pricing"),
      priceSpecification: { "@type": "UnitPriceSpecification", price: p.monthly, priceCurrency: CURRENCY, unitCode: "MON" },
    },
    {
      "@type": "Offer",
      name: `${p.name} (yearly)`,
      price: Math.round(p.monthly * 10 * 100) / 100,
      priceCurrency: CURRENCY,
      url: absoluteUrl("/pricing"),
      priceSpecification: { "@type": "UnitPriceSpecification", price: Math.round(p.monthly * 10 * 100) / 100, priceCurrency: CURRENCY, unitCode: "ANN" },
    },
  ]),
});

/** Site-wide graph: Organization + WebSite + SoftwareApplication. Meant for the root layout. */
export function SiteJsonLd() {
  return <JsonLd data={[organizationLd(), websiteLd(), softwareApplicationLd()]} />;
}

/** FAQPage: no Google rich result since May 2026, kept because it mirrors visible Q&A for AI parsers. */
export const faqLd = (items: { q: string; a: string }[]): Thing => ({
  "@type": "FAQPage",
  mainEntity: items.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
});

export const breadcrumbLd = (items: { name: string; path: string }[]): Thing => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absoluteUrl(it.path) })),
});

export const blogPostingLd = (p: {
  title: string;
  description: string;
  path: string;
  date: string;
  updated?: string;
  keywords?: string[];
  wordCount?: number;
}): Thing => ({
  "@type": "BlogPosting",
  headline: p.title,
  description: p.description,
  url: absoluteUrl(p.path),
  mainEntityOfPage: absoluteUrl(p.path),
  datePublished: p.date,
  dateModified: p.updated ?? p.date,
  inLanguage: "en",
  image: absoluteUrl(OG_IMAGE),
  author: { "@type": "Organization", name: "Mascott team", url: SITE_URL },
  publisher: { "@id": ORG_ID, "@type": "Organization", name: SITE_NAME, logo: { "@type": "ImageObject", url: absoluteUrl(OG_IMAGE) } },
  ...(p.keywords?.length ? { keywords: p.keywords.join(", ") } : {}),
  ...(p.wordCount ? { wordCount: p.wordCount } : {}),
});
