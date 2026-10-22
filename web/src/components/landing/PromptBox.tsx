"use client";

import { useRef } from "react";
import { copy } from "@/content/copy";

/** Native GET form to /create?prompt=…, works before hydration. Chips fill the box. */
export function PromptBox() {
  const ref = useRef<HTMLTextAreaElement>(null);
  const h = copy.hero;
  return (
    <form action="/create" method="get" className="mx-auto w-full max-w-2xl">
      <div className="rounded-[1.75rem] bg-white p-2 shadow-[0_24px_60px_-28px_rgb(79_91_245/0.45),0_2px_6px_rgb(27_29_58/0.06)] ring-1 ring-line transition-shadow focus-within:ring-2 focus-within:ring-g1/50">
        <label htmlFor="prompt" className="sr-only">
          {h.promptLabel}
        </label>
        <textarea
          ref={ref}
          id="prompt"
          name="prompt"
          rows={2}
          maxLength={400}
          placeholder={`${h.promptLabel}… e.g. ${h.promptPlaceholder}`}
          className="block w-full resize-none rounded-[1.4rem] bg-transparent px-4 pt-3 text-base leading-relaxed text-ink outline-none placeholder:text-[#7a7ea3] sm:text-lg"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <div className="flex flex-col items-stretch gap-2 px-2 pb-1 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="px-2 text-xs text-muted">{h.ctaNote}</p>
          <button type="submit" className="btn btn-primary">
            <Sparkle />
            {h.cta}
          </button>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2" aria-label="Ideas">
        {h.promptSuggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              if (ref.current) {
                ref.current.value = s;
                ref.current.focus();
              }
            }}
            className="rounded-full bg-soft px-3.5 py-2 text-sm font-medium text-ink/80 ring-1 ring-line transition hover:bg-white hover:text-ink"
          >
            {s}
          </button>
        ))}
      </div>
    </form>
  );
}

function Sparkle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill="currentColor">
      <path d="M12 2.5l1.9 5.6 5.6 1.9-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.9L12 2.5zM19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" />
    </svg>
  );
}
