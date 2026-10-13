#!/usr/bin/env python3
"""Mascott company simulator - CLI.

    python3 sim/run.py --quick              # smoke test (< 2 min)
    python3 sim/run.py --full               # SPEC sizes (default)
    python3 sim/run.py --seeds 200 --workers 2 --out sim/results

Pipeline:
  1. Iterations ("relaunches"): naive plan, then CEO post-mortem -> change -> relaunch,
     until survival >= target or max iterations.
  2. Broad search: random + evolutionary strategies, top-k re-run on fresh seeds.
  3. Sensitivity: +/-30% on each input assumption, on the best strategy.
  4. Stress: naive and best strategy in an all-optimistic / all-pessimistic world.
  5. Weekly time series (p10/p50/p90) for naive, first surviving iteration, best search.
Outputs: iterations.json, search.json, sensitivity.json, timeseries.json, report.md.
"""
import argparse
import copy
import json
import multiprocessing as mp
import os
import random
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
if HERE not in sys.path:
    sys.path.insert(0, HERE)

import engine  # noqa: E402
import strategy as strat  # noqa: E402

# seed ranges (documented in outputs so every number is reproducible)
SEED_OFFSETS = {"iterations": 0, "search": 0, "search_top": 100000, "sensitivity": 200000,
                "stress": 200000, "timeseries": 300000}


# --------------------------------------------------------------------------- workers
def _work(task):
    cfg, s, seeds, record = task
    out = []
    for sd in seeds:
        out.append(engine.simulate(cfg, s, sd, record=record))
    return out


class Runner:
    def __init__(self, workers, chunk=25):
        self.workers = max(1, workers)
        self.chunk = chunk
        self.pool = None
        if self.workers > 1:
            try:
                ctx = mp.get_context("fork")
            except ValueError:
                ctx = mp.get_context()
            self.pool = ctx.Pool(self.workers)
        self.sims = 0

    def close(self):
        if self.pool:
            self.pool.close()
            self.pool.join()

    def run_many(self, jobs, record=False):
        """jobs: list of (cfg, strategy, seeds). Returns list of per-seed result lists."""
        tasks, owners = [], []
        for j, (cfg, s, seeds) in enumerate(jobs):
            seeds = list(seeds)
            for k in range(0, len(seeds), self.chunk):
                tasks.append((cfg, s, seeds[k:k + self.chunk], record))
                owners.append(j)
        if self.pool:
            parts = self.pool.map(_work, tasks, chunksize=1)
        else:
            parts = [_work(t) for t in tasks]
        out = [[] for _ in jobs]
        for j, part in zip(owners, parts):
            out[j].extend(part)
        self.sims += sum(len(p) for p in parts)
        return out

    def evaluate(self, jobs):
        res = self.run_many(jobs)
        return [engine.summarize(r, jobs[i][0]) for i, r in enumerate(res)]


def seeds_for(kind, n):
    o = SEED_OFFSETS[kind]
    return range(o, o + n)


# --------------------------------------------------------------------------- config helpers
def load_config(path, quick):
    with open(path) as f:
        cfg = json.load(f)
    sim = cfg["simulation"]
    if quick:
        for k, v in sim["quick"].items():
            sim[k] = v
    return cfg


def scale_config(cfg, path, factor):
    """Return a copy of cfg with every numeric leaf under `path` multiplied by factor.
    '*' matches every dict value / list item. Values originally < 1 are capped at 0.99."""
    cfg = copy.deepcopy(cfg)
    parts = path.split(".")

    def scale_leaf(v):
        if isinstance(v, bool) or v is None:
            return v
        if isinstance(v, (int, float)):
            nv = v * factor
            return min(nv, 0.99) if v < 1 else nv
        if isinstance(v, list):
            return [scale_leaf(x) for x in v]
        if isinstance(v, dict):
            return {k: (scale_leaf(x) if not k.startswith("_") else x) for k, x in v.items()}
        return v

    def walk(node, i):
        key = parts[i]
        last = i == len(parts) - 1
        if key == "*":
            items = node.items() if isinstance(node, dict) else enumerate(node)
            keys = [k for k, _ in items if not (isinstance(k, str) and k.startswith("_"))]
        else:
            keys = [key]
        for k in keys:
            if last:
                node[k] = scale_leaf(node[k])
            else:
                walk(node[k], i + 1)
    walk(cfg, 0)
    return cfg


