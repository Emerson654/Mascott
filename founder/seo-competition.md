# SEO competition: how strong are Mascott's competitors, and can a new domain beat them?

Written 2026-10-14 by the SEO analyst. Answers the founder's question: *"How strong is our competitors' SEO? Are there many / very big competitors? Can a new domain rank above them within 6 months?"*

**Source.** Semrush API (via MCP), 40 calls, about 9,800 API units, pulled 2026-10-13/14. Databases: `us` (main) and `fr` (8 keywords). Volume = Semrush average monthly searches; KD = Semrush Keyword Difficulty % (0-100); CPC in USD; AS = Semrush Authority Score (0-100). Machine-readable twin: [`seo-competition.json`](seo-competition.json). Every number below comes from a Semrush report linked in the table or from an assumption that is labelled as one.

---

## 0. The answer in five lines

1. **The competitors are mid-sized, not giants.** The 18 named competitors have a median Authority Score of **37**. The biggest (Intercom, Tidio, Crisp) sit at **AS 49-50**. There are no AS 70+ players among them. The giants we meet in the SERPs are aggregators (Reddit, YouTube, Gartner, HubSpot, Zapier), and only on broad terms.
2. **Their US organic traffic is modest:** Crisp 60k/month, Intercom 44k, Voiceflow 43k, Tidio 28k, Userpilot 22k. The onboarding tools (Appcues 9k, UserGuiding 3k, Chameleon 1.7k, Product Fruits 3k) are small. The direct mascot/avatar players are almost invisible: Mascotbot (mascot.bot) AS 11, 0 US traffic; Tandem AS 18, 16 visits; Anam 701.
3. **The money keywords are low-KD.** "intercom alternative" (720/mo) has KD **13**, "userpilot alternatives" (260) KD **18**, "tidio alternative" (210) KD **20**, "product tour software" (260) KD **23**. Sites with AS **16-25** already hold top-10 spots on those SERPs.
4. **Verdict, 6 months: yes on the niche, no on the head terms.** A new domain can plausibly reach **the top 10 (and some top 3)** on about 34 low-KD keywords (**4,400 searches/month**) within 6 months. It **cannot** outrank Intercom/Tidio/Crisp on "ai chatbot for website" (KD 74) or "website chatbot" (KD 76) in 6 or even 12 months.
5. **But the prize is small:** an estimated **~25 Google clicks/month at month 3, ~200 at month 6, ~500 at month 12** (range x0.5 to x2). SEO is a compounding asset, not the 90-day revenue engine. This confirms `marketing.md` section 0.

---

## 1. Competitor domain strength (Semrush, US database)

