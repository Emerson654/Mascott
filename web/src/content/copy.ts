// Owned by Léa (brand). All landing, FAQ, paywall and footer text. Site language: English.
// Rules: no invented numbers, no fake testimonials. Prices must match src/lib/pricing.ts (19 / 49 / 149 EUR a month, 2 months free yearly).

export const copy = {
  hero: {
    // Prompt box under the title, sends to /create?prompt=
    promptLabel: "Describe your mascot",
    promptPlaceholder: "A calm blue cat with glasses who helps new users set up their first project",
    promptSuggestions: [
      "A sleepy bear for an invoicing app",
      "A sober robot for a developer API",
      "A pink bunny who books meetings",
    ],
    cta: "Create my mascot",
    ctaNote: "Free to create. No card needed to see her on your site.",
    secondaryCta: "See pricing",
  },

  sections: [
    {
      id: "problem",
      eyebrow: "The problem",
      title: "New users sign up, look around, and leave",
      body: [
        "Your trial users don't read the docs. They click around for two minutes, can't find the next step, and close the tab. The chat bubble in the corner waits for a question nobody types.",
        "Product tours help, until you ship a new screen and spend an afternoon rebuilding them.",
      ],
    },
    {
      id: "solution",
      eyebrow: "The fix",
      title: "A guide with a face, right where users get stuck",
      body: [
        "Your mascot greets each new user, answers from your docs in plain words and points at the exact button they need next. People notice a character. They ignore a grey bubble.",
      ],
      bullets: [
        { title: "Answers from your content", text: "Give her your site and docs URL. She reads them and replies with what's actually there." },
        { title: "Points to the next step", text: "\"Import contacts? It's this button.\" She highlights it on the page." },
        { title: "Looks like your brand", text: "Cute or sober, your colours, your name. You pick the species, the outfit and the tone." },
      ],
    },
    {
      id: "how",
      eyebrow: "How it works",
      title: "Live on your site in three steps",
      steps: [
        { title: "Create", text: "Type a sentence or tick a few boxes. Your mascot appears, already animated." },
        { title: "Feed", text: "Paste your website and docs URL. She learns your product on her own." },
        { title: "Install", text: "Copy one line of code into your app, or add it through Google Tag Manager. Preview it before anyone else sees it." },
      ],
    },
    {
      id: "objections",
      eyebrow: "Before you ask",
      title: "Cute on the outside, careful on the inside",
      cards: [
        { title: "You stay in control", text: "She answers and points. She never clicks, fills or submits anything for your users. You choose the pages she can talk about, and one switch turns her off." },
        { title: "Built for GDPR", text: "She only reads the pages you give her. Conversations are never sold or used for ads, and you can delete them whenever you like." },
        { title: "Light on your page", text: "The script loads after your page, so your app stays as fast as it is today." },
        { title: "One flat price", text: "From €19 a month, €49 for most SaaS teams. A fixed monthly quota of conversations, so the bill never surprises you." },
      ],
    },
  ],

  faq: [
    {
      q: "Won't a cartoon look childish on a B2B product?",
      a: "Every mascot comes in two styles. \"Pro\" keeps soft shapes and calm colours with less bounce, and sits nicely next to a serious dashboard. \"Cute\" goes full charm. You can switch any time and see both on your real site before paying.",
    },
    {
      q: "Can it say or do something wrong in front of my users?",
      a: "She only answers from the content you give her, and when she doesn't know, she says so and offers to pass the question to your team by email. She can point at buttons, but she never clicks, types or submits for anyone.",
    },
    {
      q: "We already use Intercom or Crisp. Do we have to switch?",
      a: "No. Mascott sits next to your current chat. She handles the \"where is…\" and \"how do I…\" questions during onboarding, and your support tool keeps everything else.",
    },
    {
      q: "How hard is it to install?",
      a: "Copy one script tag into your app or add it through Google Tag Manager. It works with React, Next.js, Vue and plain HTML sites. You get a private preview first, so your users only see her once you're happy.",
    },
    {
      q: "Will it actually help activation?",
      a: "We won't promise a number we haven't measured on your product. What we can promise: you see her working on your real site before you pay, and if she doesn't earn her place within 30 days, you get your money back.",
    },
    {
      q: "What about GDPR and my users' data?",
      a: "She reads only the pages you choose. Conversations are never sold or used for advertising, and you can delete them from your dashboard. Need a data processing agreement? Ask us and we'll send one.",
    },
    {
      q: "How much does it cost?",
      a: "Starter is €19 a month for one site, Growth €49 a month for most SaaS teams, Scale €149 a month for several products or agencies. Pay yearly and get two months free. Each plan has a fixed monthly conversation quota, so there are no surprise bills.",
    },
    {
      q: "Why is there no free plan?",
      a: "Creating a mascot is free, and so is seeing her on your own site. We'd rather keep the paid product focused and well supported. The 30-day money-back guarantee covers the rest: if it's not for you, one email and you're refunded.",
    },
  ],

  paywall: {
    title: "She's ready. Put her to work.",
    subtitle: "Your mascot is built and already knows your product. Go live today and she starts greeting your next sign-up.",
    why: [
      "Every trial user who leaves today without finding the next step is a customer you won't get back.",
      "Setup is done. The only step left is pasting one line of code.",
      "Flat monthly price, and you can cancel in two clicks.",
    ],
    guarantee: {
      title: "30-day money-back guarantee",
      text: "Try her on your real users for 30 days. If she doesn't earn her place, send us one email and we refund you in full.",
    },
    cta: "Put my mascot live",
    ctaNote: "Secure payment by Stripe. Cancel any time.",
    billingToggle: { monthly: "Monthly", yearly: "Yearly (save 17%)" },
    leadFallback: {
      title: "Not ready to pay yet?",
      text: "Leave your email and we'll keep your mascot for you.",
      cta: "Save my mascot",
    },
  },

  footer: {
    tagline: "Cute AI mascots that guide your users to the next step.",
    links: [
      { label: "Create a mascot", href: "/create" },
      { label: "Pricing", href: "/pricing" },
      { label: "Live demo", href: "/widget-demo" },
      { label: "Blog", href: "/blog" },
    ],
    legal: "© Mascott. Made with care in Europe.",
  },
};

export type Copy = typeof copy;
