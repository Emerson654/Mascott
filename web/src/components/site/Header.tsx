import Link from "next/link";
import { copy } from "@/content/copy";
import { Logo } from "./Logo";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-white/75 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2">
          <Link href="/pricing" className="rounded-full px-3 py-2 text-sm font-semibold text-muted hover:text-ink">
            Pricing
          </Link>
          <Link href="/blog" className="hidden rounded-full px-3 py-2 text-sm font-semibold text-muted hover:text-ink sm:inline-block">
            Blog
          </Link>
          <Link href="/create" className="btn btn-ghost !min-h-10 !px-4 text-sm">
            {copy.hero.cta}
          </Link>
        </nav>
      </div>
    </header>
  );
}
