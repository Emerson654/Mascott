// Owned by Léa (brand). Source of truth for the look and the demo cast. Rationale: docs/brand.md.
import type { MascotSpec } from "@/lib/mascot-spec";

export interface CastMember {
  id: string;
  name: string;
  role: string;
  /** Detailed English image prompt for the AI artwork (fixed fictional brand, fixed art direction). */
  artPrompt: string;
  /** Fixed seed so the landing artwork stays the same between visits. */
  seed: number;
  spec: MascotSpec;
  lines: string[];
  reactions: string[];
}

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
  // v2 cast: six art directions, six fictional SaaS brands. Each `artPrompt` + `seed` feeds castImageUrl() (Yanis);
  // `spec` stays the SVG fallback shown while the artwork loads or if it fails. Directions: docs/brand.md section 9.
  cast: [
    {
      id: "pip",
      name: "Pip",
      role: "Onboarding guide for Corvo, a CRM",
      seed: 41027,
      artPrompt:
        "Cute plush mascot character for a CRM app: a small round fox cub sewn from soft wool felt, with visible blanket-stitch seams, " +
        "tiny felt ears with lighter inner felt, a fluffy felt tail curled around its feet and a little leather-look satchel holding a paper contact card. " +
        "Handmade toy look, slightly fuzzy fibres, soft matte texture. Palette: body warm apricot #F4A261, belly and muzzle cream #FFF1DE, " +
        "cheeks rose #FF9EC4, satchel deep teal #2A6F77. Expression: friendly closed-mouth smile, two shiny black bead eyes, small embroidered nose. " +
        "Pose: standing, one paw raised in a wave, head tilted slightly. Full body, centered, plain soft peach pastel background #FFE8D6, " +
        "no text, no logo, high quality felt plush mascot photo, soft studio lighting, shallow depth of field, simple readable silhouette.",
      spec: { species: "fox", primary: "#F4A261", secondary: "#FFF1DE", accent: "#FF9EC4", eyes: "round", accessory: "scarf", style: "cute" },
      lines: [
        "Hi Sam. Want me to help you import your first contacts?",
        "The CSV button is right here, top right. Drop your file on it.",
        "Nice, 212 contacts in. Next step: create your first deal.",
        "Stuck? Ask me anything. I've read all the docs so you don't have to.",
      ],
      reactions: ["Careful, I'm hand-stitched.", "Hehe, that tickles!", "Fluff restored.", "Again? Okay, one more."],
    },
    {
      id: "tally",
      name: "Tally",
      role: "Setup coach for Billnook, an invoicing app",
      seed: 58311,
      artPrompt:
        "Cute object-character mascot for an invoicing app: a smiling paper invoice sheet with rounded corners and one corner gently folded, " +
        "thick and puffy like an inflated vinyl toy, with three soft grey lines printed as text placeholders and a small round green 'paid' stamp shape on its chest (no letters). " +
        "Tiny stubby arms and legs, one hand holding a small golden coin. Glossy 3D render, smooth plastic surface, subtle subsurface glow. " +
        "Palette: paper ivory #FFF8EC, lines cool grey #C9CCDA, stamp mint #3FBF8F, coin gold #F2B84B, cheeks coral #FF8F7A. " +
        "Expression: big happy open smile, two glossy oval black eyes with white highlights. Pose: leaning forward cheerfully, waving with the free hand. " +
        "Full body, centered, plain soft mint pastel background #E3F6EE, no text, no logo, high quality 3D mascot character, studio lighting, soft contact shadow.",
      spec: { species: "blob", primary: "#FFF8EC", secondary: "#E3F6EE", accent: "#3FBF8F", eyes: "round", accessory: "glasses", style: "pro" },
      lines: [
        "Welcome in. Three steps and your first invoice goes out.",
        "First, add your logo. It's the empty square, just here.",
        "Billing an EU client? I can add the VAT mention your docs recommend.",
        "All set. Hit Send when you're ready, I'll keep watch.",
      ],
      reactions: ["Paid in full.", "Hey, don't crease me.", "Stamped and approved.", "That's one for the books."],
    },
    {
      id: "lumi",
      name: "Lumi",
      role: "Calm guide for Stillpond, a meditation app",
      seed: 7302,
      artPrompt:
        "Cute kawaii cartoon character with a big smiling face, a mascot for a meditation app: a perfectly round floating orb made of soft frosted glass, filled with a slow gradient " +
        "from lilac #B9A7FF at the top to peach #FFC6A8 at the bottom, with a gentle inner glow and a faint pearly rim light. " +
        "Simple cartoon face drawn on the orb: two small closed curved eyes like peaceful arcs and a tiny soft smile, in deep plum #4A3B6B. No limbs, no accessories. " +
        "A thin soft halo ring of light floats around the orb. Pose: hovering calmly, tilted a few degrees, a soft blurred reflection below it. " +
        "Full body, centered, plain very pale lavender background #F3EFFF, no text, no logo, high quality 3D render, soft diffused studio lighting, " +
        "dreamy and serene, clean simple silhouette.",
      spec: { species: "blob", primary: "#B9A7FF", secondary: "#FFC6A8", accent: "#FFB3C7", eyes: "sleepy", accessory: "none", style: "pro" },
      lines: [
        "Hi. Let's set up your first session. Morning or evening?",
        "Your reminder lives under Settings, then Rhythm. I'll show you.",
        "Five minutes is plenty to start. The play button is just below me.",
        "Want to invite your team? The Share tile sends them a calm little link.",
      ],
      reactions: ["Breathe in... and out.", "Mmm, a gentle ripple.", "Still here. Still calm.", "That was a nice little nudge."],
    },
    {
      id: "bolt",
      name: "Bolt",
      role: "Integration helper for Brickflow, a no-code platform",
      seed: 26843,
      artPrompt:
        "Cute small rounded robot mascot for a no-code app builder: a chubby capsule-shaped body and a wide rounded-square head with a dark glossy face screen " +
        "showing two glowing rounded-rectangle eyes and a small curved smile in mint light. A short antenna topped with a single puzzle-piece shaped bulb. " +
        "Stubby rounded arms, little mitten hands, short legs with rubbery feet. Soft-touch matte vinyl toy material with tiny panel seams. " +
        "Palette: body sky blue #7FB2FF, face screen navy #1F2A55, eye light mint #4FE0B5, puzzle bulb sunny yellow #FFD36E, feet coral #FF8A80. " +
        "Pose: one arm pointing to the side as if showing a button, head slightly tilted, cheerful. Full body, centered, plain soft sky pastel background #E6F0FF, " +
        "no text, no logo, high quality 3D mascot character, studio lighting, soft shadow under the feet.",
      spec: { species: "robot", primary: "#7FB2FF", secondary: "#E6F0FF", accent: "#4FE0B5", eyes: "round", accessory: "none", style: "pro" },
      lines: [
        "Connecting Slack? Click Integrations, I'll point to the right tile.",
        "Your webhook failed twice. The URL has a typo: htps instead of https.",
        "Next step to go live: publish your first workflow. Button's glowing.",
        "Not sure? I can hand you to a human. They reply by email.",
      ],
      reactions: ["Beep. Boop. Hi.", "Recalibrating cuteness.", "Ticklish circuits detected.", "Poke logged. Thank you."],
    },
    {
      id: "juno",
      name: "Juno",
      role: "Analytics explainer for Mirador, a dashboard tool",
      seed: 91462,
      artPrompt:
        "Cute claymation mascot for an analytics app: a chubby little owl sculpted from plasticine modelling clay, with visible fingerprints and soft tool marks, " +
        "round body, short wings, big round eyes made of white clay discs with black pupils, a tiny orange beak, and three little clay bars of different heights " +
        "sticking up from the top of its head like a bar chart crest. A small clay magnifying glass held in one wing. " +
        "Palette: body teal #3FB8AF, belly pale mint #DDF4F1, chart crest bars coral #FF7F6E, mustard #F2C14E and lilac #A89BF2, beak orange #F49A3C. " +
        "Expression: curious, eyebrows slightly raised, small open smile. Pose: standing, leaning in, magnifier raised. " +
        "Full body, centered, plain soft butter-yellow background #FFF4D6, no text, no logo, stop-motion clay character, handcrafted, soft studio lighting.",
      spec: { species: "owl", primary: "#3FB8AF", secondary: "#DDF4F1", accent: "#FF7F6E", eyes: "round", accessory: "glasses", style: "pro" },
      lines: [
        "That dip on Tuesday? Your tracking script was paused for six hours.",
        "Want a weekly report by email? The toggle is under Alerts.",
        "Tip: drag this chart onto your home board to pin it.",
        "Retention means users who came back within 30 days. Want the formula?",
      ],
      reactions: ["Hoo! You startled me.", "Careful, I'm still drying.", "Wise choice. Hoo.", "I saw that coming."],
    },
    {
      id: "sprig",
      name: "Sprig",
      role: "Study buddy for Parlo, a language-learning app",
      seed: 64208,
      artPrompt:
        "Cute plant-creature mascot for a language-learning app: a small round sprout creature living in a tiny terracotta pot, its body a plump bright green bud " +
        "with two glossy leaves on top, one leaf shaped like a little speech bubble. Smooth glossy 3D look, like a polished toy with a soft satin sheen; " +
        "the pot has a small painted band of dots. Palette: body leaf green #6CCB5F, leaves fresh lime #A8E063, leaf veins darker green #3E9B4F, " +
        "pot terracotta #E07A5F, pot band cream #FFF3E0, cheeks pink #FF9EB5. Expression: delighted, sparkly black eyes with white highlights, wide open smile " +
        "as if saying hello. Pose: leaning out of the pot, one leaf lifted like a waving hand. Full body, centered, plain soft sage pastel background #EAF6E4, " +
        "no text, no logo, high quality 3D mascot character, studio lighting, soft shadow.",
      spec: { species: "blob", primary: "#6CCB5F", secondary: "#EAF6E4", accent: "#E07A5F", eyes: "sparkle", accessory: "hat", style: "cute" },
      lines: [
        "Hola. Pick the language you want first, I'll set up your path.",
        "Your daily goal sits up here. Ten minutes is a good start.",
        "Missed a word? Tap it and I'll say it again, slower.",
        "Lesson done. Next one unlocks right here when you're ready.",
      ],
      reactions: ["I'm growing on you.", "Leaf me be... no, stay.", "Photosynthesising joy.", "Water break? Okay."],
    },
  ] as CastMember[],
};
