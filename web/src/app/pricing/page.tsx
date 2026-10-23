import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { PLANS, GUARANTEE_DAYS, formatPrice } from "@/lib/pricing";
import { copy } from "@/content/copy";
import { brand } from "@/content/brand";
import { PlanCards } from "@/components/site/PlanCards";
import { LeadForm } from "@/components/site/LeadForm";
import { Mascot } from "@/components/mascot/Mascot";

export const metadata = pageMetadata({
  title: "Pricing",
  description: `Flat monthly prices for your AI mascot, from ${formatPrice(PLANS[0].monthly)} a month. 2 months free when you pay yearly. ${GUARANTEE_DAYS}-day money-back guarantee.`,
  path: "/pricing",
});

// Comparison rows: every plan feature once (minus the "Everything in…" lines); a plan includes
// a feature if it or a cheaper plan lists it.
const featureRows = (() => {
  const rows: { label: string; from: number }[] = [];
  PLANS.forEach((p, i) =>
    p.features.forEach((f) => {
      if (/^Everything in|conversations \/ month|website|badge$/i.test(f) && !/^No /.test(f)) return;
      if (!rows.some((r) => r.label === f)) rows.push({ label: f, from: i });
    }),
  );
  return rows;
})();

const priceFaq = copy.faq.filter((f) => /cost|free plan|activation|switch/i.test(f.q));

export default function PricingPage() {
  const guide = brand.cast.find((c) => c.id === "tally") ?? brand.cast[0];
  return (
    <>
      <section className="hero-glow px-4 pb-16 pt-14 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-semibold leading-[1.05]">One flat price. Your mascot, live.</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted">
            Creating your mascot is free. Pay when she goes live on your site. {GUARANTEE_DAYS}-day money-back guarantee on every plan.
          </p>
        </div>
        <div className="mx-auto mt-12 max-w-6xl">
          <PlanCards />
          <p className="mt-6 text-center text-sm text-muted">{copy.paywall.ctaNote} Prices in EUR, before VAT.</p>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6" aria-labelledby="compare">
        <div className="mx-auto max-w-5xl">
          <h2 id="compare" className="text-center text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold">
            Compare plans
          </h2>
          <div className="mt-8 overflow-x-auto rounded-[var(--radius)] ring-1 ring-line">
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <thead className="bg-soft">
                <tr>
                  <th scope="col" className="p-4 font-bold">
                    <span className="sr-only">Feature</span>
                  </th>
                  {PLANS.map((p) => (
                    <th key={p.id} scope="col" className="p-4 font-display text-lg font-semibold">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line tabular-nums">
                <tr>
                  <th scope="row" className="p-4 font-semibold">Monthly price</th>
                  {PLANS.map((p) => <td key={p.id} className="p-4">{formatPrice(p.monthly)}</td>)}
                </tr>
                <tr>
                  <th scope="row" className="p-4 font-semibold">Paid yearly, per month</th>
                  {PLANS.map((p) => <td key={p.id} className="p-4">{formatPrice(p.yearly)}</td>)}
                </tr>
                <tr>
                  <th scope="row" className="p-4 font-semibold">Websites or apps</th>
                  {PLANS.map((p) => <td key={p.id} className="p-4">{p.sites}</td>)}
                </tr>
                <tr>
                  <th scope="row" className="p-4 font-semibold">Conversations a month</th>
                  {PLANS.map((p) => <td key={p.id} className="p-4">{p.conversations.toLocaleString("en-US")}</td>)}
                </tr>
                {featureRows.map((r) => (
                  <tr key={r.label}>
                    <th scope="row" className="p-4 font-normal">{r.label}</th>
                    {PLANS.map((p, i) => (
                      <td key={p.id} className="p-4">
                        {i >= r.from ? (
                          <span className="font-bold text-accent">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="inline"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            <span className="sr-only">Included</span>
                          </span>
                        ) : (
                          <span className="text-muted">
                            <span aria-hidden>–</span>
                            <span className="sr-only">Not included</span>
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="bg-soft px-4 py-20 sm:px-6" aria-labelledby="pfaq">
        <div className="mx-auto max-w-3xl">
          <h2 id="pfaq" className="text-center text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold">
            Pricing questions
          </h2>
          <div className="mt-8 divide-y divide-line border-y border-line">
            <details className="py-1">
              <summary className="flex items-center justify-between gap-4 py-4 text-lg font-semibold">
                {copy.paywall.guarantee.title}
                <Plus />
              </summary>
              <p className="pb-5 pr-12 leading-relaxed text-ink/75">{copy.paywall.guarantee.text}</p>
            </details>
            {priceFaq.map((f) => (
              <details key={f.q} className="py-1">
                <summary className="flex items-center justify-between gap-4 py-4 text-lg font-semibold">
                  {f.q}
                  <Plus />
                </summary>
                <p className="pb-5 pr-12 leading-relaxed text-ink/75">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="pilot" className="scroll-mt-20 px-4 py-20 sm:px-6">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 rounded-[2rem] bg-white p-8 text-center ring-1 ring-line sm:p-12 md:flex-row md:text-left">
          {guide && (
            <div className="relative shrink-0">
              <span aria-hidden className="absolute inset-[8%] -z-10 rounded-full bg-halo3 blur-md" />
              <Mascot spec={guide.spec} mood="wave" size={150} label={guide.name} />
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold leading-tight">Reserve a pilot</h2>
            <p className="mb-5 mt-2 text-ink/75">
              Want help setting her up on your product? Leave your email and we&rsquo;ll set up your mascot with you, on your real site.
            </p>
            <LeadForm id="pilot" cta="Reserve my pilot" withCompany note="Pilot request" success="Thanks. We'll email you within one business day to plan your pilot." />
          </div>
        </div>
        <p className="mt-10 text-center">
          <Link href="/create" className="btn btn-primary">
            {copy.hero.cta}
          </Link>
        </p>
      </section>
    </>
  );
}

function Plus() {
  return (
    <span aria-hidden className="faq-plus flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-accent transition-transform duration-300">
      <svg width="14" height="14" viewBox="0 0 14 14"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
    </span>
  );
}
