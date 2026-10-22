import { brand } from "@/content/brand";
import { Mascot } from "@/components/mascot/Mascot";
import { SpeechBubble } from "@/components/mascot/SpeechBubble";

/** A small drawn product screen: the mascot points at the exact button the user needs. */
export function ProductMoment() {
  const pip = brand.cast[0];
  if (!pip) return null;
  return (
    <div className="relative" aria-hidden>
      <div className="absolute -inset-6 rounded-[2.5rem] bg-halo1/70 blur-2xl" />
      <div className="relative overflow-hidden rounded-[1.5rem] bg-white shadow-[0_30px_70px_-30px_rgb(27_29_58/0.35)] ring-1 ring-line">
        <div className="flex items-center gap-1.5 border-b border-line px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF8FA3]" />
          <span className="h-2.5 w-2.5 rounded-full bg-sun" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#4FD1A5]" />
          <span className="ml-3 h-5 flex-1 rounded-full bg-soft" />
        </div>
        <div className="grid grid-cols-[5.5rem_1fr] sm:grid-cols-[7rem_1fr]">
          <div className="space-y-2.5 border-r border-line p-3">
            {[70, 55, 80, 60, 45].map((w, i) => (
              <span key={i} className="block h-2.5 rounded-full bg-soft" style={{ width: `${w}%` }} />
            ))}
          </div>
          <div className="relative p-4 pb-40 sm:p-5 sm:pb-40">
            <div className="flex items-center justify-between gap-3">
              <span className="h-3.5 w-28 rounded-full bg-ink/10" />
              <span className="relative rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-white shadow-[0_0_0_6px_rgb(255_211_110/0.6)]">
                Import CSV
              </span>
            </div>
            <div className="mt-5 space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl bg-soft/70 p-2.5">
                  <span className="h-6 w-6 rounded-full bg-halo2" />
                  <span className="h-2.5 flex-1 rounded-full bg-ink/10" />
                </div>
              ))}
            </div>
            <div className="absolute bottom-3 right-3 flex items-end gap-1 sm:bottom-4 sm:right-4">
              <div className="mb-16 w-44 sm:w-52">
                <SpeechBubble text={pip.lines[1] ?? ""} />
              </div>
              <div className="rounded-full bg-halo1">
                <Mascot spec={pip.spec} mood="point" size={96} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
