# Mascott company simulator v2 - results

Mode: **full** | seeds per iteration: 400 | search: 792 strategies x 200 seeds, 10 finalists re-run at 2000 fresh seeds | channel experiment: 600 seeds per variant
Base seed 20261013 (seed ranges in each JSON file). Runtime 401 s, 239600 simulated companies, 4 workers.

> **Death rule (v2):** a company dies if cash < 0 at any time, or if at the end of month 6 after launch (week 26) MRR < 1500 EUR or cumulative revenue < 4000 EUR. Month 3 is only an early warning (MRR < 300 EUR). Market numbers are estimates in `sim/config.json` except where a `_source` says panel or Semrush; SEO competition is calibrated from `founder/seo-competition.json`. Read survival rates as relative rankings, not forecasts.

## Headline

- **Founder's vision as stated** (few-clicks install, cute + pro option, all segments, SEO + GEO + social, 29/79 + free plan, broad scope): survival **0%**, MRR p50 M3/M6/M12 0 / 0 / 0 EUR (M12 p90 0), customers M12 p50 0, gross margin p50 60%, monthly churn p50 9.1%, early warning at M3 in 100% of runs. Main cause of death: build_too_long 81%.
- **CEO relaunches**: 30 iterations; best survival **53%** at iteration 30; the 60% target was **not** reached.
- **Best strategy (broad search)**: survival **58%**, MRR p50 M3/M6/M12 778 / 1681 / 3664 EUR (M12 p90 7937), customers M12 p50 43, gross margin p50 85%, monthly churn p50 5.7%, early warning at M3 in 18% of runs.
  - install=few_clicks | targets=smallSaaS | price=66/190 +overage 1.0/100 annual-17% | hours: engineering 26%, seo 7%, geo 3%, social 5%, outreach 48%, launches 8% | scope=js_saas/2 actions | DFY setup, guarantee, presell pilots, pro style, ads 600/mo, prelaunch mkt 25%, social mix linkedin 32%/x 34%/shorts 33%
- **Best strategy that keeps the founder's vision** (few-clicks install + cute style): survival **58%**, MRR p50 M3/M6/M12 778 / 1681 / 3664 EUR (M12 p90 7937), customers M12 p50 43, gross margin p50 85%, monthly churn p50 5.7%, early warning at M3 in 18% of runs.
  - install=few_clicks | targets=smallSaaS | price=66/190 +overage 1.0/100 annual-17% | hours: engineering 26%, seo 7%, geo 3%, social 5%, outreach 48%, launches 8% | scope=js_saas/2 actions | DFY setup, guarantee, presell pilots, pro style, ads 600/mo, prelaunch mkt 25%, social mix linkedin 32%/x 34%/shorts 33%
  - The best strategy already keeps the vision: no gap.
- **Channels (single-channel ranking on the best strategy):** only Founder outreach > only GEO > only Marketplaces / plugin directories > only Social (founder + community manager) > only SEO > only Launches / directories > only Social (founder posting).
- **Is social worth it?** Founder social posting changes survival by +2pp and mean M12 MRR by +76 EUR (within noise). Adding a community manager costs 6039 EUR/run and brings -1960 EUR of extra revenue in year 1 (survival -5pp): the CM does NOT pay for itself.
- **Does SEO pay off against these competitors?** Within 6 months: **no**; within 12 months: **no**. measured inside the best plan with SEO raised to 30% of hours (754 founder hours/run on SEO; survival -6pp vs the best plan); by M6 SEO-attributed revenue = 0.01x its cost (founder hours at 35 EUR/h; companies alive at M6); by M12 SEO-attributed revenue = 0.08x its cost (founder hours at 35 EUR/h; companies alive at M12); SEO-acquired MRR at M12 336 EUR/run vs ~2199 EUR/month of founder time; tier A outranks the median competitor in 57% of runs by M6 / 68% by M12; tier B outranks the median competitor in 1% of runs by M6 / 5% by M12; tier C outranks the median competitor in 0% of runs by M6 / 0% by M12; SEO alone: survival 1%, M12 MRR p50 0 EUR; removing SEO from the best plan: survival +0pp.
- **Stress worlds** (every sensitivity input moved 30% against / 0 / 30% for / 50% for the company): naive 0% / 0% / 1% / 62%; best_search 0% / 56% / 97% / 100%.

