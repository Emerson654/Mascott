import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { JsonLd, faqLd, softwareApplicationLd } from "@/components/seo/JsonLd";
import { Breadcrumbs, CreateCta, proseClass } from "@/components/seo/ui";
import { inline } from "@/app/blog/_lib/markdown";
import { fillTokens } from "@/app/blog/_lib/posts";
import { ALTERNATIVES, CHECKED_ON, getAlternative } from "../_data";

export const dynamicParams = false;

export function generateStaticParams() {
  return ALTERNATIVES.map((a) => ({ slug: a.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const alt = getAlternative((await params).slug);
  if (!alt) return {};
  return pageMetadata({ title: alt.title, description: alt.metaDescription, path: `/alternatives/${alt.slug}`, keywords: [alt.keyword] });
}

/** Our own copy (trusted): tokens filled from pricing.ts, then **bold** / links rendered. */
const Rich = ({ text, as: Tag = "span" }: { text: string; as?: "span" | "p" | "li" }) => (
  <Tag dangerouslySetInnerHTML={{ __html: inline(fillTokens(text)) }} />
);

export default async function AlternativePage({ params }: Props) {
  const alt = getAlternative((await params).slug);
  if (!alt) notFound();
  const path = `/alternatives/${alt.slug}`;
  const faq = alt.faq.map((f) => ({ q: fillTokens(f.q), a: fillTokens(f.a) }));

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <JsonLd data={[faqLd(faq), softwareApplicationLd()]} />
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Alternatives", path: "/alternatives" }, { name: `${alt.name} alternative`, path }]} />

      <h1 className="mt-6 text-3xl font-bold tracking-tight text-[#1B1D3A] sm:text-5xl sm:leading-[1.1]">{alt.h1}</h1>
      <p className="mt-3 text-sm text-[#6B6F93]">
        By the Mascott team · Competitor facts checked {CHECKED_ON} from public sources (listed below). We make Mascott, so weigh our view accordingly.
      </p>

      <div className={`mt-8 ${proseClass}`}>
        <section aria-label="Short answer" className="rounded-2xl border border-[#e6e7f3] bg-[#f6f7ff] p-6">
          <p className="!my-0 font-semibold text-[#1B1D3A]">The short answer</p>
          <Rich as="p" text={alt.answer} />
        </section>

        <h2 id="what-is">What {alt.name} is, and what Mascott is</h2>
        <Rich as="p" text={alt.whatItIs} />

        <h2 id="why">Why teams look for {/^[AEIOU]/.test(alt.name) ? "an" : "a"} {alt.name} alternative</h2>
        <ul>{alt.whyLook.map((w) => <Rich key={w} as="li" text={w} />)}</ul>

        <h2 id="comparison">{alt.name} vs Mascott at a glance</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th scope="col"> </th><th scope="col">{alt.name}</th><th scope="col">Mascott</th></tr>
            </thead>
            <tbody>
              {alt.rows.map((r) => (
                <tr key={r.label}>
                  <th scope="row" className="!bg-transparent">{r.label}</th>
                  <td><Rich text={r.them} /></td>
                  <td><Rich text={r.mascott} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-[#6B6F93]">
          {alt.name} figures are as reported by third-party pricing guides in {CHECKED_ON}; check {alt.name}&apos;s live pricing page before deciding. Mascott prices are from our <Link href="/pricing">pricing page</Link>, in EUR before VAT.
        </p>

        <h2 id="pick-them">When {alt.name} is the better choice</h2>
        <ul>{alt.pickThem.map((w) => <Rich key={w} as="li" text={w} />)}</ul>

        <h2 id="pick-mascott">When Mascott is the better choice</h2>
        <ul>{alt.pickMascott.map((w) => <Rich key={w} as="li" text={w} />)}</ul>

        <h2 id="others">Other {alt.name} alternatives worth a look</h2>
        <ul>{alt.otherOptions.map((o) => <li key={o.name}><strong>{o.name}</strong>: {o.note}</li>)}</ul>

        <h2 id="switching">Switching (or not)</h2>
        <Rich as="p" text={alt.switching} />
      </div>

      <CreateCta title={`Try Mascott next to ${alt.name}`} text="Design your mascot in two minutes, then test it on your real site before you pay." />

      <section aria-labelledby="faq" className={proseClass}>
        <h2 id="faq">FAQ</h2>
        {faq.map((f) => (
          <div key={f.q}>
            <h3>{f.q}</h3>
            <p>{f.a}</p>
          </div>
        ))}

        <h2 id="sources">Sources</h2>
        <ul>
          {alt.sources.map((s) => (
            <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a></li>
          ))}
        </ul>

        <h2 id="related">Related reading</h2>
        <ul>
          {alt.related.map((r) => <li key={r.href}><Link href={r.href}>{r.label}</Link></li>)}
          {ALTERNATIVES.filter((a) => a.slug !== alt.slug).map((a) => (
            <li key={a.slug}><Link href={`/alternatives/${a.slug}`}>{a.name} alternative</Link></li>
          ))}
        </ul>
      </section>
    </main>
  );
}
