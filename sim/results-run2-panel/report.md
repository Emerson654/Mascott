# Mascott company simulator - results

Mode: **full** | seeds per iteration: 400 | search: 794 strategies x 200 seeds, top 10 re-run at 2000 fresh seeds
Base seed 20261013 (seed ranges in each JSON file). Runtime 218 s, 223600 simulated companies, 4 workers.

> All market numbers are **estimates** in `sim/config.json` until recalibrated from the buyer panel and the competitor map. Budget (5,000 EUR, 2 founders, no salary) is assumed, not given by the founder. Read survival rates as *relative* rankings of strategies, not as forecasts.

## Headline

- **Naive plan** (all segments, 29/79 + free plan, SEO/GEO only, broad scope): survival **0%**; MRR at M3 p50 0 EUR; main cause of death: no_traffic 55%.
- **CEO relaunches**: 25 iterations; best survival **62%** at iteration 25; target 60% first reached at iteration 25.
- **Best strategy from the broad search** (2000 fresh seeds): survival **74%**, MRR M12 p50 3374 EUR (p10 0 / p90 6324), customers M12 p50 63, gross margin p50 82%.
  - targets=smallSaaS | price=35/102 annual-15% | hours: engineering 41%, outreach 50%, launches 7% | scope=js_saas/2 actions | DFY setup, guarantee, presell pilots, pro style, ads 300/mo, prelaunch mkt 40%
- **Is the naive result baked in?** Naive survival in an all-pessimistic / baseline / all-optimistic / very-optimistic world (every sensitivity input moved 30% against / 0 / 30% for / 50% for the company): 0.0% / 0.0% / 0.0% / 2.2% (MRR at M3 p50: 0 / 0 / 108 / 361 EUR).
  Best strategy in the same worlds: 1% / 74% / 100% / 100%.

## 1. Relaunch log (CEO post-mortems)

Survival = share of seeds alive at week 52 after passing the month-3 rule (MRR >= 500 EUR and cumulative revenue >= 1000 EUR at the end of week 13 after launch) and never running out of cash.

Each row is one relaunch. The CEO diagnoses the dominant cause of death, applies the matching playbook move (plus occasional random exploration), and reverts any move that lowered survival by more than 4pp.

