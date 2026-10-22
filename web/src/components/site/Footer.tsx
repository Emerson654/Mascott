import Link from "next/link";
import { copy } from "@/content/copy";
import { Logo } from "./Logo";

// Footer links come from copy.ts; "Alternatives" points at Camille's comparison pages.
const extra = [{ label: "Alternatives", href: "/alternatives" }];

export function Footer() {
  const links = [...copy.footer.links, ...extra.filter((e) => !copy.footer.links.some((l) => l.href === e.href))];
  return (
    <footer className="border-t border-line bg-soft/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_2fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted">{copy.footer.tagline}</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap content-start gap-x-6 gap-y-3 md:justify-end">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-semibold text-ink/80 hover:text-accent">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <p className="border-t border-line/70 px-4 py-5 text-center text-xs text-muted">{copy.footer.legal}</p>
    </footer>
  );
}
