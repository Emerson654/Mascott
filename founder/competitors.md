# Competitors: Mascott

Research date: 2026-10-13. Method: `.claude/skills/founder-competitors/SKILL.md`. Public sources only.

> **Read this first: how reliable the sources are.** This session could not fetch any vendor website directly (WebFetch returned DNS errors for anam.ai, intercom.com, tidio.com, mascot.bot and acquire.com). **Every price below comes from web-search results, which mostly quote third-party pricing guides (2026)**, and many of those guides are written by competing vendors. Where sources disagreed, the range is given. Check each vendor's live pricing page before building pricing on these numbers. Conversion: USD x 0.92 = EUR.
>
> Budget and team assumptions in `idea.md` are ASSUMED (not stated by the founder). They are repeated here as the skill requires.

Files: `founder/competitors.csv` (one row per competitor), `founder/competitors.json` (pricing rows for `/founder-pricing`).

---

## 1. Who is there (sorted by how directly each competes)

### Direct: characters/avatars on websites, or agents that act on the page

No product found does all three: a **cute, customisable mascot**, **acting on the page**, and **self-serve SMB pricing**. Each direct competitor does one or two.

| Name | Character? | Acts on the page? | Price (EUR/month) | Notes |
| --- | --- | --- | --- | --- |
| **Mascotbot** | Yes. Animated mascots built on Rive, lip-sync API, custom characters made by in-house animators ([AlternativeTo](https://alternativeto.net/software/mascotbot/about)) | Not stated | ~184 to 3,211 ($200 to $3,490 per [AlternativeTo](https://alternativeto.net/software/mascotbot/about); unverified, vendor site unreachable) | Closest on look and feel. Sells avatars *for* other people's agents, with high-touch production and enterprise pricing |
| **Mascofast** | Yes. Text or image to an animated mascot, exported as a transparent looping GIF ([chatgate.ai](https://chatgate.ai/post/mascofast), [Peerlist](https://peerlist.io/dikjain/project/mascofast--ai-mascot-generator)) | No, it is a generator only | Credit-based monthly plans; about 12 credits per flow ([chatgate.ai](https://chatgate.ai/post/mascofast)); amounts unknown | Shows the "generate a mascot from a prompt" step is already a commodity. Listed as beta |
| **Anam** | Photoreal human faces ([toolify](https://www.toolify.ai/tool/anam)) | No | Free (30 min); Starter 11 (50 min); Explorer 45 (250 min, first plan without a watermark); Growth 275; overage EUR 0.10 to 0.15 per minute ([toolify](https://www.toolify.ai/tool/anam)) | Metered per minute. Human faces, not mascots |
| **Famulor AI Avatar** | 120+ ready-made faces in a web widget ([famulor.io](https://www.famulor.io/feature/ai-avatar)) | No (voice and chat) | Per talk-minute plus an avatar surcharge; pay-as-you-go tier ([famulor.io](https://www.famulor.io/feature/ai-avatar), [aiindigo](https://aiindigo.com/tool/famulor)) | Voice-agent company adding faces |
| **Sentifyd** | 3D avatars; WordPress plugin ([G2 marketplace](https://ai.g2.com/marketplace/tools/sentifyd-ai-3d-avatars), [wordpress.org](https://es.wordpress.org/plugins/?p=262552)) | No | Free, pay-as-you-go and Enterprise tiers; amounts not found | |
| **Pickaxe, Agent Page Control** | No | **Yes.** Reads the page structure, clicks buttons, links and toggles, scrolls, and runs multi-step sequences. Not available in iframe embeds ([changelog](https://pickaxe.co/learn/changelog/agent-page-control), [community](https://community.pickaxe.co/t/agent-page-control-give-your-embeds-page-superpowers/8578)) | Not retrieved | **The most dangerous for the "acts on the site" claim.** It is self-serve and works from a snippet |
| **Tandem** (Paris) | No | **Yes.** Clicks, fills forms, navigates, calls APIs; "Do it with AI" button ([usetandem.ai](https://usetandem.ai/product/ai-agent)); $3.8M seed ([tech.eu](https://tech.eu/2025/07/09/tandem-raises-38m-to-build-a-future-where-all-apps-can-think-and-act-for-us/)) | Sales-led, demo first, no public price ([pricing](https://usetandem.ai/pricing)) | Targets B2B SaaS onboarding (vendor-cited customers include Qonto, Aircall and Sellsy) |
| AIsuru | n/a | n/a | n/a | **Not verified.** The search returned nothing about it, so it is not included |

Other 2025-2026 activity: no named "AI mascot widget" launch turned up for 2026. One vendor guide reports a trend of animated chatbots and talking avatars on websites, and adds that "faces and motion are not magic conversion levers" ([MessengerBot](https://messengerbot.app/fr/?p=254890)). An acquire.com listing titled "AI mascot creation and animation platform for brands and developers" exists ([acquire.com](https://app.acquire.com/startup/d6jmha7vmf-ai-mascot-creation-and-animation-platform-for-brands-and-developers)). The page could not be opened, so its numbers and identity are unknown. A mascot startup being up for sale is a weak signal to look into.

### Indirect: AI chatbot widgets (the default purchase)

| Name | Entry price | Mid tier | Usage meter | Free tier |
| --- | --- | --- | --- | --- |
| **Intercom Fin** | Essential $29/seat/month annual, $39 monthly (EUR 27 to 36) | n/a | **$0.99 (EUR 0.91) per resolution**; several sources cite a 50-resolution monthly minimum ([Ringly](https://www.ringly.io/blog/intercom-pricing), [dragapp](https://dragapp.com/blog/intercom-pricing/), [dev.to](https://dev.to/omar_bni_f6856a8bb0e021e9/intercom-fin-pricing-in-2026-the-real-math-behind-099-62j)) | No (trial only) |
| **Tidio + Lyro** | Starter $29/month, 100 conversations (EUR 27) | Growth from $59 (EUR 54), up to $349 | Lyro add-on from $39/month for 50 AI conversations; about $0.70 per conversation from 200 ([dragapp](https://www.dragapp.com/blog/tidio-pricing/), [eesel](https://eesel.ai/blog/tidio-pricing)) | Yes: 50 conversations a month, plus 50 lifetime Lyro conversations |
| **Crisp (Hugo AI)** | Mini $45 (EUR 41) | Essentials $95 (EUR 87); Plus $295 | AI credits ($5, $25 or $75 a month) that do not roll over ([featurebase](https://www.featurebase.app/blog/crisp-pricing), [dragapp](https://www.dragapp.com/blog/crisp-pricing/)) | Yes (2 seats) |
| **Chatbase** | Hobby about $40 monthly or $32 annual (EUR 37); 500 credits, **5 AI actions** | Standard $120 (EUR 110); Pro $400 | Extra credits about $40 per 1,000; branding removal about $99/month ([chatarmin](https://chatarmin.com/en/blog/chatbase-pricing), [layer3labs](https://www.layer3labs.io/guides/chatbase-pricing)) | Yes (about 50 credits) |
| **CustomGPT.ai** | Standard $99 (EUR 91) | Premium $499 (EUR 459) | Query quota ([Capterra](https://www.capterra.com/p/10004844/CustomGPT-ai/pricing/), [customgpt.ai](https://customgpt.ai/?p=31379)) | Trial only |
| **Botpress** | Plus $89 + AI spend (legacy) or $150 annual with 250 conversations (new workspaces from 2026-05-14) | Team $495 + AI spend, or $750 | Per conversation ([Voiceflow blog](https://www.voiceflow.com/blog/botpress), [costbench](https://costbench.com/software/ai-chatbot-platforms/botpress/)) | Yes ($5 AI credit, per [dmchamp](https://dmchamp.com/best/best-free-ai-chatbots-2026/)) |
| **Voiceflow** | Pro $60 (EUR 55), 10,000 credits | n/a | Extra editor $50 ([tinycommand](https://tinycommand.com/ai-agents/botpress-vs-voiceflow)) | Not confirmed |
| **Shopify-specific** | EmbedAI app: free to $99 ([Shopify App Store](https://apps.shopify.com/embedai)); Tidio's Shopify app (see market signals) | | | |
| **AppSumo lifetime deals** | Tiny Talk $49 one-time; DM Champ $59 ([zplatform](https://zplatform.ai/lifetime-deals/tiny-talk-lifetime-deal-review/), [dmchamp](https://dmchamp.com/best/best-cheap-ai-chatbots-2026/)) | | "Lifetime usually does not include AI usage" ([99signals](https://www.99signals.com/appsumo-deals/)) | |

### Substitutes

- **Nothing, or an FAQ page and a contact form.** This costs EUR 0 and is the real default for most small sites.
- **Platform-bundled AI, free.**
  - **Shopify Inbox** is free on every Shopify plan and has an optional AI agent that uses the catalog, policies and Knowledge Base. It has 5,464 reviews ([App Store](https://apps.shopify.com/chat), [reviews](https://apps.shopify.com/reviews/2286033), [Kanal](https://getkanal.com/blog/shopify-inbox)).
  - **Wix**: AI Site Chat could no longer be installed on new sites from March 2026 and was replaced by Wix Smart Chat ([Wix support](https://support.wix.com/en/article/about-the-wix-ai-chat-assistant)).
  - **Webflow**: no native assistant for site visitors was found; Webflow's AI is for builders ([aThemes](https://athemes.com/?p=2264394)).
  - **Shopify Sidekick** is for merchants, not shoppers ([Ringly](https://www.ringly.io/nl/blog/ai-sidekick-shopify)).
- **Developer kits for builders.**
  - **CopilotKit**: open source; Copilot Cloud has a free Developer tier, and Pro and Enterprise prices are not published ([docs](https://docs.copilotkit.ai/integrations/agno/premium/overview)). One aggregator claims cloud plans start "from $5K/mo", which is unverified ([aicoolies](https://aicoolies.com/pricing/copilotkit)).
  - **OpenCopilot**: open source ([Product Hunt](https://www.producthunt.com/products/opencopilot)).
- **A DIY GPT wrapper**: LLM API cost plus a weekend of work. Indie hackers, who are one of Mascott's target segments, can build this themselves.
- **Visitors' own browser agents.** Chrome auto-browse can fill forms and book appointments ([TechRadar](https://www.techradar.com/computing/artificial-intelligence/theres-a-new-ai-agent-ready-to-browse-the-web-and-fill-in-forms-without-the-need-to-touch-your-mouse), [Yahoo Tech](https://tech.yahoo.com/articles/ai-agent-ready-browse-fill-020000240.html)). Over time, "the AI acts on the site for you" may come from the visitor's browser rather than from the site.

## 2. Price range (entry paid tier of an AI chat or avatar widget, EUR/month)

| | Product | Price |
| --- | --- | --- |
| Lowest | Anam Starter | 11 |
| Median | Crisp Mini | 41 |
| Highest self-serve | CustomGPT Standard | 91 |
| Highest of all | Mascotbot (unverified) | 184+ |

The nine entry prices in the sample, in EUR: 11, 27 (Intercom, one seat, before Fin fees), 27 (Tidio), 37, 41, 55, 82, 91, 184.

- **Usage meters are now the norm**: per resolution (EUR 0.91 at Intercom), per AI conversation (about EUR 0.64 at Tidio from 200), per credit or per minute.
- Mascott's hypothesis (Starter EUR 19 to 29, Pro EUR 79) sits at or below the median entry price. It is credible against Tidio and Chatbase. It is far below Mascotbot, so it would be the only cheap mascot option.

## 3. Positioning map (text)

Axes: **X = how much it does** (answers questions → acts on the page). **Y = how much character** (plain text bubble → embodied character).

```
           character / embodied
                 ^
  Mascotbot(EUR) |                    [ GAP: cute mascot + acts on page
  Anam, Famulor, |                      + self-serve EUR 19-79 ]  <- Mascott
  Sentifyd       |
  Mascofast(gen) |
 ----------------+--------------------------------------> acts on the page
  Tidio, Crisp,  |  Chatbase (5 AI actions), Intercom Fin (procedures)
  Shopify Inbox, |  Pickaxe Page Control, Tandem (sales-led),
  CustomGPT, FAQ |  CopilotKit/OpenCopilot (DIY)
                 |
           text bubble
```

Price adds a third dimension:
- Avatar players are metered per minute or priced for enterprise (Mascotbot).
- Players that act on the page are either developer kits (CopilotKit) or sales-led (Tandem).
- Pickaxe is the exception: self-serve, but with no character.

## 4. What customers complain about (ranked)

The main sources are listed below. Many write-ups are by competitors, so counts are given where a review platform publishes them.

1. **Unpredictable usage bills and per-resolution "tax"** (strong theme; seen at Intercom and Tidio).
   - Intercom: a Capterra reviewer says Fin at about $0.99 per resolution "adds up quickly at scale" ([Capterra](https://www.capterra.com/p/134347/Intercom/reviews/)). One review scores pricing predictability 2/5 and says Fin "gets more expensive precisely as it gets better" ([sitegpt](https://sitegpt.ai/blog/intercom-fin-ai-review)).
   - Tidio: G2 tags 76 reviews "Expensive" and 56 "Cost" out of 1,962 ([getmacha](https://www.getmacha.com/blog/tidio-review), secondary). Users report automatic plan upgrades during traffic spikes and refund difficulty ([eesel](https://www.eesel.ai/blog/tidio-reviews)). One analysis cites renewal increases of 27 to 112% ([costbench](https://costbench.com/guides/tidio-pricing-2026/)). A two-message chat and a 20-message chat count the same ([mooonai](https://blog.mooonai.com/en/tidio)).
2. **Hallucinations and wrong answers** (Chatbase, Intercom).
   - Chatbase: "will confidently generate totally wrong answers" ([Capterra](https://capterra.com/p/10012414/Chatbase/reviews/)).
   - Intercom: Fin "struggles with nuance", giving outdated or generic replies on complex issues ([hiverhq](https://hiverhq.com/blog/intercom-review)). The Chatbase evidence is thin and mostly from 2023-24 reviews.
3. **Seat and add-on stacking** (Intercom, Crisp, Chatbase).
   - Intercom gets expensive past 10+ agents ([yourgpt](https://yourgpt.ai/blog/comparison/intercom-review)).
   - Chatbase charges about $99/month to remove its branding ([chatarmin](https://chatarmin.com/en/blog/chatbase-pricing)).
   - Anam keeps its watermark below the $49 plan ([toolify](https://www.toolify.ai/tool/anam)).
   - This matters for Mascott: white-labelling the mascot is a paid lever every competitor uses.
4. **Support and refund policies** (thin). Chatbase refused a $22 refund because it has no refund policy, per a single review ([Capterra](https://www.capterra.com/p/10012414/Chatbase/reviews/?page=3)). Chatbase scores 3.8 for customer service versus 4.6 for ease of use.
5. **Visitors find chat pop-ups intrusive** (thin, forum anecdotes). A visitor will "close the box, get frustrated the next time it pops up, and eventually choose to go back to the site less" ([Moz Q&A](https://mozprod.nodebb.com/community/q/topic/59881/do-you-like-live-chat-pop-ups-please-comment/3)).
   - This is a direct risk for an animated, attention-grabbing mascot. It is also an opening for a mascot that "sleeps" and stays out of the way.
6. **Rigid scripted flows** (thin). Lyro cannot pick up off-script questions inside Flows ([yourgpt](https://yourgpt.ai/blog/comparison/tidio-review)).

No Reddit threads were retrieved directly. One competitor blog quotes an r/SaaS "resolution tax" post that could not be verified ([sitegpt](https://sitegpt.ai/blog/intercom-fin-ai-review)).

## 5. Market signals (uncertainty marked)

- **Adoption**:
  - 60% of B2B and 42% of B2C companies use chatbot software, per Tidio figures ([Ringly](https://www.ringly.io/blog/chatbot-statistics-2026)). **Medium-low confidence**: a vendor statistic, recycled from blog to blog.
  - "64% of small businesses plan to adopt AI chatbots by 2026" is an intention, not use. The same source puts actual small-business chatbot use at 16% (old). **Low confidence.**
  - No primary crawl data (such as BuiltWith) was found for live-chat penetration.
- **Shopify install volumes**:
  - Tidio is installed on **30,623 Shopify stores, down 12.8% year on year** ([StoreLeads](https://storeleads.app/reports/shopify/app/tidio-chat), medium confidence; snapshot date unclear). It has about 1,137 to 1,181 reviews at 4.7 ([App Store](https://apps.shopify.com/reviews/2064651)).
  - The free Shopify Inbox has **5,464 reviews** ([App Store](https://apps.shopify.com/reviews/2286033)).
  - Signal: the native free AI agent is growing as paid chat apps shrink on Shopify. **Shopify is a hard segment for a paid chat add-on.**
- **Free-to-paid conversion**:
  - The ChartMogul and ProductLed 2026 report (200 B2B products) gives a median of 8% free-to-paid. About 25% of freemium products convert below 2.5%, and about 25% reach 10 to 15% ([ChartMogul](https://chartmogul.com/reports/saas-conversion-report/)).
  - First Page Sage reports an average of 3.7% for classic freemium (via [Userpilot](https://userpilot.com/blog/freemium-to-premium)).
  - **Planning number for the CFO: 3 to 5% of free signups pay** (medium confidence).
- **How these companies acquire customers** (inferred from what the searches surfaced; **medium confidence**):
  1. **SEO on "X pricing 2026" and "X alternatives" pages.** Almost every pricing result was a competitor's comparison post (dragapp, eesel, sitegpt, chatarmin, costbench, getmacha, yourgpt, Voiceflow's own Botpress review). These keywords are **saturated**, which matters because SEO/GEO is Mascott's planned channel.
  2. **App marketplaces**: Shopify App Store, Wix App Market, the WordPress plugin directory (Sentifyd).
  3. **AppSumo lifetime deals** for small tools (Tiny Talk, DM Champ) ([99signals](https://www.99signals.com/?p=12515)).
  4. **Product Hunt** for developer tools (OpenCopilot).
  5. **Venture-funded sales** for agentic players (Tandem).

## 6. The gap

**Where a cute mascot that also acts on the page can win (the evidence):**

1. **Nobody combines the three.**
   - The character players (Mascotbot, Anam, Famulor, Sentifyd) do not act on the page. They are metered per minute or priced for enterprise; Mascotbot starts around EUR 184 a month (unverified).
   - The players that act (Pickaxe Page Control, Tandem, CopilotKit) have no character. They are either sales-led (Tandem) or need a developer (CopilotKit).
   - A self-serve **EUR 19 to 79** cute agent that acts on the page is empty on the map.
2. **A cheap house style is a structural edge over Mascotbot.** Mascotbot relies on custom characters made by in-house animators. Mascott's single shared animation rig makes customisation nearly free.
   - Mascofast proves that prompt-to-mascot generation is cheap and in demand. It has no agent, so it is a possible partner or a feature to match, not a moat.
3. **Bill anxiety is the top complaint about the category.** A flat price with soft quotas and no per-resolution charge answers complaint #1 directly. It must survive the CFO's inference-cost check.
4. **Segments where character is part of the product**: edtech, consumer apps, kids' and lifestyle brands, playful D2C. For these buyers, a photoreal face (Anam) or a grey bubble (Tidio) is off-brand. This is a hypothesis for `/founder-consumer`, not evidence.
5. **Agencies**: they can resell a branded mascot per client site. Every competitor charges for white-labelling, so white-labelling is a valued upsell.

**Where it cannot win:**

- **Support-volume buyers** (more than about 10 agents, helpdesk needs). Intercom, Tidio and Crisp sell an inbox, ticketing and integrations; a mascot does not replace those.
- **Shopify stores wanting basic Q&A.** The free Inbox AI agent is the default, and the leading paid app (Tidio) is losing installs there.
- **"Acting on the page" as the main pitch.** Pickaxe already ships it self-serve, Chatbase has "AI actions", and Tandem has funding. Browser-side agents (Chrome auto-browse) may make it a commodity. Agentic browsing is also known to break on client-side rendering, unlabelled forms, div-based buttons, modals and CAPTCHAs ([Homeflow](https://www.homeflow.co.uk/posts/ai-agents-are-already-browsing-your-site)). Reliability across arbitrary sites is a hard engineering problem for a solo founder.
- **Visitors who resent pop-ups.** An animated character draws more attention than a bubble. That attention can turn into annoyance (complaint #5), and one vendor admits "faces and motion are not magic conversion levers".
- **SEO and GEO at launch.** "Chatbot pricing" and "alternatives" keywords are crowded with well-funded content. The new terms Mascott could own are "AI mascot for website" and "animated AI agent". Their search volume is unknown, so check it in Semrush.

**Verdict:** there is a real but **narrow** gap. It is a positioning gap (character plus action plus a flat, low price), not a technology moat. The mascot is the differentiator; the agentic actions are table stakes that others already ship.

## 7. The threat: who could copy fastest

1. **Pickaxe.** It already has a self-serve embed with Page Control. Adding an animated avatar skin would match Mascott's core promise in weeks.
2. **Mascotbot.** It has the mascots and lip-sync. Adding a cheaper self-serve tier plus page actions would make it a direct head-to-head competitor.
3. **Tidio, Crisp and Chatbase.** Each has millions of widget installs and could ship "pick a mascot avatar" as a cosmetic option. A character is cheap for them to add, so it does not protect Mascott on its own. The moat has to be the quality of the house style, the customisation flow and segment focus (for example edtech, consumer apps, agencies).
4. **Shopify and Wix.** They could make their free native agents more visual at any time. Avoid depending on these platforms.

Next: `/founder-consumer` should turn complaints 1, 2 and 5 into buyer objections. `/founder-pricing` should use the EUR 11 / 41 / 91 entry range and the per-resolution benchmark of EUR 0.91.
