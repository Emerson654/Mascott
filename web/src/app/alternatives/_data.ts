// Owned by Camille. Single source of truth for competitor facts on /alternatives/*.
// Rules: every competitor price or limit comes from founder/competitors.md or founder/marketing.md
// (third-party pricing guides, linked in `sources`), dated, and phrased as "reported", never as verified.
// Re-check every quarter and bump CHECKED_ON. Mascott prices are tokens filled from src/lib/pricing.ts.

export const CHECKED_ON = "October 2026";

export type Row = { label: string; them: string; mascott: string };
export type Alt = {
  slug: string;
  name: string;
  /** Primary keyword (Semrush, founder/seo-competition.md). */
  keyword: string;
  title: string;
  metaDescription: string;
  h1: string;
  answer: string;
  whatItIs: string;
  whyLook: string[];
  rows: Row[];
  pickThem: string[];
  pickMascott: string[];
  otherOptions: { name: string; note: string }[];
  switching: string;
  faq: { q: string; a: string }[];
  sources: { label: string; url: string }[];
  related: { label: string; href: string }[];
};

const M = {
  price: "{{plan:starter}} {{price:starter}}, {{plan:growth}} {{price:growth}}, {{plan:scale}} {{price:scale}} per month, flat. Yearly = 2 months free",
  usage: "Soft monthly conversation caps (300 / 1,500 / 6,000). We warn you, we never surprise-bill",
  free: "No free plan. Try it on your real site first, then {{guarantee}}-day money-back guarantee",
  character: "Yes. A customisable mascot, made from a prompt or a few checkboxes",
  guide: "Answers from your pages and docs, then points to (and highlights) the next step",
  inbox: "No. Mascott sits on top of the chat or helpdesk you already run",
  setup: "One script snippet; no tours to build by hand",
  maturity: "New (launched 2026). No public reviews yet",
};

