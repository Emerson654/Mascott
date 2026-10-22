"use client";

import { useEffect, useState } from "react";

const HOLD_MS = 2600;
const OUT_MS = 450;

/** "a" / "an" for the word that follows (prefix ends with " a" in brand.ts). */
const article = (w: string) => (/^[aeiou]/i.test(w) ? "an" : "a");

export function RotatingWord({ words, withArticle }: { words: string[]; withArticle: boolean }) {
  const [i, setI] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (words.length < 2) return;
    let t2: number | undefined;
    const t1 = window.setTimeout(() => {
      setLeaving(true);
      t2 = window.setTimeout(() => {
        setI((x) => (x + 1) % words.length);
        setLeaving(false);
      }, OUT_MS);
    }, HOLD_MS);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [i, words.length]);

  const w = words[i] ?? "";
  return (
    <span aria-hidden className="block min-h-[2.2em] sm:min-h-[1.1em]">
      <span key={i} className={`inline-block pb-[0.08em] ${leaving ? "word-out" : "word-in"}`}>
        {withArticle && <span className="text-ink">{article(w)} </span>}
        <span className="gradient-text">{w}</span>
      </span>
    </span>
  );
}
