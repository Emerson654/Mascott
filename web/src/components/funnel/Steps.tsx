"use client";

import type { OnboardingData } from "@/lib/funnel";
import { copy } from "@/content/copy";
import { useRef, useState } from "react";
import { ACTIONS, AUDIENCES, BRAND_TEXT, COLOR_SUGGESTIONS, GOALS, INDUSTRIES, LANGUAGES, MAX_COLORS, TONES, VIBES } from "./options";
import { MAX_IMAGES, compressImage, type BrandImage } from "./image";

export type StepProps = {
  data: OnboardingData;
  set: (patch: Partial<OnboardingData> | ((d: OnboardingData) => Partial<OnboardingData>)) => void;
  errors: Record<string, string>;
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace("_", " ");
const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

function Label({ htmlFor, children, optional }: { htmlFor: string; children: React.ReactNode; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-bold text-ink">
      {children}
      {optional && <span className="ml-1 font-normal text-muted">(optional)</span>}
    </label>
  );
}

function ErrorText({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-sm font-semibold text-[#b4235a]">
      {msg}
    </p>
  );
}

function ChipGroup({
  legend,
  options,
  value,
  onToggle,
  type = "checkbox",
  name,
}: {
  legend: string;
  options: { id: string; label: string }[];
  value: string[];
  onToggle: (id: string) => void;
  type?: "checkbox" | "radio";
  name: string;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-bold text-ink">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label key={o.id} className="chip relative text-sm">
            <input type={type} name={name} checked={value.includes(o.id)} onChange={() => onToggle(o.id)} />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function StepIdea({ data, set, errors }: StepProps) {
  return (
    <div>
      <Label htmlFor="f-prompt">{copy.hero.promptLabel}</Label>
      <textarea
        id="f-prompt"
        className="field min-h-32 resize-y text-lg leading-relaxed"
        maxLength={400}
        value={data.prompt}
        placeholder={copy.hero.promptPlaceholder}
        aria-invalid={!!errors.prompt}
        aria-describedby={errors.prompt ? "e-prompt" : undefined}
        onChange={(e) => set({ prompt: e.target.value })}
      />
      <ErrorText id="e-prompt" msg={errors.prompt} />
      <div className="mt-4 flex flex-wrap gap-2">
        {copy.hero.promptSuggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => set({ prompt: s })}
            className="rounded-full bg-soft px-3.5 py-2 text-sm font-medium text-ink/80 ring-1 ring-line hover:bg-white"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

export function StepCompany({ data, set, errors }: StepProps) {
  const c = data.company;
  const upd = (patch: Partial<OnboardingData["company"]>) => set({ company: { ...c, ...patch } });
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div>
        <Label htmlFor="f-name">Company name</Label>
        <input
          id="f-name"
          className="field"
          autoComplete="organization"
          value={c.name}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "e-name" : undefined}
          onChange={(e) => upd({ name: e.target.value })}
        />
        <ErrorText id="e-name" msg={errors.name} />
      </div>
      <div>
        <Label htmlFor="f-url" optional>
          Website
        </Label>
        <input
          id="f-url"
          className="field"
          type="url"
          inputMode="url"
          autoComplete="url"
          placeholder="https://yourapp.com"
          value={c.url}
          aria-invalid={!!errors.url}
          aria-describedby={errors.url ? "e-url" : undefined}
          onChange={(e) => upd({ url: e.target.value })}
        />
        <ErrorText id="e-url" msg={errors.url} />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="f-industry" optional>
          Industry
        </Label>
        <select id="f-industry" className="field" value={c.industry} onChange={(e) => upd({ industry: e.target.value })}>
          <option value="">Choose one</option>
          {INDUSTRIES.map((i) => (
            <option key={i}>{i}</option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="f-desc" optional>
          What does your product do?
        </Label>
        <textarea
          id="f-desc"
          className="field min-h-24 resize-y"
          maxLength={500}
          placeholder="A CRM for small agencies. Users import contacts, then track deals."
          value={c.description}
          onChange={(e) => upd({ description: e.target.value })}
        />
      </div>
    </div>
  );
}

export function StepAudience({ data, set }: StepProps) {
  return (
    <div className="space-y-7">
      <ChipGroup
        legend="Who visits the page where I'll live?"
        name="audience"
        type="radio"
        options={AUDIENCES.map((a) => ({ id: a, label: a }))}
        value={[data.audience]}
        onToggle={(a) => set({ audience: a })}
      />
      <ChipGroup
        legend="What should I help with? Pick as many as you like."
        name="goals"
        options={GOALS.map((g) => ({ id: g, label: g }))}
        value={data.goals}
        onToggle={(g) => set({ goals: toggle(data.goals, g) })}
      />
    </div>
  );
}

export function StepPages({ data, set }: StepProps) {
  const pages = data.pages.length ? data.pages : [""];
  const upd = (i: number, v: string) => set({ pages: pages.map((p, j) => (j === i ? v : p)) });
  return (
    <div>
      <p className="mb-4 text-muted">A URL or a plain description works: &ldquo;/settings/import&rdquo; or &ldquo;Create your first project&rdquo;.</p>
      <ol className="space-y-3">
        {pages.map((p, i) => (
          <li key={i} className="flex items-center gap-2">
            <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sun font-display font-semibold">
              {i + 1}
            </span>
            <label htmlFor={`f-page-${i}`} className="sr-only">
              Key page or step {i + 1}
            </label>
            <input
              id={`f-page-${i}`}
              className="field"
              value={p}
              maxLength={160}
              placeholder={["/signup", "Import your contacts", "Invite a teammate"][i] ?? "Next key step"}
              onChange={(e) => upd(i, e.target.value)}
            />
            {pages.length > 1 && (
              <button
                type="button"
                onClick={() => set({ pages: pages.filter((_, j) => j !== i) })}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted hover:bg-soft hover:text-ink"
                aria-label={`Remove step ${i + 1}`}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </li>
        ))}
      </ol>
      {pages.length < 6 && (
        <button type="button" onClick={() => set({ pages: [...pages, ""] })} className="btn btn-ghost mt-4 !min-h-11 text-sm">
          + Add a step
        </button>
      )}
    </div>
  );
}

function Switch({ id, label, hint, checked, onChange }: { id: string; label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl bg-soft/70 p-4">
      <div>
        <label htmlFor={id} className="font-bold">
          {label}
        </label>
        <p className="text-sm text-muted">{hint}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-1 h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? "bg-accent" : "bg-[#c9cce3]"}`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? "translate-x-6" : "translate-x-1"}`}
        />
      </button>
    </div>
  );
}

export function StepBehaviour({ data, set, errors }: StepProps) {
  const b = data.behaviour;
  const updB = (patch: Partial<OnboardingData["behaviour"]>) => set({ behaviour: { ...b, ...patch } });
  return (
    <div className="space-y-7">
      <fieldset>
        <legend className="mb-2 text-sm font-bold">Tone</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {TONES.map((t) => (
            <label key={t.id} className="chip relative !items-start !rounded-2xl !py-3">
              <input type="radio" name="tone" checked={data.tone === t.id} onChange={() => set({ tone: t.id })} />
              <span>
                <span className="block">{t.label}</span>
                <span className="block text-sm font-normal text-muted">{t.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-3 sm:grid-cols-2">
        <Switch id="f-greet" label="Say hello on arrival" hint="One short greeting, then I wait." checked={b.greetOnArrival} onChange={(v) => updB({ greetOnArrival: v })} />
        <Switch id="f-tips" label="Proactive tips" hint="A nudge when someone seems stuck." checked={b.proactiveTips} onChange={(v) => updB({ proactiveTips: v })} />
      </div>
      <ChipGroup
        legend="What I'm allowed to do"
        name="actions"
        options={ACTIONS}
        value={data.actions}
        onToggle={(a) => set({ actions: toggle(data.actions, a) })}
      />
      <ChipGroup
        legend="Languages"
        name="languages"
        options={LANGUAGES.map((l) => ({ id: l, label: l }))}
        value={data.languages}
        onToggle={(l) => set({ languages: toggle(data.languages, l) })}
      />
      <div>
        <Label htmlFor="f-handoff" optional>
          When I don&rsquo;t know, pass the question to
        </Label>
        <input
          id="f-handoff"
          type="email"
          inputMode="email"
          autoComplete="email"
          className="field max-w-md"
          placeholder="support@yourapp.com"
          value={b.handoffEmail}
          aria-invalid={!!errors.handoffEmail}
          aria-describedby={errors.handoffEmail ? "e-handoff" : undefined}
          onChange={(e) => updB({ handoffEmail: e.target.value })}
        />
        <ErrorText id="e-handoff" msg={errors.handoffEmail} />
      </div>
    </div>
  );
}

export function StepRecap({ data, goTo }: StepProps & { goTo: (i: number) => void }) {
  const b = data.brand;
  const photos = b.images.length ? `${b.images.length} photo${b.images.length > 1 ? "s" : ""}` : "";
  const rows: { label: string; value: string; step: number }[] = [
    { label: "Idea", value: data.prompt, step: 0 },
    { label: "Company", value: [data.company.name, data.company.url, data.company.industry].filter(Boolean).join(" · "), step: 1 },
    { label: "Visitors", value: data.audience, step: 2 },
    { label: "Goals", value: data.goals.join(", "), step: 2 },
    { label: "Key steps", value: data.pages.filter(Boolean).join(" → "), step: 3 },
    { label: "Brand", value: [b.vibe.join(", "), photos, b.notes ? "notes" : ""].filter(Boolean).join(" · "), step: 4 },
    { label: "Tone", value: cap(data.tone), step: 5 },
    { label: "Allowed to", value: data.actions.map((a) => ACTIONS.find((x) => x.id === a)?.label ?? a).join(", "), step: 5 },
    { label: "Languages", value: data.languages.join(", "), step: 5 },
  ];
  return (
    <dl className="divide-y divide-line overflow-hidden rounded-2xl ring-1 ring-line">
      {rows.map((r) => (
        <div key={r.label} className="flex items-start gap-4 bg-white px-4 py-3">
          <dt className="w-24 shrink-0 text-sm font-bold text-muted">{r.label}</dt>
          <dd className="min-w-0 flex-1 break-words">
            {r.label === "Brand" && b.colors.length > 0 && (
              <span className="mr-2 inline-flex -space-x-1 align-middle" aria-hidden>
                {b.colors.map((c) => (
                  <span key={c} className="h-5 w-5 rounded-full ring-2 ring-white" style={{ background: c }} />
                ))}
              </span>
            )}
            {r.value || (r.label === "Brand" && b.colors.length ? null : <span className="text-muted">Not set</span>)}
          </dd>
          <button type="button" onClick={() => goTo(r.step)} className="text-sm font-semibold text-accent underline" aria-label={`Edit ${r.label}`}>
            Edit
          </button>
        </div>
      ))}
    </dl>
  );
}

type Brand = OnboardingData["brand"];
const setBrand = (set: StepProps["set"], fn: (b: Brand) => Partial<Brand>) => set((d) => ({ brand: { ...d.brand, ...fn(d.brand) } }));

export function StepBrand({ data, set }: StepProps) {
  const t = BRAND_TEXT;
  const b = data.brand;
  const fileRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const addColor = (c: string) => setBrand(set, (x) => (x.colors.length >= MAX_COLORS || x.colors.includes(c) ? {} : { colors: [...x.colors, c] }));
  const nextSuggestion = COLOR_SUGGESTIONS.find((c) => !b.colors.includes(c)) ?? "#4F5BF5";

  async function addFiles(files: FileList | null) {
    const list = Array.from(files ?? []);
    if (!list.length) return;
    const room = MAX_IMAGES - b.images.length;
    if (room <= 0) return setErr("That's 3 photos already. Remove one to add another.");
    setErr("");
    setBusy(true);
    const out: BrandImage[] = [];
    for (const f of list.slice(0, room)) {
      try {
        out.push(await compressImage(f));
      } catch {
        setErr(`We couldn't use ${f.name}. Try a JPG or PNG.`);
      }
    }
    if (list.length > room) setErr(`Only ${MAX_IMAGES} photos fit. We kept the first ${room}.`);
    setBrand(set, (x) => ({ images: [...x.images, ...out].slice(0, MAX_IMAGES) }));
    setBusy(false);
  }

  return (
    <div className="space-y-8">
      <p className="text-muted">{t.intro}</p>

      {/* Colours */}
      <fieldset>
        <legend className="text-sm font-bold text-ink">{t.colorsLegend}</legend>
        <p className="mb-3 text-sm text-muted">{t.colorsHint}</p>
        <div className="flex flex-wrap items-center gap-3">
          {b.colors.map((c, i) => (
            <div key={i} className="group relative">
              <label
                className="block h-14 w-14 cursor-pointer rounded-2xl shadow-[inset_0_0_0_1px_rgb(27_29_58/0.12),0_6px_14px_-8px_rgb(27_29_58/0.5)] transition-transform hover:scale-105 has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent"
                style={{ background: c }}
              >
                <input
                  type="color"
                  value={c}
                  onChange={(e) => {
                    const v = e.target.value;
                    setBrand(set, (x) => ({ colors: x.colors.map((y, j) => (j === i ? v : y)) }));
                  }}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  aria-label={`Brand colour ${i + 1}, ${c}. Change it`}
                />
              </label>
              <button
                type="button"
                onClick={() => setBrand(set, (x) => ({ colors: x.colors.filter((_, j) => j !== i) }))}
                className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-ink shadow ring-1 ring-line hover:bg-soft"
                aria-label={`Remove colour ${c}`}
              >
                <Cross size={10} />
              </button>
            </div>
          ))}
          {b.colors.length < MAX_COLORS && (
            <button
              type="button"
              onClick={() => addColor(nextSuggestion)}
              className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-dashed border-line text-2xl text-muted transition hover:border-g1 hover:text-ink"
              aria-label="Add a colour"
            >
              +
            </button>
          )}
        </div>
        {b.colors.length < MAX_COLORS && (
          <div className="mt-4 flex flex-wrap items-center gap-2" aria-label="Suggestions">
            <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-muted">Suggestions</span>
            {COLOR_SUGGESTIONS.filter((c) => !b.colors.includes(c)).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => addColor(c)}
                className="h-11 w-11 rounded-full p-1.5 transition-transform hover:scale-110"
                aria-label={`Add ${c}`}
              >
                <span aria-hidden className="block h-full w-full rounded-full ring-1 ring-black/10" style={{ background: c }} />
              </button>
            ))}
          </div>
        )}
      </fieldset>

      <ChipGroup
        legend={t.vibeLegend}
        name="vibe"
        options={VIBES.map((v) => ({ id: v.toLowerCase(), label: v }))}
        value={b.vibe}
        onToggle={(v) => setBrand(set, (x) => ({ vibe: toggle(x.vibe, v) }))}
      />

      {/* Photos */}
      <div>
        <p className="mb-2 text-sm font-bold text-ink">
          Photos <span className="font-normal text-muted">(optional)</span>
        </p>
        {b.images.length < MAX_IMAGES && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setOver(true);
            }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setOver(false);
              addFiles(e.dataTransfer.files);
            }}
            className={`flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-4 py-7 text-center transition-colors ${
              over ? "border-g1 bg-halo1" : "border-line bg-soft/60"
            }`}
          >
            <span aria-hidden className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-accent shadow-sm ring-1 ring-line">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="3" />
                <circle cx="9" cy="10" r="2" />
                <path d="M21 16l-5-5-9 9" />
              </svg>
            </span>
            <p className="font-semibold">{t.dropTitle}</p>
            <p className="max-w-sm text-sm text-muted">{t.dropHint}</p>
            <button type="button" onClick={() => fileRef.current?.click()} className="btn btn-ghost mt-1 !min-h-11 text-sm" disabled={busy}>
              {busy ? "Shrinking…" : t.dropButton}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>
        )}
        {err && (
          <p role="alert" className="mt-2 text-sm font-semibold text-[#b4235a]">
            {err}
          </p>
        )}
        {b.images.length > 0 && (
          <ul className="mt-3 grid max-w-md grid-cols-3 gap-3">
            {b.images.map((img) => (
              <li key={img.name} className="relative aspect-square overflow-hidden rounded-2xl bg-soft ring-1 ring-line">
                {/* eslint-disable-next-line @next/next/no-img-element -- local data URL */}
                <img src={img.dataUrl} alt={img.name} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setBrand(set, (x) => ({ images: x.images.filter((y) => y.name !== img.name) }))}
                  className="absolute right-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink shadow backdrop-blur hover:bg-white"
                  aria-label={`Remove ${img.name}`}
                >
                  <Cross size={12} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <Label htmlFor="f-notes" optional>
          {t.notesLabel}
        </Label>
        <textarea
          id="f-notes"
          className="field min-h-24 resize-y"
          maxLength={600}
          placeholder={t.notesPlaceholder}
          value={b.notes}
          onChange={(e) => {
            const v = e.target.value;
            setBrand(set, () => ({ notes: v }));
          }}
        />
      </div>

      <SpottedPalette data={data} set={set} />
    </div>
  );
}

let dismissedPalette = ""; // survives step remounts; ponytail: per tab, fine for a hint

/** Non-blocking suggestion: the palette /api/brand-scan read from the uploads. */
export function SpottedPalette({ data, set }: Pick<StepProps, "data" | "set">) {
  const palette = (data.brand.scan?.palette ?? []).filter((c) => /^#[0-9a-f]{6}$/i.test(c)).slice(0, MAX_COLORS);
  const [hidden, setHidden] = useState(dismissedPalette === palette.join());
  const same = palette.every((c) => data.brand.colors.some((x) => x.toLowerCase() === c.toLowerCase()));
  if (hidden || !palette.length || same) return null;
  return (
    <div role="status" className="fade-up flex flex-wrap items-center gap-3 rounded-2xl bg-halo1/70 p-3 pl-4 ring-1 ring-line">
      <span className="flex -space-x-1.5" aria-hidden>
        {palette.map((c) => (
          <span key={c} className="h-7 w-7 rounded-full ring-2 ring-white" style={{ background: c }} />
        ))}
      </span>
      <p className="min-w-0 flex-1 text-sm font-semibold">{BRAND_TEXT.spotted}</p>
      <div className="flex gap-1">
        <button type="button" className="btn btn-primary !min-h-10 !px-4 text-sm" onClick={() => setBrand(set, () => ({ colors: palette }))}>
          {BRAND_TEXT.useSpotted}
        </button>
        <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full text-muted hover:bg-white" aria-label="Dismiss" onClick={() => {
            dismissedPalette = palette.join();
            setHidden(true);
          }}>
          <Cross size={12} />
        </button>
      </div>
    </div>
  );
}

function Cross({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden>
      <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