## 1. Relaunch log (CEO post-mortems)

Each row is one relaunch. The CEO diagnoses the dominant cause of death, applies the matching playbook move (plus occasional random exploration), and reverts any move that lowered survival by more than 4pp.

| # | built on | survival | M3 warn | M6 MRR p50 | M12 MRR p50 (p10-p90) | trial->paid | top death cause | change made for the NEXT run | why |
|---|---|---|---|---|---|---|---|---|---|
| 1 | - | 0% | 100% | 0 | 0 (0-0) | 8% | build_too_long 81% | narrow scope to js_saas + 2 actions (shorter build, higher action success rate; board Product lens: one platform, one action) | 81% of deaths were build_too_long (build weeks p50 20 / p90 20) |
| 2 | #1 | 0% | 100% | 116 | 0 (0-0) | 8% | no_traffic 98% | shift 25% of hours from SEO/GEO to founder-led outreach: against AS-40+ competitors organic traffic stays small until months 6-12 + explore: ads 300/mo | 98% of deaths were no_traffic (median 50 trials by end of run, 429 SEO / 808 GEO / 1013 social visitors per run; M6 needs 1500 EUR MRR) |
| 3 | #2 | 0% | 99% | 195 | 0 (0-0) | 9% | no_traffic 97% | shift 20% of hours from SEO/GEO to founder-led outreach: against AS-40+ competitors organic traffic stays small until months 6-12 + explore: prices x0.80 | 97% of deaths were no_traffic (median 83 trials by end of run, 183 SEO / 651 GEO / 1043 social visitors per run; M6 needs 1500 EUR MRR) |
| 4 | #3 | 0% | 98% | 235 | 0 (0-0) | 10% | no_traffic 97% | focus on 'Indie hacker / solo SaaS founder' only (best evidence: 3.3 paid/run, trial->paid 12%, 58 EUR MRR/run); one-segment positioning and topical SEO | 97% of deaths were no_traffic (median 103 trials by end of run, 93 SEO / 480 GEO / 1048 social visitors per run; M6 needs 1500 EUR MRR) |
| 5 | #4 | 1% | 84% | 431 | 0 (0-0) | 19% | no_traffic 97% | spend 25% of build-phase hours on presales outreach + first content: builds a waitlist and starts the SEO sandbox clock before launch (build gets ~33% longer) + explore: free_plan=False | 97% of deaths were no_traffic (median 144 trials by end of run, 137 SEO / 509 GEO / 1027 social visitors per run; M6 needs 1500 EUR MRR) |
| 6 | #5 | 3% | 64% | 569 | 0 (0-0) | 19% | no_traffic 60% | presell: offer pre-launch outreach replies a paid 3-month pilot (-20%) so the first euros arrive at launch instead of after the sandbox (board Offers lens condition #3) | 60% of deaths were no_traffic (median 216 trials by end of run, 348 SEO / 773 GEO / 1056 social visitors per run; M6 needs 1500 EUR MRR) |
| 7 | #6 | 4% | 58% | 598 | 0 (0-0) | 19% | no_traffic 60% | shift social to LinkedIn/X where the B2B buyers are (Shorts reach is mostly consumers) | 60% of deaths were no_traffic (median 212 trials by end of run, 364 SEO / 791 GEO / 1064 social visitors per run; M6 needs 1500 EUR MRR) |
| 8 | #7 | 5% | 58% | 584 | 0 (0-0) | 20% | no_traffic 59% | add one-shot launches (Product Hunt, Show HN, directories) for a traffic spike and backlinks | 59% of deaths were no_traffic (median 215 trials by end of run, 361 SEO / 764 GEO / 1608 social visitors per run; M6 needs 1500 EUR MRR) |
| 9 | #8 | 6% | 48% | 672 | 0 (0-0) | 20% | no_traffic 48% | offer the mascot generator free as a lead magnet (links, shareable mascots, generator searches) | 48% of deaths were no_traffic (median 240 trials by end of run, 437 SEO / 1007 GEO / 1687 social visitors per run; M6 needs 1500 EUR MRR) |
| 10 | #9 | 8% | 52% | 642 | 0 (0-0) | 20% | no_traffic 37% | hire a part-time freelance community manager (900 EUR/month) to post mascot clips daily | 37% of deaths were no_traffic (median 252 trials by end of run, 495 SEO / 1033 GEO / 2049 social visitors per run; M6 needs 1500 EUR MRR) |
| 11 | #10 | 5% | 48% | 0 | 0 (0-0) | 19% | cash_burn 78% | stop paid ads (cash burn without payback) | 78% of deaths were cash_burn (gross margin p50 81%, LLM cost p50 114 EUR, cash min p10 -202 EUR) |
| 12 | #11 | 7% | 50% | 0 | 0 (0-0) | 20% | cash_burn 54% | let the community manager go (cash burn; reach did not turn into paying B2B customers) | 54% of deaths were cash_burn (gross margin p50 82%, LLM cost p50 210 EUR, cash min p10 -131 EUR) |
| 13 | #12 | 8% | 51% | 651 | 0 (0-0) | 20% | no_traffic 41% | recruit agency partners with a per-client-site plan (one agency = several sites) + explore: hours social -> seo | 41% of deaths were no_traffic (median 250 trials by end of run, 509 SEO / 1029 GEO / 2075 social visitors per run; M6 needs 1500 EUR MRR) |
| 14 | #13 | 1% | 76% | 502 | 0 (0-0) | 14% | no_traffic 45% | REVERT. pivot beachhead from 'indie' to 'smallSaaS' (next-best segment evidence; moves within 'indie' stopped paying off); re-priced 23/63 -> 69/199 from the segment's panel WTP | 41% of deaths were no_traffic (median 250 trials by end of run, 509 SEO / 1029 GEO / 2075 social visitors per run; M6 needs 1500 EUR MRR) survival fell 8% -> 1% after 'a_agency'; reverting to iteration 13 and never retrying that move |
| 15 | #13 | 28% | 40% | 1088 | 0 (0-5964) | 13% | price_too_high 58% | cut prices 20% (56% of fitting trialists had WTP below the price) | 58% of deaths were price_too_high (trial->paid 13%, 56% of fitting trialists priced out) |
| 16 | #15 | 31% | 38% | 1082 | 0 (0-6083) | 16% | price_too_high 34% | cut prices 20% (48% of fitting trialists had WTP below the price) | 34% of deaths were price_too_high (trial->paid 16%, 48% of fitting trialists priced out) |
| 17 | #16 | 34% | 35% | 1068 | 0 (0-6033) | 19% | low_conversion 45% | add done-for-you setup (removes setup friction; costs ~2 support hours per new customer) | 45% of deaths were low_conversion (trial->paid 19%, 40% of fitting trialists priced out) |
| 18 | #17 | 44% | 32% | 1357 | 0 (0-7263) | 22% | build_too_long 37% | ship with the plain snippet install first (saves 2-4 build weeks); few-clicks later | 37% of deaths were build_too_long (build weeks p50 16 / p90 20) |
| 19 | #18 | 36% | 24% | 1263 | 0 (0-5788) | 18% | low_conversion 60% | REVERT. drop the pro style variant (build time) | 37% of deaths were build_too_long (build weeks p50 16 / p90 20) survival fell 44% -> 36% after 'a_snippet'; reverting to iteration 18 and never retrying that move |
| 20 | #18 | 19% | 44% | 814 | 0 (0-4832) | 13% | low_conversion 57% | REVERT. cut pre-launch marketing to 10% of build hours to ship sooner | 37% of deaths were build_too_long (build weeks p50 16 / p90 20) survival fell 44% -> 19% after 'a_drop_pro_style'; reverting to iteration 18 and never retrying that move |
| 21 | #18 | 37% | 26% | 1300 | 0 (0-6862) | 21% | low_conversion 48% | REVERT. (build_too_long playbook exhausted) add a 'measurable lift in 30 days or refund' guarantee to close the proof gap | 37% of deaths were build_too_long (build weeks p50 16 / p90 20) survival fell 44% -> 37% after 'a_cut_prelaunch'; reverting to iteration 18 and never retrying that move |
| 22 | #18 | 52% | 26% | 1577 | 3241 (0-7092) | 24% | build_too_long 43% | (build_too_long playbook exhausted) pivot beachhead from 'smallSaaS' to 'agency' (next-best segment evidence; moves within 'smallSaaS' stopped paying off) | 43% of deaths were build_too_long (build weeks p50 16 / p90 20) |
| 23 | #22 | 26% | 32% | 995 | 0 (0-4537) | 18% | price_too_high 47% | REVERT. (build_too_long playbook exhausted) reserve 10pp more hours for customer success (onboarding uplift, lower churn) | 43% of deaths were build_too_long (build weeks p50 16 / p90 20) survival fell 52% -> 26% after 'a_switch_segment'; reverting to iteration 22 and never retrying that move |
| 24 | #22 | 48% | 29% | 1464 | 0 (0-6520) | 24% | build_too_long 39% | REVERT. (build_too_long playbook exhausted) move hours to engineering to raise the on-site action success rate and ship retention features | 43% of deaths were build_too_long (build weeks p50 16 / p90 20) survival fell 52% -> 48% after 'a_cs'; reverting to iteration 22 and never retrying that move |
| 25 | #22 | 48% | 26% | 1456 | 0 (0-6919) | 24% | build_too_long 39% | REVERT. (build_too_long playbook exhausted) cut prices 20% (40% of fitting trialists had WTP below the price) | 43% of deaths were build_too_long (build weeks p50 16 / p90 20) survival fell 52% -> 48% after 'a_eng'; reverting to iteration 22 and never retrying that move |
| 26 | #22 | 48% | 25% | 1478 | 0 (0-6512) | 27% | build_too_long 39% | REVERT. (build_too_long playbook exhausted) early-bird pricing: -30% for life for customers in the first 3 months | 43% of deaths were build_too_long (build weeks p50 16 / p90 20) survival fell 52% -> 48% after 'a_lower_price'; reverting to iteration 22 and never retrying that move |
| 27 | #22 | 48% | 25% | 1472 | 0 (0-6850) | 24% | build_too_long 39% | REVERT. (build_too_long playbook exhausted) add a free plan (badge virality + later upgrades), accepting its LLM cost | 43% of deaths were build_too_long (build weeks p50 16 / p90 20) survival fell 52% -> 48% after 'a_launch_discount'; reverting to iteration 22 and never retrying that move |
| 28 | #22 | 38% | 32% | 1214 | 0 (0-5371) | 27% | no_traffic 40% | REVERT. (build_too_long playbook exhausted) offer annual billing at -17% (cash upfront, no churn within the year) | 43% of deaths were build_too_long (build weeks p50 16 / p90 20) survival fell 52% -> 38% after 'a_add_free'; reverting to iteration 22 and never retrying that move |
| 29 | #22 | 52% | 25% | 1564 | 3383 (0-7094) | 23% | build_too_long 43% | no playbook move left; exploring + explore: overage 1.0/100 | 43% of deaths were build_too_long (build weeks p50 16 / p90 20) |
| 30 | #29 | 53% | 24% | 1582 | 3512 (0-7207) | 23% | build_too_long 44% | stop | max iterations reached |

