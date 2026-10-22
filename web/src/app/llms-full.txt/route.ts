// Owned by Camille. /llms-full.txt: the full Markdown of every article, for AI assistants. Static at build time.
import { absoluteUrl } from "@/lib/seo";
import { getAllPosts } from "../blog/_lib/posts";

export const dynamic = "force-static";

export function GET() {
  const body = [
    "# Mascott: full articles",
    "",
    `> Index: ${absoluteUrl("/llms.txt")}`,
    "",
    ...getAllPosts().map((p) => `---\n\n# ${p.title}\n\nURL: ${absoluteUrl(`/blog/${p.slug}`)}\nPublished: ${p.date}${p.updated ? ` (updated ${p.updated})` : ""}\n\n${p.body.trim()}\n`),
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
