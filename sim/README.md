# Mascott company simulator

Monte Carlo simulation of Mascott as a real company: departments competing for limited founder
hours, week by week, thousands of times. When a strategy fails, a simulated CEO does a post-mortem,
changes the strategy and relaunches. A broad search, a sensitivity analysis and a stress test run
alongside. Spec: `sim/SPEC.md`. Python 3.9+ standard library only (developed on 3.13).

## Run it

```bash
python3 sim/run.py --quick                 # smoke test, ~10-20 s on 4 cores (must stay < 2 min)
python3 sim/run.py --full                  # default sizes, ~4.5 min on 2 workers (see timing below)
python3 sim/run.py --full --workers 2 --out sim/results
python3 sim/run.py --seeds 1000            # more seeds per relaunch iteration
python3 sim/run.py --skip-search --skip-sensitivity   # relaunch loop only, a few seconds
python3 -m unittest discover -s sim/tests  # 21 tests, ~15 s
```

Options: `--quick` / `--full` (sizes come from `config.json` -> `simulation` and `simulation.quick`),
`--seeds N` (seeds per iteration), `--workers N` (default: CPU count), `--out DIR` (default
`sim/results`), `--config PATH`, `--max-iterations N`.

**Timing (measured).** `--full` = ~224k simulated companies. It takes 4.4 min with 2 workers on this
dev container. Budget 1.5-2x that for a slower 2-vCPU GitHub runner, so ~7-9 min, well under the
40-minute limit. Most of the time goes to the search (800 strategies x 200 seeds, then the top 10
re-run at 2,000 fresh seeds) and the sensitivity analysis (22 inputs x 2 x 600 seeds). To trade time
for precision, edit `seeds_search`, `search_strategies` and `seeds_sensitivity`; run time scales
linearly.

## Files

| file | what it holds |
|---|---|
| `engine.py` | `Company` + departments (`CEO`, `Product`, `Marketing`, `Sales`, `CustomerSuccess`, `Finance`), the market draw, `simulate()` and `summarize()` |
| `strategy.py` | strategy space, the naive plan, the CEO post-mortem playbook (`post_mortem`), `random_strategy`, `mutate` |
| `run.py` | CLI and pipeline: relaunch loop -> search -> sensitivity -> stress -> time series -> report |
| `config.json` | **every** assumption, each with a `_source` note. Segments have one block each, easy to edit |
| `tests/test_engine.py` | death rules, determinism, parallel = serial, cash accounting, great market survives, zero-demand dies, config hygiene |

## Outputs (`sim/results/`)

- `report.md`: the human summary. Start here.
- `iterations.json`: every relaunch: strategy, KPIs (p10/p50/p90 of MRR at M3/M6/M12, customers,
  minimum cash, CAC by channel, gross margin, churn), the death-cause histogram, the CEO's decision,
  the reason and the iteration it built on.
- `search.json`: top strategies re-run on fresh seeds, with per-segment customer mix and channel attribution.
- `sensitivity.json`: survival at -30% / +30% for each input, plus the `stress` worlds.
- `timeseries.json`: weekly p10/p50/p90 (weeks since launch) of MRR, cash, customers, free users,
  trials and visitors by channel, for the naive plan, the first surviving iteration and the best search strategy.

All runs are reproducible: the base seed and every seed range are written into each JSON file.

## How to read the results

- **Survival** = share of seeds still alive at week 52 after launch. A seed must pass the month-3
  rule (end of week 13 after launch: MRR >= `viability.m3_min_mrr` AND cumulative gross billings >=
  `viability.m3_min_cum_revenue`) and never go below 0 cash. A build longer than
  `viability.max_build_weeks` also counts as dead (`build_too_long`).
- **p10/p50/p90** are across seeds, *including dead companies* (a dead company has 0 MRR). So when
  survival is below 50%, "M12 MRR p50" is 0. Look at p90 or at `timeseries.json`.
- **Death causes**: `no_traffic` (too few trials for the M3 bar, or traction that came too late),
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
  outreach/launches if the company is behind M3 pace by week 6, and raises the CS floor if support is short.
- **Product**: action success rate starts lower for broad scope and improves with engineering hours.
  Maintenance comes first. Random incidents raise churn that month. Features slowly lift conversion
  and retention. Setup minutes add friction unless done-for-you setup is offered.
- **Marketing**: SEO pages ramp after a domain sandbox, with authority from backlinks (capped) and
  traffic potential scaled by the targeted segments' search demand. GEO citation probability grows
  with comparison pages and third-party mentions after an index lag. One-shot launches (PH, Show HN,
  directories) are drawn per world. Founders' network at launch and customer word of mouth arrive as
  `referral`. Rare viral spikes and paid ads are also modelled.
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
`no_traffic` -> more outreach, focus on the best segment, pre-launch presales, app store,
launches, agencies, pivot the beachhead, ads). The CEO applies the first move not yet tried from the
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
- After changing numbers, run `--quick` to check, then `--full`, and compare the sensitivity table.
