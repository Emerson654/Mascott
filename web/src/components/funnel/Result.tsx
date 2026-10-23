"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RESULT_STORAGE_KEY, type GeneratedMascot } from "@/lib/funnel";
import type { Mood } from "@/lib/mascot-spec";
import { GUARANTEE_DAYS } from "@/lib/pricing";
import { copy } from "@/content/copy";
import { Mascot } from "@/components/mascot/Mascot";
import { SpeechBubble } from "@/components/mascot/SpeechBubble";
import { PlanCards } from "@/components/site/PlanCards";
import { LeadForm } from "@/components/site/LeadForm";

/** Straight from the reveal to the paywall: the mascot alive on one side, "put it on your site" on the other. */
export function Result() {
  const [m, setM] = useState<GeneratedMascot | null | undefined>(undefined);
  const [mood, setMood] = useState<Mood>("wave");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RESULT_STORAGE_KEY);
      setM(raw ? (JSON.parse(raw) as GeneratedMascot) : null);
    } catch {
      setM(null);
    }
    const t = window.setTimeout(() => setMood("idle"), 2200);
    return () => window.clearTimeout(t);
  }, []);

  // Small life loop: a wave, a think, a happy hop, now and then.
  useEffect(() => {
    if (!m) return;
    const moods: Mood[] = ["talk", "think", "happy", "point"];
    let i = 0;
    const id = window.setInterval(() => {
      setMood(moods[i++ % moods.length]);
      window.setTimeout(() => setMood("idle"), 1800);
    }, 7000);
    return () => window.clearInterval(id);
  }, [m]);

  if (m === undefined) return <div className="min-h-[80dvh]" />;

  if (!m) {
    return (
      <div className="hero-glow flex min-h-[70dvh] flex-col items-center justify-center px-4 text-center">
        <h1 className="text-4xl font-semibold">No mascot here yet</h1>
        <p className="mt-3 max-w-md text-muted">Create one in a couple of minutes. Your answers are saved as you go.</p>
        <Link href="/create" className="btn btn-primary mt-8">
          {copy.hero.cta}
        </Link>
      </div>
    );
  }

  const p = copy.paywall;
  const slug = m.name.toLowerCase().replace(/[^a-z0-9]/g, "") || "mascot";
  const fakeCode = `<script src="https://cdn.mascotte.io/widget.js"\n  data-mascot="${slug}-k3f9a2"\n  data-site="your-site-id"\n  async></script>`;

  return (
    <div className="hero-glow">
      <section className="px-4 pb-10 pt-6 sm:px-6 sm:pt-10">
        <div className="mx-auto grid max-w-6xl items-center gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
          {/* The mascot, alive */}
          <div className="flex flex-col items-center text-center">
            <div className="w-full max-w-sm">
              <SpeechBubble text={m.greeting} className="!max-w-sm" />
            </div>
            <div className="relative mt-3">
              <span aria-hidden className="absolute inset-[6%] -z-10 rounded-full bg-halo1 blur-xl" />
              <span aria-hidden className="absolute inset-[22%] -right-[10%] -z-10 rounded-full bg-halo2 blur-2xl" />
              <div className="lg:hidden">
                <Mascot spec={m.spec} mood={mood} size={170} label={m.name} onPoke={() => setMood("happy")} />
              </div>
              <div className="hidden lg:block">
                <Mascot spec={m.spec} mood={mood} size={340} label={m.name} onPoke={() => setMood("happy")} />
              </div>
            </div>
            <p className="mt-2 font-display text-[clamp(2rem,5vw,3rem)] font-semibold leading-none">{m.name}</p>
            <p className="mt-2 hidden max-w-sm text-sm leading-relaxed text-muted sm:block lg:text-base">{m.personality}</p>
          </div>

          {/* Put it live */}
          <div>
            <h1 className="text-[clamp(1.9rem,4.2vw,3rem)] font-semibold leading-[1.08]">{copy.paywallDirect.title.replaceAll("{name}", m.name)}</h1>
            <p className="mt-3 text-lg leading-relaxed text-ink/80">{copy.paywallDirect.subtitle.replaceAll("{name}", m.name)}</p>

            <div className="relative mt-6 overflow-hidden rounded-[1.5rem] bg-[#1B1D3A] p-5 shadow-[0_30px_70px_-30px_rgb(27_29_58/0.6)]">
              <p className="mb-2 font-mono text-xs text-white/50">Your install code</p>
              <pre aria-hidden className="select-none overflow-hidden whitespace-pre-wrap break-all font-mono text-sm leading-relaxed text-[#C9D1FF] blur-[5px]">
                {fakeCode}
              </pre>
              <div className="absolute inset-0 flex items-center justify-center gap-3 bg-[#1B1D3A]/35 p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-lg">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <rect x="5" y="11" width="14" height="9" rx="2.5" stroke="#1B1D3A" strokeWidth="2" />
                    <path d="M8 11V8a4 4 0 018 0v3" stroke="#1B1D3A" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </span>
                <p className="font-semibold text-white">Unlocks when you pick a plan</p>
              </div>
            </div>

            <ul className="mt-5 space-y-2">
              {p.why.slice(1).map((w) => (
                <li key={w} className="flex gap-3 text-ink/85">
                  <span aria-hidden className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="plans" aria-labelledby="plans-title" className="scroll-mt-20 px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 id="plans-title" className="sr-only">
            {p.title}
          </h2>
          <PlanCards />
          <p className="mt-4 text-center text-sm text-muted">{p.ctaNote}</p>

          <div className="mx-auto mt-8 flex max-w-2xl items-start gap-4 rounded-[var(--radius)] bg-white/80 p-5 ring-1 ring-line">
            <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-halo3 font-display text-lg font-semibold">
              {GUARANTEE_DAYS}
            </span>
            <div>
              <h3 className="text-lg font-semibold">{p.guarantee.title}</h3>
              <p className="mt-0.5 text-ink/75">{p.guarantee.text}</p>
            </div>
          </div>

          <details className="mx-auto mt-10 max-w-md text-center">
            <summary className="inline-block rounded-full px-3 py-2 text-sm font-semibold text-muted underline underline-offset-4 hover:text-ink">
              {p.leadFallback.title} {p.leadFallback.cta}
            </summary>
            <div className="mt-3 text-left">
              <p className="mb-3 text-sm text-muted">{p.leadFallback.text}</p>
              <LeadForm id="save" cta={p.leadFallback.cta} note={`Saved mascot: ${m.name}`} success={`Saved. We'll keep ${m.name} warm for you.`} />
            </div>
          </details>
          <p className="mt-3 text-center text-xs">
            <Link href="/create" className="text-muted underline underline-offset-4 hover:text-ink">
              Edit my answers
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