Final iteration strategy: install=few_clicks | targets=smallSaaS | price=44/127 +overage 1.0/100 annual-17% | hours: engineering 27%, seo 7%, geo 3%, social 18%, outreach 34%, launches 9% | scope=js_saas/2 actions | DFY setup, guarantee, presell pilots, pro style, prelaunch mkt 25%, social mix linkedin 60%/x 30%/shorts 10%, free generator

## 2. Broad search (independent of the relaunch path)

| rank | vision? | survival | screen surv | M6 MRR p50 | M12 MRR p50 (p10-p90) | cust M12 p50 | gross margin p50 | strategy |
|---|---|---|---|---|---|---|---|---|
| 1 | yes | 58% | 64% | 1681 | 3664 (0-7937) | 43 | 85% | install=few_clicks / targets=smallSaaS / price=66/190 +overage 1.0/100 annual-17% / hours: engineering 26%, seo 7%, geo 3%, social 5%, outreach 48%, launches 8% / scope=js_saas/2 actions / DFY setup, guarantee, presell pilots, pro style, ads 600/mo, prelaunch mkt 25%, social mix linkedin 32%/x 34%/shorts 33% |
| 2 | yes | 58% | 59% | 1725 | 4065 (0-8712) | 48 | 88% | install=few_clicks / targets=smallSaaS / price=53/152 +overage 4.0/100 annual-17% / hours: engineering 27%, seo 7%, geo 3%, social 18%, outreach 34%, launches 9% / scope=js_saas/2 actions / DFY setup, guarantee, presell pilots, pro style, prelaunch mkt 25%, social mix linkedin 60%/x 30%/shorts 10%, free generator |
| 3 | yes | 57% | 58% | 1711 | 3915 (0-7884) | 70 | 81% | install=few_clicks / targets=smallSaaS / price=35/102 +overage 1.0/100 annual-17% / hours: engineering 16%, seo 7%, geo 3%, social 17%, outreach 46%, launches 8% / scope=js_saas/2 actions / DFY setup, guarantee, presell pilots, pro style, prelaunch mkt 25%, social mix linkedin 60%/x 30%/shorts 10%, free generator |
| 4 | yes | 57% | 65% | 1724 | 3769 (0-8056) | 54 | 83% | install=few_clicks / targets=smallSaaS / price=53/152 +overage 1.0/100 annual-17% / hours: engineering 26%, seo 7%, geo 3%, social 5%, outreach 48%, launches 8% / scope=js_saas/2 actions / DFY setup, guarantee, presell pilots, pro style, ads 600/mo, prelaunch mkt 25%, social mix linkedin 32%/x 34%/shorts 33%, free generator |
| 5 | yes | 57% | 58% | 1793 | 4187 (0-8647) | 65 | 76% | install=few_clicks / targets=smallSaaS / price=44/127 +overage 1.0/100 / hours: engineering 26%, seo 7%, geo 3%, social 3%, outreach 33%, app_store 16%, launches 8% / scope=js_saas/3 actions / DFY setup, guarantee, presell pilots, pro style, prelaunch mkt 25%, social mix linkedin 60%/x 30%/shorts 10%, free generator |
| 6 | yes | 57% | 59% | 1716 | 4092 (0-8702) | 58 | 86% | install=few_clicks / targets=smallSaaS / price=44/127 +overage 4.0/100 annual-17% / hours: engineering 27%, seo 7%, geo 3%, social 18%, outreach 34%, launches 9% / scope=js_saas/2 actions / DFY setup, guarantee, presell pilots, pro style, prelaunch mkt 25%, CM 900/mo, social mix linkedin 60%/x 30%/shorts 10%, free generator |
| 7 | yes | 57% | 60% | 1827 | 4164 (0-8675) | 64 | 76% | install=few_clicks / targets=smallSaaS / price=44/127 +overage 1.0/100 / hours: engineering 26%, seo 7%, geo 3%, social 3%, outreach 33%, app_store 16%, launches 8% / scope=js_saas/3 actions / DFY setup, guarantee, presell pilots, pro style, prelaunch mkt 25%, social mix linkedin 56%/x 22%/shorts 21%, free generator |
| 8 | yes | 57% | 60% | 1655 | 3954 (0-8172) | 46 | 85% | install=few_clicks / targets=smallSaaS / price=66/190 +overage 1.0/100 annual-17% / hours: engineering 26%, seo 7%, geo 3%, social 5%, outreach 48%, launches 8% / scope=js_saas/2 actions / DFY setup, guarantee, presell pilots, pro style, CM 900/mo, social mix linkedin 57%/x 11%/shorts 30%, free generator |
| 9 | yes | 56% | 57% | 1685 | 3720 (0-8032) | 44 | 85% | install=few_clicks / targets=smallSaaS / price=66/190 +overage 1.0/100 annual-17% / hours: engineering 26%, seo 7%, geo 3%, social 5%, outreach 48%, launches 8% / scope=js_saas/2 actions / DFY setup, guarantee, presell pilots, pro style, ads 600/mo, prelaunch mkt 25%, social mix linkedin 32%/x 34%/shorts 33%, free generator |
| 10 | yes | 55% | 60% | 1599 | 3612 (0-7908) | 43 | 85% | install=few_clicks / targets=smallSaaS / price=66/190 +overage 1.0/100 annual-17% / hours: engineering 26%, seo 7%, geo 3%, social 5%, outreach 48%, launches 8% / scope=js_saas/2 actions / DFY setup, guarantee, presell pilots, pro style, social mix linkedin 57%/x 11%/shorts 30%, free generator |

