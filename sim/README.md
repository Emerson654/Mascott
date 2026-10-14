# Mascott company simulator

Monte Carlo simulation of Mascott as a real company: departments competing for limited founder
hours, week by week, thousands of times. When a strategy fails, a simulated CEO does a post-mortem,
changes the strategy and relaunches. A broad search, a channel experiment, a sensitivity analysis and
a stress test run alongside. Spec: `sim/SPEC.md` + `sim/SPEC-v2.md` (v2: month-6 death rule, SEO
against real competitors, social department, few-clicks install, free generator, channel experiment).
Python 3.9+ standard library only (developed on 3.13).

## Run it

```bash
python3 sim/run.py --quick                 # smoke test, ~40 s on 2 workers (must stay < 2 min)
python3 sim/run.py --full                  # default sizes (see timing below)
python3 sim/run.py --full --workers 2 --out /tmp/mascott-results   # any output dir
python3 sim/run.py --seeds 1000            # more seeds per relaunch iteration
python3 sim/run.py --skip-search --skip-channels --skip-sensitivity   # relaunch loop only, seconds
python3 sim/calibrate_seo.py               # load founder/seo-competition.json into config.json
python3 -m unittest discover -s sim/tests  # 30 tests, ~30 s
```

Options: `--quick` / `--full` (sizes come from `config.json` -> `simulation` and `simulation.quick`),
`--seeds N` (seeds per iteration), `--workers N` (default: CPU count), `--out DIR` (default
`sim/results`), `--config PATH`, `--max-iterations N`, `--skip-search`, `--skip-channels`,
`--skip-sensitivity`.

**Timing (measured).** @@TIMING@@ Most of the time goes to the search (800 strategies x 200 seeds,
then up to 15 finalists - the overall top 10 plus the top 5 that keep the founder's vision - re-run at
2,000 fresh seeds), the sensitivity analysis (26 inputs x 2 x 600 seeds) and the channel experiment
(~16 variants x 600 seeds). To trade time for precision, edit `seeds_search`, `search_strategies`,
`seeds_sensitivity` and `seeds_channels`; run time scales linearly.

## Files

| file | what it holds |
|---|---|
| `engine.py` | `Company` + departments (`CEO`, `Product`, `Marketing` incl. the competitive SEO model, `Sales`, `Social`, `CustomerSuccess`, `Finance`), the market draw, `simulate()` and `summarize()` |
| `strategy.py` | strategy space, the founder-vision plan (iteration 1), `is_vision`, the CEO post-mortem playbook (`post_mortem`), `random_strategy`, `mutate` |
| `run.py` | CLI and pipeline: relaunch loop -> search (overall + vision) -> channel experiment -> sensitivity -> stress -> time series -> report |
| `calibrate_seo.py` | loads `founder/seo-competition.json` (Semrush) into `marketing.seo_competition` and fits the rank model to the analyst's position shares |
| `config.json` | **every** assumption, each with a `_source` note. Segments have one block each, easy to edit |
| `tests/test_engine.py` | M6 death rule + M3 warning, determinism, parallel = serial, cash accounting, social/CM accounting, install effects, SEO competition (strong market blocks a new domain, weak one does not), loader, config hygiene |

## Outputs (`sim/results/`)

- `report.md`: the human summary. Start here.
- `iterations.json`: every relaunch: strategy, KPIs (p10/p50/p90 of MRR at M3/M6/M12, customers,
  minimum cash, CAC by channel, gross margin, churn), the death-cause histogram, the CEO's decision,
  the reason and the iteration it built on.
- `search.json`: finalists re-run on fresh seeds (`vision: true` = few-clicks install + cute style), with
  per-segment customer mix, channel attribution, SEO and social KPIs.
- `channels.json`: the channel experiment on the best strategy (single-channel, leave-one-out, best + SEO,
  best + social / CM), channel x time (share of new paying customers in months 1-3 / 4-6 / 7-12), per-channel
  payoff (attributed revenue / cost by M6 and M12) and the two answers (is social worth it, with or without a CM;
  does SEO pay off within 6 / 12 months).
