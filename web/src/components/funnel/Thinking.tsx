"use client";

import { useEffect, useRef, useState } from "react";
import type { GeneratedMascot } from "@/lib/funnel";
import { Mascot } from "@/components/mascot/Mascot";
import { copy } from "@/content/copy";

/**
 * Full-screen "image model thinking" sequence: a bubbling field in the brand colours, the
 * creative director's thoughts typed one by one, then the reveal. The artwork preloads while
 * the thoughts play; 30 s without it and we reveal the SVG fallback instead.
 */

const IMAGE_TIMEOUT_MS = 30_000;
const CHAR_MS = 24;
const HOLD_MS = 650;
const REVEAL_MS = 3200;
const DEFAULT_COLORS = ["#7C8CFF", "#FF9EC4", "#FFD36E", "#5CC8C0"];

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function Thinking({
  colors,
  company,
  result,
  onDone,
}: {
  colors: string[];
  company: string;
  result: GeneratedMascot | null;
  onDone: (final: GeneratedMascot) => void;
}) {
  const pre = ["Reading your brand universe", company ? `Getting to know ${company}` : "Getting to know your product", "Sketching a few directions"];
  const queue = result ? [...pre, ...(result.thoughts?.length ? result.thoughts : ["Settling on a character", "Choosing the details"])] : pre;

  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState(0);
  const [final, setFinal] = useState<GeneratedMascot | null>(null); // set once the image is ready (or given up)
  const [revealed, setRevealed] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const line = queue[Math.min(idx, queue.length - 1)];
  const thoughtsDone = !!result && idx >= queue.length - 1 && typed >= line.length;

  // Lock the page behind and take focus.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    headingRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Type the current line, hold, move on. Waits on the last pre-line until the result lands.
  useEffect(() => {
    if (revealed) return;
    if (typed < line.length) {
      if (reducedMotion()) {
        setTyped(line.length);
        return;
      }
      const t = window.setTimeout(() => setTyped((n) => n + 1), CHAR_MS);
      return () => window.clearTimeout(t);
    }
    if (idx < queue.length - 1) {
      const t = window.setTimeout(() => {
        setIdx((i) => i + 1);
        setTyped(0);
      }, reducedMotion() ? 1200 : HOLD_MS);
      return () => window.clearTimeout(t);
    }
  }, [typed, line, idx, queue.length, revealed]);

  // Preload the artwork as soon as we know it.
  useEffect(() => {
    if (!result) return;
    const url = result.spec.imageUrl;
    if (!url) {
      setFinal(result);
      return;
    }
    let settled = false;
    const give = (ok: boolean) => {
      if (settled) return;
      settled = true;
      setFinal(ok ? result : { ...result, spec: { ...result.spec, imageUrl: undefined } });
    };
    const img = new Image();
    img.onload = () => give(true);
    img.onerror = () => give(false);
    img.src = url;
    const t = window.setTimeout(() => give(false), IMAGE_TIMEOUT_MS);
    return () => {
      settled = true;
      window.clearTimeout(t);
    };
  }, [result]);

  useEffect(() => {
    if (!thoughtsDone || !final || revealed) return;
    const t = window.setTimeout(() => setRevealed(true), 400);
    return () => window.clearTimeout(t);
  }, [thoughtsDone, final, revealed]);

  useEffect(() => {
    if (!revealed || !final) return;
    const t = window.setTimeout(() => onDone(final), REVEAL_MS);
    return () => window.clearTimeout(t);
  }, [revealed, final, onDone]);

  const palette = [...colors, ...DEFAULT_COLORS].slice(0, 4);
  const past = queue.slice(Math.max(0, idx - 3), idx);
  const waitingOnArt = thoughtsDone && !final;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="think-title"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#FBFAFF] px-6"
    >
      {/* Bubbling field */}
      <div aria-hidden className={`think-field ${revealed ? "is-revealed" : ""}`}>
        {palette.map((c, i) => (
          <span key={i} className={`think-blob b${i + 1}`} style={{ background: c }} />
        ))}
      </div>
      <span aria-hidden className="think-grain" />

      {!revealed ? (
        <div className="relative w-full max-w-xl">
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-muted">{copy.generation.title}</p>
          <h2 ref={headingRef} id="think-title" tabIndex={-1} className="think-shimmer font-display text-lg font-semibold tracking-wide outline-none">
            {waitingOnArt ? "Rendering…" : "Thinking…"}
          </h2>

          <ol className="mt-6 min-h-[13rem] space-y-3" aria-hidden>
            {past.map((p, i) => (
              <li
                key={`${idx}-${i}`}
                className="text-[clamp(1rem,2.4vw,1.15rem)] leading-snug text-ink transition-opacity duration-500"
                style={{ opacity: 0.2 + (0.4 * (i + 1)) / past.length, filter: `blur(${(past.length - i - 1) * 0.6}px)` }}
              >
                {p}
              </li>
            ))}
            <li className="text-[clamp(1.35rem,3.6vw,1.9rem)] font-semibold leading-snug text-ink">
              {line.slice(0, typed)}
              <span className="think-caret" />
            </li>
          </ol>
          {/* Screen readers get whole thoughts, not keystrokes. */}
          <p className="sr-only" aria-live="polite">
            {typed >= line.length ? line : ""}
          </p>

          <div className="mt-10 h-1.5 w-full overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-label="Designing your mascot">
            <span className="think-bar" />
          </div>
        </div>
      ) : (
        final && (
          <div className="relative flex flex-col items-center text-center">
            <span aria-hidden className="think-bloom" />
            <div className="hidden sm:block">
              <Mascot spec={final.spec} mood="wave" size={320} label={final.name} reveal />
            </div>
            <div className="sm:hidden">
              <Mascot spec={final.spec} mood="wave" size={240} label={final.name} reveal />
            </div>
            <h2 id="think-title" className="reveal-name mt-6 text-[clamp(2.25rem,7vw,4rem)] font-semibold leading-none" aria-live="polite">
              {copy.reveal.title.replace("{name}", final.name)}
            </h2>
            <p className="reveal-name mt-3 max-w-sm text-muted">{copy.reveal.subtitle}</p>
          </div>
        )
      )}
    </div>
  );
}