Best strategy - customer mix by segment (per run, all seeds):

| segment | trials | paid | trial->paid | priced out | MRR at end |
|---|---|---|---|---|---|
| Indie hacker / solo SaaS founder | 19.1 | 0.4 | 2% | 89% | 17 |
| Small SaaS startup team | 285.4 | 57.9 | 20% | 54% | 3654 |
| E-commerce store owner (Shopify / WooCommerce) | 6.9 | 0.3 | 4% | 69% | 15 |
| Web agency or freelancer | 5.6 | 0.2 | 3% | 74% | 9 |
| Small business / showcase site | 2.8 | 0.1 | 3% | 81% | 3 |
| Edtech, kids or consumer-app team | 3.7 | 0.2 | 5% | 64% | 13 |

Death causes (best strategy): no_traffic 19, low_conversion 79, price_too_high 469, price_too_low 1, churn 18, cash_burn 2, build_too_long 258. LLM cost per run p50 2249 EUR; min cash p10 2564 EUR.

## 3. Which channel works best?

All variants are built from the best strategy and run on the same 600 seeds. Single-channel: only that channel keeps marketing hours (its own share, at least 30% of hours); every other channel's hours go to engineering; paid ads, LTD and the free generator are off; presales only with outreach. Referral, badge and free-plan upgrades stay on (they are passive). CAC counts founder hours at 35 EUR/h; 'cash' includes the CM fee.

