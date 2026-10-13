# Mascott company simulator - results

Mode: **full** | seeds per iteration: 400 | search: 791 strategies x 200 seeds, top 10 re-run at 2000 fresh seeds
Base seed 20261013 (seed ranges in each JSON file). Runtime 117 s, 223000 simulated companies, 4 workers.

> All market numbers are **estimates** in `sim/config.json` until recalibrated from the buyer panel and the competitor map. Budget (5,000 EUR, 2 founders, no salary) is assumed, not given by the founder. Read survival rates as *relative* rankings of strategies, not as forecasts.

## Headline

- **Naive plan** (all segments, 29/79 + free plan, SEO/GEO only, broad scope): survival **0%**; MRR at M3 p50 0 EUR; main cause of death: no_traffic 55%.
- **CEO relaunches**: 25 iterations; best survival **62%** at iteration 25; target 60% first reached at iteration 25.
- **Best strategy from the broad search** (2000 fresh seeds): survival **76%**, MRR M12 p50 3802 EUR (p10 0 / p90 6871), customers M12 p50 76, gross margin p50 70%.
  - targets=edtech | price=31/76 +overage 2.0/100 annual-15% | hours: engineering 35%, seo 7%, geo 3%, outreach 45%, launches 8% | scope=js_saas/2 actions | DFY setup, guarantee, presell pilots, ads 300/mo, prelaunch mkt 40%
- **Is the naive result baked in?** Naive survival in an all-pessimistic / baseline / all-optimistic / very-optimistic world (every sensitivity input moved 30% against / 0 / 30% for / 50% for the company): 0.0% / 0.0% / 0.0% / 2.2% (MRR at M3 p50: 0 / 0 / 108 / 369 EUR).
  Best strategy in the same worlds: 0% / 74% / 100% / 100%.

## 1. Relaunch log (CEO post-mortems)

Survival = share of seeds alive at week 52 after passing the month-3 rule (MRR >= 500 EUR and cumulative revenue >= 1000 EUR at the end of week 13 after launch) and never running out of cash.

Each row is one relaunch. The CEO diagnoses the dominant cause of death, applies the matching playbook move (plus occasional random exploration), and reverts any move that lowered survival by more than 4pp.

