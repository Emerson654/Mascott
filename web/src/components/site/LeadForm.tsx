"use client";

import { useState } from "react";

/** Email capture → POST /api/lead. Includes the "website" honeypot the API expects to stay empty. */
export function LeadForm({
  cta,
  plan,
  note,
  withCompany = false,
  success = "Thanks. We'll be in touch by email.",
  id = "lead",
}: {
  cta: string;
  plan?: string;
  note?: string;
  withCompany?: boolean;
  success?: string;
  id?: string;
}) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState("busy");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(f.get("email") ?? "").trim(),
          company: String(f.get("company") ?? "").trim() || undefined,
          plan,
          note,
          website: String(f.get("website") ?? ""),
        }),
      });
      if (!res.ok) throw new Error();
      setState("done");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p role="status" className="rounded-2xl bg-halo1 px-4 py-3 font-semibold">
        {success}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className="flex flex-col gap-2 sm:flex-row">
        {withCompany && (
          <>
            <label htmlFor={`${id}-company`} className="sr-only">
              Company
            </label>
            <input id={`${id}-company`} name="company" className="field sm:max-w-48" placeholder="Company" autoComplete="organization" />
          </>
        )}
        <label htmlFor={`${id}-email`} className="sr-only">
          Work email
        </label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          required
          inputMode="email"
          autoComplete="email"
          placeholder="you@company.com"
          className="field"
        />
        {/* Honeypot: humans never see or fill this. */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          defaultValue=""
          className="absolute -left-[9999px] h-px w-px opacity-0"
        />
        <button type="submit" className="btn btn-ghost shrink-0" disabled={state === "busy"} aria-busy={state === "busy"}>
          {state === "busy" ? "Saving…" : cta}
        </button>
      </div>
      {state === "error" && (
        <p role="alert" className="mt-2 text-sm font-semibold text-[#b4235a]">
          That didn&rsquo;t go through. Check the address and try again.
        </p>
      )}
    </form>
  );
}
