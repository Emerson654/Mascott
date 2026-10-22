"use client";

type MascottApi = { pointAt: (selector: string, text?: string) => boolean; say: (text: string) => void; open: () => void };

const STEPS: { label: string; run: (m: MascottApi) => void }[] = [
  { label: "Point at “New report”", run: (m) => m.pointAt("#new-report", "Start here: create your first report!") },
  { label: "Point at “Invite team”", run: (m) => m.pointAt("#invite-team", "Reports are better together. Invite a teammate.") },
  { label: "Point at something missing", run: (m) => m.pointAt("#does-not-exist") },
  { label: "Open the chat", run: (m) => m.open() },
];

export function DemoControls() {
  const call = (run: (m: MascottApi) => void) => {
    const m = (window as unknown as { Mascott?: MascottApi }).Mascott;
    if (m) run(m);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {STEPS.map((s) => (
        <button
          key={s.label}
          type="button"
          onClick={() => call(s.run)}
          className="rounded-full border border-[#2B2340]/10 bg-white px-4 py-2 text-sm font-medium text-[#2B2340] shadow-sm transition active:scale-95 hover:bg-[#F3F1FA]"
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
