"use client";

import Link from "next/link";
import { useState } from "react";
import { PLANS, LAUNCH_OFFER, launchOfferActive, formatPrice, type Billing, type PlanId } from "@/lib/pricing";
import { copy } from "@/content/copy";

/**
 * Plan cards with a monthly / yearly switch.
 * mode "checkout": the button POSTs /api/checkout and redirects. mode "link": goes to /pricing.
 */
export function PlanCards({ mode = "checkout", ctaLabel }: { mode?: "checkout" | "link"; ctaLabel?: string }) {
  const [billing, setBilling] = useState<Billing>("monthly");
  const [busy, setBusy] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const offer = launchOfferActive() ? LAUNCH_OFFER : null;

  async function checkout(planId: PlanId) {
    setBusy(planId);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, billing }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string };
      if (!res.ok || !data.url) throw new Error();
      window.location.href = data.url;
    } catch {
      setError("Checkout didn't open. Please try again, or reserve a pilot below and we'll set you up by email.");
      setBusy(null);
    }
  }

  return (
    <div>
      <div className="flex flex-col items-center gap-3">
        <div role="radiogroup" aria-label="Billing period" className="inline-flex rounded-full bg-soft p-1 ring-1 ring-line">
          {(["monthly", "yearly"] as const).map((b) => (
            <button
              key={b}
              type="button"
              role="radio"
              aria-checked={billing === b}
              onClick={() => setBilling(b)}
              className={`min-h-10 rounded-full px-4 text-sm font-bold transition-colors ${
                billing === b ? "bg-white text-ink shadow-[0_2px_8px_rgb(27_29_58/0.12)]" : "text-muted hover:text-ink"
              }`}
            >
              {copy.paywall.billingToggle[b]}
            </button>
          ))}
        </div>
        {offer && billing === offer.appliesTo && (
          <p className="rounded-full bg-sun/40 px-4 py-1.5 text-center text-sm font-semibold text-ink">
            {offer.label}. Until {new Date(offer.endsAt).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}, first {offer.maxCustomers} customers.
          </p>
        )}
      </div>

      <ul className="mt-8 grid gap-5 md:grid-cols-3 md:items-stretch">
        {PLANS.map((p) => {
          const price = billing === "monthly" ? p.monthly : p.yearly;
          return (
            <li
              key={p.id}
              className={`relative flex flex-col rounded-[var(--radius)] bg-white p-6 ${
                p.highlighted
                  ? "shadow-[0_24px_60px_-24px_rgb(79_91_245/0.5)] ring-2 ring-accent md:-my-3 md:py-9"
                  : "ring-1 ring-line"
              }`}
            >
              {p.highlighted && (
                <span className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-1 text-xs font-bold text-white">Most picked</span>
              )}
              <h3 className="text-2xl font-semibold">{p.name}</h3>
              <p className="mt-1 min-h-[3rem] text-sm text-muted">{p.tagline}</p>
              <p className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-4xl font-semibold tabular-nums">{formatPrice(price)}</span>
                <span className="text-sm text-muted">/ month</span>
              </p>
              <p className="min-h-5 text-xs text-muted">
                {billing === "yearly" ? `${formatPrice(p.monthly * 10)} billed yearly, 2 months free` : "Billed monthly, before VAT"}
              </p>
              <ul className="mt-5 space-y-2.5 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2.5">
                    <Check />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-6">
                {mode === "checkout" ? (
                  <button
                    type="button"
                    onClick={() => checkout(p.id)}
                    disabled={busy !== null}
                    aria-busy={busy === p.id}
                    className={`btn w-full ${p.highlighted ? "btn-primary" : "btn-ghost"}`}
                  >
                    {busy === p.id ? "Opening secure checkout…" : ctaLabel ?? p.cta}
                  </button>
                ) : (
                  <Link href="/pricing" className={`btn w-full ${p.highlighted ? "btn-primary" : "btn-ghost"}`}>
                    {p.cta}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {error && (
        <p role="alert" className="mt-4 text-center text-sm font-semibold text-[#b4235a]">
          {error}
        </p>
      )}
    </div>
  );
}

function Check() {
  return (
    <svg className="mt-0.5 shrink-0 text-accent" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.12" />
      <path d="M7.5 12.5l3 3 6-6.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
