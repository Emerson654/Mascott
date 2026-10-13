# Marketing plan: Mascott

Written 2026-10-13 by the marketing director, following `.claude/skills/founder-marketing/SKILL.md`.
Inputs: `idea.md`, `board.md`, `competitors.md`, `panel/results.md` (pitch v1: 0/20 buy), `panel-v2/results.md` and `panel-v2/answers/` (pitch v2: 2/20 buy), `pitch-v2.md`, `pricing-curve-v2.md`.
Machine-readable estimates: `founder/marketing-assumptions.json`.

> **Read this first.**
> - **Budget, team and cash are ASSUMED** (`idea.md`): solo or two founders, bootstrapped, about 5,000 EUR, no salary. Not given by the founder.
> - **No `offer.md`, `pricing.md` or `numbers.json` exist yet.** The prices below are the pitch-v2 hypothesis (Free 100 conversations; Starter 19; Growth 49; Agency 149 EUR/month; refund if no measured lift in 30 days). Gross margin is **not measured**: I use the board's 70-75% target. Re-run section 6 when `/founder-cfo` exists.
> - **The panel is simulated** (20 valid answers per round; every segment is "thin"). It tells us which objections to answer, not how many people will buy. Panel sentences are research. **They are never used as customer quotes in ads.**
> - **No keyword volumes were available** (no Semrush or Ahrefs data in this session). Every volume is `unknown`; difficulty is my judgement from the competitor SERPs described in `competitors.md`. Check them in a keyword tool in week 1 before you write anything.
> - **The clock.** Week 1 = Monday 19 Oct 2026. The kill rule ("≥500 EUR MRR by the end of month 3") lands on **Sunday 10 Jan 2027**. The last two weeks of December are dead for B2B sales, so **the working target is 500 EUR MRR by Friday 18 Dec 2026** (week 9). The remaining three weeks are buffer, not plan.

---

## 0. The core decision in one paragraph

SEO and GEO are the right **long-term** engine: the category ("AI guide with a face") is new, and LLMs cite whoever publishes the clearest structured facts first. But a new domain earns almost nothing from Google within 12 weeks (estimate: 150-600 organic visitors/month at month 3, which is about 0-2 paying customers). **So for 12 weeks, every euro comes from founder-led selling to one segment.** Each sales conversation is turned into SEO and GEO assets: the objections become comparison pages, and the pilots become the public lift benchmark. Time split for weeks 1-9: **about 60% direct selling and pilots, 30% SEO and GEO content, 10% launches and community.** From week 10 the split moves toward SEO.

---

## 1. Positioning and the beachhead

### The beachhead: small B2B SaaS teams (2-20 people) with a self-serve free trial or freemium plan and a chat widget that is already installed

Why this segment and no other:

| Evidence | What it says |
| --- | --- |
| Panel v2 by segment | **Small SaaS teams: 2 of 6 buy (33%).** Every other segment: 0 (edtech 0/2, showcase sites 0/6, indie 0/2, agencies 0/2, e-commerce 0/2). |
| Why the two buyers buy (P007, P011) | (a) "sits on top of" the current chatbot, so nothing to migrate; (b) the **A/B report** proves the lift; (c) the **refund if there is no lift** makes the test "close to free"; (d) 49 EUR is small against their revenue. Both are conversion-minded: one optimiser and one frustrated with their current bot. |
| Buying behaviour | "Frustrated with their current chatbot": 1 of 1 buys. "Conversion optimiser": 1 of 3. These two behaviours are the targeting filter. |
| Competitors | **Shopify is a trap.** The free Shopify Inbox AI agent is the default, and Tidio's installs on Shopify are down 12.8% year on year. **SaaS onboarding has a price hole.** Userpilot is about $249-299/month and Appcues about $249/month (annual); UserGuiding Basic is about $89/month; Tandem is sales-led with no public price. Nobody sells a self-serve AI guide with a character at 49 EUR. |
| Board | The board named "small SaaS: walk new users to activation" as one of the two candidate beachheads. It asked for one segment, one outcome and one action. |
| Channel fit | These founders and PMs are reachable by name (LinkedIn, X, Indie Hackers, r/SaaS, Product Hunt), search for "X alternatives", and ask ChatGPT for tool picks. That makes them a good match for SEO and GEO. |

**The one outcome sold: trial-to-activation.** The new user reaches the "aha" step (first project created, first integration connected). **The one v1 action: answer from the docs and point at or highlight the next element.** Form-filling and clicking come later, and only behind allow-lists. This answers the #1 objection in both panels, an AI acting wrongly in front of customers (P002, P010, P013, P014, P019), and matches P002's request for a "read-only mode (answers and pointing only)".

**The default look is the sober "pro" character for B2B. Cute is an option.** "Childish" came up in both panels (P008, P009, P015). A SaaS buyer must see a serious version first.

