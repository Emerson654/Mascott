// Funnel choices and the mascot's comments per step (front-end owned: copy.ts has no funnel text).
import type { OnboardingData } from "@/lib/funnel";
import { DEFAULT_SPEC, SPECIES, type MascotSpec, type Species } from "@/lib/mascot-spec";

export const STEPS = [
  { id: "idea", title: "Your mascot in one sentence", comment: "Hi. Describe me in one sentence and I'll take it from there." },
  { id: "company", title: "Your company", comment: "Tell me where I'll be working. I'll read your site so I can answer like a teammate." },
  { id: "audience", title: "Your visitors and goals", comment: "Who am I greeting, and what counts as a win? I'll steer every chat towards it." },
  { id: "pages", title: "Where should I guide people?", comment: "Give me the key pages or steps. I'll point people to the next one, one at a time." },
  { id: "style", title: "My look", comment: "Now the fun part. Pick my species, colours and outfit. I'll change as you click." },
  { id: "behaviour", title: "How I behave", comment: "Set my manners. You stay in control of what I say and do." },
  { id: "recap", title: "Ready when you are", comment: "Here's everything. Check it over, then let me come to life." },
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
export const EYES = ["round", "sparkle", "sleepy"] as const;

/** Body / belly / accent trios, drawn from the brand pastels. */
export const COLOURWAYS: { name: string; primary: string; secondary: string; accent: string }[] = [
  { name: "Periwinkle", primary: "#7C8CFF", secondary: "#E9ECFF", accent: "#FF9EC4" },
  { name: "Apricot", primary: "#FFB86B", secondary: "#FFF1DE", accent: "#FF8FA3" },
  { name: "Honey bear", primary: "#C89B7B", secondary: "#F6E6D8", accent: "#FF9EC4" },
  { name: "Lagoon", primary: "#5CC8C0", secondary: "#E3F7F5", accent: "#FFC46B" },
  { name: "Bubblegum", primary: "#FFB3D1", secondary: "#FFF0F6", accent: "#7C8CFF" },
  { name: "Steel", primary: "#9AA6C9", secondary: "#EEF1FA", accent: "#4FD1A5" },
  { name: "Mint", primary: "#7FD8A6", secondary: "#E6F8EE", accent: "#FF9EC4" },
  { name: "Lilac", primary: "#B79CFF", secondary: "#F1EBFF", accent: "#FFC46B" },
];

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
};

const COLOUR_WORDS: [RegExp, number][] = [
  [/blue|periwinkle|indigo|purple/i, 0],
  [/orange|apricot|peach|yellow/i, 1],
  [/brown|honey|beige/i, 2],
  [/teal|green|turquoise|aqua/i, 3],
  [/pink|rose/i, 4],
  [/grey|gray|silver|steel|metal/i, 5],
  [/mint/i, 6],
  [/lilac|lavender|violet/i, 7],
];

/** Read a species and colour hints out of the visitor's sentence, so the preview feels like it listened. */
export function guessSpec(prompt: string): Partial<MascotSpec> {
  const out: Partial<MascotSpec> = {};
  const words: Record<string, Species> = { kitten: "cat", kitty: "cat", rabbit: "bunny", bot: "robot", teddy: "bear", slime: "blob" };
  const lower = prompt.toLowerCase();
  const sp = SPECIES.find((s) => new RegExp(`\\b${s}`).test(lower)) ?? Object.entries(words).find(([w]) => new RegExp(`\\b${w}\\b`).test(lower))?.[1];
  if (sp) out.species = sp;
  const c = COLOUR_WORDS.find(([re]) => re.test(prompt));
  if (c) Object.assign(out, COLOURWAYS[c[1]]);
  if (/glasses|specs/i.test(prompt)) out.accessory = "glasses";
  else if (/headphone/i.test(prompt)) out.accessory = "headphones";
  else if (/scarf/i.test(prompt)) out.accessory = "scarf";
  else if (/crown/i.test(prompt)) out.accessory = "crown";
  else if (/\bbow\b/i.test(prompt)) out.accessory = "bow";
  else if (/\bhat\b/i.test(prompt)) out.accessory = "hat";
  if (/sleepy|calm|lazy/i.test(prompt)) out.eyes = "sleepy";
  if (/sober|serious|pro\b|professional|corporate/i.test(prompt)) out.style = "pro";
  return out;
}

export function specFor(data: OnboardingData): MascotSpec {
  const { name: _name, ...chosen } = data.mascot;
  void _name;
  return { ...DEFAULT_SPEC, ...guessSpec(data.prompt), ...chosen };
}