| # | built on | survival | M3 MRR p50 | M12 MRR p50 (p10-p90) | trial->paid | top death cause | change made for the NEXT run | why |
|---|---|---|---|---|---|---|---|---|
| 1 | - | 0% | 0 | 0 (0-0) | 3% | no_traffic 55% | shift 35% of hours from SEO/GEO to founder-led outreach: SEO sandbox (8-16 wks) means organic traffic arrives after the M3 deadline | 55% of deaths were no_traffic (median 15 trials by end of run, 268 SEO / 210 GEO visitors per run; M3 needs 500 EUR MRR) |
| 2 | #1 | 0% | 0 | 0 (0-0) | 4% | no_traffic 54% | shift 20% of hours from SEO/GEO to founder-led outreach: SEO sandbox (8-16 wks) means organic traffic arrives after the M3 deadline + explore: style=cute_pro | 54% of deaths were no_traffic (median 36 trials by end of run, 138 SEO / 117 GEO visitors per run; M3 needs 500 EUR MRR) |
| 3 | #2 | 0% | 0 | 0 (0-0) | 6% | build_too_long 66% | narrow scope to js_saas + 2 actions (shorter build, higher action success rate; board Product lens: one platform, one action) | 66% of deaths were build_too_long (build weeks p50 20 / p90 20) |
| 4 | #3 | 0% | 87 | 0 (0-0) | 5% | no_traffic 82% | focus on 'Edtech, kids or consumer-app team' only (best evidence: 0.8 paid/run, trial->paid 10%, 32 EUR MRR/run); one-segment positioning and topical SEO; re-priced 29/79 -> 49/119 from the segment's panel WTP | 82% of deaths were no_traffic (median 60 trials by end of run, 114 SEO / 112 GEO visitors per run; M3 needs 500 EUR MRR) |
| 5 | #4 | 14% | 315 | 0 (0-3789) | 16% | price_too_high 39% | cut prices 20% (48% of fitting trialists had WTP below the price) | 39% of deaths were price_too_high (trial->paid 16%, 48% of fitting trialists priced out) |
| 6 | #5 | 12% | 329 | 0 (0-2752) | 19% | no_traffic 47% | spend 25% of build-phase hours on presales outreach + first content: builds a waitlist and starts the SEO sandbox clock before launch (build gets ~33% longer) | 47% of deaths were no_traffic (median 67 trials by end of run, 874 SEO / 275 GEO visitors per run; M3 needs 500 EUR MRR) |
| 7 | #6 | 21% | 385 | 0 (0-3962) | 19% | low_conversion 42% | add done-for-you setup (removes setup friction; costs ~2 support hours per new customer) | 42% of deaths were low_conversion (trial->paid 19%, 41% of fitting trialists priced out) |
| 8 | #7 | 32% | 480 | 0 (0-5202) | 24% | low_conversion 39% | add a 'measurable lift in 30 days or refund' guarantee to close the proof gap | 39% of deaths were low_conversion (trial->paid 24%, 40% of fitting trialists priced out) |
| 9 | #8 | 36% | 497 | 0 (0-4662) | 26% | no_traffic 44% | presell: offer pre-launch outreach replies a paid 3-month pilot (-20%) so the first euros arrive at launch instead of after the sandbox (board Offers lens condition #3) | 44% of deaths were no_traffic (median 89 trials by end of run, 3062 SEO / 739 GEO visitors per run; M3 needs 500 EUR MRR) |
| 10 | #9 | 46% | 569 | 0 (0-4693) | 25% | no_traffic 41% | add one-shot launches (Product Hunt, Show HN, directories) for a traffic spike and backlinks | 41% of deaths were no_traffic (median 99 trials by end of run, 3632 SEO / 878 GEO visitors per run; M3 needs 500 EUR MRR) |
| 11 | #10 | 47% | 585 | 0 (0-5297) | 25% | no_traffic 34% | recruit agency partners with a per-client-site plan (one agency = several sites) + explore: hours agency -> launches | 34% of deaths were no_traffic (median 111 trials by end of run, 5461 SEO / 1458 GEO visitors per run; M3 needs 500 EUR MRR) |
| 12 | #11 | 4% | 234 | 0 (0-0) | 9% | low_conversion 58% | REVERT. pivot beachhead from 'edtech' to 'indie' (next-best segment evidence; moves within 'edtech' stopped paying off); re-priced 39/95 -> 24/69 from the segment's panel WTP | 34% of deaths were no_traffic (median 111 trials by end of run, 5461 SEO / 1458 GEO visitors per run; M3 needs 500 EUR MRR) survival fell 47% -> 4% after 'a_agency'; reverting to iteration 11 and never retrying that move |
| 13 | #11 | 14% | 352 | 0 (0-2330) | 24% | no_traffic 47% | REVERT. test a small paid-search budget (300 EUR/month) to buy traffic during the sandbox | 34% of deaths were no_traffic (median 111 trials by end of run, 5461 SEO / 1458 GEO visitors per run; M3 needs 500 EUR MRR) survival fell 47% -> 14% after 'a_switch_segment'; reverting to iteration 11 and never retrying that move |
| 14 | #11 | 45% | 558 | 0 (0-5405) | 25% | no_traffic 33% | (no_traffic playbook exhausted) reserve 10pp more hours for customer success (onboarding uplift, lower churn) | 33% of deaths were no_traffic (median 107 trials by end of run, 5049 SEO / 1406 GEO visitors per run; M3 needs 500 EUR MRR) |
| 15 | #14 | 44% | 575 | 0 (0-5065) | 25% | no_traffic 40% | (no_traffic playbook exhausted) reserve 10pp more hours for customer success (onboarding uplift, lower churn) | 40% of deaths were no_traffic (median 96 trials by end of run, 4761 SEO / 1327 GEO visitors per run; M3 needs 500 EUR MRR) |
| 16 | #15 | 39% | 517 | 0 (0-4838) | 25% | no_traffic 44% | REVERT. (no_traffic playbook exhausted) move hours to engineering to raise the on-site action success rate and ship retention features | 40% of deaths were no_traffic (median 96 trials by end of run, 4761 SEO / 1327 GEO visitors per run; M3 needs 500 EUR MRR) survival fell 44% -> 39% after 'a_cs'; reverting to iteration 15 and never retrying that move |
| 17 | #15 | 45% | 557 | 0 (0-4856) | 26% | no_traffic 44% | (no_traffic playbook exhausted) move hours to engineering to raise the on-site action success rate and ship retention features + explore: prices x0.80 | 44% of deaths were no_traffic (median 96 trials by end of run, 3633 SEO / 1285 GEO visitors per run; M3 needs 500 EUR MRR) |
| 18 | #17 | 38% | 490 | 0 (0-4179) | 30% | no_traffic 65% | REVERT. (no_traffic playbook exhausted) cut prices 20% (41% of fitting trialists had WTP below the price) + explore: prelaunch share 0.2 | 44% of deaths were no_traffic (median 96 trials by end of run, 3633 SEO / 1285 GEO visitors per run; M3 needs 500 EUR MRR) survival fell 45% -> 38% after 'a_eng'; reverting to iteration 17 and never retrying that move |
| 19 | #17 | 33% | 476 | 0 (0-4498) | 30% | no_traffic 71% | REVERT. (no_traffic playbook exhausted) early-bird pricing: -30% for life for customers in the first 3 months | 44% of deaths were no_traffic (median 96 trials by end of run, 3633 SEO / 1285 GEO visitors per run; M3 needs 500 EUR MRR) survival fell 45% -> 33% after 'a_lower_price'; reverting to iteration 17 and never retrying that move |
| 20 | #17 | 35% | 478 | 0 (0-4869) | 28% | no_traffic 58% | REVERT. (no_traffic playbook exhausted) offer annual billing at -17% (cash upfront, no churn within the year) | 44% of deaths were no_traffic (median 96 trials by end of run, 3633 SEO / 1285 GEO visitors per run; M3 needs 500 EUR MRR) survival fell 45% -> 35% after 'a_launch_discount'; reverting to iteration 17 and never retrying that move |
| 21 | #17 | 56% | 545 | 2208 (0-4951) | 26% | low_conversion 34% | (low_conversion playbook exhausted) drop the pro style variant (build time) | 34% of deaths were low_conversion (trial->paid 26%, 41% of fitting trialists priced out) |
| 22 | #21 | 54% | 528 | 2215 (0-4962) | 26% | no_traffic 35% | no playbook move left; exploring + explore: style=cute_pro | 35% of deaths were no_traffic (median 235 trials by end of run, 3943 SEO / 1427 GEO visitors per run; M3 needs 500 EUR MRR) |
| 23 | #22 | 56% | 545 | 2208 (0-4951) | 26% | low_conversion 34% | (low_conversion playbook exhausted) cut pre-launch marketing to 10% of build hours to ship sooner | 34% of deaths were low_conversion (trial->paid 26%, 41% of fitting trialists priced out) |
| 24 | #23 | 40% | 442 | 0 (0-4836) | 26% | no_traffic 45% | REVERT. no playbook move left; exploring + explore: prelaunch share 0.4 | 34% of deaths were low_conversion (trial->paid 26%, 41% of fitting trialists priced out) survival fell 56% -> 40% after 'a_cut_prelaunch'; reverting to iteration 23 and never retrying that move |
| 25 | #23 | 62% | 622 | 2657 (0-5093) | 26% | price_too_high 27% | stop | survival 62% >= target 60% |

