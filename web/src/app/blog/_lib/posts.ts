// Owned by Camille. Reads src/content/blog/*.md at build time (all blog pages are static).
import fs from "node:fs";
import path from "node:path";
import { PLANS, GUARANTEE_DAYS, formatPrice } from "@/lib/pricing";
import { markdownToHtml, type TocItem } from "./markdown";

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  keywords: string[];
  author: string;
};
export type Post = PostMeta & { body: string; html: string; toc: TocItem[]; wordCount: number; readingMinutes: number };

const DIR = path.join(process.cwd(), "src/content/blog");

/** Prices in posts are tokens ({{price:growth}}, {{guarantee}}) so they follow src/lib/pricing.ts. */
export function fillTokens(s: string): string {
  return s
    .replace(/\{\{price:(\w+)\}\}/g, (m, id: string) => {
      const plan = PLANS.find((p) => p.id === id);
      return plan ? formatPrice(plan.monthly) : m;
    })
    .replace(/\{\{plan:(\w+)\}\}/g, (m, id: string) => PLANS.find((p) => p.id === id)?.name ?? m)
    .replace(/\{\{guarantee\}\}/g, String(GUARANTEE_DAYS));
}

function parse(slug: string, raw: string): Post {
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(raw.replace(/\r\n/g, "\n"));
  if (!m) throw new Error(`Missing frontmatter in ${slug}.md`);
  const fm: Record<string, string> = {};
  for (const line of m[1].split("\n")) {
    const kv = /^(\w+):\s*(.*)$/.exec(line);
    if (kv) fm[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, "");
  }
  for (const k of ["title", "description", "date"]) if (!fm[k]) throw new Error(`${slug}.md: missing "${k}"`);
  const body = fillTokens(m[2]);
  const { html, toc } = markdownToHtml(body);
  const wordCount = body.split(/\s+/).filter(Boolean).length;
  return {
    slug,
    title: fm.title,
    description: fm.description,
    date: fm.date,
    updated: fm.updated || undefined,
    keywords: (fm.keywords ?? "").replace(/^\[|\]$/g, "").split(",").map((k) => k.trim().replace(/^["']|["']$/g, "")).filter(Boolean),
    author: fm.author || "Mascott team",
    body,
    html,
    toc,
    wordCount,
    readingMinutes: Math.max(1, Math.round(wordCount / 230)),
  };
}

let cache: Post[] | null = null;

/** All posts, newest first. */
export function getAllPosts(): Post[] {
  if (cache) return cache;
  cache = fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => parse(f.replace(/\.md$/, ""), fs.readFileSync(path.join(DIR, f), "utf8")))
    .sort((a, b) => b.date.localeCompare(a.date));
  return cache;
}

export const getPost = (slug: string) => getAllPosts().find((p) => p.slug === slug);
