import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/content/brand";
import { Mascot } from "@/components/mascot/Mascot";
import { SpeechBubble } from "@/components/mascot/SpeechBubble";

export const metadata: Metadata = { title: "Welcome aboard", robots: { index: false, follow: false } };

const NEXT_STEPS = [
  { title: "Check your inbox", text: "Your receipt and your install code are on their way from Stripe and from us." },
  { title: "Paste one line", text: "Add the script tag to your app, or add it through Google Tag Manager. It starts in private preview." },
  { title: "Go live", text: "When you're happy with her, flip her on for your users. Reply to our email if you want a hand." },
];

export default function SuccessPage() {
  const m = brand.cast[0];
  return (
    <section className="hero-glow px-4 pb-24 pt-14 sm:px-6">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        {m && (
          <>
            <SpeechBubble text="We're live soon. I can't wait to meet your users." />
            <div className="relative mt-3">
              <span aria-hidden className="absolute inset-[8%] -z-10 rounded-full bg-halo1 blur-md" />
              <Mascot spec={m.spec} mood="happy" size={180} label={m.name} />
            </div>
          </>
        )}
        <h1 className="mt-6 text-[clamp(2.5rem,6vw,4rem)] font-semibold leading-[1.05]">Thank you. Welcome aboard.</h1>
        <p className="mt-4 max-w-lg text-lg text-muted">Your payment went through. Here&rsquo;s what happens next.</p>
      </div>
      <ol className="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-3">
        {NEXT_STEPS.map((s, i) => (
          <li key={s.title} className="rounded-[var(--radius)] bg-white p-6 ring-1 ring-line">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sun font-display text-xl font-semibold">{i + 1}</span>
            <h2 className="mt-4 text-xl font-semibold">{s.title}</h2>
            <p className="mt-1 text-ink/75">{s.text}</p>
          </li>
        ))}
      </ol>
      <p className="mt-12 flex flex-wrap justify-center gap-3">
        <Link href="/widget-demo" className="btn btn-primary">See the live demo</Link>
        <Link href="/" className="btn btn-ghost">Back home</Link>
      </p>
    </section>
  );
}