- `sensitivity.json`: survival at -30% / +30% for each input, plus the `stress` worlds.
- `timeseries.json`: weekly p10/p50/p90 (weeks since launch) of MRR, cash, customers, free users,
  trials, visitors by channel, our SEO authority, clicks / top-10 share / top-3 share per keyword tier and
  social followers, for the founder's vision, the first surviving iteration, the best strategy and the best
  vision-keeping strategy.

All runs are reproducible: the base seed and every seed range are written into each JSON file.

## How to read the results

- **Survival** = share of seeds still alive at week 52 after launch. A seed must pass the month-6
  rule (end of week 26 after launch: MRR >= `viability.m6_min_mrr` AND cumulative gross billings >=
  `viability.m6_min_cum_revenue`) and never go below 0 cash. A build longer than
  `viability.max_build_weeks` also counts as dead (`build_too_long`). Month 3 is only an early warning
  (`m3_warning_share` = share of runs with MRR < `viability.m3_warning_mrr` at M3).
- **p10/p50/p90** are across seeds, *including dead companies* (a dead company has 0 MRR). So when
  survival is below 50%, "M12 MRR p50" is 0. Look at p90 or at `timeseries.json`.
- **Death causes**: `no_traffic` (too few trials for the M6 bar, or traction that came too late),
  `low_conversion`, `price_too_high` (trialists who fit were priced out), `price_too_low` (ARPA too low or
  negative margin), `churn`, `cash_burn`, `llm_costs`, `build_too_long`.
- **CAC** is shown both in cash and in founder hours; the "incl. hours" figure values hours at
  `team.hour_value_eur`, which is never actually paid.
- **Survival numbers are relative**, not forecasts: the market inputs are estimates. Use them to rank
  strategies and to see which assumptions matter (sensitivity). Under ~4pp differences are noise at
  600 seeds; at 200 seeds (search screening) the noise is ~7pp, which is why the top 10 are re-run on fresh seeds.

## Model in one page

Time step 1 week. Pre-launch build phase: `base_build_weeks x scope factor x overrun`, stretched by
any pre-launch marketing share. Then up to 52 weeks on the market.

- **World per seed** (`MarketDraw`, drawn first and independent of strategy, so all strategies face
  the same worlds): demand shock, per-segment conversion/WTP/churn/usage multipliers, reply rates
  (uniform in each segment's range), SEO sandbox (8-16 weeks), LLM cost per conversation (triangular
  0.005-0.03 EUR), build overrun, launch outcomes, app-store yield, agency partner rate.
- **CEO**: allocates hours each week. Customer success takes what it needs (floor `cs_min_share`,
  cap `cs_cap_share`), the rest is split by the strategy's shares. Channels that cannot absorb hours
  (launches done, listing done) hand them back. A monthly review shifts SEO/GEO hours to
  outreach/launches if the company is behind M6 pace by week 6, and raises the CS floor if support is short.
- **Product**: action success rate starts lower for broad scope and improves with engineering hours.
  Maintenance comes first. Random incidents raise churn that month. Features slowly lift conversion
  and retention. Setup minutes add friction unless done-for-you setup is offered.
- **Marketing / SEO against competitors** (`marketing.seo_competition`, calibrated from Semrush): keyword
  tiers A/B/C with monthly volume, KD and the median Authority Score of today's top 10. Our authority
  follows the analyst's anchor curve (AS ~5/12/20 at months 3/6/12) scaled by our link effort versus the
  reference (links come from SEO link-building hours, pages, launches, directories, GEO mentions, social
  virals and the free generator). Per tier, a rank score r = auth_coef x ln((our AS+1)/(their AS+1)) -
  kd_coef x (KD-30)/100 + content depth + focus; keyword-level positions spread around r, so the share
  of the tier in the top 3/10/20 is a normal CDF; clicks = volume x covered share x CTR(position) x
  sandbox. The coefficients are fitted by `calibrate_seo.py` to the analyst's expected position shares.
  GEO citation probability grows with comparison pages, mentions (directories, social), reviews and
  authority. One-shot launches (PH, Show HN,
  directories) are drawn per world. Founders' network at launch and customer word of mouth arrive as
  `referral`. Rare viral spikes and paid ads are also modelled.
