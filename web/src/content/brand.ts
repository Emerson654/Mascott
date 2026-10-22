// Owned by Léa (brand). Source of truth for the look and the demo cast. Rationale: docs/brand.md.
import type { MascotSpec } from "@/lib/mascot-spec";

export interface CastMember { id: string; name: string; role: string; spec: MascotSpec; lines: string[]; reactions: string[] }

export const brand = {
  name: "Mascott",
  domain: "mascotte.io",
  // Hero reads: "Give your product a <rotating word>". The rotating word gets the gradient.
  heroPrefix: "Give your product a",
  rotatingWords: [
    "friendly guide",
    "onboarding buddy",
    "patient tour guide",
    "cute sidekick",
    "docs expert",
    "always-on helper",
  ],
  heroSubtitle:
    "A cute AI mascot that welcomes new users, answers from your docs and points to the next step. Paste one line of code and she is live on your site.",
  palette: {
    bg: "#FFFFFF",        // the page stays white and bright
    surface: "#F6F5FF",   // cards, prompt box, sections (lavender cloud)
    ink: "#1B1D3A",       // text, 16.4:1 on white
    muted: "#6B6F93",     // secondary text, 4.9:1 on white
    primary: "#4F5BF5",   // buttons and links, white text on it 5.1:1
    sun: "#FFD36E",       // highlights, step numbers, badges (never text on white)
    // Gradient for the rotating hero word. Every stop is >= 3:1 on white (large-text AA).
    gradient: ["#4F5BF5", "#D94E9A", "#E8742A"],
    // Pastel halos behind mascots and section blobs (backgrounds only, never text).
    soft: ["#E9ECFF", "#FFE3F1", "#FFF1DE"],
  },
  fonts: { display: "Fredoka", body: "Figtree" }, // Google Fonts; see docs/brand.md
  cast: [
    {
      id: "pip",
      name: "Pip",
      role: "Onboarding guide for a CRM",
      spec: { species: "blob", primary: "#7C8CFF", secondary: "#E9ECFF", accent: "#FF9EC4", eyes: "round", accessory: "headphones", style: "cute" },
      lines: [
        "Hi Sam! Want me to help you import your first contacts?",
        "The CSV button is right here, top right. Drop your file on it.",
        "Nice, 212 contacts in. Next step: create your first deal.",
        "Stuck? Ask me anything. I've read all the docs so you don't have to.",
      ],
      reactions: ["Boop received.", "Hehe, that tickles!", "I'm working, I promise.", "Again? Okay, one more."],
    },
    {
      id: "miso",
      name: "Miso",
      role: "Docs helper for a developer API",
      spec: { species: "cat", primary: "#FFB86B", secondary: "#FFF1DE", accent: "#FF8FA3", eyes: "sparkle", accessory: "glasses", style: "pro" },
      lines: [
        "Looking for your API key? Settings, then Developers. I'll highlight it.",
        "Rate limit is in the docs: 100 requests a minute on your plan.",
        "Here's the Node snippet for that endpoint. Copy, paste, done.",
        "Got a 401? Your key is probably missing the Bearer prefix.",
      ],
      reactions: ["Purr... I mean, hello.", "Careful, these glasses were expensive.", "Mrrp?", "I'll allow one more pet."],
    },
    {
      id: "bramble",
      name: "Bramble",
      role: "Setup coach for an invoicing app",
      spec: { species: "bear", primary: "#C89B7B", secondary: "#F6E6D8", accent: "#FF9EC4", eyes: "round", accessory: "scarf", style: "cute" },
      lines: [
        "Welcome in! Three steps and your first invoice goes out.",
        "First, add your logo. It's the empty square, just here.",
        "Billing an EU client? I can add the VAT mention your docs recommend.",
        "All set. Hit Send when you're ready, I'll keep watch.",
      ],
      reactions: ["Bear hug incoming.", "Oof, cozy.", "Is it nap time?", "Pat accepted."],
    },
    {
      id: "juno",
      name: "Juno",
      role: "Analytics explainer for a dashboard tool",
      spec: { species: "owl", primary: "#5CC8C0", secondary: "#E3F7F5", accent: "#FFC46B", eyes: "round", accessory: "none", style: "pro" },
      lines: [
        "That dip on Tuesday? Your tracking script was paused for six hours.",
        "Want a weekly report by email? The toggle is under Alerts.",
        "Tip: drag this chart onto your home board to pin it.",
        "Retention means users who came back within 30 days. Want the formula?",
      ],
      reactions: ["Hoo! You startled me.", "Feathers ruffled.", "Wise choice. Hoo.", "I saw that coming."],
    },
    {
      id: "biscuit",
      name: "Biscuit",
      role: "Booking assistant for a scheduling app",
      spec: { species: "bunny", primary: "#FFB3D1", secondary: "#FFF0F6", accent: "#7C8CFF", eyes: "sparkle", accessory: "bow", style: "cute" },
      lines: [
        "Let's connect your calendar first. Google or Outlook?",
        "Your booking link is ready. Copy it from the pink button.",
        "Want buffer time between meetings? Ten minutes is the most popular.",
        "Someone just booked Thursday at 3 pm. Want a reminder set?",
      ],
      reactions: ["Boing!", "My ears are not buttons.", "Hop hop, hello!", "Okay, that was fun."],
    },
    {
      id: "bolt",
      name: "Bolt",
      role: "Integration helper for a no-code platform",
      spec: { species: "robot", primary: "#9AA6C9", secondary: "#EEF1FA", accent: "#4FD1A5", eyes: "round", accessory: "none", style: "pro" },
      lines: [
        "Connecting Slack? Click Integrations, I'll point to the right tile.",
        "Your webhook failed twice. The URL has a typo: htps instead of https.",
        "Next step to go live: publish your first workflow. Button's glowing.",
        "Not sure? I can hand you to a human. They reply by email.",
      ],
      reactions: ["Beep. Boop. Hi.", "Recalibrating cuteness.", "Ticklish circuits detected.", "Poke logged. Thank you."],
    },
  ] as CastMember[],
};