| # | built on | survival | M3 MRR p50 | M12 MRR p50 (p10-p90) | trial->paid | top death cause | change made for the NEXT run | why |
|---|---|---|---|---|---|---|---|---|
| 1 | - | 0% | 0 | 0 (0-0) | 3% | no_traffic 55% | shift 35% of hours from SEO/GEO to founder-led outreach: SEO sandbox (8-16 wks) means organic traffic arrives after the M3 deadline | 55% of deaths were no_traffic (median 15 trials by end of run, 268 SEO / 210 GEO visitors per run; M3 needs 500 EUR MRR) |
| 2 | #1 | 0% | 0 | 0 (0-0) | 4% | no_traffic 54% | shift 20% of hours from SEO/GEO to founder-led outreach: SEO sandbox (8-16 wks) means organic traffic arrives after the M3 deadline + explore: style=cute_pro | 54% of deaths were no_traffic (median 36 trials by end of run, 138 SEO / 117 GEO visitors per run; M3 needs 500 EUR MRR) |
| 3 | #2 | 0% | 0 | 0 (0-0) | 5% | build_too_long 66% | narrow scope to js_saas + 2 actions (shorter build, higher action success rate; board Product lens: one platform, one action) | 66% of deaths were build_too_long (build weeks p50 20 / p90 20) |
| 4 | #3 | 0% | 87 | 0 (0-0) | 5% | no_traffic 80% | focus on 'Small SaaS startup team' only (best evidence: 0.8 paid/run, trial->paid 7%, 32 EUR MRR/run); one-segment positioning and topical SEO; re-priced 29/79 -> 69/199 from the segment's panel WTP | 80% of deaths were no_traffic (median 60 trials by end of run, 114 SEO / 112 GEO visitors per run; M3 needs 500 EUR MRR) |
| 5 | #4 | 12% | 276 | 0 (0-2864) | 12% | price_too_high 58% | cut prices 20% (55% of fitting trialists had WTP below the price) | 58% of deaths were price_too_high (trial->paid 12%, 55% of fitting trialists priced out) |
| 6 | #5 | 12% | 275 | 0 (0-2856) | 15% | low_conversion 49% | add done-for-you setup (removes setup friction; costs ~2 support hours per new customer) | 49% of deaths were low_conversion (trial->paid 15%, 46% of fitting trialists priced out) |
| 7 | #6 | 18% | 330 | 0 (0-4975) | 18% | low_conversion 45% | add a 'measurable lift in 30 days or refund' guarantee to close the proof gap | 45% of deaths were low_conversion (trial->paid 18%, 47% of fitting trialists priced out) |
| 8 | #7 | 28% | 440 | 0 (0-5437) | 21% | price_too_high 40% | cut prices 20% (47% of fitting trialists had WTP below the price) | 40% of deaths were price_too_high (trial->paid 21%, 47% of fitting trialists priced out) |
| 9 | #8 | 32% | 476 | 0 (0-5206) | 25% | no_traffic 42% | spend 25% of build-phase hours on presales outreach + first content: builds a waitlist and starts the SEO sandbox clock before launch (build gets ~33% longer) | 42% of deaths were no_traffic (median 75 trials by end of run, 2254 SEO / 693 GEO visitors per run; M3 needs 500 EUR MRR) |
| 10 | #9 | 46% | 562 | 0 (0-5606) | 25% | low_conversion 45% | pivot beachhead from 'smallSaaS' to 'indie' (next-best segment evidence; moves within 'smallSaaS' stopped paying off); re-priced 44/127 -> 24/69 from the segment's panel WTP | 45% of deaths were low_conversion (trial->paid 25%, 39% of fitting trialists priced out) |
| 11 | #10 | 10% | 309 | 0 (0-0) | 23% | no_traffic 53% | REVERT. reserve 10pp more hours for customer success (onboarding uplift, lower churn) + explore: hours agency -> launches | 45% of deaths were low_conversion (trial->paid 25%, 39% of fitting trialists priced out) survival fell 46% -> 10% after 'a_switch_segment'; reverting to iteration 10 and never retrying that move |
| 12 | #10 | 42% | 562 | 0 (0-6194) | 25% | low_conversion 37% | reserve 10pp more hours for customer success (onboarding uplift, lower churn) | 37% of deaths were low_conversion (trial->paid 25%, 39% of fitting trialists priced out) |
| 13 | #12 | 36% | 476 | 0 (0-5732) | 25% | low_conversion 39% | REVERT. move hours to engineering to raise the on-site action success rate and ship retention features | 37% of deaths were low_conversion (trial->paid 25%, 39% of fitting trialists priced out) survival fell 42% -> 36% after 'a_cs'; reverting to iteration 12 and never retrying that move |
| 14 | #12 | 42% | 557 | 0 (0-5792) | 26% | no_traffic 39% | presell: offer pre-launch outreach replies a paid 3-month pilot (-20%) so the first euros arrive at launch instead of after the sandbox (board Offers lens condition #3) | 39% of deaths were no_traffic (median 84 trials by end of run, 3779 SEO / 1303 GEO visitors per run; M3 needs 500 EUR MRR) |
| 15 | #14 | 48% | 592 | 0 (0-5891) | 26% | low_conversion 36% | move hours to engineering to raise the on-site action success rate and ship retention features | 36% of deaths were low_conversion (trial->paid 26%, 39% of fitting trialists priced out) |
| 16 | #15 | 47% | 558 | 0 (0-5380) | 26% | no_traffic 34% | add one-shot launches (Product Hunt, Show HN, directories) for a traffic spike and backlinks | 34% of deaths were no_traffic (median 92 trials by end of run, 3094 SEO / 1192 GEO visitors per run; M3 needs 500 EUR MRR) |
| 17 | #16 | 49% | 569 | 0 (0-5525) | 26% | low_conversion 33% | move hours to engineering to raise the on-site action success rate and ship retention features + explore: prices x0.80 | 33% of deaths were low_conversion (trial->paid 26%, 38% of fitting trialists priced out) |
| 18 | #17 | 45% | 527 | 0 (0-4999) | 30% | no_traffic 53% | shift 20% of hours from SEO/GEO to founder-led outreach: SEO sandbox (8-16 wks) means organic traffic arrives after the M3 deadline + explore: prelaunch share 0.2 | 53% of deaths were no_traffic (median 92 trials by end of run, 2213 SEO / 1544 GEO visitors per run; M3 needs 500 EUR MRR) |
| 19 | #18 | 47% | 582 | 0 (0-5435) | 31% | no_traffic 44% | spend 25% of build-phase hours on presales outreach + first content: builds a waitlist and starts the SEO sandbox clock before launch (build gets ~33% longer) | 44% of deaths were no_traffic (median 105 trials by end of run, 1032 SEO / 1334 GEO visitors per run; M3 needs 500 EUR MRR) |
| 20 | #19 | 52% | 624 | 2112 (0-5327) | 30% | no_traffic 45% | recruit agency partners with a per-client-site plan (one agency = several sites) | 45% of deaths were no_traffic (median 213 trials by end of run, 1224 SEO / 1549 GEO visitors per run; M3 needs 500 EUR MRR) |
| 21 | #20 | 8% | 244 | 0 (0-0) | 11% | low_conversion 64% | REVERT. test a small paid-search budget (300 EUR/month) to buy traffic during the sandbox | 45% of deaths were no_traffic (median 213 trials by end of run, 1224 SEO / 1549 GEO visitors per run; M3 needs 500 EUR MRR) survival fell 52% -> 8% after 'a_agency'; reverting to iteration 20 and never retrying that move |
| 22 | #20 | 55% | 624 | 2258 (0-5130) | 30% | low_conversion 43% | move hours to engineering to raise the on-site action success rate and ship retention features | 43% of deaths were low_conversion (trial->paid 30%, 31% of fitting trialists priced out) |
| 23 | #22 | 52% | 596 | 1854 (0-5009) | 30% | no_traffic 42% | (no_traffic playbook exhausted) move hours to engineering to raise the on-site action success rate and ship retention features | 42% of deaths were no_traffic (median 191 trials by end of run, 830 SEO / 1442 GEO visitors per run; M3 needs 500 EUR MRR) |
| 24 | #23 | 46% | 564 | 0 (0-4801) | 30% | no_traffic 51% | REVERT. (no_traffic playbook exhausted) offer annual billing at -17% (cash upfront, no churn within the year) | 42% of deaths were no_traffic (median 191 trials by end of run, 830 SEO / 1442 GEO visitors per run; M3 needs 500 EUR MRR) survival fell 52% -> 46% after 'a_eng'; reverting to iteration 23 and never retrying that move |
| 25 | #23 | 62% | 614 | 2671 (0-5252) | 30% | no_traffic 39% | stop | survival 62% >= target 60% |