Final iteration strategy: targets=edtech | price=39/95 +free annual-17% | hours: engineering 35%, seo 7%, geo 3%, outreach 45%, launches 8% | scope=js_saas/2 actions | DFY setup, guarantee, presell pilots, pro style, ads 300/mo, prelaunch mkt 40%

## 2. Broad search (independent of the relaunch path)

| rank | survival | screen surv | M3 MRR p50 | M12 MRR p50 (p10-p90) | cust M12 p50 | gross margin p50 | strategy |
|---|---|---|---|---|---|---|---|
| 1 | 76% | 74% | 789 | 3802 (0-6871) | 76 | 70% | targets=edtech / price=31/76 +overage 2.0/100 annual-15% / hours: engineering 35%, seo 7%, geo 3%, outreach 45%, launches 8% / scope=js_saas/2 actions / DFY setup, guarantee, presell pilots, ads 300/mo, prelaunch mkt 40% |
| 2 | 75% | 73% | 803 | 4975 (0-9500) | 84 | 73% | targets=edtech / price=39/95 +overage 1.0/100 annual-17% / hours: engineering 10%, seo 35%, outreach 42%, launches 8% / scope=js_saas/2 actions / DFY setup, guarantee, presell pilots, pro style, prelaunch mkt 40% |
| 3 | 74% | 72% | 780 | 3783 (0-6896) | 72 | 74% | targets=edtech / price=33/80 +overage 4.0/100 annual-17% / hours: engineering 35%, seo 7%, geo 3%, outreach 45%, launches 8% / scope=js_saas/2 actions / DFY setup, guarantee, presell pilots, pro style, prelaunch mkt 40% |
| 4 | 73% | 75% | 770 | 3346 (0-6302) | 61 | 78% | targets=edtech / price=39/95 annual-15% / hours: engineering 34%, seo 4%, outreach 49%, launches 8% / scope=js_saas/2 actions / DFY setup, guarantee, presell pilots, pro style, prelaunch mkt 40% |
| 5 | 73% | 72% | 811 | 6107 (0-12479) | 71 | 90% | targets=smallSaaS / price=59/183 +overage 4.0/100 annual-20% early-30% / hours: engineering 7%, seo 25%, outreach 55%, launches 10% / scope=js_saas/2 actions / DFY setup, pro style, ads 150/mo, prelaunch mkt 40% |
| 6 | 72% | 74% | 756 | 3542 (0-6787) | 56 | 81% | targets=edtech / price=46/114 annual-17% / hours: engineering 34%, seo 7%, outreach 44%, launches 13% / scope=js_saas/2 actions / DFY setup, guarantee, presell pilots, pro style, ads 300/mo, prelaunch mkt 40% |
| 7 | 72% | 73% | 741 | 3472 (0-6553) | 63 | 78% | targets=edtech / price=39/95 annual-15% / hours: engineering 35%, seo 7%, geo 3%, outreach 45%, launches 8% / scope=js_saas/2 actions / DFY setup, guarantee, presell pilots, pro style, prelaunch mkt 40% |
| 8 | 72% | 73% | 787 | 6045 (0-12411) | 70 | 90% | targets=smallSaaS / price=59/183 +overage 4.0/100 annual-20% early-30% / hours: engineering 8%, seo 26%, outreach 56%, launches 7% / scope=js_saas/2 actions / DFY setup, pro style, ads 150/mo, prelaunch mkt 40% |
| 9 | 68% | 73% | 743 | 6168 (0-12868) | 67 | 91% | targets=smallSaaS / price=59/183 +overage 4.0/100 annual-20% early-30% / hours: engineering 8%, seo 25%, outreach 55%, app_store 6%, launches 3% / scope=js_saas/2 actions / DFY setup, pro style, ads 150/mo, prelaunch mkt 40% |
| 10 | 67% | 72% | 700 | 5632 (0-12406) | 66 | 90% | targets=smallSaaS / price=59/183 +overage 4.0/100 annual-20% early-30% / hours: engineering 7%, seo 25%, outreach 55%, app_store 6%, launches 3% / scope=js_saas/2 actions / DFY setup, pro style, ads 150/mo, prelaunch mkt 40% |

