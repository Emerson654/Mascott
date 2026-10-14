# Simulator v2: changes requested by the founder (2026-10-13)

Builds on `sim/SPEC.md`. Everything there still holds unless changed here.

## 1. Deadline moves to 6 months
- The company is DEAD if at the end of **month 6 after launch** (end of week 26):
  MRR < `viability.m6_min_mrr` (1,500 EUR) OR cumulative revenue < `viability.m6_min_cum_revenue`
  (4,000 EUR). Cash < 0 at any time is still death.
- The month-3 check is no longer a death rule. Keep reporting M3 KPIs, and add an
  "early warning" flag (MRR at M3 < 300 EUR).
- Horizon: 52 weeks after launch (12 months). Report M3, M6, M9, M12.
- Rationale: the founder wants SEO/GEO to have time to work.

## 2. SEO against real competitors
Replace the generic SEO traffic curve with a competitive model calibrated from
`founder/seo-competition.json` (Semrush data, written by the SEO analyst):
- Keyword tiers A (winnable < 6 months), B (6-18 months), C (out of reach). Each has
  a monthly search volume, an average KD and the median authority of the current top 10.
- Our domain authority (0-100) grows each week with pages published, backlinks earned
  (launches, directories, free tools, social mentions, guest posts, PR) and age, with
  diminishing returns. Start at ~0, with the 8-16 week sandbox.
- For each tier, our expected position = f(our authority vs tier authority, KD,
  content depth in that cluster, page age). Clicks = volume x CTR(position), with
  CTR tables in config (e.g. pos 1-3 ~ 15-30%, 4-10 ~ 2-8%, 11-20 ~ 0.5-1%, beyond ~0).
- Weekly outputs: our authority, the share of each tier's keywords where we are in the
  top 10 and top 3, organic clicks per tier, and the week we first outrank the median
  competitor in each tier (or never).
- GEO stays a separate channel. Citations grow with comparison pages, directory listings,
  reviews, social mentions and authority.

## 3. New channel: social media with a community manager
- Department "Social / community": platforms LinkedIn, X, TikTok/Instagram/YouTube
  Shorts. Short videos of cute animated mascots are the natural content format.
- Staffing options (strategy lever): founder hours only, OR a freelance community
  manager at `social.cm_cost_per_month` (estimate 600-1,500 EUR/month, part-time), OR both.
  A CM produces N posts/week. Founder posts add authenticity (build in public).
- Model: posts -> impressions -> followers (compounding) with heavy-tailed viral hits
  (lognormal, rare big spikes); followers and hits -> profile and site visits -> signups.
  Only a share of the audience is the B2B SaaS target (config per platform). Social
  mentions slightly boost GEO citations and SEO authority (backlinks/brand searches).
- Report the CAC including the CM cost, and whether the CM pays for itself.

## 4. Product: "installed in a few clicks" (founder's core value)
The founder's vision: the user designs the mascot by prompting or ticking criteria,
generates it, then puts it on their site in a few clicks. This is a key differentiator.
- Product lever `install`:
  - `snippet` (baseline): a script tag plus manual configuration of content and actions.
  - `few_clicks`: guided wizard (prompt or checkboxes -> mascot), automatic crawl of the
    site's content, ready-made plugins/integrations (WordPress, Webflow, Shopify, Wix,
    Framer, Google Tag Manager, plus copy-paste snippet for React/Next/SaaS), working on
    the site in < 5 minutes.
- Effects of `few_clicks` (config, all estimates): +2-4 build weeks and more engineering
  hours; much shorter time-to-value; higher trial activation and trial->paid; fewer
  support hours per new customer (done-for-you setup becomes optional); more installs
  from plugin directories and marketplaces; the "Made with Mascott" badge and shareable
  mascot pages feed social and referral; slightly widens appeal to self-serve segments
  (agencies, small businesses). The CEO can still choose done-for-you on top.
- The mascot generator itself (prompt/checkboxes, one house style, shared animation set)
  can be offered free as a lead magnet and SEO/social asset (strategy lever).

## 5. Which channel works best? (new experiment)
On the best strategy found, run:
- **Single-channel**: only SEO, only GEO, only outreach, only social (founder),
  only social (with CM), only launches/directories, only marketplaces/plugins.
  Hours for removed channels are given to engineering.
- **Leave-one-out**: the best strategy minus each channel.
- **Channel x time**: share of new paying customers by channel in months 1-3, 4-6,
  7-12 (shows SEO taking over later, or not).
For each: survival (M6 rule), MRR at M6/M12, customers, CAC with and without founder
hours, cash cost. Write `sim/results/channels.json` and a report section that ranks
channels and answers: "is social worth it, with or without a CM?" and "does SEO pay
off within 6 / 12 months against these competitors?".

## 6. Iterations and search
- Iteration 1 (naive) = the founder's stated vision: few-clicks install, cute mascot with
  a pro option, all segments, SEO + GEO + social as the main channels, 29/79 EUR with a
  free plan. The CEO playbook gains moves for social (hire/drop the CM, shift platforms)
  and install (switch snippet <-> few_clicks).
- The broad search covers the new levers (install, social staffing, CM cost, free
  generator).
- The report states the best strategy, the best strategy that keeps the founder's
  vision (few_clicks + cute), and the gap between them.

## 7. Keep
Standard library only; deterministic seeds; every new assumption in `sim/config.json`
with `_source`; tests updated (M6 rule, social channel accounting, install effects,
SEO competition: a strong-authority market blocks a new domain, a weak one does not);
`--quick` < 2 min; `--full` < 40 min on 2 vCPUs.
