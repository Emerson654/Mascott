// Owned by Camille (SEO/GEO). Site-wide metadata + a helper every page can use.
import type { Metadata } from "next";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://mascotte.io").replace(/\/$/, "");
export const SITE_NAME = "Mascott";
export const SITE_TAGLINE = "AI mascots that guide your visitors";
/** One sentence used everywhere (directories, schema, llms.txt): keep it identical. */
export const SITE_DESCRIPTION =
  "Mascott is an AI onboarding guide with a face: a cute, customisable mascot that answers visitors from your content and points new users to their next step. Installed with one snippet.";
/** Bump when static pages change (sitemap lastModified). */
export const SITE_LAST_UPDATED = "2026-10-22";
export const OG_IMAGE = "/opengraph-image";
/** Fill in once the profiles exist (Organization.sameAs). Never list a profile that does not exist. */
export const SAME_AS: string[] = [];

export const absoluteUrl = (path = "/") => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export const siteMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: { default: `${SITE_NAME} - ${SITE_TAGLINE}`, template: `%s | ${SITE_NAME}` },
  description:
    "Create a cute AI mascot for your website or SaaS in minutes. It greets visitors, answers from your content and guides new users to activation.",
  keywords: [
    "AI mascot",
    "AI onboarding guide",
    "AI onboarding agent",
    "Intercom alternative",
    "Userpilot alternatives",
    "product tour software",
    "SaaS onboarding",
    "chatbot avatar",
    "AI agent for website",
  ],
  authors: [{ name: "Mascott team", url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    url: "/",
    title: `${SITE_NAME} - ${SITE_TAGLINE}`,
    description: "A cute AI guide that answers your visitors and walks new users to activation.",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Mascott: AI mascots that guide your visitors" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - ${SITE_TAGLINE}`,
    description: "A cute AI guide that answers your visitors and walks new users to activation.",
    images: [OG_IMAGE],
  },
  icons: { icon: "/favicon.ico" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
};

/**
 * Per-page metadata with canonical, Open Graph and Twitter filled in.
 * Usage: `export const metadata = pageMetadata({ title: "Pricing", description: "...", path: "/pricing" })`.
 * `title` goes through the "%s | Mascott" template.
 */
export function pageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  publishedTime,
  modifiedTime,
  keywords,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  keywords?: string[];
}): Metadata {
  const images = [{ url: image ?? OG_IMAGE, width: 1200, height: 630, alt: title }];
  return {
    title,
    description,
    ...(keywords?.length ? { keywords } : {}),
    alternates: { canonical: path },
    openGraph: {
      type,
      siteName: SITE_NAME,
      locale: "en_US",
      url: path,
      title,
      description,
      images,
      ...(type === "article" ? { publishedTime, modifiedTime, authors: ["Mascott team"] } : {}),
    },
    twitter: { card: "summary_large_image", title, description, images: [images[0].url] },
  };
}
