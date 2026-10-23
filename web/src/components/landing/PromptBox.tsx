"use client";

import { useRef, useState } from "react";
import { copy } from "@/content/copy";
import { addImageToSavedFunnel, compressImage, removeImageFromSavedFunnel, type BrandImage } from "@/components/funnel/image";

/** Native GET form to /create?prompt=…, works before hydration. Chips fill the box. The paperclip drops a photo into the funnel's brand step. */
export function PromptBox() {
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<BrandImage | null>(null);
  const [photoErr, setPhotoErr] = useState("");
  const h = copy.hero;

  async function onPhoto(file?: File) {
    if (!file) return;
    setPhotoErr("");
    try {
      const img = await compressImage(file);
      if (photo) removeImageFromSavedFunnel(photo.name);
      addImageToSavedFunnel(img);
      setPhoto(img);
    } catch {
      setPhotoErr("We couldn't read that photo. Try a JPG or PNG.");
    }
  }
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
          <div className="flex min-w-0 items-center gap-2">
            {photo ? (
              <span className="inline-flex min-w-0 items-center gap-2 rounded-full bg-soft py-1 pl-1 pr-1 ring-1 ring-line">
                {/* eslint-disable-next-line @next/next/no-img-element -- local data URL */}
                <img src={photo.dataUrl} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
                <span className="max-w-[9rem] truncate text-xs font-semibold">{photo.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    removeImageFromSavedFunnel(photo.name);
                    setPhoto(null);
                  }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted hover:bg-white hover:text-ink"
                  aria-label={`Remove ${photo.name}`}
                >
                  <svg width="10" height="10" viewBox="0 0 16 16" aria-hidden>
                    <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                  </svg>
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-soft hover:text-ink"
                aria-label="Add a photo: logo, product or moodboard"
                title="Add a photo"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M21 11.5l-8.6 8.6a5.5 5.5 0 01-7.8-7.8l8.9-8.9a3.7 3.7 0 015.2 5.2l-8.9 8.9a1.8 1.8 0 01-2.6-2.6l8.2-8.2" />
                </svg>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { onPhoto(e.target.files?.[0]); e.target.value = ""; }} />
            <p className="px-1 text-xs text-muted">{photoErr || h.ctaNote}</p>
          </div>
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
