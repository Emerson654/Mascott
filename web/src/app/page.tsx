import Link from "next/link";
import { brand } from "@/content/brand";
import { copy } from "@/content/copy";
import { RotatingWord } from "@/components/landing/RotatingWord";
import { MascotCarousel } from "@/components/landing/MascotCarousel";
import { PromptBox } from "@/components/landing/PromptBox";
import { ProductMoment } from "@/components/landing/ProductMoment";
import { PlanCards } from "@/components/site/PlanCards";
import { GUARANTEE_DAYS } from "@/lib/pricing";
import { JsonLd, faqLd } from "@/components/seo/JsonLd";

type Section = (typeof copy.sections)[number];
const section = (id: string) => copy.sections.find((s) => s.id === id) as Section & Record<string, unknown>;

export default function Home() {
  const withArticle = / a$/.test(brand.heroPrefix);
  const prefix = withArticle ? brand.heroPrefix.replace(/ a$/, "") : brand.heroPrefix;
  const first = brand.rotatingWords[0] ?? "";
  const problem = section("problem");
  const solution = section("solution") as Section & { bullets?: { title: string; text: string }[] };
  const how = section("how") as Section & { steps?: { title: string; text: string }[] };
  const objections = section("objections") as Section & { cards?: { title: string; text: string }[] };

  return (
    <>
      {/* Hero */}
      <section className="hero-glow relative overflow-hidden px-4 pb-16 pt-12 sm:px-6 sm:pt-16">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.05]">
            <span className="sr-only">
              {brand.heroPrefix} {first}
            </span>
            <span aria-hidden>{prefix}</span>
            <RotatingWord words={brand.rotatingWords} withArticle={withArticle} />
          </h1>
          <p className="mx-auto mt-5 max-w-[60ch] text-lg leading-relaxed text-muted">{brand.heroSubtitle}</p>
        </div>

        <div className="mt-6">
          <MascotCarousel cast={brand.cast} />
        </div>

        <div className="mt-8">
          <PromptBox />
        </div>
      </section>

      {/* Problem */}
      {problem && (
        <section id={problem.id} className="bg-soft px-4 py-20 sm:px-6">
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 md:gap-16">
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.1]">{problem.title}</h2>
            <div className="space-y-4 text-lg leading-relaxed text-ink/80">
              {(problem.body ?? []).map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Solution */}
      {solution && (
        <section id={solution.id} className="px-4 py-20 sm:px-6">
          <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[1fr_1.1fr]">
            <div>
              <h2 className="text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.1]">{solution.title}</h2>
              {(solution.body ?? []).map((p) => (
                <p key={p} className="mt-4 text-lg leading-relaxed text-ink/80">
                  {p}
                </p>
              ))}
              <dl className="mt-8 space-y-5">
                {(solution.bullets ?? []).map((b) => (
                  <div key={b.title} className="flex gap-4">
                    <span aria-hidden className="mt-1.5 h-3 w-3 shrink-0 rounded-full bg-sun ring-4 ring-halo3" />
                    <div>
                      <dt className="font-display text-xl font-semibold">{b.title}</dt>
                      <dd className="mt-1 text-ink/75">{b.text}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>
            <ProductMoment />
          </div>
        </section>
      )}

      {/* How it works */}
      {how && (
        <section id={how.id} className="bg-soft px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.1]">{how.title}</h2>
            <ol className="relative mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
              <span aria-hidden className="absolute left-[16%] right-[16%] top-7 hidden border-t-2 border-dashed border-line md:block" />
              {(how.steps ?? []).map((s, i) => (
                <li key={s.title} className="relative text-center">
                  <span className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sun font-display text-2xl font-semibold text-ink shadow-[0_8px_20px_-8px_rgb(232_116_42/0.55)]">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 text-2xl font-semibold">{s.title}</h3>
                  <p className="mx-auto mt-2 max-w-xs text-ink/75">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Objections / control */}
      {objections && (
        <section id={objections.id} className="px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <h2 className="max-w-2xl text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.1]">{objections.title}</h2>
            <div className="mt-10 grid gap-x-12 gap-y-10 sm:grid-cols-2">
              {(objections.cards ?? []).map((c, i) => (
                <div key={c.title} className="flex gap-4">
                  <ControlIcon i={i} />
                  <div>
                    <h3 className="text-xl font-semibold">{c.title}</h3>
                    <p className="mt-1.5 leading-relaxed text-ink/75">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing summary */}
      <section id="pricing" className="bg-soft px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.1]">Flat prices, no surprise bills</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted">
              Create your mascot for free and see her on your own site first. {GUARANTEE_DAYS}-day money-back guarantee.
            </p>
          </div>
          <div className="mt-10">
            <PlanCards mode="link" />
          </div>
          <p className="mt-8 text-center">
            <Link href="/pricing" className="font-semibold text-accent underline">
              Compare plans in detail
            </Link>
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-4 py-20 sm:px-6">
        <JsonLd data={faqLd(copy.faq)} />
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.1]">Questions teams ask us</h2>
          <div className="mt-10 divide-y divide-line border-y border-line">
            {copy.faq.map((f) => (
              <details key={f.q} className="group py-1">
                <summary className="flex items-center justify-between gap-4 rounded-xl py-4 text-left text-lg font-semibold">
                  {f.q}
                  <span aria-hidden className="faq-plus flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-soft text-accent transition-transform duration-300">
                    <svg width="14" height="14" viewBox="0 0 14 14"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
                  </span>
                </summary>
                <p className="pb-5 pr-12 leading-relaxed text-ink/75">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 pb-24 sm:px-6">
        <div className="hero-glow mx-auto max-w-5xl rounded-[2rem] bg-soft px-6 py-16 text-center ring-1 ring-line">
          <h2 className="mx-auto max-w-2xl text-[clamp(2rem,4.5vw,3.25rem)] font-semibold leading-[1.1]">
            Your mascot is one sentence away
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted">{copy.hero.ctaNote}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/create" className="btn btn-primary">
              {copy.hero.cta}
            </Link>
            <Link href="/pricing" className="btn btn-ghost">
              {copy.hero.secondaryCta}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/** Drawn icons for the "control" section: shield, lock, feather, tag. */
function ControlIcon({ i }: { i: number }) {
  const paths = [
    "M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6l7-3z M9 12l2 2 4-4",
    "M7 11V8a5 5 0 0110 0v3 M5.5 11h13v9h-13z M12 15v2",
    "M20 4C11 4 6 9 5 19 M5 19c4-1 8-3 10-7 M9 15h5",
    "M3 12V4h8l9 9-8 8-9-9z M7.5 7.5h.01",
  ];
  const bg = ["bg-halo1", "bg-halo2", "bg-halo3", "bg-halo1"][i % 4];
  return (
    <span aria-hidden className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${bg}`}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1B1D3A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d={paths[i % paths.length]} />
      </svg>
    </span>
  );
}