# sensitivity params where a HIGHER value is bad for the company (used for the stress test)
BAD_WHEN_HIGH = {"segments.*.churn_monthly", "segments.*.competition_pressure",
                 "segments.*.proof_sensitivity", "segments.*.conv_per_month_median",
                 "costs.llm_cost_per_conv", "marketing.seo.sandbox_weeks", "product.base_build_weeks",
                 "customer_success.hours_per_paid_customer_per_week"}


def stress_config(cfg, optimistic, delta=None):
    d = cfg["simulation"]["sensitivity_delta"] if delta is None else delta
    out = cfg
    for p in cfg["sensitivity"]["params"]:
        good_up = p not in BAD_WHEN_HIGH
        up = good_up if optimistic else not good_up
        out = scale_config(out, p, 1 + d if up else 1 - d)
    return out


# --------------------------------------------------------------------------- stages
def kpi_line(sm):
    return ("surv %4.0f%% | M3 MRR p50 %5.0f | M12 MRR p50 %6.0f | trials p50 %4.0f | t2p %4.1f%%"
            % (sm["survival"] * 100, sm["mrr_m3"]["p50"], sm["mrr_m12"]["p50"], sm["trials"]["p50"],
               sm["trial_to_paid"] * 100))


def run_iterations(R, cfg, log):
    sim = cfg["simulation"]
    target = sim["survival_target"]
    n = sim["seeds_iteration"]
    seeds = seeds_for("iterations", n)
    rng = random.Random(sim["base_seed"])
    s = strat.naive_strategy(cfg)
    history, tried = [], set()
    decision_in, parent, action = None, None, None
    for it in range(1, sim["max_iterations"] + 1):
        sm = R.evaluate([(cfg, s, seeds)])[0]
        rec = {"iteration": it, "strategy": s, "description": strat.describe(s),
               "decision_in": decision_in, "parent": parent, "action": action, "kpis": sm}
        history.append(rec)
        log("  iter %2d  %s  <- %s" % (it, kpi_line(sm), (decision_in or "naive plan")[:110]))
        if sm["survival"] >= target:
            rec["decision"] = {"stop": True, "reason": "survival %.0f%% >= target %.0f%%"
                               % (sm["survival"] * 100, target * 100)}
            break
        if it == sim["max_iterations"]:
            rec["decision"] = {"stop": True, "reason": "max iterations reached"}
            break
        s, dec = strat.post_mortem(s, sm, history, rng, cfg, tried)
        rec["decision"] = dec
        parent, action = dec["base_iteration"] - 1, dec["action"]
        decision_in = dec["change"] + ((" + explore: " + dec["exploration"]) if dec.get("exploration") else "")
        if dec.get("reverted"):
            decision_in = "REVERT; " + decision_in
    return history