Best strategy - customer mix by segment (per run, all seeds):

| segment | trials | paid | trial->paid | priced out | MRR at end |
|---|---|---|---|---|---|
| Indie hacker / solo SaaS founder | 24.4 | 1.6 | 7% | 62% | 33 |
| Small SaaS startup team | 13.8 | 1.0 | 7% | 24% | 38 |
| E-commerce store owner (Shopify / WooCommerce) | 10.4 | 0.2 | 2% | 40% | 8 |
| Web agency or freelancer | 7.7 | 0.2 | 2% | 42% | 4 |
| Small business / showcase site | 4.1 | 0.1 | 2% | 50% | 2 |
| Edtech, kids or consumer-app team | 363.0 | 97.6 | 27% | 34% | 3624 |

Best strategy - channel attribution (paid customers acquired per run; CAC counts founder hours at 35 EUR/h, never paid):

| channel | paid / run | founder hours per paid | cash per paid | CAC incl. hours (EUR) |
|---|---|---|---|---|
| seo | 25.71 | 10.2 | 0.0 | 356.8 |
| geo | 17.52 | 5.9 | 0.0 | 206.6 |
| launch | 1.96 | 29.0 | 0.0 | 1016.4 |
| ads | 3.88 | 0.0 | 754.2 | 754.2 |
| referral | 5.42 | 0.0 | 0.0 | 0.0 |
| outreach | 46.23 | 35.0 | 0.0 | 1226.7 |

