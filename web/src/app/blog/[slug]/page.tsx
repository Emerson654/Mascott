import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { JsonLd, blogPostingLd } from "@/components/seo/JsonLd";
import { Breadcrumbs, CreateCta, proseClass } from "@/components/seo/ui";
import { getAllPosts, getPost } from "../_lib/posts";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return pageMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    type: "article",
    publishedTime: post.date,
    modifiedTime: post.updated ?? post.date,
    keywords: post.keywords,
  });
}

const fmt = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

export default async function BlogPost({ params }: Props) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const path = `/blog/${post.slug}`;
  const related = getAllPosts().filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <JsonLd data={blogPostingLd({ ...post, path })} />
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }, { name: post.title, path }]} />

      <div className="mt-6 lg:grid lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-12">
        <article className="min-w-0 max-w-3xl">
          <header>
            <h1 className="text-3xl font-bold tracking-tight text-[#1B1D3A] sm:text-5xl sm:leading-[1.1]">{post.title}</h1>
            <p className="mt-4 text-lg text-[#6B6F93]">{post.description}</p>
            <p className="mt-4 text-sm text-[#6B6F93]">
              By {post.author} · Published <time dateTime={post.date}>{fmt(post.date)}</time>
              {post.updated && post.updated !== post.date && (
                <> · Updated <time dateTime={post.updated}>{fmt(post.updated)}</time></>
              )}{" "}
              · {post.readingMinutes} min read
            </p>
          </header>

          {post.toc.length > 2 && (
            <nav aria-label="Table of contents" className="mt-8 rounded-2xl bg-[#f6f7ff] p-5 lg:hidden">
              <p className="font-semibold text-[#1B1D3A]">On this page</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-[15px]">
                {post.toc.map((t) => (
                  <li key={t.id}><a href={`#${t.id}`} className="text-[#4f5bd5] hover:underline">{t.text}</a></li>
                ))}
              </ol>
            </nav>
          )}

          <div className={`mt-8 ${proseClass}`} dangerouslySetInnerHTML={{ __html: post.html }} />

          <CreateCta />

          {related.length > 0 && (
            <section aria-labelledby="related" className="mt-4">
              <h2 id="related" className="text-xl font-bold text-[#1B1D3A]">Keep reading</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/blog/${r.slug}`} className="block h-full rounded-2xl border border-[#e6e7f3] p-4 text-[15px] font-medium text-[#1B1D3A] hover:border-[#7C8CFF]">
                      {r.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>

        {post.toc.length > 2 && (
          <aside className="hidden lg:block">
            <nav aria-label="Table of contents" className="sticky top-24 text-sm">
              <p className="font-semibold text-[#1B1D3A]">On this page</p>
              <ol className="mt-3 space-y-2 border-l border-[#e6e7f3] pl-4">
                {post.toc.map((t) => (
                  <li key={t.id}><a href={`#${t.id}`} className="text-[#6B6F93] hover:text-[#1B1D3A]">{t.text}</a></li>
                ))}
              </ol>
              <Link href="/create" className="mt-6 inline-flex rounded-full bg-[#1B1D3A] px-4 py-2 font-semibold text-white">
                Create your mascot
              </Link>
            </nav>
          </aside>
        )}
      </div>
    </main>
  );
}