def run_search(R, cfg, log, extra_seeds):
    sim = cfg["simulation"]
    total = sim["search_strategies"]
    gens = max(1, sim["search_generations"])
    n = sim["seeds_search"]
    seeds = seeds_for("search", n)
    rng = random.Random(sim["base_seed"] + 1)
    per_gen = [total // gens] * gens
    per_gen[0] += total - sum(per_gen)
    pool, seen = [], set()

    def add(cands):
        jobs, keep = [], []
        for c in cands:
            fp = strat.fingerprint(c)
            if fp in seen:
                continue
            seen.add(fp)
            keep.append(c)
            jobs.append((cfg, c, seeds))
        for c, sm in zip(keep, R.evaluate(jobs)):
            pool.append({"strategy": c, "kpis": sm})

    first = [copy.deepcopy(x) for x in extra_seeds]
    while len(first) < per_gen[0]:
        first.append(strat.random_strategy(rng, cfg))
    add(first)
    log("  search gen 1: %d strategies, best surv %.0f%%" % (len(pool), 100 * max(p["kpis"]["survival"] for p in pool)))
    for g in range(1, gens):
        ranked = sorted(pool, key=score, reverse=True)
        elite = ranked[:max(5, len(ranked) // 10)]
        cands = []
        tries = 0
        while len(cands) < per_gen[g] and tries < per_gen[g] * 5:
            tries += 1
            if rng.random() < 0.8:
                c = strat.mutate(rng.choice(elite)["strategy"], rng, cfg)
            else:
                c = strat.random_strategy(rng, cfg)
            if strat.fingerprint(c) not in seen:
                cands.append(c)
        add(cands)
        log("  search gen %d: %d strategies total, best surv %.0f%%"
            % (g + 1, len(pool), 100 * max(p["kpis"]["survival"] for p in pool)))
    ranked = sorted(pool, key=score, reverse=True)
    top = ranked[:sim["search_top_k"]]
    nt = sim["seeds_search_top"]
    tseeds = seeds_for("search_top", nt)
    sums = R.evaluate([(cfg, t["strategy"], tseeds) for t in top])
    final = []
    for t, sm in zip(top, sums):
        t["strategy"]["name"] = "search"
        final.append({"strategy": t["strategy"], "description": strat.describe(t["strategy"]),
                      "screen_kpis": {"survival": t["kpis"]["survival"], "n": t["kpis"]["n"]},
                      "kpis": sm})
    final.sort(key=score, reverse=True)
    log("  search top-%d re-run at %d fresh seeds: best surv %.0f%%"
        % (len(final), nt, 100 * final[0]["kpis"]["survival"]))
    return final, len(pool)


def score(entry):
    k = entry["kpis"]
    return (k["survival"], k["mrr_m12"]["p50"])


def run_sensitivity(R, cfg, s, log):
    sim = cfg["simulation"]
    n = sim["seeds_sensitivity"]
    d = sim["sensitivity_delta"]
    params = list(cfg["sensitivity"]["params"])
    if sim.get("sensitivity_max_params"):
        params = params[:sim["sensitivity_max_params"]]
    seeds = seeds_for("sensitivity", n)
    jobs = [(cfg, s, seeds)]
    for p in params:
        jobs.append((scale_config(cfg, p, 1 - d), s, seeds))
        jobs.append((scale_config(cfg, p, 1 + d), s, seeds))
    sums = R.evaluate(jobs)
    base = sums[0]["survival"]
    rows = []
    for k, p in enumerate(params):
        lo, hi = sums[1 + 2 * k], sums[2 + 2 * k]
        rows.append({"param": p, "survival_minus": lo["survival"], "survival_plus": hi["survival"],
                     "mrr_m12_p50_minus": lo["mrr_m12"]["p50"], "mrr_m12_p50_plus": hi["mrr_m12"]["p50"],
                     "swing": round(abs(hi["survival"] - lo["survival"]), 4)})
    rows.sort(key=lambda r: -r["swing"])
    log("  sensitivity: %d params x2 at %d seeds; top mover: %s (swing %.0fpp)"
        % (len(params), n, rows[0]["param"] if rows else "-", 100 * (rows[0]["swing"] if rows else 0)))
    return {"base_survival": base, "delta": d, "seeds": n, "rows": rows}


def run_stress(R, cfg, named, log):
    n = cfg["simulation"]["seeds_sensitivity"]
    seeds = seeds_for("stress", n)
    opt, pes = stress_config(cfg, True), stress_config(cfg, False)
    opt_x = stress_config(cfg, True, delta=0.5)
    jobs, keys = [], []
    for name, s in named:
        for world, c in (("pessimistic", pes), ("baseline", cfg), ("optimistic", opt), ("very_optimistic", opt_x)):
            jobs.append((c, s, seeds))
            keys.append((name, world))
    sums = R.evaluate(jobs)
    out = {}
    for (name, world), sm in zip(keys, sums):
        out.setdefault(name, {})[world] = {"survival": sm["survival"], "mrr_m3": sm["mrr_m3"], "mrr_m12": sm["mrr_m12"],
                                           "death_causes": sm["death_causes"]}
    log("  stress: " + "; ".join("%s %s" % (k, "/".join("%.0f%%" % (v[w]["survival"] * 100)
                                                         for w in ("pessimistic", "baseline", "optimistic", "very_optimistic")))
                                 for k, v in out.items()))
    return out


def run_timeseries(R, cfg, named):
    n = cfg["simulation"]["seeds_timeseries"]
    seeds = seeds_for("timeseries", n)
    res = R.run_many([(cfg, s, seeds) for _, s in named], record=True)
    out = {}
    for (name, s), runs in zip(named, res):
        series = {}
        for k in engine.TS_KEYS:
            weeks = len(runs[0]["ts"][k])
            p10, p50, p90 = [], [], []
            for w in range(weeks):
                vals = sorted(r["ts"][k][w] for r in runs)
                p10.append(round(engine.percentile(vals, 0.1), 1))
                p50.append(round(engine.percentile(vals, 0.5), 1))
                p90.append(round(engine.percentile(vals, 0.9), 1))
            series[k] = {"p10": p10, "p50": p50, "p90": p90}
        alive = []
        weeks = len(runs[0]["ts"]["mrr"])
        for w in range(weeks):
            alive.append(round(sum(1 for r in runs if r["alive"] or (r["death_wsl"] is not None and r["death_wsl"] >= w))
                               / len(runs), 3))
        out[name] = {"strategy": s, "description": strat.describe(s), "seeds": n,
                     "week_index": "weeks since launch (0 = launch week); dead companies count as 0 MRR/customers, cash frozen",
                     "alive_share": alive, "series": series}
    return out


# --------------------------------------------------------------------------- report
def fmt_p(p, money=True):
    if p is None:
        return "n/a"
    f = "%.0f" if money else "%.2f"
    return (f + " (" + f + "-" + f + ")") % (p["p50"], p["p10"], p["p90"])


def top_cause(sm):
    dc = {k: v for k, v in sm["death_causes"].items() if v}
    if not dc:
        return "-"
    tot = sum(dc.values())
    k = max(dc, key=dc.get)
    return "%s %.0f%%" % (k, 100 * dc[k] / tot)


def write_report(path, cfg, iters, search, n_screened, sens, stress, meta):
    sim = cfg["simulation"]
    target = sim["survival_target"]
    L = []
    w = L.append
    naive = iters[0]["kpis"]
    best_it = max(iters, key=lambda r: (r["kpis"]["survival"], r["kpis"]["mrr_m12"]["p50"]))
    first_ok = next((r for r in iters if r["kpis"]["survival"] >= target), None)
    best_s = search[0] if search else None
    w("# Mascott company simulator - results")
    w("")
    w("Mode: **%s** | seeds per iteration: %d | search: %d strategies x %d seeds, top %d re-run at %d fresh seeds"
      % (meta["mode"], sim["seeds_iteration"], n_screened, sim["seeds_search"], len(search), sim["seeds_search_top"]))
    w("Base seed %d (seed ranges in each JSON file). Runtime %.0f s, %d simulated companies, %d workers."
      % (sim["base_seed"], meta["runtime_s"], meta["sims"], meta["workers"]))
    w("")
    w("> All market numbers are **estimates** in `sim/config.json` until recalibrated from the buyer panel and the "
      "competitor map. Budget (5,000 EUR, 2 founders, no salary) is assumed, not given by the founder. "
      "Read survival rates as *relative* rankings of strategies, not as forecasts.")
    w("")
    w("## Headline")
    w("")
    w("- **Naive plan** (all segments, 29/79 + free plan, SEO/GEO only, broad scope): survival **%.0f%%**; "
      "MRR at M3 p50 %.0f EUR; main cause of death: %s."
      % (naive["survival"] * 100, naive["mrr_m3"]["p50"], top_cause(naive)))
    w("- **CEO relaunches**: %d iterations; best survival **%.0f%%** at iteration %d%s."
      % (len(iters), best_it["kpis"]["survival"] * 100, best_it["iteration"],
         ("; target %.0f%% first reached at iteration %d" % (target * 100, first_ok["iteration"])) if first_ok
         else "; the %.0f%% target was **not** reached" % (target * 100)))
    if best_s:
        k = best_s["kpis"]
        w("- **Best strategy from the broad search** (%d fresh seeds): survival **%.0f%%**, MRR M12 p50 %.0f EUR "
          "(p10 %.0f / p90 %.0f), customers M12 p50 %.0f, gross margin p50 %s."
          % (k["n"], k["survival"] * 100, k["mrr_m12"]["p50"], k["mrr_m12"]["p10"], k["mrr_m12"]["p90"],
             k["customers_m12"]["p50"], ("%.0f%%" % (k["gross_margin"]["p50"] * 100)) if k["gross_margin"] else "n/a"))
        w("  - %s" % best_s["description"])
    if stress and "naive" in stress:
        st = stress["naive"]
        w("- **Is the naive result baked in?** Naive survival in an all-pessimistic / baseline / all-optimistic / "
          "very-optimistic world (every sensitivity input moved 30%% against / 0 / 30%% for / 50%% for the company): "
          "%.1f%% / %.1f%% / %.1f%% / %.1f%% (MRR at M3 p50: %.0f / %.0f / %.0f / %.0f EUR)."
          % tuple([st[x]["survival"] * 100 for x in ("pessimistic", "baseline", "optimistic", "very_optimistic")]
                  + [st[x]["mrr_m3"]["p50"] for x in ("pessimistic", "baseline", "optimistic", "very_optimistic")]))
        other = [k for k in stress if k != "naive"]
        if other:
            sb = stress[other[0]]
            w("  Best strategy in the same worlds: %.0f%% / %.0f%% / %.0f%% / %.0f%%."
              % tuple(sb[x]["survival"] * 100 for x in ("pessimistic", "baseline", "optimistic", "very_optimistic")))
    w("")
    w("## 1. Relaunch log (CEO post-mortems)")
    w("")
    w("Survival = share of seeds alive at week 52 after passing the month-3 rule (MRR >= %d EUR and cumulative "
      "revenue >= %d EUR at the end of week 13 after launch) and never running out of cash."
      % (cfg["viability"]["m3_min_mrr"], cfg["viability"]["m3_min_cum_revenue"]))
    w("")
    w("Each row is one relaunch. The CEO diagnoses the dominant cause of death, applies the matching playbook move "
      "(plus occasional random exploration), and reverts any move that lowered survival by more than %.0fpp."
      % (cfg["ceo"]["revert_if_drop"] * 100))
    w("")
    w("| # | built on | survival | M3 MRR p50 | M12 MRR p50 (p10-p90) | trial->paid | top death cause | change made for the NEXT run | why |")
    w("|---|---|---|---|---|---|---|---|---|")
    for r in iters:
        k = r["kpis"]
        d = r.get("decision", {})
        if d.get("stop"):
            change, why = "stop", d["reason"]
        else:
            change = (("REVERT. " if d.get("reverted") else "") + d.get("change", "")
                      + (" + explore: %s" % d["exploration"] if d.get("exploration") else ""))
            why = d.get("reason", "") + ((" " + d["reverted"]) if d.get("reverted") else "")
        w("| %d | %s | %.0f%% | %.0f | %s | %.0f%% | %s | %s | %s |"
          % (r["iteration"], ("#%d" % (r["parent"] + 1)) if r.get("parent") is not None else "-",
             k["survival"] * 100, k["mrr_m3"]["p50"], fmt_p(k["mrr_m12"]),
             k["trial_to_paid"] * 100, top_cause(k), change.replace("|", "/"), why.replace("|", "/")))
    w("")
    w("Final iteration strategy: %s" % iters[-1]["description"])
    w("")
    w("## 2. Broad search (independent of the relaunch path)")
    w("")
    w("| rank | survival | screen surv | M3 MRR p50 | M12 MRR p50 (p10-p90) | cust M12 p50 | gross margin p50 | strategy |")
    w("|---|---|---|---|---|---|---|---|")
    for i, s in enumerate(search):
        k = s["kpis"]
        w("| %d | %.0f%% | %.0f%% | %.0f | %s | %.0f | %s | %s |"
          % (i + 1, k["survival"] * 100, s["screen_kpis"]["survival"] * 100, k["mrr_m3"]["p50"],
             fmt_p(k["mrr_m12"]), k["customers_m12"]["p50"],
             ("%.0f%%" % (k["gross_margin"]["p50"] * 100)) if k["gross_margin"] else "n/a",
             s["description"].replace("|", "/")))
    if best_s:
        k = best_s["kpis"]
        w("")
        w("Best strategy - customer mix by segment (per run, all seeds):")
        w("")
        w("| segment | trials | paid | trial->paid | priced out | MRR at end |")
        w("|---|---|---|---|---|---|")
        for name, st in k["segments"].items():
            w("| %s | %.1f | %.1f | %.0f%% | %.0f%% | %.0f |" % (name, st["trials_per_run"], st["paid_per_run"],
                                                             st["trial_to_paid"] * 100, st["price_lost_share"] * 100,
                                                             st["mrr_end_per_run"]))
        w("")
        w("Best strategy - channel attribution (paid customers acquired per run; CAC counts founder hours at %d EUR/h, "
          "never paid):" % cfg["team"]["hour_value_eur"])
        w("")
        w("| channel | paid / run | founder hours per paid | cash per paid | CAC incl. hours (EUR) |")
        w("|---|---|---|---|---|")
        for c, st in k["channels"].items():
            w("| %s | %.2f | %s | %s | %s |" % (c, st["paid_per_run"], st["hours_per_paid"], st["cash_per_paid"],
                                                st["cac_eur_incl_hours"]))
        w("")
        w("Death causes (best strategy): %s" % ", ".join("%s %d" % (c, n) for c, n in k["death_causes"].items() if n))
        w("Monthly churn p50 %s; LLM cost per run p50 %.0f EUR (p90 %.0f); min cash p10 %.0f EUR."
          % (("%.1f%%" % (k["churn_monthly"]["p50"] * 100)) if k["churn_monthly"] else "n/a",
             k["llm_cost"]["p50"], k["llm_cost"]["p90"], k["cash_min"]["p10"]))
    w("")
    w("## 3. Sensitivity (which assumptions matter most)")
    w("")
    if sens:
        w("Each input moved -%d%% / +%d%% on the best search strategy (%d seeds each; base survival %.0f%%). "
          "Sorted by swing. Survival differences under ~%dpp are within Monte Carlo noise."
          % (sens["delta"] * 100, sens["delta"] * 100, sens["seeds"], sens["base_survival"] * 100,
             max(3, int(round(100 * 2 * (0.25 / max(1, sens["seeds"])) ** 0.5)))))
        w("")
        w("| assumption | survival at -%d%% | survival at +%d%% | swing |" % (sens["delta"] * 100, sens["delta"] * 100))
        w("|---|---|---|---|")
        for r in sens["rows"]:
            w("| `%s` | %.0f%% | %.0f%% | %.0fpp |" % (r["param"], r["survival_minus"] * 100,
                                                    r["survival_plus"] * 100, r["swing"] * 100))
    w("")
    w("## 4. How to read this")
    w("")
    w("- `iterations.json`: every relaunch (strategy, KPIs with p10/p50/p90, death-cause histogram, CEO decision and reason).")
    w("- `search.json`: top strategies re-run on fresh seeds, with per-segment mix and channel attribution.")
    w("- `sensitivity.json`: +/-30% swings; `stress` block: naive and best strategy in all-pessimistic/optimistic worlds.")
    w("- `timeseries.json`: weekly p10/p50/p90 (weeks since launch) of MRR, cash, customers, visitors by channel for the "
      "naive plan, the first surviving iteration and the best search strategy.")
    w("- Death causes: no_traffic (too few trials, or traction too late for the M3 bar), low_conversion, price_too_high "
      "(fitting trialists priced out), price_too_low (ARPA/margin), churn, cash_burn, llm_costs, build_too_long "
      "(not launched within %d weeks, or cash out before launch)." % cfg["viability"]["max_build_weeks"])
    w("- The model is deliberately harsh: SEO sandbox 8-16 weeks, cold reply rates 2-8%, no proof at launch, "
      "action success rates that start low for broad scope. See sim/README.md for the modelling choices to double-check.")
    w("")
    with open(path, "w") as f:
        f.write("\n".join(L))


# --------------------------------------------------------------------------- main
def main(argv=None):
    ap = argparse.ArgumentParser(description="Mascott company simulator")
    g = ap.add_mutually_exclusive_group()
    g.add_argument("--quick", action="store_true", help="small smoke-test sizes (< 2 min)")
    g.add_argument("--full", action="store_true", help="SPEC sizes (default)")
    ap.add_argument("--seeds", type=int, default=None, help="override seeds per iteration")
    ap.add_argument("--workers", type=int, default=None, help="worker processes (default: CPU count)")
    ap.add_argument("--out", default=os.path.join(HERE, "results"), help="output directory")
    ap.add_argument("--config", default=os.path.join(HERE, "config.json"))
    ap.add_argument("--max-iterations", type=int, default=None)
    ap.add_argument("--skip-search", action="store_true")
    ap.add_argument("--skip-sensitivity", action="store_true")
    a = ap.parse_args(argv)

    t0 = time.time()
    cfg = load_config(a.config, a.quick)
    sim = cfg["simulation"]
    if a.seeds:
        sim["seeds_iteration"] = a.seeds
    if a.max_iterations:
        sim["max_iterations"] = a.max_iterations
    workers = a.workers or os.cpu_count() or 1
    os.makedirs(a.out, exist_ok=True)

    def log(msg):
        print("[%6.1fs] %s" % (time.time() - t0, msg), flush=True)

    mode = "quick" if a.quick else "full"
    log("mode=%s workers=%d out=%s" % (mode, workers, a.out))
    R = Runner(workers)
    try:
        log("1/5 relaunch iterations (%d seeds each, target %.0f%%)" % (sim["seeds_iteration"], sim["survival_target"] * 100))
        iters = run_iterations(R, cfg, log)
        seed_info = {"base_seed": sim["base_seed"], "offsets": SEED_OFFSETS}
        with open(os.path.join(a.out, "iterations.json"), "w") as f:
            json.dump({"seeds": dict(seed_info, iterations=[0, sim["seeds_iteration"]]),
                       "survival_target": sim["survival_target"], "iterations": iters}, f, indent=1)

        best_it = max(iters, key=lambda r: (r["kpis"]["survival"], r["kpis"]["mrr_m12"]["p50"]))
        search, n_screened = [], 0
        if not a.skip_search:
            log("2/5 broad search (%d strategies x %d seeds)" % (sim["search_strategies"], sim["seeds_search"]))
            search, n_screened = run_search(R, cfg, log, [iters[0]["strategy"], best_it["strategy"]])
            with open(os.path.join(a.out, "search.json"), "w") as f:
                json.dump({"seeds": dict(seed_info, screen=[0, sim["seeds_search"]],
                                         top=[SEED_OFFSETS["search_top"], SEED_OFFSETS["search_top"] + sim["seeds_search_top"]]),
                           "screened": n_screened, "top": search}, f, indent=1)
        best_strategy = search[0]["strategy"] if search else best_it["strategy"]

        sens, stress = None, None
        if not a.skip_sensitivity:
            log("3/5 sensitivity on the best strategy")
            sens = run_sensitivity(R, cfg, best_strategy, log)
            log("4/5 stress worlds (naive + best)")
            named = [("naive", iters[0]["strategy"]), ("best_search" if search else "best_iteration", best_strategy)]
            stress = run_stress(R, cfg, named, log)
            with open(os.path.join(a.out, "sensitivity.json"), "w") as f:
                json.dump({"seeds": dict(seed_info, sensitivity=[SEED_OFFSETS["sensitivity"],
                                                                 SEED_OFFSETS["sensitivity"] + sim["seeds_sensitivity"]]),
                           "strategy": best_strategy, "description": strat.describe(best_strategy),
                           "sensitivity": sens, "stress": stress}, f, indent=1)

        log("5/5 weekly time series")
        first_ok = next((r for r in iters if r["kpis"]["survival"] >= sim["survival_target"]), None)
        named = [("naive", iters[0]["strategy"]),
                 ("first_surviving_iteration" if first_ok else "best_iteration (target not reached)",
                  (first_ok or best_it)["strategy"])]
        if search:
            named.append(("best_search", best_strategy))
        ts = run_timeseries(R, cfg, named)
        with open(os.path.join(a.out, "timeseries.json"), "w") as f:
            json.dump({"seeds": dict(seed_info, timeseries=[SEED_OFFSETS["timeseries"],
                                                            SEED_OFFSETS["timeseries"] + sim["seeds_timeseries"]]),
                       "series": ts}, f)
        meta = {"mode": mode, "runtime_s": time.time() - t0, "sims": R.sims, "workers": workers}
        write_report(os.path.join(a.out, "report.md"), cfg, iters, search, n_screened, sens, stress, meta)
        log("done: %d simulated companies in %.1f s -> %s" % (R.sims, time.time() - t0, os.path.join(a.out, "report.md")))
    finally:
        R.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