**Not now:** e-commerce and Shopify (a free native competitor), showcase sites (no budget; P004 and P020 put "too expensive" at 45-59), edtech and kids (the child-data question needs legal work first; P003, P008), and indie hackers ("I'll build it myself", 1/2 earning $17k a year). **Agencies** are a *partner channel* (section 4), not the beachhead.

### Three positioning lines (recommendation: A)

**A (recommended):**
> For small B2B SaaS teams whose trial users sign up and never reach the "aha" step, **Mascott is the AI onboarding guide with a face** that answers from your docs and **points new users to their next step**, on top of the Intercom or Crisp you already run, with a built-in A/B report and your month refunded if activation doesn't lift. **Unlike Userpilot or Appcues,** you don't build tours by hand and you don't pay ~250 a month. **Unlike Intercom Fin,** there's no per-resolution bill.

*Evidence:* both v2 buyers bought on "on top of my chat, no migration" plus "measured lift plus refund". The SaaS segment is the only one that bought. The bill-anxiety complaint is #1 in `competitors.md`.

**B:** "The friendly AI guide that gets trial users to activation: set up for you in 24 hours, proven by its own A/B test." This is simpler, but loses the "keeps your current chat" line, which was the decisive argument for P011.

**C:** "Intercom Fin's per-resolution bill, replaced by a flat-priced guide that also shows users where to click." This line is good for "vs" pages. As a main message it is too narrow and too negative.

**Category name to own in SEO and GEO:** "AI onboarding guide" (secondary: "AI onboarding agent"). "Mascot" is the brand and the differentiator, not the category buyers search for.

---

## 2. SEO plan

