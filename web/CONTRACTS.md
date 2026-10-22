# Team contracts for the Mascott website (web/)

Stack: Next.js 15 App Router, TypeScript, Tailwind v4, deployed on Vercel. Site language: English (SEO volume is US). No new dependency without a strong reason (ponytail): SVG + CSS for the mascots and the 3D carousel, fetch for APIs.

## File ownership (only edit your own files; ask the CEO for anything else)
| Owner | Files |
|---|---|
| Léa (brand) | `src/content/brand.ts`, `src/content/copy.ts`, `docs/brand.md` |
| Sacha (mascot engine) | `src/components/mascot/**`, `public/widget.js`, `src/app/widget-demo/**` |
| Chloé (front-end) | `src/app/page.tsx`, `src/app/create/**`, `src/app/pricing/**`, `src/app/success/**`, `src/app/globals.css`, `src/app/layout.tsx` (body/fonts/header/footer only), `src/components/site/**`, `src/components/landing/**`, `src/components/funnel/**` |
| Yanis (back-end) | `src/app/api/**`, `src/lib/server/**`, `.env.example` |
| Inès (pricing & Stripe) | `src/lib/pricing.ts`, `docs/stripe-setup.md` |
| Camille (SEO/GEO) | `src/lib/seo.ts`, `src/components/seo/**`, `src/app/blog/**`, `src/app/alternatives/**`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/content/blog/**`, `public/llms.txt`, `src/app/opengraph-image.tsx` |
| Victor (security) | read-only audit, fixes proposed to the CEO |

## Shared types (do not change without the CEO)
- `src/lib/mascot-spec.ts`: `MascotSpec`, `Mood`.
- `src/lib/funnel.ts`: `OnboardingData`, `GeneratedMascot`, localStorage keys.

## Component and API contracts
- `import { Mascot } from "@/components/mascot/Mascot"` → `<Mascot spec={MascotSpec} mood={Mood} size={number} onPoke?={() => void} className? />` renders an animated SVG mascot; `import { SpeechBubble } from "@/components/mascot/SpeechBubble"` → `<SpeechBubble text={string} />` with typing effect.
- `POST /api/generate` body `OnboardingData` → `GeneratedMascot` (Gemini if `GEMINI_API_KEY`, else xAI if `XAI_API_KEY`, else deterministic fallback; never fails).
- `POST /api/chat` body `{ mascot: GeneratedMascot, messages: {role:"user"|"assistant", content:string}[] }` → `{ reply: string }` (rate-limited, short answers, fallback canned replies).
- `POST /api/checkout` body `{ planId: string, billing: "monthly"|"yearly" }` → `{ url: string }` (Stripe Checkout when `STRIPE_SECRET_KEY` + price ids are set; else Payment Link env vars; else `{ url: "/pricing#pilot" }`).
- `POST /api/lead` body `{ email: string, company?: string, plan?: string, note?: string }` → `{ ok: true }` (forwards to `LEAD_WEBHOOK_URL` if set, else logs).
- `import { PLANS } from "@/lib/pricing"` → plans with `id, name, monthly, yearly, features[], highlighted?`.

## Pages
`/` landing (rotating gradient word, 3D mascot carousel with speech bubbles and poke reactions, prompt box → `/create?prompt=`), `/create` multi-step funnel, `/create/result` generated mascot live + chat demo + paywall, `/pricing`, `/success`, `/blog`, `/blog/[slug]`, `/alternatives/[slug]`, `/widget-demo`.
