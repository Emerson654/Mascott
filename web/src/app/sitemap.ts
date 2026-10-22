import type { MetadataRoute } from "next";
import { SITE_LAST_UPDATED, absoluteUrl } from "@/lib/seo";
import { getAllPosts } from "./blog/_lib/posts";
import { ALTERNATIVES } from "./alternatives/_data";

// Only public, indexable pages. /create/result, /success and /api are user-specific (see robots.ts).
const STATIC_PATHS = ["/", "/create", "/pricing", "/blog", "/alternatives"];

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const site = new Date(SITE_LAST_UPDATED);
  return [
    ...STATIC_PATHS.map((p) => ({ url: absoluteUrl(p), lastModified: site })),
    ...ALTERNATIVES.map((a) => ({ url: absoluteUrl(`/alternatives/${a.slug}`), lastModified: site })),
    ...posts.map((p) => ({ url: absoluteUrl(`/blog/${p.slug}`), lastModified: new Date(p.updated ?? p.date) })),
  ];
}