| variant | survival | delta surv | M6 MRR p50 | M12 MRR p50 | cust M12 p50 | mean yr-1 revenue | cash cost/run | channel paid/run | channel CAC cash | CAC incl. hours |
|---|---|---|---|---|---|---|---|---|---|---|
| best strategy (baseline) | 53% | +0pp | 1602 | 3301 | 40 | 25872 | 4966 | - | - | - |
| only SEO | 1% | -52pp | 319 | 0 | 0 | 2027 | 0 | 2.25 | 0.0 | 10559.1 |
| only GEO | 8% | -46pp | 482 | 0 | 0 | 4997 | 0 | 8.83 | 0.0 | 2837.7 |
| only Founder outreach | 40% | -14pp | 1216 | 0 | 0 | 16319 | 0 | 30.61 | 0.0 | 1708.5 |
| only Social (founder posting) | 0% | -53pp | 167 | 0 | 0 | 1480 | 0 | 0.54 | 0.0 | 53731.5 |
| only Social (founder + community manager) | 2% | -52pp | 0 | 0 | 0 | 1770 | 3918 | 0.82 | 4778.0 | 37776.2 |
| only Launches / directories | 1% | -52pp | 198 | 0 | 0 | 1823 | 0 | 0.92 | 0.0 | 11759.2 |
| only Marketplaces / plugin directories | 3% | -50pp | 394 | 0 | 0 | 3195 | 0 | 7.41 | 0.0 | 2104.7 |
| best minus seo | 53% | +0pp | 1603 | 3088 | 36 | 25036 | 4966 | - | - | - |
| best minus geo | 52% | -2pp | 1533 | 2824 | 33 | 24964 | 4900 | - | - | - |
| best minus outreach | 13% | -40pp | 633 | 0 | 0 | 6814 | 3506 | - | - | - |
| best minus launches | 46% | -8pp | 1378 | 0 | 0 | 21148 | 4684 | - | - | - |
| best minus social | 51% | -2pp | 1570 | 2992 | 36 | 24881 | 4888 | - | - | - |
| best minus ads | 51% | -2pp | 1558 | 2709 | 32 | 24666 | 0 | - | - | - |
| best + SEO at 30% of hours | 47% | -6pp | 1437 | 0 | 0 | 21075 | 4750 | 5.61 | 0.0 | 4703.5 |
| best + CM only (no founder posting) | 48% | -5pp | 1423 | 0 | 0 | 23912 | 11005 | 0.85 | 7768.0 | 15949.8 |

