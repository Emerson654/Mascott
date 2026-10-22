"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { RESULT_STORAGE_KEY, type GeneratedMascot } from "@/lib/funnel";
import type { Mood } from "@/lib/mascot-spec";
import { GUARANTEE_DAYS } from "@/lib/pricing";
import { copy } from "@/content/copy";
import { Mascot } from "@/components/mascot/Mascot";
import { SpeechBubble } from "@/components/mascot/SpeechBubble";
import { PlanCards } from "@/components/site/PlanCards";
import { LeadForm } from "@/components/site/LeadForm";

const MAX_USER_MESSAGES = 6;
type Msg = { role: "user" | "assistant"; content: string };

export function Result() {
  const [m, setM] = useState<GeneratedMascot | null | undefined>(undefined);
  const [mood, setMood] = useState<Mood>("wave");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RESULT_STORAGE_KEY);
      setM(raw ? (JSON.parse(raw) as GeneratedMascot) : null);
    } catch {
      setM(null);
    }
    const t = window.setTimeout(() => setMood("idle"), 2200);
    return () => window.clearTimeout(t);
  }, []);

  if (m === undefined) return <div className="min-h-[80dvh]" />;

  if (!m) {
    return (
      <div className="hero-glow flex min-h-[70dvh] flex-col items-center justify-center px-4 text-center">
        <h1 className="text-4xl font-semibold">No mascot here yet</h1>
        <p className="mt-3 max-w-md text-muted">Create one in a couple of minutes. Your answers are saved as you go.</p>
        <Link href="/create" className="btn btn-primary mt-8">
          {copy.hero.cta}
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* The mascot, alive */}
      <section className="hero-glow px-4 pb-16 pt-10 sm:px-6">
        <div className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-[1fr_1.05fr]">
          <div className="flex flex-col items-center text-center">
            <div className="w-full max-w-sm">
              <SpeechBubble text={m.greeting} className="!max-w-sm" />
            </div>
            <div className="relative mt-4">
              <span aria-hidden className="absolute inset-[6%] -z-10 rounded-full bg-halo1 blur-xl" />
              <span aria-hidden className="absolute inset-[22%] -right-[10%] -z-10 rounded-full bg-halo2 blur-2xl" />
              <Mascot spec={m.spec} mood={mood} size={260} label={m.name} onPoke={() => setMood("happy")} />
            </div>
            <h1 className="mt-4 text-[clamp(2.5rem,6vw,4rem)] font-semibold leading-none">
              Meet {m.name}
            </h1>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-ink/80">{m.personality}</p>
            <p className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
              <Link href="/create" className="font-semibold text-accent underline">
                Tweak her answers
              </Link>
              <a href="#activate" className="font-semibold text-accent underline">
                Put her live
              </a>
            </p>
          </div>
          <ChatDemo mascot={m} onMood={setMood} />
        </div>
      </section>

      <Paywall mascot={m} />
    </>
  );
}