| Domain | Authority Score | Referring domains | Organic keywords (US) | Organic traffic / month (US) | In top 10 for our sampled keywords | Semrush |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| tidio.com | 50 | 30,390 | 19,386 | 28,220 | none of the 9 sampled | [overview](https://www.semrush.com/analytics/overview/?db=us&q=tidio.com) |
| crisp.chat | 50 | 18,847 | 6,061 | 60,450 | #3 intercom alternative, #1 tidio alternative | [overview](https://www.semrush.com/analytics/overview/?db=us&q=crisp.chat) |
| intercom.com | 49 | 65,995 | 21,632 | 43,593 | none of the 9 sampled | [overview](https://www.semrush.com/analytics/overview/?db=us&q=intercom.com) |
| voiceflow.com | 48 | 9,461 | 10,590 | 43,342 | none | [overview](https://www.semrush.com/analytics/overview/?db=us&q=voiceflow.com) |
| botpress.com | 47 | 10,869 | 10,688 | 16,266 | none | [overview](https://www.semrush.com/analytics/overview/?db=us&q=botpress.com) |
| chatbase.co | 45 | 16,984 | 5,282 | 11,074 | none | [overview](https://www.semrush.com/analytics/overview/?db=us&q=chatbase.co) |
| userpilot.com | 45 | 10,311 | 15,783 | 22,480 | #1 userpilot alternatives, #3 product tour software, #2 user onboarding software, #7 ai onboarding | [overview](https://www.semrush.com/analytics/overview/?db=us&q=userpilot.com) |
| appcues.com | 42 | 8,713 | 5,695 | 9,045 | #3 user onboarding software | [overview](https://www.semrush.com/analytics/overview/?db=us&q=appcues.com) |
| userguiding.com | 38 | 8,381 | 10,591 | 3,016 | none | [overview](https://www.semrush.com/analytics/overview/?db=us&q=userguiding.com) |
| pickaxe.co | 36 | 5,582 | 4,583 | 4,760 | none | [overview](https://www.semrush.com/analytics/overview/?db=us&q=pickaxe.co) |
| productfruits.com | 35 | 1,591 | 1,247 | 2,967 | #1 product tour software, #5 userpilot alternatives | [overview](https://www.semrush.com/analytics/overview/?db=us&q=productfruits.com) |
| customgpt.ai | 34 | 7,656 | 5,003 | 2,829 | none | [overview](https://www.semrush.com/analytics/overview/?db=us&q=customgpt.ai) |
| chameleon.io | 34 | 6,248 | 2,929 | 1,727 | none | [overview](https://www.semrush.com/analytics/overview/?db=us&q=chameleon.io) |
| copilotkit.ai | 34 | 3,501 | 1,976 | 4,838 | none | [overview](https://www.semrush.com/analytics/overview/?db=us&q=copilotkit.ai) |
| anam.ai | 32 | 3,389 | 163 | 701 | none | [overview](https://www.semrush.com/analytics/overview/?db=us&q=anam.ai) |
| usetandem.ai | 18 | 3,495 | 53 | 16 | none | [overview](https://www.semrush.com/analytics/overview/?db=us&q=usetandem.ai) |
| mascot.bot (Mascotbot) | 11 | 206 | 29 | 0 | none | [overview](https://www.semrush.com/analytics/overview/?db=us&q=mascot.bot) |
| mascofast.com | 2 | 212 | not pulled | not pulled | none | backlinks only |

Authority and referring domains: [Semrush bulk backlink analysis](https://www.semrush.com/analytics/backlinks/bulk-analysis/?q=intercom.com%2Ctidio.com%2Ccrisp.chat%2Cchatbase.co%2Cbotpress.com%2Cvoiceflow.com%2Ccustomgpt.ai%2Cuserpilot.com%2Cappcues.com%2Cuserguiding.com%2Cchameleon.io%2Cpickaxe.co%2Cmascot.bot%2Canam.ai%2Ccopilotkit.ai%2Cusetandem.ai%2Cproductfruits.com%2Cmascofast.com). Keywords and traffic: Semrush `domain_rank`, US database, latest month.

**How to read it.**
- **Many competitors, none huge.** The median AS of the 18 is **37**. The top tier (Intercom, Tidio, Crisp, Voiceflow, Botpress) is AS 47-50 with 10k-66k referring domains: years of links, impossible to match in 6 months.
- **The onboarding tools are beatable on narrow pages.** Userpilot is the SEO leader of the onboarding category (15.8k keywords, 22k visits). Appcues, UserGuiding, Chameleon and Product Fruits each get under 10k US visits.
- **The direct "AI character on the website" players have no SEO at all.** Mascotbot: 29 keywords, 0 traffic. Tandem: 53 keywords. Anam: 163. **Nobody owns "AI mascot / AI onboarding guide" in search.**
- Traffic figures are Semrush estimates for the US only. Brand searches ("intercom login") make up most of the big players' traffic. That traffic is not available to us anyway.

> **Watch out: `mascott.ai` already exists in the SERP.** It ranks **#5 for "ai mascot"** (US) with AS **7** and 1,917 referring domains. Nothing in the repo says whether this is our domain. If it is not ours, it is a name collision to resolve before we buy links or print the brand (see `founder-brand`).

---

## 2. Keyword map

Volumes, KD and CPC: Semrush batch keyword overview ([US](https://www.semrush.com/analytics/keywordoverview/?db=us&q=intercom+alternative), [FR](https://www.semrush.com/analytics/keywordoverview/?db=fr&q=logiciel+onboarding)). "Top 3" and "weakest top-10 AS" come from Semrush `phrase_organic` (top 10, US) plus the bulk backlink AS of every ranking domain. They were pulled for 9 keywords. The others are tiered on KD alone and marked "KD only".

### 2a. Keywords with a full SERP check

| Keyword (db) | Volume | KD % | CPC $ | Top 3 (AS) | Weakest top-10 domain (AS) | Median top-10 AS | Tier |
| --- | ---: | ---: | ---: | --- | --- | ---: | :---: |
| intercom alternative (us) | 720 | 13 | 25.03 | ringly.io (39), reddit.com (100), crisp.chat (50) | use-apify.com (25) at #8 | 44 | A |
| userpilot alternatives (us) | 260 | 18 | 40.93 | userpilot.com (45), **productonboarding.com (16)**, userflow.com (36) | productonboarding.com (16) at #2 | 35.5 | A |
| tidio alternative (us) | 210 | 20 | 23.10 | crisp.chat (50), front.com (51), kayako.com (50) | worktual.co.uk (23) at #8 | 49 | A |
| product tour software (us) | 260 | 23 | 31.52 | productfruits.com (35), reddit.com (100), userpilot.com (45) | howdygo.com (30) at #6 | 40 | A |
| ai mascot (us) | 110 | 19 | 2.62 | masko.ai (27), template.net (73), dribbble.com (77) | **mascott.ai (7) at #5** | 69.5 | A |
| user onboarding software (us) | 480 | 32 | 19.94 | userflow.com (36), userpilot.com (45), appcues.com (42) | plgos.com (18) at #9 | 42.5 | B |
| ai onboarding (us) | 210 | 38 | 18.01 | reddit.com (100), enboarder.com (41), linkedin.com (100) | leena.ai (36) | 46.5 | B (HR intent) |
| ai chatbot for website (us) | 1,000 | 74 | 13.54 | chatbot.com (52), reddit.com (100), google.com (100) | nextlevel.ai (28) | 49.5 | C |
| logiciel onboarding (fr) | 590 | 19 | 14.75 | workelo.eu (33), culture-rh.com (47), heyteam.com (33) | foederis.fr (28) | 35.5 | excluded: 10/10 results are HR onboarding |

**What the SERPs show.** On the "alternatives" and "product tour" SERPs, top-10 spots are held by **AS 16-30 domains with 600-2,000 referring domains**. productonboarding.com (AS 16) is **#2** for "userpilot alternatives". These are the pages a focused new site can match. The chatbot head terms are different: KD 74-76, with Google, HubSpot (79) and Zapier (76) on page 1.

### 2b. Full list, by tier

**Tier A: winnable in 6 months or less** (KD < 30, weak domains already in the top 10, or no data showing otherwise)

| Keyword (db) | Vol | KD | CPC $ | Note |
| --- | ---: | ---: | ---: | --- |
| intercom alternative (us) | 720 | 13 | 25.03 | SERP checked; top 3 harder (AS 39/100/50) |
| time to value (us) | 720 | 28 | 15.62 | borderline; broad informational |
| saas onboarding (us) | 390 | 28 | 16.84 | borderline A/B |
| userpilot alternatives (us) | 260 | 18 | 40.93 | SERP checked; AS 16 at #2 |
| product tour software (us) | 260 | 23 | 31.52 | SERP checked |
| mascot generator (us) | 260 | 14 | 1.14 | free-tool page; low buyer intent |
| tidio alternative (us) | 210 | 20 | 23.10 | SERP checked |
| product adoption software (us) | 210 | 22 | n/a | |
| ai mascot generator (us) | 170 | 21 | 2.09 | free-tool page |
| appcues alternatives (us) | 140 | 3 | 22.66 | |
| ai mascot (us) | 110 | 19 | 2.62 | SERP checked |
| chatbot widget (us) | 110 | 22 | 7.70 | |
| interactive product tour (us) | 90 | 16 | 23.03 | |
| chatbot avatar (us) | 90 | 24 | n/a | |
| chatbase alternative (us) | 70 | 10 | 8.18 | |
| appcues alternative (us) | 70 | 4 | 22.66 | |
| crisp vs intercom (us) | 70 | 9 | 16.38 | |
| interactive walkthrough (us) | 70 | 5 | 37.02 | |
| userpilot alternative (us) | 50 | 0 | 40.93 | |
| alternative intercom (fr) | 50 | 25 | 8.03 | |
| ai onboarding agent (us) | 40 | 26 | 12.72 | the category name we want to own |
| ai agent for website (us) | 30 | 0 | 15.82 | |
| in app guidance (us) | 30 | 16 | 33.46 | |
| product fruits alternatives (us) | 30 | 0 | 6.69 | |
| intercom fin pricing (us) | 20 | 0 | 33.60 | calculator page |
| saas activation rate (us) | 20 | 0 | n/a | benchmark page |
| mascotte site web (fr) | 20 | 0 | n/a | |
| mascotte ia (fr) | 20 | 0 | n/a | |
| agent ia site web (fr) | 20 | 0 | 2.04 | |
| intercom fin alternative (us) | 10 | 0 | n/a | |
| userguiding alternatives (us) | 10 | 0 | 37.63 | |
| ai avatar for website (us) | 10 | 0 | n/a | |
| chatbot ia site web (fr) | 10 | 0 | n/a | |
| onboarding utilisateur (fr) | 10 | 0 | 4.44 | |
| **Total (34 keywords)** | **4,400** | **avg 10.8** | | US 4,270 + FR 130 |

**Tier B: 6-18 months** (KD 30-50, or strong top 3)

| Keyword (db) | Vol | KD | CPC $ | Note |
| --- | ---: | ---: | ---: | --- |
| onboarding checklist (us) | 2,400 | 43 | 6.96 | mixed HR + SaaS intent |
| customer onboarding software (us) | 1,000 | 36 | 47.12 | |
| digital adoption platform (us) | 1,000 | 41 | 36.32 | WalkMe/Whatfix/Pendo category |
| user onboarding (us) | 1,000 | 47 | 9.73 | informational |
| talking avatar (us) | 880 | 37 | 2.04 | photoreal-avatar intent; low relevance |
| user onboarding software (us) | 480 | 32 | 19.94 | SERP checked: Gartner x2, Userpilot, Appcues |
| chatbot site internet (fr) | 320 | 38 | 6.48 | |
| ai onboarding (us) | 210 | 38 | 18.01 | SERP is HR onboarding; intent mismatch |
| **Total (8 keywords)** | **7,290** | **avg 39** | | |

**Tier C: out of reach for 12+ months** (KD > 60)

| Keyword (db) | Vol | KD | CPC $ | Note |
| --- | ---: | ---: | ---: | --- |
| ai chatbot for website (us) | 1,000 | 74 | 13.54 | Google, HubSpot 79, Zapier 76, Reddit in top 10 |
| ai customer service chatbot (us) | 1,000 | 70 | 134.10 | |
| website chatbot (us) | 720 | 76 | 13.55 | |
| **Total (3 keywords)** | **2,720** | **avg 73** | | |

Strictly, **no checked SERP has "top 10 all above AS 60"**: even "ai chatbot for website" has an AS-28 site at #4. Tier C is therefore defined by KD > 60. The difficulty there comes from the depth of content and links across the whole page, not from one giant.

**Excluded:** "logiciel onboarding" (fr, 590, KD 19). Easy on paper, but the intent is HR employee onboarding. **No measurable volume** (0 or no Semrush row): website mascot, in-app ai assistant, ai product tour, mascotbot, animated avatar chatbot, ai sales agent website, avatar ia site web, visite guidée produit. These are worth a page only for GEO/LLM answers and conversion, not for Google traffic.

---

## 3. Synthesis: what a new domain can realistically get

### Model inputs (all in the JSON)

| Input | Value | Basis |
| --- | ---: | --- |
| Tier A searches / month | 4,400 | sum of the 34 keywords above |
| Tier B searches / month | 7,290 | sum of the 8 keywords |
| Tier C searches / month | 2,720 | sum of the 3 keywords |
| Avg KD tier A / B / C | 10.8 / 39 / 73.3 | Semrush KD |
| Median AS of all top-10 slots (9 SERPs, 90 slots) | 43.5 | Semrush bulk backlinks |
| Median AS of the 18 named competitors | 37 | table in section 1 |
| CTR pos 1-3 / 4-10 / 11-20 | 18% / 4% / 0.8% | **assumption**: public CTR curves (pos 1 ~25-30%, pos 3 ~10%) discounted ~25% for AI Overviews and ads |
| Our AS, month 3 / 6 / 12 | 5 / 12 / 20 | **estimate**, see below |

**Why AS 5 / 12 / 20.** A new domain starts at AS 0-2. The off-page plan in `marketing.md` (10 directories in W2, G2/Capterra in W4, Show HN plus the 500-flow study in W5, the mascot generator in W6) should plausibly bring 30-60 referring domains by month 3 (AS ~5), 100-150 by month 6 (AS ~10-15) and 200-300 by month 12 (AS ~18-22). Benchmarks in our own SERPs: productonboarding.com is AS 16 and **#2** for "userpilot alternatives"; helphero.co (AS 22, 576 referring domains) is #8 on the same SERP; kompassify.com (AS 19) is #10.

### Expected Google clicks per month

Share of each tier's search volume where we rank in each position band (**assumption**):

| Month | Tier A: pos 1-3 / 4-10 / 11-20 | Tier B: pos 1-3 / 4-10 / 11-20 | Tier C | Clicks/month | Range (x0.5 to x2) |
| --- | --- | --- | --- | ---: | --- |
| 3 | 0% / 10% / 20% | 0 / 0 / 0 | 0 | **~25** | 12-49 |
| 6 | 15% / 35% / 25% | 0% / 0% / 15% | 0 | **~200** | 99-396 |
| 12 | 35% / 40% / 15% | 5% / 20% / 30% | 5% on page 2 | **~495** | 248-991 |

Calculation: clicks = Σ tier volume × share in band × CTR of band. At month 6: 4,400 × (0.15×0.18 + 0.35×0.04 + 0.25×0.008) + 7,290 × 0.15×0.008 ≈ 189 + 9 ≈ 198.

The x2 high end exists because Semrush undercounts B2B SaaS long-tail volume, and the programmatic pages (cluster D in `marketing.md`, mostly 0-10 searches each) are not in these sums. Clicks from LLMs/GEO, referrals and Product Hunt are **not** counted here.

What the clicks are worth: the alternatives and vs pages (~1,760 of the 4,400 tier-A searches; CPC 22-41 USD) convert best. At ~200 clicks/month at month 6 and the 4-8% page conversion assumed in `marketing.md`, that is about 8-16 trials a month from Google: a useful supplement, not a sales engine.

---

## 4. Verdict

**Can a new domain rank above them within 6 months?**

- **Yes, on the long tail and the "alternatives" pages.** KD 0-23, top 10 already shared with AS 16-30 sites, and Intercom and Tidio are not in the top 10 for "intercom alternative" / "tidio alternative". Crisp (a rival) and Userpilot (its own term) are. Target: top 10 on most of tier A by month 6, top 3 on the narrowest ("appcues alternatives", "interactive walkthrough", "ai onboarding agent", "chatbase alternative", "crisp vs intercom").
- **Probably not top 3 on "intercom alternative" or "tidio alternative" by month 6.** The top 3 there average AS ~50, and Reddit holds #2 on "intercom alternative". Realistic target: page 1, positions 5-10.
- **No, on the category head terms** ("ai chatbot for website", "website chatbot", "ai customer service chatbot": KD 70-76), even at 12 months. Do not build the plan on them.
- **The opening that nobody holds:** "AI mascot / AI onboarding guide". The direct rivals (Mascotbot, Tandem, Anam) have almost no SEO, and the "ai mascot" SERP has an AS-7 site at #5. Volume is tiny (~110-260/month) but it is uncontested and is what LLMs will quote.
- **Business reality:** ~25 clicks at month 3, ~200 at month 6. SEO does not rescue the 500 EUR MRR target by Dec 2026. Keep the 60/30/10 split in `marketing.md`.

**Actions this implies (change to `marketing.md` §2):** (1) replace the "unknown" volumes with the numbers above; (2) move "userpilot alternatives", "appcues alternatives", "product tour software" and "intercom alternative" to W2-W3 (highest value, lowest KD); (3) drop "ai onboarding" as a pillar keyword, because its SERP is HR, and use "ai onboarding agent" instead; (4) check who owns `mascott.ai` before anything else.

### Limits
- SERPs were checked for 9 keywords. The other 37 are tiered on KD only.
- Traffic, AS and KD are Semrush estimates (latest month). Volumes for niche B2B terms are often understated.
- CTR, position shares and our future AS are assumptions, labelled as such. Re-run with Google Search Console data at month 3.