Final iteration strategy: targets=smallSaaS | price=35/102 +free annual-17% | hours: engineering 41%, outreach 50%, launches 7% | scope=js_saas/2 actions | DFY setup, guarantee, presell pilots, pro style, ads 300/mo, prelaunch mkt 25%

## 2. Broad search (independent of the relaunch path)

| rank | survival | screen surv | M3 MRR p50 | M12 MRR p50 (p10-p90) | cust M12 p50 | gross margin p50 | strategy |
|---|---|---|---|---|---|---|---|
| 1 | 74% | 74% | 812 | 3374 (0-6324) | 63 | 82% | targets=smallSaaS / price=35/102 annual-15% / hours: engineering 41%, outreach 50%, launches 7% / scope=js_saas/2 actions / DFY setup, guarantee, presell pilots, pro style, ads 300/mo, prelaunch mkt 40% |
| 2 | 70% | 66% | 687 | 3253 (0-6067) | 62 | 82% | targets=smallSaaS / price=35/102 annual-15% / hours: engineering 41%, outreach 50%, launches 7% / scope=js_saas/2 actions / DFY setup, guarantee, presell pilots, pro style, ads 300/mo, prelaunch mkt 25% |
| 3 | 69% | 66% | 783 | 5226 (0-11718) | 42 | 92% | targets=smallSaaS / price=88/274 +overage 4.0/100 annual-15% early-30% / hours: engineering 8%, seo 29%, geo 6%, outreach 56% / scope=js_saas/2 actions / DFY setup, presell pilots, pro style, ads 300/mo, prelaunch mkt 40% |
| 4 | 69% | 68% | 744 | 5785 (0-11890) | 61 | 91% | targets=smallSaaS / price=59/183 +overage 4.0/100 annual-15% early-30% / hours: engineering 8%, seo 27%, geo 6%, outreach 58% / scope=js_saas/2 actions / DFY setup, pro style, ads 150/mo, prelaunch mkt 40% |
| 5 | 69% | 68% | 692 | 3152 (0-6047) | 60 | 83% | targets=smallSaaS / price=35/102 annual-17% / hours: engineering 43%, outreach 48%, launches 6% / scope=js_saas/2 actions / DFY setup, guarantee, presell pilots, pro style, ads 300/mo, prelaunch mkt 25% |
| 6 | 68% | 66% | 725 | 2812 (0-5372) | 52 | 84% | targets=smallSaaS / price=35/102 +free annual-15% / hours: engineering 41%, outreach 50%, launches 7% / scope=js_saas/2 actions / DFY setup, guarantee, presell pilots, pro style, ads 300/mo, prelaunch mkt 40% |
| 7 | 68% | 70% | 707 | 2770 (0-5312) | 52 | 81% | targets=smallSaaS / price=35/102 +free annual-15% / hours: engineering 40%, outreach 52%, launches 6% / scope=js_saas/2 actions / DFY setup, guarantee, presell pilots, pro style, ads 300/mo, prelaunch mkt 40% |
| 8 | 66% | 72% | 691 | 3597 (0-6977) | 68 | 83% | targets=smallSaaS / price=35/102 annual-17% / hours: engineering 41%, outreach 50%, launches 7% / scope=js_saas/3 actions / DFY setup, presell pilots, pro style, ads 300/mo, prelaunch mkt 30% |
| 9 | 64% | 67% | 649 | 3024 (0-6014) | 57 | 83% | targets=smallSaaS / price=35/102 annual-15% / hours: engineering 40%, outreach 52%, launches 6% / scope=js_saas/2 actions / DFY setup, guarantee, presell pilots, pro style, ads 300/mo, prelaunch mkt 20% |
| 10 | 61% | 66% | 611 | 3338 (0-7028) | 58 | 84% | targets=smallSaaS / price=35/102 +overage 2.0/100 annual-17% / hours: engineering 41%, outreach 50%, launches 7% / scope=js_saas/2 actions / DFY setup, presell pilots, pro style, ads 300/mo, prelaunch mkt 25% |