function ChatDemo({ mascot, onMood }: { mascot: GeneratedMascot; onMood: (m: Mood) => void }) {
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "assistant", content: mascot.greeting }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const userCount = msgs.filter((x) => x.role === "user").length;
  const done = userCount >= MAX_USER_MESSAGES;
  const suggestions = mascot.sampleDialog.map((d) => d.q).filter((q) => !msgs.some((x) => x.content === q));

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [msgs, busy]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy || done) return;
    const nextMsgs: Msg[] = [...msgs, { role: "user", content }];
    setMsgs(nextMsgs);
    setInput("");
    setBusy(true);
    onMood("think");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mascot, messages: nextMsgs }),
      });
      const data = (await res.json().catch(() => ({}))) as { reply?: string };
      // 429 carries a friendly reply too: show it as-is.
      const reply = data.reply || "I lost my train of thought. Could you ask that again?";
      setMsgs((x) => [...x, { role: "assistant", content: reply }]);
      onMood("talk");
    } catch {
      setMsgs((x) => [...x, { role: "assistant", content: "My connection hiccuped. Could you ask that again?" }]);
      onMood("surprised");
    } finally {
      setBusy(false);
      window.setTimeout(() => onMood("idle"), 2400);
    }
  }

  return (
    <section aria-label={`Chat with ${mascot.name}`} className="flex h-[32rem] flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-[0_30px_70px_-30px_rgb(27_29_58/0.35)] ring-1 ring-line">
      <header className="flex items-center gap-3 border-b border-line px-4 py-3">
        <Mascot spec={mascot.spec} mood="idle" size={40} label={mascot.name} />
        <div>
          <p className="font-display text-lg font-semibold leading-tight">{mascot.name}</p>
          <p className="text-xs text-muted">Live demo · {MAX_USER_MESSAGES - userCount} questions left</p>
        </div>
      </header>
      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
        {msgs.map((x, i) => (
          <div key={i} className={`flex ${x.role === "user" ? "justify-end" : "justify-start"}`}>
            <p
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[15px] leading-snug ${
                x.role === "user" ? "rounded-br-md bg-accent text-white" : "rounded-bl-md bg-soft text-ink"
              }`}
            >
              {x.content}
            </p>
          </div>
        ))}
        {busy && (
          <div className="flex gap-1.5 px-2 py-2" aria-label={`${mascot.name} is typing`}>
            <span className="dot h-2 w-2 rounded-full bg-muted" />
            <span className="dot h-2 w-2 rounded-full bg-muted [animation-delay:150ms]" />
            <span className="dot h-2 w-2 rounded-full bg-muted [animation-delay:300ms]" />
          </div>
        )}
        {done && (
          <div className="rounded-2xl bg-halo3 p-4 text-sm">
            <p className="font-semibold">That&rsquo;s the end of the demo.</p>
            <p className="mt-1">Want {mascot.name} to keep answering on your real site?</p>
            <a href="#activate" className="mt-3 inline-block font-bold text-accent underline">
              Activate {mascot.name}
            </a>
          </div>
        )}
      </div>
      {!done && suggestions.length > 0 && userCount < 2 && (
        <div className="flex gap-2 overflow-x-auto px-4 pb-2">
          {suggestions.slice(0, 3).map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => send(q)}
              disabled={busy}
              className="shrink-0 rounded-full bg-white px-3 py-1.5 text-sm font-medium ring-1 ring-line hover:ring-g1"
            >
              {q}
            </button>
          ))}
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2 border-t border-line p-3"
      >
        <label htmlFor="chat-input" className="sr-only">
          Ask {mascot.name} a question
        </label>
        <input
          id="chat-input"
          className="field !rounded-full"
          placeholder={done ? "Demo finished" : `Ask ${mascot.name} anything`}
          value={input}
          maxLength={300}
          disabled={done}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="btn btn-ghost !w-12 !p-0" disabled={busy || done || !input.trim()} aria-label="Send">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M4 12l16-8-6 16-2.5-6.5L4 12z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        </button>
      </form>
    </section>
  );
}

function Paywall({ mascot }: { mascot: GeneratedMascot }) {
  const p = copy.paywall;
  const fakeCode = `<script src="https://cdn.mascotte.io/widget.js"\n  data-mascot="${mascot.name.toLowerCase().replace(/[^a-z0-9]/g, "")}-k3f9a2"\n  data-site="your-site-id"\n  async></script>`;
  return (
    <section id="activate" className="scroll-mt-20 bg-soft px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-[clamp(2rem,4.5vw,3.25rem)] font-semibold leading-[1.08]">Activate {mascot.name} on your site</h2>
            <p className="mt-4 text-lg leading-relaxed text-ink/80">{p.subtitle}</p>
            <ul className="mt-6 space-y-3">
              {p.why.map((w) => (
                <li key={w} className="flex gap-3">
                  <span aria-hidden className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-sun ring-4 ring-halo3" />
                  <span className="text-ink/85">{w}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Locked install code */}
          <div className="relative min-h-72 overflow-hidden rounded-[1.5rem] bg-[#1B1D3A] p-6 shadow-[0_30px_70px_-30px_rgb(27_29_58/0.6)]">
            <p className="mb-3 font-mono text-xs text-white/50">Your install code</p>
            <pre aria-hidden className="select-none overflow-hidden whitespace-pre-wrap break-all font-mono text-sm leading-relaxed text-[#C9D1FF] blur-[5px]">
              {fakeCode}
            </pre>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#1B1D3A]/40 p-6 text-center">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white shadow-lg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <rect x="5" y="11" width="14" height="9" rx="2.5" stroke="#1B1D3A" strokeWidth="2" />
                  <path d="M8 11V8a4 4 0 018 0v3" stroke="#1B1D3A" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              <p className="font-semibold text-white">Unlocks when you pick a plan</p>
              <a href="#plans" className="btn btn-primary">
                {p.cta}
              </a>
            </div>
          </div>
        </div>

        <div id="plans" className="mt-16 scroll-mt-24">
          <h3 className="text-center text-3xl font-semibold">{p.title}</h3>
          <div className="mt-8">
            <PlanCards />
          </div>
          <p className="mt-4 text-center text-sm text-muted">{p.ctaNote}</p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
          <div className="flex gap-4 rounded-[var(--radius)] bg-white p-6 ring-1 ring-line">
            <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-halo3 font-display text-lg font-semibold">
              {GUARANTEE_DAYS}
            </span>
            <div>
              <h3 className="text-xl font-semibold">{p.guarantee.title}</h3>
              <p className="mt-1 text-ink/75">{p.guarantee.text}</p>
            </div>
          </div>
          <div className="rounded-[var(--radius)] bg-white p-6 ring-1 ring-line">
            <h3 className="text-xl font-semibold">{p.leadFallback.title}</h3>
            <p className="mb-4 mt-1 text-ink/75">{p.leadFallback.text}</p>
            <LeadForm id="save" cta={p.leadFallback.cta} note={`Saved mascot: ${mascot.name}`} success={`Saved. We'll keep ${mascot.name} warm for you.`} />
          </div>
        </div>
      </div>
    </section>
  );
}
