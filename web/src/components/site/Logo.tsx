import Link from "next/link";
import { brand } from "@/content/brand";
import { DEFAULT_SPEC } from "@/lib/mascot-spec";
import { Mascot } from "@/components/mascot/Mascot";

export function Logo() {
  const spec = DEFAULT_SPEC; // the Mascott blob: stable, whatever the cast order
  return (
    <Link href="/" className="group inline-flex items-center gap-2 rounded-full pr-2" aria-label={`${brand.name} home`}>
      <span aria-hidden className="inline-block transition-transform duration-300 group-hover:-rotate-6">
        <Mascot spec={spec} mood="idle" size={34} />
      </span>
      <span className="font-display text-xl font-semibold tracking-tight">{brand.name}</span>
    </Link>
  );
}
