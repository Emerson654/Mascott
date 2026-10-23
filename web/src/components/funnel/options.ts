// Funnel choices and the guide's comments per step (front-end owned: copy.ts has no funnel text).
import type { OnboardingData } from "@/lib/funnel";

// The comments are spoken by Mascott's own little guide, never by the visitor's mascot (that one stays a surprise).
export const STEPS = [
  { id: "idea", title: "Your mascot in one sentence", comment: "Hi, I'm the Mascott guide. Give me a rough idea and our designer will take it from there." },
  { id: "company", title: "Your company", comment: "Where will your mascot work? A few words help it answer like a teammate." },
  { id: "audience", title: "Your visitors and goals", comment: "Who gets greeted, and what counts as a win? Every chat will steer towards it." },
  { id: "pages", title: "Where should people be guided?", comment: "List the key pages or steps. Your mascot will point to the next one, one at a time." },
  { id: "brand", title: "Your brand universe", comment: "No presets here. Show us your world and we design a one-of-a-kind character around it." },
  { id: "behaviour", title: "Manners", comment: "Set the house rules. You stay in control of what it says and does." },
  { id: "recap", title: "Ready when you are", comment: "That's everything. No peeking: you'll meet your mascot in a moment." },
] as const;

export const AUDIENCES = ["New trial users", "Paying customers", "Website visitors", "Developers", "Internal team"];
export const GOALS = ["Activate new users", "Answer product questions", "Book demos", "Reduce support tickets", "Explain pricing", "Collect feedback"];
export const INDUSTRIES = ["SaaS / B2B software", "Developer tools", "E-commerce", "Fintech", "Education", "Health", "Agency", "Other"];
export const TONES: { id: OnboardingData["tone"]; label: string; hint: string }[] = [
  { id: "playful", label: "Playful", hint: "Light jokes, lots of warmth" },
  { id: "friendly", label: "Friendly", hint: "Warm and clear" },
  { id: "professional", label: "Professional", hint: "Calm, to the point" },
  { id: "expert", label: "Expert", hint: "Precise, a bit technical" },
];
export const ACTIONS: { id: string; label: string }[] = [
  { id: "answer", label: "Answer questions from my content" },
  { id: "point", label: "Point at buttons and fields" },
  { id: "open_page", label: "Suggest the next page" },
  { id: "fill_form", label: "Explain forms, field by field" },
  { id: "book_slot", label: "Offer a demo slot" },
];
export const LANGUAGES = ["English", "French", "Spanish", "German", "Italian", "Portuguese", "Dutch"];
/** Brand step: provisional text (Léa's copy.ts has no funnel text yet). */
export const BRAND_TEXT = {
  intro: "Colours, mood, a logo or a product shot. The more we see, the more it feels like yours. Everything is optional.",
  colorsLegend: "Brand colours",
  colorsHint: "Up to 4. Tap a suggestion or pick your own.",
  vibeLegend: "Vibe",
  notesLabel: "Anything else?",
  notesPlaceholder: "Our world is cosy and nordic. Think Studio Ghibli, not corporate. Please avoid robots.",
  dropTitle: "Drop up to 3 photos",
  dropHint: "Logo, product, moodboard. JPG or PNG, we shrink them for you.",
  dropButton: "Choose photos",
  spotted: "We spotted these colours in your logo",
  useSpotted: "Use these",
};

export const VIBES = ["Playful", "Warm", "Calm", "Premium", "Techy", "Bold", "Minimal", "Quirky", "Cosy", "Futuristic"];
export const COLOR_SUGGESTIONS = ["#4F5BF5", "#FF6B6B", "#FFB84D", "#2BB673", "#00A3FF", "#8B5CF6", "#FF7AB6", "#1B1D3A"];
export const MAX_COLORS = 4;

export const EMPTY_DATA: OnboardingData = {
  prompt: "",
  company: { name: "", url: "", industry: "", description: "" },
  audience: "",
  goals: [],
  pages: [""],
  tone: "friendly",
  behaviour: { greetOnArrival: true, proactiveTips: true, handoffEmail: "" },
  actions: ["answer", "point", "open_page"],
  languages: ["English"],
  mascot: {},
  brand: { colors: [], vibe: [], notes: "", images: [] },
};