**Channel x time** (share of new paying customers acquired in each period, best strategy):

| channel | months 1-3 | months 4-6 | months 7-12 | paid/run | payoff by M6 / M12 (attributed revenue / cost incl. founder hours) |
|---|---|---|---|---|---|
| outreach | 70% | 66% | 55% | 33.6 | 0.10 / 0.30 |
| geo | 9% | 19% | 22% | 10.1 | 0.28 / 1.21 |
| seo | 1% | 4% | 10% | 3.5 | 0.02 / 0.14 |
| referral | 9% | 3% | 7% | 3.4 | - / - |
| ads | 5% | 6% | 5% | 3.0 | 0.09 / 0.26 |
| launch | 6% | 1% | 2% | 1.4 | 0.17 / 0.58 |
| social | 1% | 1% | 0% | 0.3 | 0.01 / 0.02 |

- **Is social worth it, with or without a CM?** Founder social posting changes survival by +2pp and mean M12 MRR by +76 EUR (within noise). Adding a community manager costs 6039 EUR/run and brings -1960 EUR of extra revenue in year 1 (survival -5pp): the CM does NOT pay for itself.
- **Does SEO pay off within 6 / 12 months against these competitors?** no / no. measured inside the best plan with SEO raised to 30% of hours (754 founder hours/run on SEO; survival -6pp vs the best plan); by M6 SEO-attributed revenue = 0.01x its cost (founder hours at 35 EUR/h; companies alive at M6); by M12 SEO-attributed revenue = 0.08x its cost (founder hours at 35 EUR/h; companies alive at M12); SEO-acquired MRR at M12 336 EUR/run vs ~2199 EUR/month of founder time; tier A outranks the median competitor in 57% of runs by M6 / 68% by M12; tier B outranks the median competitor in 1% of runs by M6 / 5% by M12; tier C outranks the median competitor in 0% of runs by M6 / 0% by M12; SEO alone: survival 1%, M12 MRR p50 0 EUR; removing SEO from the best plan: survival +0pp.

