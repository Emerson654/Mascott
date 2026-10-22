import "./globals.css";
import { Fredoka, Figtree } from "next/font/google";
import { siteMetadata } from "@/lib/seo";
import { brand } from "@/content/brand";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SiteJsonLd } from "@/components/seo/JsonLd";

export const metadata = siteMetadata;

const display = Fredoka({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-fredoka", display: "swap" });
const p = brand.palette;
const tokens = {
  "--ink": p.ink, "--muted": p.muted, "--soft": p.surface, "--accent": p.primary, "--sun": p.sun,
  "--g1": p.gradient[0], "--g2": p.gradient[1], "--g3": p.gradient[2],
  "--halo1": p.soft[0], "--halo2": p.soft[1], "--halo3": p.soft[2],
} as React.CSSProperties;

const body = Figtree({ subsets: ["latin"], variable: "--font-figtree", display: "swap" });

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`} style={tokens}>
      <body className="min-h-dvh flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded-full focus:shadow-lg"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <SiteJsonLd />
      </body>
    </html>
  );
}