- **Social / community**: founder posts (hours) and/or a freelance community manager (cash). Posts ->
  impressions (base + per follower, rare lognormal viral hits) -> followers (compounding, capped) -> site
  clicks; only `icp_share` of the audience is the B2B target. LinkedIn + X followers lift cold reply rates
  (build in public), virals earn mentions and links, followers create brand searches, and with the
  few-clicks install customers' shareable mascots add impressions. Before launch, social visitors join
  a waitlist.
- **Install lever**: `few_clicks` (+2-4 build weeks, more maintenance) gives < 5 min setup, higher
  trial->paid, fewer support hours, plugin directories (Webflow/Wix too) and more referrals; `snippet`
  ships sooner. The free mascot generator (+1 build week) brings low-intent visitors, links and social reach.
- **Sales**: cold outreach (hours -> contacts -> 2-8% replies -> ~35% interested -> demo trials or a
  pre-launch waitlist, optionally presold as paid 3-month pilots); app-store listing (listing hours,
  review delay, installs that grow with reviews); agency partners (each brings client sites); an
  optional AppSumo-style LTD (cash after ~8 weeks, then LLM and support load with no MRR).
- **Funnel**: visitors -> signups -> (free plan) or a 14-day trial -> paid. A trialist converts only if
  they pass the fit draw (segment base x style appeal x platform support x actions x competition x
  focus x proof x onboarding x incidents) **and** the plan price is <= their sampled lognormal WTP.
  Usage per customer is lognormal (heavy tail). Over-quota users pay overage, upgrade or get capped
  (capped users churn more). Free users upgrade with a weekly hazard.
- **Customer success**: support hours needed grow with customers, free users, LLM-deal users and trials.
  A shortfall lowers onboarding (trial conversion) and raises churn.
- **Finance**: monthly bills accrued weekly, Stripe 2.9% + 0.25 (app-store billing uses the store's
  revenue share instead), annual plans and pilots prepaid (cash upfront, no churn during the term),
  LLM cost = conversations x cost per conversation (falling ~25%/yr), hosting, tools, admin, ads,
  refunds from the guarantee. `cash_end = starting cash + inflows - outflows` is unit-tested.

The CEO playbook (`strategy.PLAYBOOK`) maps each death cause to an ordered list of moves (e.g.
`no_traffic` -> more outreach, focus on the best segment, pre-launch presales, social to LinkedIn/X,
founder posting, app store, launches, free generator, hire a CM, agencies, pivot the beachhead, ads;
`build_too_long` -> narrow scope, snippet install first; `cash_burn` -> cut ads, let the CM go).
A move that undoes an earlier lever (CM, install, free plan) retires the opposite move. The CEO applies the first move not yet tried from the
current base, sometimes adds a random exploration, and reverts any move that cut survival by more
than `ceo.revert_if_drop` (or that let survival drift 2x that below the best so far). A reverted move
is never retried. When the CEO pivots or focuses on a segment, it re-prices from that segment's
panel WTP.

## Recalibrating (for the CEO)

Edit `config.json`; the engine holds no market numbers. The most decision-relevant inputs, per the
sensitivity table, are segment `trial_to_paid`, `wtp_median`, `team.hours_per_week`, the outreach
reply rate and contacts/hour, and the launch action success rate (`product.asr_narrow_start`).

- From the **buyer panel** (`founder/panel/answers/*.json`): set each segment's `wtp_median` to the
  median `price_expensive` answer of that segment, and `wtp_sigma` to roughly the std of
  ln(price_expensive). Use buy rates and reasons to adjust `trial_to_paid`, `style_appeal`
  ("too childish" objections), `need_actions` and `proof_sensitivity` ("prove it lifts sales").
- From the **competitor map**: `competition_pressure` per segment, `cpc`, the app-store
  `base_installs_per_week` and `review_k`.
- From **Semrush** (`founder/seo-competition.json`): run `python3 sim/calibrate_seo.py`. It writes tier
  volumes, KD, top-10 authority, pages needed, CTRs, our authority anchors and the fitted rank
  coefficients (with `_source` notes); `--dry-run` prints them without writing.
- After changing numbers, run `--quick` to check, then `--full`, and compare the sensitivity table.