## 4. SEO against real competitors

Measured on the best plan with SEO raised to 30% of hours (the best plan itself puts 8% there).

Competitive model calibrated from `founder/seo-competition.json`: median top-10 competitor Authority Score 43.5, named competitors median 37.0 / max 50. Our authority p50 (p10-p90): M3 12.60 (9.20-17.80), M6 16.10 (11.70-22.20), M12 22.60 (16.60-31.60) (analyst anchors {'0': 0, '3': 5.0, '6': 12.0, '12': 20.0}).

| tier | searches/mo | KD | top-10 authority | top-10 share M6 / M12 | top-3 share M6 / M12 | clicks/mo M6 p50 | clicks/mo M12 p50 | outranks median competitor by M6 / M12 (week p50) |
|---|---|---|---|---|---|---|---|---|
| A | 4400 | 11 | 44 | 78% / 91% | 37% / 60% | 163 | 225 | 57% / 68% (week 16) |
| B | 7290 | 39 | 44 | 24% / 45% | 4% / 11% | 58 | 128 | 1% / 5% (week 42) |
| C | 2720 | 73 | 50 | 0% / 2% | 0% / 0% | 0 | 2 | 0% / 0% (never) |

The analyst's own estimate for a focused plan: {'m3': 25, 'm6': 198, 'm12': 495} organic clicks/month (Semrush volumes are usually undercounted for B2B long-tail; the model's per-run SEO yield uncertainty covers x0.5-x2).

