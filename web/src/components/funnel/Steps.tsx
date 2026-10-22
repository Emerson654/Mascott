"use client";

import type { OnboardingData } from "@/lib/funnel";
import { ACCESSORIES, SPECIES, type MascotSpec } from "@/lib/mascot-spec";
import { copy } from "@/content/copy";
import { ACTIONS, AUDIENCES, COLOURWAYS, EYES, GOALS, INDUSTRIES, LANGUAGES, TONES, specFor } from "./options";
import { Mascot } from "@/components/mascot/Mascot";

export type StepProps = {
  data: OnboardingData;
  set: (patch: Partial<OnboardingData>) => void;
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

export function StepStyle({ data, set }: StepProps) {
  const spec = specFor(data);
  const m = data.mascot;
  const upd = (patch: Partial<MascotSpec> & { name?: string }) => set({ mascot: { ...m, ...patch } });
  return (
    <div className="space-y-7">
      <div>
        <Label htmlFor="f-mname">Name</Label>
        <input
          id="f-mname"
          className="field max-w-xs"
          maxLength={24}
          placeholder="Pip"
          value={m.name ?? ""}
          onChange={(e) => upd({ name: e.target.value })}
        />
      </div>
      <fieldset>
        <legend className="mb-2 text-sm font-bold">Species</legend>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
          {SPECIES.map((s) => (
            <label
              key={s}
              className="chip relative !min-h-0 flex-col !gap-0 !rounded-2xl !p-1.5 text-xs"
              title={cap(s)}
            >
              <input type="radio" name="species" checked={spec.species === s} onChange={() => upd({ species: s })} />
              <Mascot spec={{ ...spec, species: s }} mood="idle" size={52} />
              {cap(s)}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-2 text-sm font-bold">Colours</legend>
        <div className="flex flex-wrap items-center gap-2.5">
          {COLOURWAYS.map((c) => {
            const on = spec.primary.toLowerCase() === c.primary.toLowerCase();
            return (
              <label key={c.name} className="relative cursor-pointer" title={c.name}>
                <input
                  type="radio"
                  name="colour"
                  className="peer sr-only"
                  checked={on}
                  onChange={() => upd({ primary: c.primary, secondary: c.secondary, accent: c.accent })}
                />
                <span className="sr-only">{c.name}</span>
                <span
                  aria-hidden
                  className={`block h-11 w-11 rounded-full ring-offset-2 transition-transform peer-focus-visible:ring-4 peer-focus-visible:ring-accent ${
                    on ? "scale-110 ring-[3px] ring-ink" : "ring-1 ring-line hover:scale-105"
                  }`}
                  style={{ background: `linear-gradient(135deg, ${c.primary} 55%, ${c.secondary} 55% 78%, ${c.accent} 78%)` }}
                />
              </label>
            );
          })}
          <label className="ml-1 inline-flex items-center gap-2 text-sm font-semibold text-muted">
            Custom
            <input
              type="color"
              value={spec.primary}
              onChange={(e) => upd({ primary: e.target.value })}
              className="h-11 w-11 cursor-pointer rounded-full border-0 bg-transparent p-0"
              aria-label="Custom body colour"
            />
          </label>
        </div>
      </fieldset>
      <div className="grid gap-7 sm:grid-cols-2">
        <ChipGroup
          legend="Eyes"
          name="eyes"
          type="radio"
          options={EYES.map((e) => ({ id: e, label: cap(e) }))}
          value={[spec.eyes]}
          onToggle={(e) => upd({ eyes: e as MascotSpec["eyes"] })}
        />
        <ChipGroup
          legend="Style"
          name="mstyle"
          type="radio"
          options={[
            { id: "cute", label: "Cute" },
            { id: "pro", label: "Pro" },
          ]}
          value={[spec.style]}
          onToggle={(s) => upd({ style: s as MascotSpec["style"] })}
        />
      </div>
      <ChipGroup
        legend="Accessory"
        name="accessory"
        type="radio"
        options={ACCESSORIES.map((a) => ({ id: a, label: cap(a) }))}
        value={[spec.accessory]}
        onToggle={(a) => upd({ accessory: a as MascotSpec["accessory"] })}
      />
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
  const spec = specFor(data);
  const rows: { label: string; value: string; step: number }[] = [
    { label: "Idea", value: data.prompt, step: 0 },
    { label: "Company", value: [data.company.name, data.company.url, data.company.industry].filter(Boolean).join(" · "), step: 1 },
    { label: "Visitors", value: data.audience, step: 2 },
    { label: "Goals", value: data.goals.join(", "), step: 2 },
    { label: "Key steps", value: data.pages.filter(Boolean).join(" → "), step: 3 },
    { label: "Look", value: [data.mascot.name, cap(spec.species), spec.style, spec.accessory !== "none" ? spec.accessory : ""].filter(Boolean).join(" · "), step: 4 },
    { label: "Tone", value: cap(data.tone), step: 5 },
    { label: "Allowed to", value: data.actions.map((a) => ACTIONS.find((x) => x.id === a)?.label ?? a).join(", "), step: 5 },
    { label: "Languages", value: data.languages.join(", "), step: 5 },
  ];
  return (
    <dl className="divide-y divide-line overflow-hidden rounded-2xl ring-1 ring-line">
      {rows.map((r) => (
        <div key={r.label} className="flex items-start gap-4 bg-white px-4 py-3">
          <dt className="w-24 shrink-0 text-sm font-bold text-muted">{r.label}</dt>
          <dd className="min-w-0 flex-1 break-words">{r.value || <span className="text-muted">Not set</span>}</dd>
          <button type="button" onClick={() => goTo(r.step)} className="text-sm font-semibold text-accent underline" aria-label={`Edit ${r.label}`}>
            Edit
          </button>
        </div>
      ))}
    </dl>
  );
}