Best strategy - customer mix by segment (per run, all seeds):

| segment | trials | paid | trial->paid | priced out | MRR at end |
|---|---|---|---|---|---|
| Indie hacker / solo SaaS founder | 21.1 | 1.2 | 6% | 69% | 26 |
| Small SaaS startup team | 298.3 | 85.1 | 29% | 31% | 3270 |
| E-commerce store owner (Shopify / WooCommerce) | 8.5 | 0.2 | 3% | 47% | 8 |
| Web agency or freelancer | 6.3 | 0.2 | 3% | 45% | 6 |
| Small business / showcase site | 3.4 | 0.1 | 2% | 53% | 2 |
| Edtech, kids or consumer-app team | 3.9 | 0.2 | 6% | 39% | 10 |

Best strategy - channel attribution (paid customers acquired per run; CAC counts founder hours at 35 EUR/h, never paid):

| channel | paid / run | founder hours per paid | cash per paid | CAC incl. hours (EUR) |
|---|---|---|---|---|
| seo | 5.70 | 5.7 | 0.0 | 200.7 |
| geo | 18.74 | 0.8 | 0.0 | 27.1 |
| launch | 2.94 | 19.4 | 0.0 | 678.5 |
| ads | 2.50 | 0.0 | 1140.1 | 1140.1 |
| referral | 5.20 | 0.0 | 0.0 | 0.0 |
| outreach | 51.97 | 35.3 | 0.0 | 1233.8 |

