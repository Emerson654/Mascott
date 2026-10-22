import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs, CreateCta } from "@/components/seo/ui";
import { getAllPosts } from "./_lib/posts";

export const metadata = pageMetadata({
  title: "Blog: SaaS onboarding, activation and AI guides",
  description:
    "Practical, honest guides on SaaS onboarding, trial activation, product tours and AI onboarding agents, plus fair comparisons of Intercom, Userpilot, Tidio and others.",
  path: "/blog",
});

const fmt = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

export default function BlogIndex() {
  const posts = getAllPosts();
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }]} />
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-[#1B1D3A] sm:text-5xl">The Mascott blog</h1>
      <p className="mt-4 max-w-2xl text-lg text-[#6B6F93]">
        How small SaaS teams get more trial users to their first win: onboarding, activation, product tours and AI guides.
        We say when a competitor is the better pick.
      </p>
      <ul className="mt-10 grid gap-5">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/blog/${p.slug}`}
              className="block rounded-2xl border border-[#e6e7f3] p-6 transition hover:border-[#7C8CFF] hover:shadow-[0_8px_30px_rgba(124,140,255,0.15)]"
            >
              <p className="text-sm text-[#6B6F93]">
                <time dateTime={p.date}>{fmt(p.date)}</time> · {p.readingMinutes} min read
              </p>
              <h2 className="mt-2 text-xl font-semibold text-[#1B1D3A]">{p.title}</h2>
              <p className="mt-2 text-[#6B6F93]">{p.description}</p>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-10 text-[#6B6F93]">
        Comparing tools? See our <Link href="/alternatives" className="text-[#4f5bd5] underline">side-by-side alternatives pages</Link>.
      </p>
      <CreateCta />
    </main>
  );
}