### Principles
1. **One topic: SaaS onboarding and activation.** Every page links back to it. Topical focus is the only edge a new domain has.
2. **Bottom-funnel first** (alternatives, vs, pricing calculators). These pages convert at 4-8% and are what LLMs quote when someone asks "best X for Y".
3. **Each page carries a facts table** (price, quota, what it does, what it doesn't, last verified date). That table is also the GEO asset.
4. **No fabricated numbers.** Competitor prices carry a "verified on <date>" link. Lift claims appear only once the benchmark exists.
5. Volumes: `unknown` everywhere until checked. Difficulty (KD) is my estimate: **L** = beatable in under 3 months by a new domain with 5-15 good links; **M** = 6+ months and real links; **H** = needs authority we do not have, so publish for GEO and conversion, not for ranking.

### Keyword and topic map (37 targets)

**Cluster A: bottom of the funnel: alternatives, vs, pricing (commercial intent; the money pages)**

| # | Target | Intent | KD (est.) | Volume | Page |
| --- | --- | --- | --- | --- | --- |
| 1 | intercom fin alternative for startups | commercial | H | unknown | /alternatives/intercom-fin |
| 2 | intercom fin pricing calculator / cost per resolution | commercial / tool | M | unknown | /tools/intercom-fin-cost-calculator |
| 3 | userpilot alternatives | commercial | M | unknown | /alternatives/userpilot |
| 4 | appcues alternatives | commercial | M | unknown | /alternatives/appcues |
| 5 | userguiding alternatives | commercial | L-M | unknown | /alternatives/userguiding |
| 6 | product fruits alternatives | commercial | L | unknown | /alternatives/product-fruits |
| 7 | tandem ai alternative / tandem pricing | commercial | L | unknown | /alternatives/tandem |
| 8 | chatbase alternative for saas | commercial | M | unknown | /alternatives/chatbase |
| 9 | crisp vs intercom for early-stage saas | commercial / info | M | unknown | /compare/crisp-vs-intercom-startups |
| 10 | mascotbot alternative | commercial | L | unknown | /alternatives/mascotbot |
| 11 | Mascott vs Userpilot / vs Intercom Fin / vs Appcues | commercial (brand) | L | unknown | /compare/* (three pages) |
| 12 | cheap product tour software / onboarding tool under $100 | commercial | M | unknown | /best/onboarding-tools-under-100 |

**Cluster B: "AI agent for SaaS onboarding" (category creation; mid-funnel)**

| # | Target | Intent | KD | Volume | Page |
| --- | --- | --- | --- | --- | --- |
| 13 | ai onboarding agent | commercial / info | L-M (emerging) | unknown | /ai-onboarding-agent (pillar) |
| 14 | ai agent for saas onboarding | commercial | L | unknown | pillar section + /blog |
| 15 | in-app ai assistant for saas | commercial | M | unknown | /in-app-ai-assistant |
| 16 | ai product tour / ai-generated walkthrough | commercial | M | unknown | /ai-product-tour |
| 17 | add ai to intercom messenger / ai on top of crisp | commercial | L | unknown | /integrations/intercom, /integrations/crisp |
| 18 | improve trial to paid conversion saas | info | H | unknown | /guides/trial-to-paid |
| 19 | saas activation rate benchmark | info (data) | M | unknown | /benchmarks/activation (the GEO magnet) |
| 20 | reduce time to value saas | info | M | unknown | /guides/time-to-value |
| 21 | interactive walkthrough without code | commercial | M | unknown | /no-code-walkthrough |
| 22 | does an onboarding chatbot increase activation | info | L | unknown | /research/onboarding-chat-lift |

**Cluster C: website mascot and AI mascot (brand territory; low intent and low competition)**

| # | Target | Intent | KD | Volume | Page |
| --- | --- | --- | --- | --- | --- |
| 23 | ai mascot for website | commercial | L | unknown | /ai-mascot-for-website |
| 24 | animated mascot chatbot / chatbot with a character | commercial | L | unknown | /animated-chatbot-mascot |
| 25 | saas mascot examples (Duolingo-style) | info | L | unknown | /blog/saas-mascot-examples |
| 26 | do mascots increase conversion | info (data) | L | unknown | /research/do-mascots-lift-conversion |
| 27 | talking avatar for website (vs photoreal avatars) | commercial | M | unknown | /compare/mascot-vs-photoreal-avatar |
| 28 | professional mascot / non-childish brand character | info | L | unknown | /blog/professional-mascot-b2b |

**Cluster D: programmatic pages (built from one template, each with genuinely unique content: the category's typical "aha" step, example prompts, a screenshot of the guide on a sample app)**

| # | Template | Intent | KD | Count | Notes |
| --- | --- | --- | --- | --- | --- |
| 29 | "AI onboarding guide for [SaaS category] apps" (CRM, invoicing, HR, analytics, project management, email marketing, scheduling, dev tools, LMS, no-code builders...) | commercial | L each | 15 in W5-W12, then 30+ | Beachhead-pure; ship in batches of 5 |
| 30 | "Add an AI guide to a [stack] app" (Next.js, React, Vue, Webflow, Bubble, Framer) | commercial / how-to | L | 6 | Doubles as developer docs |
| 31 | "[Tool] + Mascott" integration pages (Intercom, Crisp, HubSpot chat, Segment, PostHog, Mixpanel) | commercial | L | 6 | Needed for marketplace listings too |
| 32 | "AI mascot for [industry]" (fintech, legaltech, healthtech, edtech...) | commercial / low | L | 10 from W9 only | Secondary. Do not dilute the SaaS focus before M3 |

**Cluster E: free tools (link magnets; Product Hunt and HN fuel)**

| # | Tool | Target | KD | Why |
| --- | --- | --- | --- | --- |
| 33 | **Free AI mascot generator** (prompt or checkboxes, export a PNG plus a 5-second animated preview; watermark; email to download the animated version) | free ai mascot generator, brand mascot maker | M (Mascofast and others) | Viral and linkable; shows off the house style. Cost capped (section 6) |
| 34 | **Onboarding grader**: paste your signup URL, get a score plus the three biggest friction points (an LLM crawl of the first-run pages) | saas onboarding audit, onboarding checklist | L | **Qualifies beachhead leads**; every report ends with "see the guide on your app" |
| 35 | **Intercom Fin / Tidio Lyro cost calculator** | intercom fin cost, per-resolution pricing calculator | M | Converts bill-anxious buyers (complaint #1) |
| 36 | **Trial-to-activation calculator** ("what +X% activation is worth in MRR") | activation rate calculator | L | Pairs with the benchmark |
| 37 | **llms.txt generator for SaaS docs** | llms.txt generator | M | Developer link magnet; on-topic with GEO; brings the same founders and PMs |

### 12-week publishing calendar (~3 pages a week; ~36 assets by 10 Jan)

| Week (Mon) | Publish | Off-page and GEO action |
| --- | --- | --- |
| W1 (19 Oct) | Home (positioning A), /pricing (flat prices, hard caps, refund terms), /security (allow-list, confirm step, logs, off switch, EU hosting, DPA, sub-processors) | Keyword-tool check of all 37 targets; GSC, Bing Webmaster and GA4 set up; llms.txt plus schema live; Crunchbase, LinkedIn page, X handle |
| W2 (26 Oct) | /ai-onboarding-agent (pillar), /alternatives/userpilot, /alternatives/intercom-fin | Submit to 10 free AI and SaaS directories (list in section 3) |
| W3 (2 Nov) | /tools/intercom-fin-cost-calculator, /alternatives/appcues, /compare/mascott-vs-userpilot | Start crawling 500 SaaS signup flows for the study (section 3) |
| W4 (9 Nov) | /integrations/intercom, /integrations/crisp, /alternatives/userguiding | First Reddit and IH answers (value only, disclosed); G2 and Capterra profiles claimed |
| W5 (16 Nov) | **Study: "We tested 500 SaaS onboarding flows"** + /benchmarks/activation (v0, public data only) + onboarding grader live | Show HN (the grader); pitch the study to 3 SaaS newsletters |
| W6 (23 Nov) | Free mascot generator live + /ai-mascot-for-website + programmatic batch 1 (5 "AI onboarding guide for [category]") | Generator shared in build-in-public; first 3 G2 reviews requested from pilots |
| W7 (30 Nov) | **Product Hunt launch (Tue 1 Dec)**; /alternatives/tandem, /alternatives/chatbase, /compare/mascott-vs-intercom-fin | PH page links to the comparison hub; ask "best of" list authors for inclusion |
| W8 (7 Dec) | /research/do-mascots-lift-conversion (v1: the pilots' first A/B results, raw, n stated, nulls included); /no-code-walkthrough; programmatic batch 2 (5) | Pitch the benchmark to 10 "best AI onboarding tools" list authors |
| W9 (14 Dec) | /alternatives/product-fruits, /alternatives/mascotbot, /blog/professional-mascot-b2b, 3 stack pages (Next.js, React, Webflow) | Capterra and GetApp listing complete with ≥5 reviews |
| W10 (21 Dec) | Holiday batch, written ahead: /guides/trial-to-paid, /guides/time-to-value, /blog/saas-mascot-examples, programmatic batch 3 (5) | Refresh every "last verified" date on comparison pages |
| W11 (28 Dec) | llms.txt generator tool, /in-app-ai-assistant, /ai-product-tour, 3 integration pages (HubSpot, Segment, PostHog) | Year-end post: "What 12 weeks of onboarding A/B tests taught us" |
| W12 (4 Jan) | Benchmark v2 (all pilots), /best/onboarding-tools-under-100, /compare/mascott-vs-appcues | GSC review: drop or merge pages with 0 impressions; double down on the clusters that index |

Each page has one CTA: **"Get your guide set up in 24h, free"** (done-for-you, on the free plan with the 14-day A/B readout). This answers P014's complaint that the A/B report sat behind the 49 EUR plan. That is an offer change, flagged for `/founder-offer`.

---

## 3. GEO plan: being cited by ChatGPT, Perplexity, Google AI Overviews, Claude and Gemini

LLM answers to "best AI onboarding tool for a small SaaS" or "Intercom Fin alternative without per-resolution pricing" are built from (a) pages with clear, extractable facts, (b) third-party lists and review sites, (c) Reddit and forum threads, and (d) original data that others cite. AI referrals are still small: about 0.24% of all web traffic in 2025 and 0.32% in 2026, ChatGPT about 75% of it (SE Ranking study). They are high-intent and disproportionately B2B software research, so they are worth it for a tool like this.

### Checklist (owner: founder; done = ticked and dated in this file)

**On our site**
- [ ] `/llms.txt` (plus `/llms-full.txt`): what Mascott is, for whom, prices, limits, safety model, links to the comparison hub and the benchmark. Update it with every price change.
- [ ] Every comparison or alternatives page opens with a **40-60-word direct answer** and then a **facts table** (price, quota, overage, actions, character yes/no, setup time, free plan, "verified on" date with source links). Fair to competitors: say where they win.
- [ ] A single `/compare` hub page: one big table of ~12 tools × 10 attributes. LLMs love one canonical table.
- [ ] Schema: `SoftwareApplication` (with `offers`, priced per plan), `Organization` (with `sameAs` pointing to G2, Capterra, PH, LinkedIn, X and Crunchbase), `FAQPage` on pricing, security and alternatives pages, `HowTo` on stack pages, `Dataset` on the benchmark. `AggregateRating` only once real reviews exist, and only as shown on G2 and Capterra.
- [ ] Server-rendered HTML (no JS-only content); `robots.txt` allows GPTBot, OAI-SearchBot, PerplexityBot, ClaudeBot, Google-Extended and Bingbot; Bing Webmaster submitted (ChatGPT search leans on Bing's index).
- [ ] An "about the founder" page with a real name and LinkedIn (author entities help citation).
- [ ] Consistent entity wording everywhere: "Mascott is an AI onboarding guide with a face for SaaS apps". The same sentence goes in every directory listing.

**Off our site**
- [ ] Directories (W2-W4, free first): Product Hunt (upcoming page), There's An AI For That, Futurepedia, Toolify, AlternativeTo (listed as an alternative to Userpilot, Appcues and Intercom), SaaSHub, BetaList, Indie Hackers products, Crunchbase, G2, Capterra and GetApp, Uneed, Microlaunch. Target: **15 listings by W6.**
- [ ] "Best of" lists: find the 20 pages that currently rank or are cited for "best AI onboarding tools", "Userpilot alternatives" and "AI chatbot for SaaS". Email each author with a 3-line fact sheet plus free access. Target: **5 inclusions by W12.**
- [ ] G2 and Capterra: ask every pilot customer for an honest review after 30 days. Any incentive follows each platform's rules (neutral, disclosed, the same whatever the rating). **Never write, buy or seed fake reviews.** Target: **≥5 reviews on each by W12.**
- [ ] Reddit and forums (r/SaaS, r/startups, r/SideProject, r/UXDesign, Indie Hackers, relevant Slack and Discord communities): **3 genuinely helpful answers a week** on onboarding and activation, and disclose that you are the founder whenever Mascott is mentioned. No sock puppets. Most threads should not mention the product at all.
- [ ] Original data that gets cited:
  1. **"We tested 500 SaaS onboarding flows" (W5).** Public crawl: which chat widget each runs, whether there is a product tour, the number of steps to the first "aha", and whether help answers instantly. Doable with public pages only; no claims about Mascott.
  2. **"Do mascots lift conversion?" public benchmark (W8 and W12).** Pilot A/B tests: control (no guide or the existing chat) vs the guide, on activation rate. Publish n, the confidence interval, the losers and the nulls. If it shows no lift, publish that too and say what we changed. Credibility is the asset.
  3. A quarterly "AI onboarding tools pricing index" (refreshed comparison data).
- [ ] Podcast and newsletter guest slots (SaaS growth, onboarding): 2 by W12, each pitched with the study.

### How to measure citations
1. **Prompt panel, run every Monday (30 min):** 25 fixed prompts × 5 engines (ChatGPT with search, Perplexity, Google AI Overviews and AI Mode, Claude, Gemini). Record in `founder/geo-log.csv`: date, engine, prompt, cited (y/n), position, URL cited, competitors cited. Example prompts: "best AI onboarding tool for a small SaaS", "Userpilot alternative under $100", "Intercom Fin alternative without per-resolution pricing", "AI chatbot with a mascot for my website", "how to increase SaaS trial activation with AI". Optional from W8: a paid tracker (Otterly, Peec AI or similar; check current prices) if the manual log takes too long.
2. **Referral analytics:** GA4 or Plausible channel group "AI assistants" (referrers chatgpt.com, perplexity.ai, gemini.google.com, claude.ai, copilot.microsoft.com, plus `utm_source=chatgpt.com`). Track visits, signups and paid customers separately from organic.
3. **Self-reported attribution:** a required "How did you hear about us?" field at signup, with "ChatGPT / AI assistant" as an option. AI-driven discovery is often uncredited, so this catches it.
4. **KPI:** citation share = cited answers / 125 prompt-runs. Targets: 0% at W4, ≥5% at W8, ≥15% at W12, ≥30% at M6 (estimate).

---

## 4. Where the first euros come from (weeks 1-12, not SEO)

The arithmetic: **500 EUR MRR ≈ 11-12 paying accounts** at a ~45 EUR blended ARPA (mostly Growth at 49, some Starter at 19, and one Agency at 149 counts as 3). Planning for churn and refunds under the guarantee, **the target is 14 paying accounts by 10 Jan**, with 500 EUR reached on 18 Dec.

### Channels, ranked by expected euros before M3

| # | Channel | Why it fits small SaaS | Cost | Expected paid accounts by W12 (est.) | Works if... |
| --- | --- | --- | --- | --- | --- |
| 1 | **Founder-led outreach plus done-for-you pilots** | Both v2 buyers needed proof on their own app. A pre-built guide on *their* site is that proof. | ~250 EUR tools; ~15 h/week | **8-10** | ≥6% reply rate, ≥25% demo→paid |
| 2 | **Product Hunt (Tue 1 Dec) plus Show HN (W5, with the grader)** | PH is where "AI tool collectors" live (P001, P008, P019). B2B launches bring 50-300 signups (Lenny's Newsletter). Outside the top 10, fewer than 20. | ~150 EUR (video, assets) | 2-4 (signups convert over 30-60 days) | Top-10 of the day; ≥80 signups |
| 3 | **Build in public on LinkedIn and X** (founder account) | SaaS founders and PMs read it; it warms the outreach (a reply rate lift) and feeds PH. | 0 EUR, 4 h/week | 1-2 direct; it mostly lifts #1 and #2 | ≥3 inbound DMs a week by W6 |
| 4 | **Agency partners** (SaaS growth, onboarding and Webflow agencies that build SaaS marketing sites) | Agency plan at 149 = 3 Starter equivalents. P005 and P013 said they would resell with white-label plus proof. | 0 EUR; 2 h/week from W4 | 1 | One agency puts it on 2+ client apps |
| 5 | **Marketplace listings: Intercom App Store, Crisp Marketplace** (not Shopify) | "Works on top of the chat you have" is the winning argument. Be found where those buyers look. Check listing requirements and review times in W1. | 0 EUR; 8-12 h build | 0-1 before M3 (review delays); more after | Listing approved by W8 |
| 6 | **Viral free mascot generator** | Reach and backlinks, but **its users are mostly not buyers**. Count it as SEO and GEO, not revenue. | ≤300 EUR inference, hard-capped | 0-1 | ≥3 referring domains from it by W12 |

**Not doing before M3, and why:**
- Paid search ("intercom alternative" clicks are expensive and owned by funded players).
- Paid social at scale (no proof to show yet).
- Shopify App Store (a free native rival; wrong segment).
- AppSumo lifetime deal (cash now, but almost no MRR, a support load, and it does not count toward the MRR rule).
- Edtech and kids (minors' data question unsolved).

### The outreach machine (channel #1, concrete)
- **List (W1):** 300 small B2B SaaS with (a) a self-serve trial or free plan, (b) Intercom, Crisp or Tidio visible on the app or site, (c) 2-20 employees, (d) English or French. Sources: PH launches from the last 18 months, the BuiltWith or Wappalyzer free lookup, G2 categories, the crawl from the W5 study. Priority: signs of a weak bot (the "frustrated" filter) or a growth or PM hire (the "optimiser" filter).
- **Message:** 3 touches over 10 days, email plus LinkedIn. No volume blasting: lists of 50 or fewer per batch reply about 2.5× better than large sends (benchmark: 5.8% vs 2.1%). Each first message includes a **15-second Loom of their own signup page** with a sketch of the guide pointing at their first "aha" step (made once the grader exists, from W5; until then, a screenshot).
- **Offer:** "Founding 10": done-for-you setup in 24h, Growth at 49 EUR/month locked for 12 months, **3 months prepaid for 129 EUR**, and a refund of the month if the A/B shows no lift. Prepaying answers the board's "pre-paid commitments" condition and brings cash in before MRR.
- **Demo = their own app**, read-only mode (answers plus pointing; no form-filling), sitting next to their existing Intercom or Crisp.

### Weekly numbers to hit

"Prospects" = new companies contacted (follow-ups not counted). "MRR" = live paying MRR after refunds, at a ~45 EUR blended ARPA. These numbers are targets set from the estimates in `marketing-assumptions.json`, not forecasts.

| Week | Mon | Prospects | Demos (all sources) | New paid | Paid total | MRR target (EUR) | Other numbers to hit |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| W1 | 19 Oct | 40 | 1 | 0 | 0 | 0 | List of 300 built; demo app live; 3 pages live; 5 build-in-public posts |
| W2 | 26 Oct | 60 | 2 | 1 | 1 | 45 | 10 directories submitted; first Founding-10 prepay |
| W3 | 2 Nov | 60 | 3 | 1 | 2 | 90 | 2 pilots live with the A/B running |
| W4 | 9 Nov | 60 | 3 | 1 | 3 | 135 | **Gate 1** (below) |
| W5 | 16 Nov | 60 | 3 | 1 | 4 | 180 | Show HN of the grader: ≥300 grader runs, ≥30 qualified leads |
| W6 | 23 Nov | 60 | 3 | 2 | 6 | 270 | Generator live; 3 agency conversations; PH supporters list ≥150 |
| W7 | 30 Nov | 40 | 3 | 1 | 7 | 315 | **PH launch:** ≥80 signups (range 30-300) |
| W8 | 7 Dec | 60 | 4 | 2 | 9 | 405 | **Gate 2**; first benchmark published; first G2 reviews |
| W9 | 14 Dec | 50 | 3 | 2 | 11 | **≥500** | **Working target reached** |
| W10 | 21 Dec | 10 | 1 | 0 | 11 | 495 | Holidays: write pages; nurture emails to free signups |
| W11 | 28 Dec | 10 | 1 | 1 (agency) | 12 | 600 | Year-end lessons post |
| W12 | 4 Jan | 60 | 4 | 2 | 14 | ≥560 after churn | **M3 check on 10 Jan** |
| **Total** | | **610** | **31** | **14** | | | |

Implied funnel: 610 prospects × ~7% reply = ~43 replies → ~60% book = ~25 outreach demos, plus ~6 inbound demos (PH, HN, grader, content) = 31 demos → ~30% pay = ~9-10. Add ~4 self-serve upgrades from PH and community signups (~200 free signups × 2-3% within the window). Total: about 14.

**Gates (decide on the date; do not drift):**
- **Gate 1, Fri 13 Nov (W4):** ≥8 demos and ≥2 paid (or prepaid) so far. If reply rate is <4%, rewrite the message and switch the filter to "frustrated with current chatbot" only. If demos happen but nobody pays, the offer is wrong: run `/founder-offer` and test a paid setup (199 EUR one-time, refundable) instead of a free pilot.
- **Gate 2, Fri 11 Dec (W8):** ≥300 EUR MRR. If below: move all content hours to outreach plus agency deals for W9-W12, and add a one-time "done-for-you onboarding audit plus guide" at 299 EUR as a cash bridge (cash is not MRR, so say so honestly in the M3 review).
- **M3, Sun 10 Jan 2027:** ≥500 EUR MRR → continue, with SEO and GEO taking a larger share. Paid accounts but <500 → the founder decides on extending against the explicit rule; the data to decide with is in the KPI sheet. 0 EUR → the business is dead as scoped (founder's rule).

---

## 5. Ten hooks (each answers one objection from the panels)

Format noted for each. No hook claims a lift number until the benchmark exists. Panel sentences are never shown as customer quotes.

| # | Objection (source) | Hook | Format |
| --- | --- | --- | --- |
| 1 | **Trust:** "an AI that clicks and fills forms in front of my customers" (P002, P010, P013, P014, P019) | **"It points. It doesn't click. Until you say so."** Read-only mode by default: it answers and highlights the next button, and actions are allow-listed and confirmed by the user. | Homepage H1 alternative; LinkedIn post opener |
| 2 | **Trust, wrong answers:** "confidently wrong in front of a customer" (P017, and complaint #2 in competitors.md) | **"Our guide says 'I don't know' — and shows the doc it read."** Every answer is grounded in your docs, with the source shown. Test it on your own docs before it goes live. | Ad headline; demo opening line |
| 3 | **Proof:** "show me a measured lift on a site like mine" (P001, P006, P012, P014, P020) | **"Don't believe us. Your own A/B test will tell you in 14 days."** A split test is built in: guide vs no guide, on your activation event. No lift, the month is refunded. | Cold email subject line; pricing page |
| 4 | **Proof, social:** "no G2 or Capterra reviews yet" (P003, P016, P019) | **"We publish every A/B result from our pilots — including the ones where we lost."** A link to the public benchmark replaces the reviews we don't have yet. | Benchmark page H1; X thread opener |
| 5 | **"I'll build it myself in a weekend"** (P004, P005, P006, P012, P017, P020) | **"Build the chat in a weekend. Then build the A/B harness, the docs sync, the pointing, the safety rules and the character. Or paste one script."** | 3-second video opener (split screen: weekend to-do list vs one script tag) |
| 6 | **Childish look** (P008, P009, P015) | **"Cute is optional. This is the pro version."** Show the sober character first on every B2B page, restyled to the prospect's brand colours. | Ad creative: side-by-side pro and cute on a SaaS dashboard |
| 7 | **"I already have a chatbot; no migration"** (P001, P002, P016, P020) | **"Keep Intercom. Add a guide that gets users to their first win."** It sits on top of Intercom, Crisp or Tidio; nothing to migrate; one click to turn it off. | Intercom marketplace listing title; outreach line 1 |
| 8 | **Will visitors ignore it? Is it a gimmick?** (P003, P006, P008, P012) | **"Your docs get read by 3% of trial users. Your guide meets 100% of them at step one."** *(Replace "3%" with a sourced figure or our own measured one before use. Do not ship unsourced.)* | Blog intro; LinkedIn carousel |
| 9 | **Speed and design** (P007, P018) | **"Under 30 KB, loads after your page. Check your Core Web Vitals before and after — we'll wait."** | Developer page H1; HN comment |
| 10 | **Price and bill anxiety** (Intercom and Tidio complaint #1; P011 "cost if conversations explode") | **"No per-resolution tax. Hard caps. 49 EUR flat."** Intercom Fin charges about $0.99 per resolution; ours never surprises you. *(Comparative claim: keep the price-source link and the date next to it.)* | Comparison pages; Google-style ad headline |

**When there's nothing new to say:** a weekly build-in-public post (an onboarding teardown of a well-known SaaS using the grader; a pilot's A/B status, anonymised with permission; a mascot design iteration; the MRR number, honestly).

---

## 6. Unit economics for marketing: max CAC and the 5,000 EUR split

### The most we can pay to win a customer

Inputs: ARPA 35-49 EUR/month (blended 35 if Starter-heavy, 49 if Growth). Monthly churn 5% → average lifetime 1 / 0.05 = **20 months**. Gross margin **70-75% assumed** (the board's target; LLM cost per conversation not yet measured).

| | Low case | High case |
| --- | ---: | ---: |
| ARPA (EUR/month) | 35 | 49 |
| Gross margin | 70% | 75% |
| Gross profit per month | 24.5 | 36.8 |
| LTV = GP / churn | 24.5 / 0.05 = **490** | 36.8 / 0.05 = **735** |
| Max CAC at LTV:CAC = 3 | **163** | **245** |
| **Cash-safe max CAC (payback ≤ 3 months)** = 3 × GP | **74** | **110** |

**Rule for weeks 1-12: no paid channel may spend more than 100 EUR in cash per paying customer.** With ~5,000 EUR and a 3-month kill rule, a customer must pay back within the window, so the 3-month payback cap binds, not LTV:CAC. After M3, with proof and retention data, the cap can rise toward ~160 (low case LTV/3).

Founder time is the real CAC of outreach: at ~31 demos and ~10 outreach wins, that is about 12-15 hours per paying customer. Track it.

The **refund guarantee** raises effective CAC: if 20% of pilots claim it, every retained customer costs 1.25× as much. Track refund rate as a KPI.

### Budget split for ~5,000 EUR (all ASSUMED cash; covers the whole company, not just marketing)

| Bucket | EUR | What it buys |
| --- | ---: | --- |
| **Marketing and sales (12 weeks)** | **2,150** | |
| · Outreach stack: a separate sending domain plus 2 mailboxes, warm-up, a contact-data tool for 2 months | 350 | Protects the main domain's reputation |
| · SEO tooling: one keyword and backlink tool for 1-2 months (W1 research, W12 review) | 250 | Volumes are unknown today |
| · Free mascot generator plus grader inference (hard monthly cap, then a waitlist) | 400 | Link magnets |
| · Product Hunt and HN assets (demo video, visuals) | 150 | |
| · GEO tracking tool from W8 (optional) plus directory fast-track fees (only where they pass the CAC test) | 250 | |
| · Review requests: neutral, disclosed thank-you gifts per G2 and Capterra rules | 150 | |
| · Paid test, W8-W12 only: LinkedIn or Reddit retargeting of pricing and comparison visitors, killed if CAC > 100 | 400 | Only after Gate 2 |
| · Contingency (newsletter sponsorship if the study gets traction) | 200 | |
| **Product, infra and LLM (12 weeks)** | **1,200** | Hosting, LLM API for pilots and the free plan, domain, email, analytics |
| **Legal and trust** | **350** | DPA and privacy template review, EU hosting extras (it answers P011 and P016) |
| **Refund reserve (guarantee)** | **300** | ~6 refunded months at 49 |
| **Reserve, runway for M4-M6** | **1,000** | Not to be touched before Gate 2 |
| **Total** | **5,000** | |

---

## 7. KPIs to watch weekly (every Friday, one row per week in `founder/kpi.csv`)

| # | KPI | Target by W12 | "Change something" if... |
| --- | --- | --- | --- |
| 1 | **MRR (EUR) and paying accounts** | ≥560 / 14 | Off the weekly table by >30% for 2 weeks in a row |
| 2 | **Outreach reply rate** (positive plus neutral replies / prospects) | ≥7% | <4% after 150 prospects → rewrite the message or the filter |
| 3 | **Demo → paid** (within 14 days) | ≥30% | <15% after 10 demos → the offer or product is the problem, not the traffic |
| 4 | **Pilot A/B: share of pilots showing activation lift** | ≥50% of pilots positive | <30% → stop selling "lift"; rethink the product before marketing more |
| 5 | **Refund and churn rate** | <10% / <5% per month | Above that → stop acquisition and fix retention |
| 6 | **Free signups → activated → paid** (self-serve) | 2-3% signup→paid within 30 days | <1% → the free plan is too generous or onboarding is broken |
| 7 | **Organic: indexed pages, GSC impressions, clicks, organic signups** | 36 indexed; ≥5,000 impressions/month; first organic signups by W8-W10 | 0 impressions on a page after 4 weeks → fix internal links or merge the page |
| 8 | **GEO citation share** (25 prompts × 5 engines) plus AI-referral visits and signups | ≥15% citation share; first AI-referral signup | 0% at W8 → more third-party lists and Reddit, fewer own pages |
| 9 | **Cash CAC per channel and founder hours per paid customer** | ≤100 EUR; ≤15 h | Any channel >100 EUR cash per customer → stop it |
| 10 | **Cash balance** | ≥2,000 EUR on 10 Jan | <2,500 EUR before W8 → cut the paid test and the tool subscriptions |

**The three numbers to look at first every Friday:** MRR versus the table, demo→paid rate, and pilot A/B results. If those three are fine, SEO and GEO can be patient. If they aren't, no amount of content will save the M3 date.

---

## Rules followed
- No fake reviews, testimonials, follower counts, before/afters or "as seen on". Hook 8 is held until it has a source.
- Panel sentences are research only; none appears as a customer quote.
- Comparative price claims carry a source link and a "verified on" date. Lift claims appear only from the published benchmark, with n and method. Paid partnerships and founder identity are disclosed in forums. Not legal advice.

## Sources used in this plan (beyond the founder files)
- Product Hunt B2B signup ranges: [Lenny's Newsletter](https://www.lennysnewsletter.com/p/how-to-successfully-launch-on-product); top-3 vs outside-top-10 (vendor guide, unverified): [causo.ai](https://hub.causo.ai/guides/product-hunt-traffic-data-2026)
- Cold email reply benchmarks (3.43% average; small lists 5.8% vs 2.1%): [Instantly](https://instantly.ai/blog/cold-email-reply-rate-benchmarks), [Autobound](https://www.autobound.ai/blog/saas-outbound-sales-benchmarks-2026), [Cleverly](https://www.cleverly.co/blog/cold-email-benchmarks-by-industry)
- AI referral share of web traffic (0.24% in 2025, 0.32% in 2026; ChatGPT ~75%): [SE Ranking](https://seranking.com/blog/ai-traffic-research-study/)
- Onboarding tool prices (Userpilot ~$249-299, Appcues ~$249, UserGuiding $89; check live pages): [costbench](https://costbench.com/compare/appcues-vs-userpilot/), [Capterra](https://www.capterra.com/p/179187/Userpilot/reviews/1154786), [toolradar](https://toolradar.com/tools/userguiding/pricing)
- Free-to-paid planning rate (3-5%), competitor prices and complaints: `founder/competitors.md` and its links

Next: `/founder-offer` (move the A/B readout to the free pilot; Founding-10 prepay), `/founder-cfo` (measure LLM cost per conversation to confirm the 70-75% margin), then `/founder-brand` (pro plus cute looks), then `/founder-launch`.
