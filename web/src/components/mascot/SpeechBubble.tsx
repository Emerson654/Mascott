"use client";
import { useEffect, useState, type CSSProperties } from "react";

export interface SpeechBubbleProps {
  text: string;
  /** Side of the bubble the tail sits on, i.e. where the mascot is. Default "bottom". */
  side?: "bottom" | "top" | "left" | "right";
  speed?: number; // ms per character
  className?: string;
}

const TAIL: Record<NonNullable<SpeechBubbleProps["side"]>, CSSProperties> = {
  bottom: { bottom: -7, left: 28 },
  top: { top: -7, left: 28 },
  left: { left: -7, top: 18 },
  right: { right: -7, top: 18 },
};

export function SpeechBubble({ text, side = "bottom", speed = 28, className }: SpeechBubbleProps) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShown(text.length);
      return;
    }
    setShown(0);
    const id = setInterval(() => {
      setShown((n) => {
        if (n >= text.length) clearInterval(id);
        return Math.min(n + 1, text.length);
      });
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  const typing = shown < text.length;
  return (
    <div
      className={
        "relative inline-block max-w-xs rounded-[22px] border border-black/5 bg-white px-4 py-3 text-[15px] leading-snug text-[#2B2340] shadow-[0_10px_30px_-10px_rgba(43,35,64,.35)] " +
        (className ?? "")
      }
    >
      <span className="sr-only" aria-live="polite">{text}</span>
      <span aria-hidden="true">
        {text.slice(0, shown)}
        {typing && <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-current align-baseline" />}
        {/* reserve final size so the bubble doesn't jump while typing */}
        <span className="invisible">{text.slice(shown)}</span>
      </span>
      <span
        aria-hidden="true"
        className="absolute h-3.5 w-3.5 rotate-45 bg-white"
        style={{ ...TAIL[side], boxShadow: side === "bottom" || side === "right" ? "3px 3px 6px -3px rgba(43,35,64,.18)" : "none" }}
      />
    </div>
  );
}

export default SpeechBubble;