export const ALTERNATIVES: Alt[] = [
  {
    slug: "intercom",
    name: "Intercom",
    keyword: "intercom alternative",
    title: "Intercom alternative for small SaaS teams (2026): Mascott vs Intercom Fin",
    metaDescription:
      "Looking for an Intercom alternative? An honest comparison of Intercom Fin and Mascott for small SaaS teams: pricing per resolution vs flat price, what each does, and when Intercom is still the better pick.",
    h1: "The Intercom alternative for small SaaS teams that care about activation",
    answer:
      "If you are a 2-20 person SaaS team that mainly needs new trial users to reach their first win, Mascott is a lighter Intercom alternative: a flat-priced AI guide with a face that answers from your docs and points users to the next step. If you need a full support inbox, ticketing and many agents, stay on Intercom.",
    whatItIs:
      "Intercom is a customer service platform: shared inbox, help center, ticketing, outbound messages and Fin, its AI agent that resolves support questions. It is a strong, mature product built for support teams. Mascott is narrower: an AI mascot that lives on your site or app and guides visitors and new users, often on top of the Intercom or Crisp messenger you already have.",
    whyLook: [
      "**The per-resolution bill.** Fin is reported at about $0.99 per resolution on top of seats, and several pricing guides mention a 50-resolution monthly minimum. Reviewers say it \"adds up quickly at scale\".",
      "**Seat stacking.** The Essential plan is reported at $29 per seat per month (annual) or $39 monthly. Costs grow with the team, not with the value you get.",
      "**Support-first design.** Intercom answers questions well; walking a new user through the setup of your product is not its core job.",
      "**More than a small team needs.** Inbox, ticketing, workflows and reporting are great at 20 agents and heavy at 3 people.",
    ],
    rows: [
      { label: "Pricing model (reported)", them: "Essential from $29/seat/month (annual) or $39 monthly, plus Fin at ~$0.99 per resolution", mascott: M.price },
      { label: "Usage billing", them: "Per AI resolution; some guides cite a 50-resolution monthly minimum", mascott: M.usage },
      { label: "Free plan", them: "No, trial only", mascott: M.free },
      { label: "Shared inbox, tickets, help center", them: "Yes, a full support suite", mascott: M.inbox },
      { label: "Guides new users to the next step", them: "Mostly answers questions; tours and checklists are separate features", mascott: M.guide },
      { label: "Character / mascot", them: "No, a messenger bubble", mascott: M.character },
      { label: "Setup", them: "Messenger snippet, then inbox, help center and Fin configuration", mascott: M.setup },
      { label: "Maturity", them: "Mature, large ecosystem and integrations", mascott: M.maturity },
    ],
    pickThem: [
      "You run a real support operation: several agents, SLAs, ticket routing and a help center.",
      "You need deep integrations (CRM, data, outbound campaigns) in one tool.",
      "Your main goal is resolving support tickets, not activating trial users.",
    ],
    pickMascott: [
      "Your trial users sign up and never reach the \"aha\" step, and you want a guide that shows them where to click.",
      "You want a predictable flat price instead of a bill that grows with every resolution.",
      "You want something with personality that matches a friendly brand, installed in minutes.",
      "You want to keep Intercom for support and add a guide on top, without migrating anything.",
    ],
    otherOptions: [
      { name: "Crisp", note: "A cheaper all-in-one chat with an AI assistant, popular with small teams; AI usage is sold as credits." },
      { name: "Tidio", note: "Live chat plus the Lyro AI agent, with a free plan; strong with e-commerce and small businesses." },
      { name: "Chatbase", note: "Train a chatbot on your docs quickly; credit-based plans and a few AI actions." },
    ],
    switching:
      "You do not have to switch. For most small teams we recommend keeping Intercom for support conversations and adding the mascot for onboarding: paste one snippet, point it at your docs and key pages, and the guide hands off to your existing messenger when a human is needed. If you later drop Intercom, nothing in Mascott depends on it.",
    faq: [
      { q: "What is the best Intercom alternative for a small SaaS?", a: "It depends on the job. For support at lower cost, Crisp or Tidio are common picks. For getting new users to activation with a flat price, an AI onboarding guide like Mascott is the closer fit. For a full support suite, Intercom itself is hard to beat." },
      { q: "Is Mascott cheaper than Intercom Fin?", a: "Mascott is a flat monthly price with soft conversation caps, so the bill does not grow per resolution. Whether it is cheaper depends on your volume and seats; check Intercom's live pricing page, since the figures here come from third-party guides." },
      { q: "Can Mascott replace Intercom completely?", a: "Not for support teams. Mascott has no shared inbox, ticketing or help center. It replaces Intercom only if all you used Intercom for was answering visitor questions." },
      { q: "Can I use Mascott and Intercom together?", a: "Yes. That is the most common setup: Mascott guides and answers, and your Intercom messenger stays for human conversations." },
    ],
    sources: [
      { label: "Ringly: Intercom pricing", url: "https://www.ringly.io/blog/intercom-pricing" },
      { label: "dragapp: Intercom pricing", url: "https://dragapp.com/blog/intercom-pricing/" },
      { label: "Capterra: Intercom reviews", url: "https://www.capterra.com/p/134347/Intercom/reviews/" },
    ],
    related: [
      { label: "Best Intercom alternatives for small SaaS (2026)", href: "/blog/best-intercom-alternatives-small-saas" },
      { label: "Chatbase vs Intercom Fin vs an AI mascot", href: "/blog/chatbase-vs-intercom-fin-vs-ai-mascot" },
    ],
  },
  {
    slug: "tidio",
    name: "Tidio",
    keyword: "tidio alternative",
    title: "Tidio alternative for SaaS onboarding (2026): Mascott vs Tidio + Lyro",
    metaDescription:
      "A fair Tidio alternative comparison: Tidio and its Lyro AI agent vs Mascott, a flat-priced AI guide with a face. Pricing, conversation limits, free plans and who should pick which.",
    h1: "A Tidio alternative built for guiding users, not just answering chats",
    answer:
      "Tidio is a good, affordable live chat with an AI agent (Lyro) and a free plan, especially for online stores. If you run a SaaS and want an AI guide that walks new users to their next step, with a flat price instead of per-conversation AI add-ons, Mascott is the better fit. For e-commerce live chat on a tight budget, Tidio wins.",
    whatItIs:
      "Tidio combines live chat, a ticketing inbox, chatbot flows and Lyro, an AI agent that answers from your knowledge base. It is popular with small businesses and Shopify stores. Mascott is an AI mascot that guides visitors and new users inside a website or SaaS app.",
    whyLook: [
      "**AI conversations are an add-on.** Lyro is reported from $39/month for 50 AI conversations, about $0.70 per conversation from 200, on top of the chat plan.",
      "**A short chat and a long one cost the same.** Reviews note that a two-message chat and a twenty-message chat count as one conversation each.",
      "**Price surprises.** G2 reviewers tag pricing as \"Expensive\" in dozens of reviews, and some users report automatic plan upgrades during traffic spikes.",
      "**Scripted flows.** Lyro is reported to struggle with off-script questions inside Flows.",
    ],
    rows: [
      { label: "Pricing model (reported)", them: "Starter $29/month (100 conversations); Growth from $59 up to $349", mascott: M.price },
      { label: "AI usage billing", them: "Lyro add-on from $39/month for 50 AI conversations; ~$0.70 each from 200", mascott: M.usage },
      { label: "Free plan", them: "Yes: 50 conversations/month plus 50 lifetime Lyro conversations", mascott: M.free },
      { label: "Live chat inbox for humans", them: "Yes", mascott: M.inbox },
      { label: "Guides new users to the next step", them: "Answers and scripted flows", mascott: M.guide },
      { label: "Character / mascot", them: "No, a chat widget", mascott: M.character },
      { label: "Best known for", them: "Small businesses and Shopify stores", mascott: "Small B2B SaaS teams working on activation" },
      { label: "Maturity", them: "Mature, large install base", mascott: M.maturity },
    ],
    pickThem: [
      "You run an online store and want live chat plus AI answers, starting free.",
      "You need a human chat inbox and chatbot flows in the same tool.",
      "Your budget is close to zero and your volume is low.",
    ],
    pickMascott: [
      "You run a SaaS and the problem is activation: users sign up, then get lost.",
      "You want a guide that points to the next button or page, not only a chat window.",
      "You prefer one flat price to chat plans plus AI add-ons.",
      "You want a friendly character that fits your brand.",
    ],
    otherOptions: [
      { name: "Crisp", note: "All-in-one chat for small teams; AI credits do not roll over month to month." },
      { name: "Intercom", note: "The premium support suite, with Fin billed per resolution." },
      { name: "Shopify Inbox", note: "Free on every Shopify plan with an optional AI agent; the default for many stores." },
    ],
    switching:
      "If you use Tidio for live chat, keep it and add Mascott for guidance: the mascot answers and points the way, and hands off to your Tidio chat when someone wants a human. If you only used Lyro for AI answers on a SaaS, you can replace it with Mascott by pointing the mascot at the same help pages.",
    faq: [
      { q: "What is a good Tidio alternative for SaaS?", a: "For SaaS onboarding, look for a tool that guides users in the product rather than only chatting: an AI onboarding guide like Mascott, or a product tour tool like Userpilot or Appcues if you want hand-built tours. For support chat, Crisp and Intercom are the usual alternatives." },
      { q: "Does Mascott have a free plan like Tidio?", a: "No. Mascott has no free plan; you can try it on your real site first, and paid plans have a money-back guarantee. The free mascot generator lets you design your character at no cost." },
      { q: "Is Tidio better for Shopify?", a: "Yes. Tidio and the free Shopify Inbox are built for stores. Mascott focuses on websites and SaaS apps that need to guide users." },
    ],
    sources: [
      { label: "dragapp: Tidio pricing", url: "https://www.dragapp.com/blog/tidio-pricing/" },
      { label: "eesel: Tidio pricing", url: "https://eesel.ai/blog/tidio-pricing" },
      { label: "eesel: Tidio reviews", url: "https://www.eesel.ai/blog/tidio-reviews" },
      { label: "yourgpt: Tidio review", url: "https://yourgpt.ai/blog/comparison/tidio-review" },
    ],
    related: [
      { label: "Tidio alternatives for SaaS teams", href: "/blog/tidio-alternatives" },
      { label: "AI mascot for your website", href: "/blog/ai-mascot-for-website" },
    ],
  },
  {
    slug: "userpilot",
    name: "Userpilot",
    keyword: "userpilot alternatives",
    title: "Userpilot alternatives (2026): an AI guide vs hand-built product tours",
    metaDescription:
      "Honest Userpilot alternatives for small SaaS teams: Mascott, Appcues, UserGuiding, Product Fruits, Userflow and Chameleon. What each is for, reported prices, and when Userpilot is still the right call.",
    h1: "Userpilot alternatives for small SaaS teams",
    answer:
      "Userpilot is one of the most complete product adoption platforms, with tours, checklists, surveys and analytics, but it is reported at roughly $249-299 per month and you build every flow by hand. Small teams looking for an alternative usually pick a cheaper tour builder (UserGuiding, Product Fruits) or an AI guide like Mascott that answers and points users to the next step without building tours.",
    whatItIs:
      "Userpilot is a no-code product growth platform: in-app flows and tours, onboarding checklists, resource centers, NPS surveys and product analytics. It is aimed at product and growth teams that want to design and measure every step. Mascott takes a different approach: instead of scripting tours, you give an AI mascot your docs and key pages, and it guides each user in context.",
    whyLook: [
      "**Price.** Reported at about $249-299 per month, which is a lot for a team of three with a few hundred trials a month.",
      "**Tours take time to build and maintain.** Every flow is designed by hand and breaks when the UI changes.",
      "**Tours are linear.** Users who skip a step or ask an unplanned question fall out of the script.",
      "**More analytics than you need.** Many small teams already use PostHog or Mixpanel.",
    ],
    rows: [
      { label: "Pricing (reported)", them: "About $249-299/month", mascott: M.price },
      { label: "How guidance is created", them: "You build tours, checklists and tooltips with a no-code editor", mascott: "AI: give it your docs and pages; it guides each user in context" },
      { label: "Answers free-form questions", them: "Resource center and search; not a conversational AI guide", mascott: M.guide },
      { label: "Surveys and product analytics", them: "Yes, built in", mascott: "Activation analytics on Growth and above; no survey suite" },
      { label: "Character / mascot", them: "No", mascott: M.character },
      { label: "Free plan", them: "Not listed in our sources", mascott: M.free },
      { label: "Maturity", them: "Mature; SEO and content leader of the category", mascott: M.maturity },
    ],
    pickThem: [
      "You have a product or growth person who will design, test and maintain flows every week.",
      "You need surveys, segmentation and product analytics in the same tool.",
      "Your onboarding is a fixed sequence that rarely changes.",
    ],
    pickMascott: [
      "You do not have time to build and maintain tours.",
      "Your users ask questions that a fixed tour cannot answer.",
      "You want guidance at a flat, small-team price.",
      "You want onboarding with personality, not another tooltip.",
    ],
    otherOptions: [
      { name: "Appcues", note: "Polished flows and checklists; reported at about $249/month on annual billing." },
      { name: "UserGuiding", note: "A cheaper no-code tour builder; Basic is reported at about $89/month." },
      { name: "Product Fruits", note: "Tours, checklists and a knowledge base for smaller budgets; ranks #1 for \"product tour software\"." },
      { name: "Userflow", note: "A fast flow builder, often listed among the top Userpilot alternatives." },
      { name: "Chameleon", note: "Highly customisable in-product experiences for product teams." },
    ],
    switching:
      "Moving from Userpilot to Mascott is not a one-to-one migration: tours do not convert into an AI guide. Start by listing the three to five steps a new user must complete to reach their first win, give Mascott those pages and your help docs, and run both side by side for two weeks on new signups before you cancel anything.",
    faq: [
      { q: "What is the cheapest Userpilot alternative?", a: "Among tour builders, UserGuiding and Product Fruits are usually cheaper. Among AI guides, Mascott's plans start at {{price:starter}} per month. Check each vendor's live pricing page: the figures here come from third-party guides." },
      { q: "Is an AI guide better than a product tour?", a: "Not always. Tours are better for a fixed, must-see sequence. An AI guide is better when users arrive with different goals and questions. Many teams use a short tour plus an AI guide." },
      { q: "Does Mascott do product analytics like Userpilot?", a: "Only activation analytics on the higher plans. If you need surveys and full product analytics, Userpilot (or a dedicated analytics tool) does more." },
    ],
    sources: [
      { label: "costbench: Appcues vs Userpilot", url: "https://costbench.com/compare/appcues-vs-userpilot/" },
      { label: "Capterra: Userpilot reviews", url: "https://www.capterra.com/p/179187/Userpilot/reviews/1154786" },
      { label: "toolradar: UserGuiding pricing", url: "https://toolradar.com/tools/userguiding/pricing" },
    ],
    related: [
      { label: "Userpilot alternatives: the long version", href: "/blog/userpilot-alternatives" },
      { label: "Product tour software vs AI guides", href: "/blog/product-tour-software-vs-ai-guides" },
    ],
  },
  {
    slug: "appcues",
    name: "Appcues",
    keyword: "appcues alternatives",
    title: "Appcues alternatives (2026): honest options for small SaaS teams",
    metaDescription:
      "Appcues alternatives compared: Mascott (AI guide with a face), Userpilot, UserGuiding, Product Fruits and Userflow. Reported prices, what each does best, and when Appcues is still worth it.",
    h1: "Appcues alternatives for small SaaS teams",
    answer:
      "Appcues makes polished in-app flows, checklists and announcements, and is reported at about $249 per month on annual billing. If that is too much for your stage, cheaper tour builders such as UserGuiding or Product Fruits do the same job with fewer extras, while Mascott replaces hand-built tours with an AI guide that answers and points users to the next step.",
    whatItIs:
      "Appcues is a no-code user onboarding platform: modal and tooltip flows, onboarding checklists, banners, NPS and event analytics, used by product and growth teams. Mascott is an AI mascot that guides users in context from your docs and pages, without a tour editor.",
    whyLook: [
      "**Price for a small team.** About $249/month (annual) is reported, a large line for a team with a few hundred signups.",
      "**Building and maintaining flows.** Every tooltip is placed by hand and needs updating when the UI changes.",
      "**Linear by design.** Flows show what you planned, not what this user is trying to do.",
    ],
    rows: [
      { label: "Pricing (reported)", them: "About $249/month, annual billing", mascott: M.price },
      { label: "How guidance is created", them: "No-code flow builder: modals, tooltips, checklists", mascott: "AI guide trained on your docs and pages" },
      { label: "Answers free-form questions", them: "Not its core job", mascott: M.guide },
      { label: "Announcements, NPS", them: "Yes", mascott: "No" },
      { label: "Character / mascot", them: "No", mascott: M.character },
      { label: "Setup", them: "Snippet plus building each flow", mascott: M.setup },
      { label: "Maturity", them: "Mature, well-known brand", mascott: M.maturity },
    ],
    pickThem: [
      "You have someone who will own and iterate on flows every week.",
      "You need announcements, NPS and checklists in one tool.",
      "Your onboarding is a clear fixed path.",
    ],
    pickMascott: [
      "You want onboarding that adapts to each user without building flows.",
      "Users keep asking the same questions your tours do not answer.",
      "You want a flat price that fits a 2-20 person team.",
    ],
    otherOptions: [
      { name: "Userpilot", note: "The most complete adoption platform, with surveys and analytics; reported at about $249-299/month." },
      { name: "UserGuiding", note: "Cheaper no-code tours and checklists; Basic reported at about $89/month." },
      { name: "Product Fruits", note: "Tours, checklists and a knowledge base for smaller budgets." },
      { name: "Userflow", note: "A fast flow builder that many teams shortlist next to Appcues." },
    ],
    switching:
      "Keep your most important Appcues flow (often the welcome flow) during the test, add Mascott on the same pages, and compare activation on new signups for two weeks. If the guide covers what your flows did, you can retire them one by one.",
    faq: [
      { q: "What is the best Appcues alternative for a startup?", a: "For a cheaper tour builder, UserGuiding or Product Fruits. For an AI guide that needs no tours, Mascott. For the most features, Userpilot." },
      { q: "Can Mascott run step-by-step tours?", a: "The higher plans include onboarding checklists and step-by-step guidance, but Mascott's core is conversational: it answers and points to the next step. If you need pixel-perfect scripted tours, a tour builder is the better tool." },
    ],
    sources: [
      { label: "costbench: Appcues vs Userpilot", url: "https://costbench.com/compare/appcues-vs-userpilot/" },
      { label: "toolradar: UserGuiding pricing", url: "https://toolradar.com/tools/userguiding/pricing" },
    ],
    related: [
      { label: "Product tour software vs AI guides", href: "/blog/product-tour-software-vs-ai-guides" },
      { label: "How to increase SaaS trial activation", href: "/blog/increase-saas-trial-activation" },
    ],
  },
  {
    slug: "chatbase",
    name: "Chatbase",
    keyword: "chatbase alternative",
    title: "Chatbase alternative for SaaS (2026): Mascott vs Chatbase",
    metaDescription:
      "A fair Chatbase alternative comparison: Chatbase's credit-based AI chatbot vs Mascott's flat-priced AI guide with a face. Pricing, AI actions, branding removal and who should pick which.",
    h1: "A Chatbase alternative that guides users instead of just chatting",
    answer:
      "Chatbase is a quick way to train an AI chatbot on your docs, with credit-based plans from about $32-40 per month and a free tier. If you want the bot to guide new users through your product, with a character and a flat price that includes no branding fee, Mascott is the closer fit. For a plain docs chatbot at the lowest entry price, Chatbase is fine.",
    whatItIs:
      "Chatbase lets you upload documents or a website and get a GPT-style chatbot you can embed, with a limited number of AI actions. Mascott is an AI mascot for websites and SaaS apps that answers from your content and points users to the next step.",
    whyLook: [
      "**Credits run out.** The Hobby plan is reported with 500 credits; extra credits are about $40 per 1,000.",
      "**Branding removal costs extra.** Reported at about $99 per month.",
      "**Few actions on entry plans.** Hobby is reported with 5 AI actions.",
      "**Wrong answers.** Some reviewers say it can \"confidently generate totally wrong answers\" (mostly 2023-24 reviews).",
    ],
    rows: [
      { label: "Pricing (reported)", them: "Hobby ~$40 monthly or $32 annual; Standard $120; Pro $400", mascott: M.price },
      { label: "Usage billing", them: "Message credits; ~$40 per extra 1,000", mascott: M.usage },
      { label: "Free plan", them: "Yes, about 50 credits", mascott: M.free },
      { label: "Remove vendor branding", them: "About $99/month add-on", mascott: "Included from {{plan:growth}} ({{price:growth}}/month)" },
      { label: "Guides users to the next step", them: "Chat answers plus a few AI actions", mascott: M.guide },
      { label: "Character / mascot", them: "No, a chat bubble", mascott: M.character },
      { label: "Maturity", them: "Established, large user base", mascott: M.maturity },
    ],
    pickThem: [
      "You want the cheapest way to put a docs chatbot on a site.",
      "You need a free tier to experiment.",
      "You do not care about onboarding, only about answering questions.",
    ],
    pickMascott: [
      "You want the bot to guide users to activation, not just reply.",
      "You want predictable flat pricing, with no branding fee on {{plan:growth}}.",
      "You want a friendly character that makes the help visible.",
    ],
    otherOptions: [
      { name: "CustomGPT.ai", note: "Docs chatbot with query quotas; Standard reported at $99/month." },
      { name: "Intercom Fin", note: "A support-grade AI agent billed per resolution." },
      { name: "Botpress / Voiceflow", note: "Builders for teams that want to design complex conversational agents." },
    ],
    switching:
      "Point Mascott at the same website or docs you gave Chatbase, set the pages a new user should reach, and replace the embed snippet. Run both on different pages for a week if you want to compare answer quality.",
    faq: [
      { q: "What is a good Chatbase alternative for SaaS onboarding?", a: "An AI onboarding guide like Mascott, which answers and points users to the next step, or a product tour tool if you prefer scripted flows." },
      { q: "Is Mascott more accurate than Chatbase?", a: "We have not run a public head-to-head test, so we do not claim it. Both answer from the content you provide; accuracy depends mostly on how complete your docs are." },
    ],
    sources: [
      { label: "chatarmin: Chatbase pricing", url: "https://chatarmin.com/en/blog/chatbase-pricing" },
      { label: "layer3labs: Chatbase pricing", url: "https://www.layer3labs.io/guides/chatbase-pricing" },
      { label: "Capterra: Chatbase reviews", url: "https://capterra.com/p/10012414/Chatbase/reviews/" },
    ],
    related: [
      { label: "Chatbase vs Intercom Fin vs an AI mascot", href: "/blog/chatbase-vs-intercom-fin-vs-ai-mascot" },
      { label: "What is an AI onboarding agent?", href: "/blog/what-is-an-ai-onboarding-agent" },
    ],
  },
];

export const getAlternative = (slug: string) => ALTERNATIVES.find((a) => a.slug === slug);