## 5. Sensitivity (which assumptions matter most)

Each input moved -30% / +30% on the best search strategy (600 seeds each; base survival 56%). Sorted by swing.

| assumption | survival at -30% | survival at +30% | swing |
|---|---|---|---|
| `segments.*.wtp_median` | 31% | 71% | 39pp |
| `segments.*.trial_to_paid` | 36% | 72% | 36pp |
| `product.few_clicks.trial_to_paid_mult` | 36% | 72% | 36pp |
| `team.hours_per_week` | 33% | 69% | 36pp |
| `segments.*.reply_rate` | 43% | 66% | 22pp |
| `sales.outreach.contacts_per_hour` | 44% | 65% | 20pp |
| `product.base_build_weeks` | 60% | 46% | 15pp |
| `product.asr_narrow_start` | 51% | 61% | 10pp |
| `segments.*.proof_sensitivity` | 61% | 52% | 10pp |
| `segments.*.visitor_to_signup` | 53% | 62% | 9pp |
| `segments.*.competition_pressure` | 59% | 52% | 7pp |
| `marketing.geo.max_referrals_per_week` | 52% | 58% | 6pp |
| `segments.*.churn_monthly` | 58% | 54% | 4pp |
| `customer_success.hours_per_paid_customer_per_week` | 56% | 53% | 3pp |
| `marketing.seo_competition.authority_anchor` | 55% | 56% | 1pp |
| `social.platforms.*.base_impressions` | 56% | 57% | 1pp |
| `marketing.seo_competition.tiers.*.monthly_volume` | 55% | 56% | 1pp |
| `marketing.launches.*.visitors_median` | 55% | 55% | 1pp |
| `social.platforms.*.click_rate` | 55% | 56% | 1pp |
| `segments.*.conv_per_month_median` | 56% | 56% | 0pp |
| `segments.*.style_appeal` | 56% | 56% | 0pp |
| `marketing.seo.sandbox_weeks` | 56% | 56% | 0pp |
| `costs.llm_cost_per_conv` | 56% | 56% | 0pp |
| `marketing.seo_competition.tiers.*.top10_authority` | 55% | 55% | 0pp |
| `sales.app_store.base_installs_per_week` | 56% | 56% | 0pp |
| `viability.starting_cash` | 56% | 56% | 0pp |

## 6. How to read this

- `iterations.json`: every relaunch (strategy, KPIs incl. M3/M6/M9/M12 MRR, M3 early warning, SEO and social KPIs, death-cause histogram, CEO decision and reason).
- `search.json`: finalists re-run on fresh seeds (`vision` flags few-clicks + cute), with segment mix and channels.
- `channels.json`: single-channel, leave-one-out and add-social variants of the best strategy, channel x time, answers.
- `sensitivity.json`: +/-30% swings and the stress worlds. `timeseries.json`: weekly p10/p50/p90 incl. authority, per-tier clicks and top-10/top-3 shares, social followers.
- Death causes: no_traffic (too few trials, or traction too late for the M6 bar), low_conversion, price_too_high, price_too_low, churn, cash_burn, llm_costs, build_too_long (not launched within 20 weeks).
