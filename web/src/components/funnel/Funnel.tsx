"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FUNNEL_STORAGE_KEY, RESULT_STORAGE_KEY, type BrandScan, type GeneratedMascot, type OnboardingData } from "@/lib/funnel";
import { DEFAULT_SPEC, type Mood } from "@/lib/mascot-spec";
import { Mascot } from "@/components/mascot/Mascot";
import { SpeechBubble } from "@/components/mascot/SpeechBubble";
import { copy } from "@/content/copy";
import { EMPTY_DATA, STEPS } from "./options";
import { SpottedPalette, StepAudience, StepBehaviour, StepBrand, StepCompany, StepIdea, StepPages, StepRecap } from "./Steps";
import { Thinking } from "./Thinking";

const STEP_KEY = `${FUNNEL_STORAGE_KEY}.step`;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BRAND_STEP = STEPS.findIndex((s) => s.id === "brand");
const BEHAVIOUR_STEP = STEPS.findIndex((s) => s.id === "behaviour");
/** Mascott's own little guide: the brand mascot, never the visitor's (theirs stays a surprise). */
const GUIDE_SPEC = DEFAULT_SPEC; // same blob as the site logo

function load(): OnboardingData | null {
  try {
    const raw = localStorage.getItem(FUNNEL_STORAGE_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as Partial<OnboardingData>;
    return {
      ...EMPTY_DATA,
      ...d,
      company: { ...EMPTY_DATA.company, ...d.company },
      behaviour: { ...EMPTY_DATA.behaviour, ...d.behaviour },
      brand: { ...EMPTY_DATA.brand, ...d.brand },
      mascot: {},
    };
  } catch {
    return null;
  }
}

function validate(step: number, d: OnboardingData): Record<string, string> {
  const e: Record<string, string> = {};
  if (step === 0 && d.prompt.trim().length < 3) e.prompt = "Write a few words about your mascot, even a rough idea works.";
  if (step === 1) {
    if (!d.company.name.trim()) e.name = "Add your company or product name.";
    const u = d.company.url.trim();
    if (u && !/^(https?:\/\/)?[^\s.]+\.[^\s]{2,}/i.test(u)) e.url = "That doesn't look like a web address. Try yourapp.com.";
  }
  if (step === BEHAVIOUR_STEP && d.behaviour.handoffEmail.trim() && !EMAIL.test(d.behaviour.handoffEmail.trim()))
    e.handoffEmail = "Check this email address, or leave it empty.";
  return e;
}

export function Funnel() {
  const router = useRouter();
  const params = useSearchParams();
  const [data, setData] = useState<OnboardingData>(EMPTY_DATA);
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [result, setResult] = useState<GeneratedMascot | null>(null);
  const [mood, setMood] = useState<Mood>("wave");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);
  const scanned = useRef("");

  // Restore saved progress; a ?prompt from the landing page wins over the saved idea.
  useEffect(() => {
    const saved = load();
    const prompt = params.get("prompt")?.slice(0, 400).trim();
    const next = saved ?? EMPTY_DATA;
    let s = 0;
    try {
      s = Math.min(STEPS.length - 1, Math.max(0, Number(localStorage.getItem(STEP_KEY)) || 0));
    } catch {}
    if (prompt) {
      setData({ ...next, prompt });
      s = next.prompt === prompt ? s : 1; // fresh idea from the landing: go straight to step 2
    } else setData(next);
    setStep(s);
    setReady(true);
  }, [params]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(FUNNEL_STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem(STEP_KEY, String(step));
    } catch {}
  }, [data, step, ready]);

  // Move focus to the step title on change (not on first paint), and let the guide react.
  useEffect(() => {
    if (!ready) return;
    if (first.current) {
      first.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    setMood(step === STEPS.length - 1 ? "happy" : step === 3 ? "point" : "talk");
    const t = window.setTimeout(() => setMood("idle"), 2400);
    return () => window.clearTimeout(t);
  }, [step, ready]);

  const set = useCallback((patch: Partial<OnboardingData> | ((d: OnboardingData) => Partial<OnboardingData>)) => {
    setData((d) => ({ ...d, ...(typeof patch === "function" ? patch(d) : patch) }));
    setErrors({});
  }, []);

  const goTo = (i: number) => {
    setErrors({});
    setStep(Math.max(0, Math.min(STEPS.length - 1, i)));
  };

  /** Fire-and-forget: read the uploads/notes, store brand.scan. Never blocks the funnel. */
  function scanBrand(d: OnboardingData) {
    const b = d.brand;
    if (!b.images.length && !b.notes.trim()) return;
    const key = b.images.map((i) => i.name + i.dataUrl.length).join("|") + "#" + b.notes.trim();
    if (key === scanned.current) return;
    scanned.current = key;
    const ctrl = new AbortController();
    const t = window.setTimeout(() => ctrl.abort(), 20_000);
    fetch("/api/brand-scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: ctrl.signal,
      body: JSON.stringify({
        images: b.images,
        notes: b.notes,
        company: { name: d.company.name, industry: d.company.industry, description: d.company.description },
      }),
    })
      .then((r) => (r.ok ? (r.json() as Promise<BrandScan>) : null))
      .then((scan) => {
        if (scan && Array.isArray(scan.palette)) set((x) => ({ brand: { ...x.brand, scan } }));
      })
      .catch(() => {
        scanned.current = ""; // allow a retry next time
      })
      .finally(() => window.clearTimeout(t));
  }

  const next = () => {
    const e = validate(step, data);
    setErrors(e);
    if (Object.keys(e).length) {
      setMood("surprised");
      return;
    }
    if (step === BRAND_STEP) scanBrand(data);
    goTo(step + 1);
  };

  async function generate() {
    setBusy(true);
    setFailed(false);
    setResult(null);
    try {
      const body: OnboardingData = {
        ...data,
        pages: data.pages.map((p) => p.trim()).filter(Boolean),
        mascot: {}, // no presets: the AI designs the mascot from the brand universe
      };
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(String(res.status));
      const r = (await res.json()) as GeneratedMascot;
      setResult({ ...r, thoughts: Array.isArray(r.thoughts) ? r.thoughts : [] });
    } catch {
      setFailed(true);
      setBusy(false);
      setMood("surprised");
    }
  }

  const onRevealed = useCallback(
    (final: GeneratedMascot) => {
      try {
        localStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(final));
      } catch {}
      router.push("/create/result");
    },
    [router],
  );

  const s = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const bubble = failed
    ? "Something tripped on the way. Your answers are saved, shall we try again?"
    : Object.keys(errors).length
      ? "One thing needs a fix below."
      : s.comment;
  const stepProps = { data, set, errors };
  const thinkColors = data.brand.colors.length ? data.brand.colors : (data.brand.scan?.palette ?? []);

  return (
    <div className="hero-glow min-h-[calc(100dvh-4rem)] px-4 pb-16 pt-6 sm:px-6 sm:pt-10">
      {busy && <Thinking colors={thinkColors} company={data.company.name} result={result} onDone={onRevealed} />}
      <div className="mx-auto max-w-3xl">
        {/* Progress */}
        <div className="flex items-center justify-between text-sm font-semibold text-muted">
          <span>
            Step {step + 1} of {STEPS.length}
          </span>
          <span className="hidden sm:inline">{s.title}</span>
        </div>
        <div
          className="mt-2 h-2.5 overflow-hidden rounded-full bg-white ring-1 ring-line"
          role="progressbar"
          aria-label="Progress"
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
          aria-valuenow={step + 1}
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Mascott's guide */}
        <aside className="mt-6 flex items-end gap-3" aria-label="Mascott guide">
          <div className="relative shrink-0">
            <span aria-hidden className="absolute inset-[10%] -z-10 rounded-full bg-halo1 blur-md" />
            <Mascot spec={GUIDE_SPEC} mood={mood} size={64} label="Mascott guide" onPoke={() => setMood("happy")} />
          </div>
          <div className="min-w-0 flex-1 pb-3">
            <SpeechBubble key={bubble} text={bubble} side="left" />
          </div>
        </aside>

        {/* Step card */}
        <section className="mt-4 rounded-[1.75rem] bg-white p-5 shadow-[0_24px_60px_-30px_rgb(27_29_58/0.3)] ring-1 ring-line sm:p-8">
          <h1 ref={headingRef} tabIndex={-1} className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold leading-tight outline-none">
            {s.title}
          </h1>
          <form
            className="mt-6"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (isLast) generate();
              else next();
            }}
          >
            {!ready ? (
              <div className="h-40 animate-pulse rounded-2xl bg-soft" />
            ) : (
              <div key={step} className="fade-up">
                {step === 0 && <StepIdea {...stepProps} />}
                {step === 1 && <StepCompany {...stepProps} />}
                {step === 2 && <StepAudience {...stepProps} />}
                {step === 3 && <StepPages {...stepProps} />}
                {step === BRAND_STEP && <StepBrand {...stepProps} />}
                {step === BEHAVIOUR_STEP && <StepBehaviour {...stepProps} />}
                {isLast && <StepRecap {...stepProps} goTo={goTo} />}
                {step > BRAND_STEP && (
                  <div className="mt-6">
                    <SpottedPalette data={data} set={set} />
                  </div>
                )}
              </div>
            )}

            {failed && (
              <p role="alert" className="mt-6 rounded-2xl bg-halo2 px-4 py-3 text-sm font-semibold">
                We couldn&rsquo;t generate your mascot just now. Your answers are saved, so you can try again.
              </p>
            )}

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
              {step > 0 ? (
                <button type="button" onClick={() => goTo(step - 1)} className="btn btn-ghost" disabled={busy}>
                  Back
                </button>
              ) : (
                <span />
              )}
              <button type="submit" className="btn btn-primary min-w-48" disabled={busy || !ready}>
                {isLast ? (failed ? "Try again" : copy.brandUniverse.cta) : "Continue"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
