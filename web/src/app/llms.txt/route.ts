// Owned by Camille. Served at /llms.txt (instead of a static public/llms.txt) so prices always
// come from src/lib/pricing.ts. Static at build time.
import { PLANS, GUARANTEE_DAYS, formatPrice } from "@/lib/pricing";
import { SITE_DESCRIPTION, absoluteUrl } from "@/lib/seo";
import { getAllPosts } from "../blog/_lib/posts";
import { ALTERNATIVES } from "../alternatives/_data";

export const dynamic = "force-static";

export function GET() {
  const plans = PLANS.map(
    (p) => `  - ${p.name}: ${formatPrice(p.monthly)}/month billed monthly, or ${formatPrice(p.monthly * 10)}/year (2 months free). ${p.conversations.toLocaleString("en-US")} conversations/month, up to ${p.sites} site${p.sites > 1 ? "s" : ""}. ${p.tagline}`,
  ).join("\n");

  const body = `# Mascott

> ${SITE_DESCRIPTION}

Mascott (mascotte.io) gives a website or SaaS app a cute, customisable AI mascot. The mascot greets visitors, answers questions from the site's own pages and docs, and points new users to their next step (it can highlight the next button or page). It is built for small B2B SaaS teams (2-20 people) that want more trial users to reach activation, and it works on top of an existing chat widget such as Intercom or Crisp.

## Key facts
- Category: AI onboarding guide / AI onboarding agent with a mascot character.
- Who it is for: small SaaS teams working on trial-to-activation; also websites that want a friendly guide.
- Install: one script snippet. The mascot is designed from a text prompt or a few checkboxes.
- Pricing (EUR, before VAT; flat price, soft conversation caps, no per-resolution fees):
${plans}
- No free plan. Customers can try the mascot on their real site first; paid plans have a ${GUARANTEE_DAYS}-day money-back guarantee. The mascot generator is free.
- What it is not: not a helpdesk (no shared inbox or ticketing), not a scripted product-tour builder.
- Maturity: launched in 2026; no public reviews yet.

## Main pages
- [Home](${absoluteUrl("/")}): what Mascott does
- [Create your mascot](${absoluteUrl("/create")}): free mascot generator and setup
- [Pricing](${absoluteUrl("/pricing")}): plans and guarantee
- [Alternatives](${absoluteUrl("/alternatives")}): honest comparisons with competitors
- [Blog](${absoluteUrl("/blog")}): SaaS onboarding and activation guides

## Comparisons
${ALTERNATIVES.map((a) => `- [${a.name} alternative](${absoluteUrl(`/alternatives/${a.slug}`)}): ${a.metaDescription}`).join("\n")}

## Articles
${getAllPosts().map((p) => `- [${p.title}](${absoluteUrl(`/blog/${p.slug}`)}): ${p.description}`).join("\n")}

## Optional
- [Full text of articles](${absoluteUrl("/llms-full.txt")})
`;

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