Death causes (best strategy): no_traffic 48, low_conversion 235, price_too_high 67, price_too_low 1, churn 26, build_too_long 134
Monthly churn p50 5.6%; LLM cost per run p50 3230 EUR (p90 7931); min cash p10 3814 EUR.

## 3. Sensitivity (which assumptions matter most)

Each input moved -30% / +30% on the best search strategy (600 seeds each; base survival 74%). Sorted by swing. Survival differences under ~4pp are within Monte Carlo noise.

| assumption | survival at -30% | survival at +30% | swing |
|---|---|---|---|
| `segments.*.trial_to_paid` | 55% | 84% | 28pp |
| `team.hours_per_week` | 56% | 84% | 27pp |
| `segments.*.wtp_median` | 60% | 80% | 20pp |
| `sales.outreach.contacts_per_hour` | 62% | 81% | 19pp |
| `segments.*.reply_rate` | 64% | 81% | 18pp |
| `product.base_build_weeks` | 75% | 59% | 16pp |
| `product.asr_narrow_start` | 68% | 78% | 10pp |
| `segments.*.proof_sensitivity` | 78% | 69% | 10pp |
| `segments.*.visitor_to_signup` | 69% | 78% | 9pp |
| `segments.*.competition_pressure` | 77% | 70% | 7pp |
| `marketing.geo.max_referrals_per_week` | 72% | 78% | 6pp |
| `segments.*.churn_monthly` | 76% | 72% | 4pp |
| `marketing.launches.*.visitors_median` | 72% | 74% | 2pp |
| `segments.*.conv_per_month_median` | 73% | 75% | 1pp |
| `segments.*.style_appeal` | 74% | 75% | 0pp |
| `marketing.seo.sandbox_weeks` | 74% | 74% | 0pp |
| `customer_success.hours_per_paid_customer_per_week` | 74% | 74% | 0pp |
| `costs.llm_cost_per_conv` | 74% | 74% | 0pp |
| `marketing.seo.visits_per_page_mature` | 76% | 76% | 0pp |
| `sales.app_store.base_installs_per_week` | 74% | 74% | 0pp |
| `sales.agency.partner_signup_rate` | 74% | 74% | 0pp |
| `viability.starting_cash` | 74% | 74% | 0pp |

## 4. How to read this

- `iterations.json`: every relaunch (strategy, KPIs with p10/p50/p90, death-cause histogram, CEO decision and reason).
- `search.json`: top strategies re-run on fresh seeds, with per-segment mix and channel attribution.
- `sensitivity.json`: +/-30% swings; `stress` block: naive and best strategy in all-pessimistic/optimistic worlds.
- `timeseries.json`: weekly p10/p50/p90 (weeks since launch) of MRR, cash, customers, visitors by channel for the naive plan, the first surviving iteration and the best search strategy.
- Death causes: no_traffic (too few trials, or traction too late for the M3 bar), low_conversion, price_too_high (fitting trialists priced out), price_too_low (ARPA/margin), churn, cash_burn, llm_costs, build_too_long (not launched within 20 weeks, or cash out before launch).
- The model is deliberately harsh: SEO sandbox 8-16 weeks, cold reply rates 2-8%, no proof at launch, action success rates that start low for broad scope. See sim/README.md for the modelling choices to double-check.
