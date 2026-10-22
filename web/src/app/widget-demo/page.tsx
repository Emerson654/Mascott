import type { Metadata } from "next";
import Script from "next/script";
import { DemoControls } from "./DemoControls";

export const metadata: Metadata = {
  title: "Widget demo",
  description: "See the Mascott widget live on a sample SaaS dashboard: greeting, chat and guided pointing.",
  robots: { index: false },
};

const SPEC = { species: "fox", primary: "#FF8A4C", secondary: "#FFF4EA", accent: "#FF7A9A", eyes: "sparkle", accessory: "scarf", style: "cute" };
const SNIPPET = `<script src="https://mascotte.io/widget.js"
  data-mascot='${JSON.stringify(SPEC)}'
  data-name="Pip" data-greeting="Hi! I'm Pip. Want a quick tour?"></script>`;

const KPIS = [
  { k: "Active users", v: "1,284", d: "+12%" },
  { k: "Reports created", v: "0", d: "Get started" },
  { k: "Avg. session", v: "6m 12s", d: "+4%" },
];

export default function WidgetDemoPage() {
  return (
    <div className="min-h-screen bg-[#F6F5FB] text-[#2B2340]">
      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
        <aside className="hidden w-52 shrink-0 flex-col gap-1 rounded-3xl bg-white p-4 shadow-sm md:flex">
          <div className="mb-4 flex items-center gap-2 text-lg font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#2B2340] text-white">A</span> Acmetrics
          </div>
          {["Dashboard", "Reports", "Data sources", "Team", "Settings"].map((x, i) => (
            <span key={x} className={"rounded-xl px-3 py-2 text-sm " + (i === 0 ? "bg-[#F3F1FA] font-semibold" : "text-[#2B2340]/70")}>{x}</span>
          ))}
        </aside>

        <main className="min-w-0 flex-1 space-y-6">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-[#2B2340]/60">Sample SaaS: this whole page is fake, the mascot is real.</p>
              <h1 className="text-2xl font-bold tracking-tight">Welcome back, Sam</h1>
            </div>
            <div className="flex gap-2">
              <button id="invite-team" type="button" className="rounded-full border border-[#2B2340]/15 bg-white px-4 py-2 text-sm font-semibold">Invite team</button>
              <button id="new-report" type="button" className="rounded-full bg-[#2B2340] px-4 py-2 text-sm font-semibold text-white">+ New report</button>
            </div>
          </header>

          <section className="grid gap-4 sm:grid-cols-3">
            {KPIS.map((x) => (
              <div key={x.k} className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm text-[#2B2340]/60">{x.k}</p>
                <p className="mt-1 text-3xl font-bold tracking-tight">{x.v}</p>
                <p className="mt-1 text-xs font-medium text-emerald-600">{x.d}</p>
              </div>
            ))}
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-sm">
            <h2 className="font-semibold">Try the mascot</h2>
            <p className="mb-4 mt-1 text-sm text-[#2B2340]/60">
              Click the fox in the corner to chat, or drive it with <code className="rounded bg-[#F3F1FA] px-1">window.Mascott.pointAt(selector)</code>.
            </p>
            <DemoControls />
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-sm">
            <h2 className="font-semibold">Install on your site</h2>
            <p className="mb-3 mt-1 text-sm text-[#2B2340]/60">One line before <code>&lt;/body&gt;</code>. No build step, no CSS conflicts (Shadow DOM).</p>
            <pre className="overflow-x-auto rounded-2xl bg-[#2B2340] p-4 text-xs leading-relaxed text-[#F3F1FA]">{SNIPPET}</pre>
          </section>

          <section className="h-64 rounded-3xl border-2 border-dashed border-[#2B2340]/10 p-5 text-sm text-[#2B2340]/40">Chart placeholder</section>
        </main>
      </div>

      <Script
        src="/widget.js"
        strategy="afterInteractive"
        data-mascot={JSON.stringify(SPEC)}
        data-name="Pip"
        data-greeting="Hi! I'm Pip. Want a quick tour? Tap me!"
      />
    </div>
  );
}
