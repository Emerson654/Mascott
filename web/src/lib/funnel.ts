// Shared contract: everything the creation funnel (/create) collects, sent to POST /api/generate.
import type { MascotSpec } from "./mascot-spec";

export interface OnboardingData {
  prompt: string;                 // what the visitor typed on the landing page
  company: { name: string; url: string; industry: string; description: string };
  audience: string;               // who visits the site
  goals: string[];                // e.g. "activate new users", "answer questions", "book demos"
  pages: string[];                // key pages / steps the mascot should guide to
  tone: "playful" | "friendly" | "professional" | "expert";
  behaviour: { greetOnArrival: boolean; proactiveTips: boolean; handoffEmail: string };
  actions: string[];              // "answer", "point", "open_page", "fill_form", "book_slot"
  languages: string[];
  mascot: Partial<MascotSpec> & { name?: string };
  /** Brand universe: what the AI designs the mascot around (no preset picking). */
  brand: {
    colors: string[];           // hex, up to 4 (picked or detected)
    vibe: string[];             // e.g. "playful", "premium", "techy", "warm"
    notes: string;              // free text: universe, references, things to avoid
    images: { name: string; dataUrl: string }[]; // up to 3 uploads, client-compressed JPEG <= 1024px, <= 400 KB each
    scan?: BrandScan;           // filled by POST /api/brand-scan
  };
}

export interface BrandScan {
  palette: string[];             // hex
  mood: string;                  // one sentence
  motifs: string[];              // shapes / objects / textures seen in the brand
  audience: string;
}

export interface GeneratedMascot {
  name: string;
  spec: MascotSpec;
  greeting: string;
  personality: string;            // 1-2 sentences
  sampleDialog: { q: string; a: string }[];
  systemPrompt: string;           // the agent prompt that would run on the customer's site
  source: "ai" | "fallback";
  /** 5-7 short "creative director" thoughts shown while the artwork renders (like an image model thinking). */
  thoughts: string[];
}

export const FUNNEL_STORAGE_KEY = "mascott.funnel.v1";
export const RESULT_STORAGE_KEY = "mascott.result.v1";
