// Owned by Camille (SEO/GEO). Site-wide metadata; refine freely.
import type { Metadata } from "next";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mascotte.io";
export const siteMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Mascott - AI mascots that guide your visitors", template: "%s | Mascott" },
  description: "Create a cute AI mascot for your website or SaaS in minutes. It greets visitors, answers from your content and guides new users to activation.",
};