Death causes (best strategy): no_traffic 51, low_conversion 286, price_too_high 83, churn 25, build_too_long 41
Monthly churn p50 5.7%; LLM cost per run p50 6898 EUR (p90 16115); min cash p10 3602 EUR.

## 3. Sensitivity (which assumptions matter most)

Each input moved -30% / +30% on the best search strategy (600 seeds each; base survival 74%). Sorted by swing. Survival differences under ~4pp are within Monte Carlo noise.

| assumption | survival at -30% | survival at +30% | swing |
|---|---|---|---|
| `segments.*.trial_to_paid` | 53% | 85% | 32pp |
| `team.hours_per_week` | 53% | 82% | 29pp |
| `segments.*.wtp_median` | 55% | 83% | 28pp |
| `segments.*.style_appeal` | 53% | 80% | 27pp |
| `sales.outreach.contacts_per_hour` | 62% | 80% | 18pp |
| `segments.*.reply_rate` | 64% | 81% | 17pp |
| `segments.*.proof_sensitivity` | 80% | 69% | 11pp |
| `segments.*.visitor_to_signup` | 67% | 77% | 10pp |
| `product.asr_narrow_start` | 70% | 78% | 8pp |
| `segments.*.competition_pressure` | 76% | 72% | 4pp |
| `segments.*.churn_monthly` | 76% | 73% | 3pp |
| `segments.*.conv_per_month_median` | 72% | 74% | 3pp |
| `marketing.geo.max_referrals_per_week` | 72% | 74% | 2pp |
| `marketing.seo.sandbox_weeks` | 75% | 73% | 2pp |
| `marketing.seo.visits_per_page_mature` | 73% | 75% | 2pp |
| `product.base_build_weeks` | 69% | 71% | 2pp |
| `marketing.launches.*.visitors_median` | 74% | 74% | 0pp |
| `customer_success.hours_per_paid_customer_per_week` | 74% | 74% | 0pp |
| `costs.llm_cost_per_conv` | 74% | 74% | 0pp |
| `viability.starting_cash` | 74% | 74% | 0pp |
| `sales.app_store.base_installs_per_week` | 74% | 74% | 0pp |
| `sales.agency.partner_signup_rate` | 74% | 74% | 0pp |

## 4. How to read this

- `iterations.json`: every relaunch (strategy, KPIs with p10/p50/p90, death-cause histogram, CEO decision and reason).
- `search.json`: top strategies re-run on fresh seeds, with per-segment mix and channel attribution.
- `sensitivity.json`: +/-30% swings; `stress` block: naive and best strategy in all-pessimistic/optimistic worlds.
- `timeseries.json`: weekly p10/p50/p90 (weeks since launch) of MRR, cash, customers, visitors by channel for the naive plan, the first surviving iteration and the best search strategy.
- Death causes: no_traffic (too few trials, or traction too late for the M3 bar), low_conversion, price_too_high (fitting trialists priced out), price_too_low (ARPA/margin), churn, cash_burn, llm_costs, build_too_long (not launched within 20 weeks, or cash out before launch).
- The model is deliberately harsh: SEO sandbox 8-16 weeks, cold reply rates 2-8%, no proof at launch, action success rates that start low for broad scope. See sim/README.md for the modelling choices to double-check.
