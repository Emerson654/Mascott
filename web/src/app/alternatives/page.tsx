import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs, CreateCta } from "@/components/seo/ui";
import { ALTERNATIVES, CHECKED_ON } from "./_data";

export const metadata = pageMetadata({
  title: "Alternatives to Intercom, Tidio, Userpilot, Appcues and Chatbase",
  description:
    "Fair, sourced comparisons of Mascott with Intercom, Tidio, Userpilot, Appcues and Chatbase for small SaaS teams: reported prices, what each tool does best, and when to pick the competitor.",
  path: "/alternatives",
});

export default function AlternativesIndex() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Alternatives", path: "/alternatives" }]} />
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-[#1B1D3A] sm:text-5xl">Mascott vs the tools you already know</h1>
      <p className="mt-4 max-w-2xl text-lg text-[#6B6F93]">
        Mascott is an AI onboarding guide with a face for small SaaS teams. These pages compare it honestly with support chatbots
        and product tour tools, including when the other tool is the better pick. Competitor facts checked {CHECKED_ON}.
      </p>
      <ul className="mt-10 grid gap-5 sm:grid-cols-2">
        {ALTERNATIVES.map((a) => (
          <li key={a.slug}>
            <Link
              href={`/alternatives/${a.slug}`}
              className="block h-full rounded-2xl border border-[#e6e7f3] p-6 transition hover:border-[#7C8CFF] hover:shadow-[0_8px_30px_rgba(124,140,255,0.15)]"
            >
              <h2 className="text-xl font-semibold text-[#1B1D3A]">{a.name} alternative</h2>
              <p className="mt-2 text-[#6B6F93]">{a.metaDescription}</p>
            </Link>
          </li>
        ))}
      </ul>
      <CreateCta />
    </main>
  );
}
