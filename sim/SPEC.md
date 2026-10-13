# Mascott company simulator: specification

Goal: simulate the Mascott SaaS as a real company, with its departments, month by month,
thousands of times (Monte Carlo). Each time a company dies, a new "relaunch" starts with
a strategy the CEO changed based on the cause of death, until a strategy survives.
It runs on GitHub Actions (Python 3.11+, **standard library only**, no network, no LLM).

## The business (see founder/idea.md)
Cute customisable animated AI mascot agents for websites/SaaS: chat + on-site actions,
installed with a script tag. Subscription SaaS, variable LLM cost per conversation.

## Time and death rules
- Time step: 1 week. Horizon: 52 weeks after launch (12 months; minimum 6), plus a
  pre-launch build phase whose length depends on product scope (see Product department).
- Month = 4.33 weeks. "Month 3" = end of week 13 after launch.
- **DEAD** if (a) cash < 0 at any point, or (b) at the end of month 3 after launch:
  MRR < 500 EUR OR cumulative revenue < 1,000 EUR. Thresholds live in config
  (`viability.m3_min_mrr`, `viability.m3_min_cum_revenue`).
- A run that survives month 3 continues to week 52 (it can still die from cash).

## Departments (each is an agent with a weekly decision function and a share of the
founder team's limited hours; team = config `team.hours_per_week`, e.g. 2 founders x 45h)
1. **CEO / Strategy**: holds the Strategy object (target segment(s), pricing, channel mix,
   product scope, offer). Allocates weekly hours across departments. Monthly review: reads
   the KPIs and can make small in-run adjustments (e.g. shift hours from SEO to outreach
   if no trials by week 6). The big pivots happen between relaunches (see Iterations).
2. **Product & Engineering**: build phase length = base weeks x scope factor (one platform +
   one action = small; "all platforms, all actions" = large). Tracks `action_success_rate`
   (starts low for broad scope, higher for narrow scope; improves with eng hours),
   `setup_time_minutes`, bugs/incidents (random; an incident raises churn that month).
   Ships features over time when given hours (improves conversion and retention a little).
3. **Marketing - SEO & GEO**: hours -> articles/comparison pages/programmatic pages per
   week. Domain authority grows slowly (log-like). Organic visitors per week = f(pages,
   authority, keyword difficulty, time since publication) with Google sandbox delay
   (~8-16 weeks before meaningful traffic). GEO (citations in ChatGPT/Perplexity/AI
   Overviews): probability of being cited grows with comparison pages, third-party mentions
   (directories, reviews, Reddit) and authority; each citation brings referral visitors.
   Also: one-shot launches (Product Hunt, Hacker News Show, directories) giving spikes.
4. **Sales & Partnerships**: founder-led direct outreach (hours -> contacts -> replies ->
   demos -> trials), platform app-store listing (Shopify App Store / WordPress plugin dir:
   listing work then a steady flow of installs depending on reviews and rank), agency
   partnerships (one agency brings several client sites), optional LTD (AppSumo-style
   lifetime deal: cash now, high load later, low MRR).
5. **Customer Success & Support**: hours -> onboarding quality -> trial-to-paid uplift and
   churn reduction; support load grows with customers; if under-staffed, churn rises.
6. **Finance**: cash, revenue (MRR, overages, LTD), costs: LLM inference per conversation
   (with a per-plan usage distribution, heavy-tail), hosting, tools, payment fees
   (~2.9% + 0.25), Stripe/app-store revenue share where relevant, paid ads if any,
   founders' salary (0 by default). Gross margin per plan.

## Market (from config, calibrated by the CEO from the buyer panel and competitor map)
Per segment: reachable pool size, share reachable by each channel, visitor->signup rate,
signup->trial->paid base rates, willingness to pay (lognormal fitted from panel price
answers: median of "expensive" and spread), appeal of the cute house style (some segments
find it childish), need for on-site actions, churn per month, conversations per month per
customer (lognormal), expected ARPA, sensitivity to proof (case studies/reviews: conversion
multiplier that grows with number of happy customers and reviews), competition pressure.
A prospect converts to paid only if plan price <= its sampled WTP AND it passes the trust /
fit draws. Free plan users can upgrade later with a weekly hazard.

## Strategy space (the levers the CEO can pull)
- target: any subset of segments (one-segment focus gets a conversion/positioning bonus
  and an SEO bonus because content is topical; many segments dilute both).
- pricing: free plan yes/no, tiers (price, conversation quota), overage price, annual
  discount, usage-based or per-resolution option, agency plan.
- channels: hour shares for SEO, GEO, outreach, app store, agency partners, launches,
  paid ads budget/month.
- product scope: narrow (1 platform, 1-2 actions) vs broad.
- offer: done-for-you setup, guarantee (refund if no lift: costs refunds, raises trust),
  launch discount.
- style: cute-only vs cute + "pro/sober" variant (raises appeal for B2B segments, costs
  eng hours).

## Iterations ("relaunches")
1. Iteration 1 = the founder's naive plan: all segments, 29/79 EUR + free plan, SEO/GEO
   only, broad scope.
2. Run N Monte Carlo seeds (default 400) per strategy. Survival rate = share of seeds alive
   at week 52 having passed the M3 rule.
3. If survival < target (default 60%), the CEO does a post-mortem: classify the dominant
   cause of death (no_traffic, low_conversion, price_too_high, price_too_low/margin,
   churn, cash_burn, llm_costs, build_too_long) and applies the matching playbook change
   (deterministic rules + small random exploration), logs WHY, and relaunches.
4. Stop when a strategy reaches the target, or after max iterations (default 30). Keep the
   full log of every iteration (strategy, KPIs, cause of death, change made).
5. In addition, run a broad search (random/evolutionary over the strategy space, e.g.
   300 strategies x 150 seeds, then top 10 re-run at 1,000 seeds) to find the best
   strategies independently of the iteration path, and a sensitivity analysis (which input
   assumptions move survival the most: +/-30% on each).

## Outputs (written to `sim/results/`)
- `iterations.json`: every relaunch with strategy, KPIs (p10/p50/p90 of MRR at M3, M6,
  M12, customers, cash min, CAC by channel, gross margin, churn), death causes histogram,
  CEO decision and reason.
- `search.json`: top strategies with the same KPIs and per-segment customer mix,
  channel attribution.
- `sensitivity.json`
- `timeseries.json`: weekly p10/p50/p90 of MRR, cash, customers, visitors (SEO, GEO, etc.)
  for: the naive plan, the first surviving iteration, and the best search strategy.
- `report.md`: human-readable summary.
All numbers reproducible: fixed seeds recorded.

## Config
`sim/config.json` holds every assumption with a `_source` note (panel, competitor page,
public benchmark, or "estimate"). The engine never hardcodes a market number.

## Quality bar
- `python3 -m unittest discover -s sim/tests` passes (death rules, determinism with seed,
  cash accounting balances, a trivially great market survives, a zero-demand market dies).
- Full run finishes in < 40 minutes on a GitHub runner (2 vCPU); use multiprocessing.
- `python3 sim/run.py --quick` finishes in < 2 minutes locally for smoke tests.
