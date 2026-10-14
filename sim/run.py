#!/usr/bin/env python3
"""Mascott company simulator - CLI.

    python3 sim/run.py --quick              # smoke test (< 2 min)
    python3 sim/run.py --full               # default sizes (see README for timing)
    python3 sim/run.py --seeds 200 --workers 2 --out sim/results

Pipeline (sim/SPEC.md + sim/SPEC-v2.md):
  1. Iterations ("relaunches"): the founder's vision, then CEO post-mortem -> change ->
     relaunch, until survival (month-6 rule) >= target or max iterations.
  2. Broad search: random + evolutionary strategies; the overall top-k and the top-k that
     keep the founder's vision (few-clicks install + cute style) re-run on fresh seeds.
  3. Channel experiment on the best strategy: single-channel, leave-one-out, add-social,
     channel x time.
  4. Sensitivity: +/-30% on each input assumption, on the best strategy.
  5. Stress: naive / best / best-vision in all-pessimistic / optimistic worlds.
  6. Weekly time series (p10/p50/p90) for naive, first surviving iteration, best, best vision.
Outputs: iterations.json, search.json, channels.json, sensitivity.json, timeseries.json, report.md.
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
                "stress": 200000, "timeseries": 300000, "channels": 400000}


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
                 "customer_success.hours_per_paid_customer_per_week",
                 "marketing.seo_competition.tiers.*.top10_authority"}


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
    return ("surv %4.0f%% | M6 MRR p50 %5.0f | M12 MRR p50 %6.0f | trials p50 %4.0f | t2p %4.1f%%"
            % (sm["survival"] * 100, sm["mrr_m6"]["p50"], sm["mrr_m12"]["p50"], sm["trials"]["p50"],
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


def score(entry):
    k = entry["kpis"]
    return (k["survival"], k["mrr_m12"]["p50"], k["mrr_m12_mean"])


def run_search(R, cfg, log, extra_seeds):
    """Random + evolutionary search. Keeps two elites (overall and founder-vision) so the
    report can state the best strategy and the best one that keeps few-clicks + cute."""
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

    def best_of(vision):
        cand = [p for p in pool if strat.is_vision(p["strategy"]) or not vision]
        return max(p["kpis"]["survival"] for p in cand) if cand else 0.0

    first = [copy.deepcopy(x) for x in extra_seeds]
    while len(first) < per_gen[0]:
        first.append(strat.random_strategy(rng, cfg))
    add(first)
    log("  search gen 1: %d strategies, best surv %.0f%% (vision %.0f%%)" % (len(pool), 100 * best_of(False), 100 * best_of(True)))
    for g in range(1, gens):
        ranked = sorted(pool, key=score, reverse=True)
        vis = [p for p in ranked if strat.is_vision(p["strategy"])]
        k = max(5, len(ranked) // 10)
        elite = ranked[:k] + vis[:max(3, k // 2)]
        cands, tries = [], 0
        while len(cands) < per_gen[g] and tries < per_gen[g] * 5:
            tries += 1
            if rng.random() < 0.8:
                c = strat.mutate(rng.choice(elite)["strategy"], rng, cfg)
            else:
                c = strat.random_strategy(rng, cfg)
            if strat.fingerprint(c) not in seen:
                cands.append(c)
        add(cands)
        log("  search gen %d: %d strategies total, best surv %.0f%% (vision %.0f%%)"
            % (g + 1, len(pool), 100 * best_of(False), 100 * best_of(True)))
    ranked = sorted(pool, key=score, reverse=True)
    kk = sim["search_top_k"]
    top = ranked[:kk]
    vis_top = [p for p in ranked if strat.is_vision(p["strategy"])][:max(1, kk // 2)]
    rerun, fps = [], set()
    for t in top + vis_top:
        fp = strat.fingerprint(t["strategy"])
        if fp not in fps:
            fps.add(fp)
            rerun.append(t)
    nt = sim["seeds_search_top"]
    tseeds = seeds_for("search_top", nt)
    sums = R.evaluate([(cfg, t["strategy"], tseeds) for t in rerun])
    final = []
    for t, sm in zip(rerun, sums):
        t["strategy"]["name"] = "search"
        final.append({"strategy": t["strategy"], "description": strat.describe(t["strategy"]),
                      "vision": strat.is_vision(t["strategy"]),
                      "screen_kpis": {"survival": t["kpis"]["survival"], "n": t["kpis"]["n"]},
                      "kpis": sm})
    final.sort(key=score, reverse=True)
    bv = next((f for f in final if f["vision"]), None)
    log("  search re-run of %d finalists at %d fresh seeds: best surv %.0f%%, best vision %s"
        % (len(final), nt, 100 * final[0]["kpis"]["survival"],
           ("%.0f%%" % (100 * bv["kpis"]["survival"])) if bv else "n/a"))
    return final, len(pool)


# --------------------------------------------------------------------------- channel experiment
CHANNEL_DEFS = [  # (id, label, hours key, extra lever)
    ("seo", "SEO", "seo"),
    ("geo", "GEO", "geo"),
    ("outreach", "Founder outreach", "outreach"),
    ("social_founder", "Social (founder posting)", "social"),
    ("social_cm", "Social (founder + community manager)", "social"),
    ("launches", "Launches / directories", "launches"),
    ("marketplaces", "Marketplaces / plugin directories", "app_store"),
]
ATTRIB = {"seo": ["seo"], "geo": ["geo"], "outreach": ["outreach"], "social_founder": ["social"],
          "social_cm": ["social"], "launches": ["launch"], "marketplaces": ["app_store"],
          "agency": ["agency"], "ads": ["ads"], "generator": ["generator"], "cm": ["social"], "social": ["social"]}


def only_channel(s, ch, key, cfg):
    t = copy.deepcopy(s)
    h = t["hours"]
    keep = max(h.get(key, 0.0), cfg["simulation"]["single_channel_min_share"])
    for k in engine.MARKETING_KEYS:
        h[k] = 0.0
    h["engineering"] = 1.0 - keep                    # removed channels' hours go to engineering
    h[key] = keep
    t["paid_ads_per_month"] = 0.0
    t["ltd"]["enabled"] = False
    t["free_generator"] = False
    t["offer"]["presell"] = bool(s["offer"].get("presell")) and ch == "outreach"
    t["social"]["cm"] = ch == "social_cm"
    if ch in ("social_founder", "social_cm") and not (s["hours"].get("social", 0) > 0.02 or s["social"]["cm"]):
        t["social"]["platform_mix"] = {"linkedin": 0.6, "x": 0.3, "shorts": 0.1}
    if ch == "marketplaces" and t.get("install") != "few_clicks" and not set(t["scope"]["platforms"]) & {"shopify", "wordpress"}:
        t["install"] = "few_clicks"                  # otherwise no plugin directory is reachable
    return strat.normalize(t, cfg)


def without(s, ch, cfg):
    t = copy.deepcopy(s)
    h = t["hours"]
    keys = {"seo": ["seo"], "geo": ["geo"], "outreach": ["outreach"], "social": ["social"], "launches": ["launches"],
            "marketplaces": ["app_store"], "agency": ["agency"]}.get(ch, [])
    for k in keys:
        h["engineering"] += h.get(k, 0.0)
        h[k] = 0.0
    if ch == "outreach":
        t["offer"]["presell"] = False
    if ch in ("social", "cm"):
        t["social"]["cm"] = False
    if ch == "ads":
        t["paid_ads_per_month"] = 0.0
    if ch == "generator":
        t["free_generator"] = False
    return strat.normalize(t, cfg)


def present_channels(s):
    h = s["hours"]
    out = [c for c, k in (("seo", "seo"), ("geo", "geo"), ("outreach", "outreach"), ("launches", "launches"),
                          ("marketplaces", "app_store"), ("agency", "agency")) if h.get(k, 0) > 0.01]
    if h.get("social", 0) > 0.01 or s["social"]["cm"]:
        out.append("social")
    if s["social"]["cm"]:
        out.append("cm")
    if s.get("paid_ads_per_month", 0) > 0:
        out.append("ads")
    if s.get("free_generator"):
        out.append("generator")
    return out


def variant_row(label, kind, ch, sm, cfg):
    hv = cfg["team"]["hour_value_eur"]
    att = ATTRIB.get(ch, [])
    paid = sum(sm["channels"].get(a, {}).get("paid_per_run", 0.0) for a in att)
    hours = sum(sm["channels"].get(a, {}).get("hours_per_run", 0.0) for a in att)
    cash = sum(sm["channels"].get(a, {}).get("cash_per_run", 0.0) for a in att)
    return {"label": label, "kind": kind, "channel": ch,
            "survival": sm["survival"], "mrr_m6_p50": sm["mrr_m6"]["p50"], "mrr_m12_p50": sm["mrr_m12"]["p50"],
            "mrr_m6_mean": sm["mrr_m6_mean"], "mrr_m12_mean": sm["mrr_m12_mean"],
            "customers_m12_p50": sm["customers_m12"]["p50"], "revenue_mean": sm["revenue_mean"],
            "cash_cost_per_run": sm["cash_cost_per_run"],
            "channel_paid_per_run": round(paid, 2),
            "channel_cac_cash": round(cash / paid, 1) if paid else None,
            "channel_cac_incl_hours": round((cash + hours * hv) / paid, 1) if paid else None,
            "death_causes": {k: v for k, v in sm["death_causes"].items() if v},
            "seo": sm["seo"] if ch == "seo" else None,
            "channel_payoff_m6": sm["channels"].get(att[0], {}).get("payoff_m6") if att else None,
            "channel_payoff_m12": sm["channels"].get(att[0], {}).get("payoff_m12") if att else None,
            "channel_mrr_m12_per_run": round(sum(sm["channels"].get(a, {}).get("mrr_m12_per_run", 0.0) for a in att), 1),
            "channel_hours_per_run": round(hours, 1)}


def run_channels(R, cfg, best, log):
    sim = cfg["simulation"]
    n = sim["seeds_channels"]
    seeds = seeds_for("channels", n)
    variants = [("best strategy (baseline)", "baseline", None, best)]
    for ch, label, key in CHANNEL_DEFS:
        variants.append(("only " + label, "single", ch, only_channel(best, ch, key, cfg)))
    for ch in present_channels(best):
        variants.append(("best minus %s" % ch, "leave_one_out", ch, without(best, ch, cfg)))
    seo_share = sim["single_channel_min_share"]
    if best["hours"].get("seo", 0) < seo_share:
        t = copy.deepcopy(best)
        t["hours"]["seo"] = seo_share / (1 - seo_share) * sum(v for k, v in t["hours"].items() if k != "seo")
        variants.append(("best + SEO at %.0f%% of hours" % (100 * seo_share), "add", "seo", strat.normalize(t, cfg)))
    if not (best["hours"].get("social", 0) > 0.02):
        t = copy.deepcopy(best)
        t["hours"]["social"] = 0.12
        t["social"]["platform_mix"] = {"linkedin": 0.6, "x": 0.3, "shorts": 0.1}
        variants.append(("best + founder social (12% of hours)", "add", "social_founder", strat.normalize(t, cfg)))
        t2 = copy.deepcopy(t)
        t2["social"]["cm"] = True
        t2["social"]["cm_cost"] = cfg["social"]["cm_ref_cost"]
        variants.append(("best + founder social + CM", "add", "social_cm", strat.normalize(t2, cfg)))
    if not best["social"]["cm"]:
        t3 = copy.deepcopy(best)
        t3["social"]["cm"] = True
        t3["social"]["cm_cost"] = cfg["social"]["cm_ref_cost"]
        if not (t3["hours"].get("social", 0) > 0.02):
            t3["social"]["platform_mix"] = {"linkedin": 0.6, "x": 0.3, "shorts": 0.1}
        variants.append(("best + CM only (no founder posting)", "add", "cm", strat.normalize(t3, cfg)))
    sums = R.evaluate([(cfg, v[3], seeds) for v in variants])
    rows = [variant_row(v[0], v[1], v[2], sm, cfg) for v, sm in zip(variants, sums)]
    for r, v in zip(rows, variants):
        r["description"] = strat.describe(v[3])
    base = sums[0]
    for r in rows:
        r["delta_survival"] = round(r["survival"] - base["survival"], 4)
        r["delta_mrr_m12_mean"] = round(r["mrr_m12_mean"] - base["mrr_m12_mean"], 1)
        r["delta_revenue_mean"] = round(r["revenue_mean"] - base["revenue_mean"], 1)
        r["delta_cash_cost"] = round(r["cash_cost_per_run"] - base["cash_cost_per_run"], 1)
    by_time = {c: v["share_of_new_paid"] for c, v in base["channels"].items() if v["paid_per_run"] > 0}
    singles = sorted([r for r in rows if r["kind"] == "single"], key=lambda r: (-r["survival"], -r["mrr_m12_mean"]))
    answers = channel_answers(rows, base, cfg)
    log("  channels: %d variants x %d seeds; best single channel: %s (%.0f%%)"
        % (len(rows), n, singles[0]["label"], 100 * singles[0]["survival"]))
    return {"seeds": n, "baseline_description": strat.describe(best), "variants": rows,
            "single_channel_ranking": [r["label"] for r in singles], "channel_x_time": by_time,
            "baseline_channels": base["channels"], "baseline_seo": base["seo"], "answers": answers}


def channel_answers(rows, base, cfg):
    """Plain answers to SPEC-v2 section 5's two questions, computed from the variants."""
    def find(kind, ch):
        return next((r for r in rows if r["kind"] == kind and r["channel"] == ch), None)
    out = {}
    soc_add = find("add", "social_founder") or find("leave_one_out", "social")
    cm_add = find("add", "social_cm")
    cm_loo = find("leave_one_out", "cm")
    cm_only = find("add", "cm")
    noise = 0.04
    lines = []
    if soc_add:
        sign = 1 if soc_add["kind"] == "add" else -1   # leave-one-out: effect of social = -delta
        d = sign * soc_add["delta_survival"]
        dm = sign * soc_add["delta_mrr_m12_mean"]
        lines.append("Founder social posting changes survival by %+.0fpp and mean M12 MRR by %+.0f EUR (%s)."
                     % (d * 100, dm, "within noise" if abs(d) < noise else ("helps" if d > 0 else "hurts")))
    cm_row = cm_add or cm_only
    if cm_row:
        ref = soc_add if (cm_add and soc_add and soc_add["kind"] == "add") else rows[0]
        drev = cm_row["revenue_mean"] - ref["revenue_mean"]
        dcost = cm_row["cash_cost_per_run"] - ref["cash_cost_per_run"]
        dsurv = cm_row["survival"] - ref["survival"]
        pays = drev > dcost
        lines.append("Adding a community manager costs %.0f EUR/run and brings %+.0f EUR of extra revenue in year 1 "
                     "(survival %+.0fpp): the CM %s." % (dcost, drev, dsurv * 100,
                                                       "pays for itself" if pays else "does NOT pay for itself"))
        out["cm_pays_for_itself"] = pays
    elif cm_loo:
        drev = -cm_loo["delta_revenue_mean"]
        dcost = -cm_loo["delta_cash_cost"]
        pays = drev > dcost
        lines.append("The community manager costs %.0f EUR/run and brings %+.0f EUR of revenue in year 1: %s."
                     % (dcost, drev, "pays for itself" if pays else "does NOT pay for itself"))
        out["cm_pays_for_itself"] = pays
    out["social"] = " ".join(lines)
    single_seo = find("single", "seo")
    loo_seo = find("leave_one_out", "seo")
    add_seo = find("add", "seo")
    s_lines = []
    hv = cfg["team"]["hour_value_eur"]
    src_row = add_seo
    if src_row:
        po6, po12 = src_row["channel_payoff_m6"], src_row["channel_payoff_m12"]
        s_lines.append("measured inside the best plan with SEO raised to %.0f%% of hours (%.0f founder hours/run on SEO; "
                       "survival %+.0fpp vs the best plan)"
                       % (100 * cfg["simulation"]["single_channel_min_share"], src_row["channel_hours_per_run"],
                          100 * src_row["delta_survival"]))
    else:
        po6 = base["channels"].get("seo", {}).get("payoff_m6")
        po12 = base["channels"].get("seo", {}).get("payoff_m12")
        src_row = {"channel_hours_per_run": base["channels"].get("seo", {}).get("hours_per_run", 0.0),
                   "channel_mrr_m12_per_run": base["channels"].get("seo", {}).get("mrr_m12_per_run", 0.0),
                   "seo": base["seo"]}
        s_lines.append("measured on the best plan (%.0f founder hours/run on SEO)" % src_row["channel_hours_per_run"])
    for m, po in ((6, po6), (12, po12)):
        if po is not None:
            s_lines.append("by M%d SEO-attributed revenue = %.2fx its cost (founder hours at %d EUR/h; companies alive at M%d)"
                           % (m, po, hv, m))
    if src_row and src_row["channel_hours_per_run"] > 0:
        monthly_cost = src_row["channel_hours_per_run"] / 12.0 * hv
        s_lines.append("SEO-acquired MRR at M12 %.0f EUR/run vs ~%.0f EUR/month of founder time"
                       % (src_row["channel_mrr_m12_per_run"], monthly_cost))
    tiers = (src_row["seo"] if src_row and src_row.get("seo") else base["seo"])["tiers"]
    s_lines.append("; ".join("tier %s outranks the median competitor in %.0f%% of runs by M6 / %.0f%% by M12"
                             % (t, 100 * v["outranks_median_competitor_by_m6"], 100 * v["outranks_median_competitor_by_m12"])
                             for t, v in tiers.items()))
    if single_seo:
        s_lines.append("SEO alone: survival %.0f%%, M12 MRR p50 %.0f EUR" % (100 * single_seo["survival"], single_seo["mrr_m12_p50"]))
    if loo_seo:
        s_lines.append("removing SEO from the best plan: survival %+.0fpp" % (100 * loo_seo["delta_survival"]))
    out["seo"] = "; ".join(s_lines) + "."
    out["seo_pays_off_m6"] = bool(po6 is not None and po6 >= 1.0)
    out["seo_pays_off_m12"] = bool(po12 is not None and po12 >= 1.0)
    return out


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
        out.setdefault(name, {})[world] = {"survival": sm["survival"], "mrr_m3": sm["mrr_m3"], "mrr_m6": sm["mrr_m6"],
                                           "mrr_m12": sm["mrr_m12"],
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
        for k in runs[0]["ts"].keys():
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


def pct(x):
    return "n/a" if x is None else "%.0f%%" % (100 * x)


def top_cause(sm):
    dc = {k: v for k, v in sm["death_causes"].items() if v}
    if not dc:
        return "-"
    tot = sum(dc.values())
    k = max(dc, key=dc.get)
    return "%s %.0f%%" % (k, 100 * dc[k] / tot)


def kpi_sentence(k):
    return ("survival **%s**, MRR p50 M3/M6/M12 %.0f / %.0f / %.0f EUR (M12 p90 %.0f), customers M12 p50 %.0f, "
            "gross margin p50 %s, monthly churn p50 %s, early warning at M3 in %s of runs"
            % (pct(k["survival"]), k["mrr_m3"]["p50"], k["mrr_m6"]["p50"], k["mrr_m12"]["p50"], k["mrr_m12"]["p90"],
               k["customers_m12"]["p50"], pct(k["gross_margin"]["p50"]) if k["gross_margin"] else "n/a",
               ("%.1f%%" % (100 * k["churn_monthly"]["p50"])) if k["churn_monthly"] else "n/a", pct(k["m3_warning_share"])))


def write_report(path, cfg, iters, search, n_screened, chans, sens, stress, meta):
    sim = cfg["simulation"]
    via = cfg["viability"]
    target = sim["survival_target"]
    L = []
    w = L.append
    naive = iters[0]["kpis"]
    best_it = max(iters, key=lambda r: (r["kpis"]["survival"], r["kpis"]["mrr_m12"]["p50"]))
    first_ok = next((r for r in iters if r["kpis"]["survival"] >= target), None)
    best_s = search[0] if search else None
    best_v = next((s for s in search if s["vision"]), None)
    w("# Mascott company simulator v2 - results")
    w("")
    w("Mode: **%s** | seeds per iteration: %d | search: %d strategies x %d seeds, %d finalists re-run at %d fresh seeds | "
      "channel experiment: %s seeds per variant"
      % (meta["mode"], sim["seeds_iteration"], n_screened, sim["seeds_search"], len(search), sim["seeds_search_top"],
         chans["seeds"] if chans else "-"))
    w("Base seed %d (seed ranges in each JSON file). Runtime %.0f s, %d simulated companies, %d workers."
      % (sim["base_seed"], meta["runtime_s"], meta["sims"], meta["workers"]))
    w("")
    w("> **Death rule (v2):** a company dies if cash < 0 at any time, or if at the end of month 6 after launch "
      "(week %d) MRR < %d EUR or cumulative revenue < %d EUR. Month 3 is only an early warning (MRR < %d EUR). "
      "Market numbers are estimates in `sim/config.json` except where a `_source` says panel or Semrush; "
      "SEO competition is calibrated from `founder/seo-competition.json`. Read survival rates as relative rankings, "
      "not forecasts." % (via["m6_week"], via["m6_min_mrr"], via["m6_min_cum_revenue"], via["m3_warning_mrr"]))
    w("")
    w("## Headline")
    w("")
    w("- **Founder's vision as stated** (few-clicks install, cute + pro option, all segments, SEO + GEO + social, "
      "29/79 + free plan, broad scope): %s. Main cause of death: %s." % (kpi_sentence(naive), top_cause(naive)))
    w("- **CEO relaunches**: %d iterations; best survival **%s** at iteration %d%s."
      % (len(iters), pct(best_it["kpis"]["survival"]), best_it["iteration"],
         ("; target %s first reached at iteration %d" % (pct(target), first_ok["iteration"])) if first_ok
         else "; the %s target was **not** reached" % pct(target)))
    if best_s:
        w("- **Best strategy (broad search)**: %s." % kpi_sentence(best_s["kpis"]))
        w("  - %s" % best_s["description"])
    if best_v:
        w("- **Best strategy that keeps the founder's vision** (few-clicks install + cute style): %s." % kpi_sentence(best_v["kpis"]))
        w("  - %s" % best_v["description"])
        if best_s and best_v is not best_s:
            w("  - **Gap to the best strategy:** survival %+.0fpp, M12 MRR p50 %+.0f EUR, mean year-1 revenue %+.0f EUR."
              % (100 * (best_v["kpis"]["survival"] - best_s["kpis"]["survival"]),
                 best_v["kpis"]["mrr_m12"]["p50"] - best_s["kpis"]["mrr_m12"]["p50"],
                 best_v["kpis"]["revenue_mean"] - best_s["kpis"]["revenue_mean"]))
        elif best_s:
            w("  - The best strategy already keeps the vision: no gap.")
    if chans:
        a = chans["answers"]
        w("- **Channels (single-channel ranking on the best strategy):** %s." % " > ".join(chans["single_channel_ranking"]))
        w("- **Is social worth it?** %s" % (a.get("social") or "n/a"))
        w("- **Does SEO pay off against these competitors?** Within 6 months: **%s**; within 12 months: **%s**. %s"
          % ("yes" if a["seo_pays_off_m6"] else "no", "yes" if a["seo_pays_off_m12"] else "no", a["seo"]))
    if stress and "naive" in stress:
        worlds = ("pessimistic", "baseline", "optimistic", "very_optimistic")
        w("- **Stress worlds** (every sensitivity input moved 30% against / 0 / 30% for / 50% for the company): "
          + "; ".join("%s %s" % (name, " / ".join(pct(st[x]["survival"]) for x in worlds)) for name, st in stress.items()) + ".")
    w("")

    w("## 1. Relaunch log (CEO post-mortems)")
    w("")
    w("Each row is one relaunch. The CEO diagnoses the dominant cause of death, applies the matching playbook move "
      "(plus occasional random exploration), and reverts any move that lowered survival by more than %.0fpp."
      % (cfg["ceo"]["revert_if_drop"] * 100))
    w("")
    w("| # | built on | survival | M3 warn | M6 MRR p50 | M12 MRR p50 (p10-p90) | trial->paid | top death cause | change made for the NEXT run | why |")
    w("|---|---|---|---|---|---|---|---|---|---|")
    for r in iters:
        k = r["kpis"]
        d = r.get("decision", {})
        if d.get("stop"):
            change, why = "stop", d["reason"]
        else:
            change = (("REVERT. " if d.get("reverted") else "") + d.get("change", "")
                      + (" + explore: %s" % d["exploration"] if d.get("exploration") else ""))
            why = d.get("reason", "") + ((" " + d["reverted"]) if d.get("reverted") else "")
        w("| %d | %s | %s | %s | %.0f | %s | %.0f%% | %s | %s | %s |"
          % (r["iteration"], ("#%d" % (r["parent"] + 1)) if r.get("parent") is not None else "-",
             pct(k["survival"]), pct(k["m3_warning_share"]), k["mrr_m6"]["p50"], fmt_p(k["mrr_m12"]),
             k["trial_to_paid"] * 100, top_cause(k), change.replace("|", "/"), why.replace("|", "/")))
    w("")
    w("Final iteration strategy: %s" % iters[-1]["description"])
    w("")

    w("## 2. Broad search (independent of the relaunch path)")
    w("")
    w("| rank | vision? | survival | screen surv | M6 MRR p50 | M12 MRR p50 (p10-p90) | cust M12 p50 | gross margin p50 | strategy |")
    w("|---|---|---|---|---|---|---|---|---|")
    for i, s in enumerate(search):
        k = s["kpis"]
        w("| %d | %s | %s | %s | %.0f | %s | %.0f | %s | %s |"
          % (i + 1, "yes" if s["vision"] else "no", pct(k["survival"]), pct(s["screen_kpis"]["survival"]),
             k["mrr_m6"]["p50"], fmt_p(k["mrr_m12"]), k["customers_m12"]["p50"],
             pct(k["gross_margin"]["p50"]) if k["gross_margin"] else "n/a", s["description"].replace("|", "/")))
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
        w("Death causes (best strategy): %s. LLM cost per run p50 %.0f EUR; min cash p10 %.0f EUR."
          % (", ".join("%s %d" % (c, n) for c, n in k["death_causes"].items() if n), k["llm_cost"]["p50"], k["cash_min"]["p10"]))
    w("")

    if chans:
        w("## 3. Which channel works best?")
        w("")
        w("All variants are built from the best strategy and run on the same %d seeds. Single-channel: only that "
          "channel keeps marketing hours (its own share, at least %.0f%% of hours); every other channel's hours go to "
          "engineering; paid ads, LTD and the free generator are off; presales only with outreach. Referral, badge and "
          "free-plan upgrades stay on (they are passive). CAC counts founder hours at %d EUR/h; 'cash' includes the CM fee."
          % (chans["seeds"], 100 * sim["single_channel_min_share"], cfg["team"]["hour_value_eur"]))
        w("")
        w("| variant | survival | delta surv | M6 MRR p50 | M12 MRR p50 | cust M12 p50 | mean yr-1 revenue | cash cost/run | channel paid/run | channel CAC cash | CAC incl. hours |")
        w("|---|---|---|---|---|---|---|---|---|---|---|")
        for r in chans["variants"]:
            show = r["kind"] in ("single", "add")
            w("| %s | %s | %+.0fpp | %.0f | %.0f | %.0f | %.0f | %.0f | %s | %s | %s |"
              % (r["label"], pct(r["survival"]), 100 * r["delta_survival"], r["mrr_m6_p50"], r["mrr_m12_p50"],
                 r["customers_m12_p50"], r["revenue_mean"], r["cash_cost_per_run"],
                 ("%.2f" % r["channel_paid_per_run"]) if show else "-",
                 r["channel_cac_cash"] if show and r["channel_cac_cash"] is not None else "-",
                 r["channel_cac_incl_hours"] if show and r["channel_cac_incl_hours"] is not None else "-"))
        w("")
        w("**Channel x time** (share of new paying customers acquired in each period, best strategy):")
        w("")
        w("| channel | months 1-3 | months 4-6 | months 7-12 | paid/run | payoff by M6 / M12 (attributed revenue / cost incl. founder hours) |")
        w("|---|---|---|---|---|---|")
        for c, sh in sorted(chans["channel_x_time"].items(), key=lambda kv: -chans["baseline_channels"][kv[0]]["paid_per_run"]):
            bc = chans["baseline_channels"][c]
            w("| %s | %s | %s | %s | %.1f | %s / %s |" % (c, pct(sh["m1_3"]), pct(sh["m4_6"]), pct(sh["m7_12"]), bc["paid_per_run"],
                                                         ("%.2f" % bc["payoff_m6"]) if bc.get("payoff_m6") is not None else "-",
                                                         ("%.2f" % bc["payoff_m12"]) if bc.get("payoff_m12") is not None else "-"))
        w("")
        a = chans["answers"]
        w("- **Is social worth it, with or without a CM?** %s" % (a.get("social") or "n/a"))
        w("- **Does SEO pay off within 6 / 12 months against these competitors?** %s / %s. %s"
          % ("yes" if a["seo_pays_off_m6"] else "no", "yes" if a["seo_pays_off_m12"] else "no", a["seo"]))
        w("")

    if best_s:
        sc = cfg["marketing"]["seo_competition"]
        seo_row = next((r for r in chans["variants"] if r["kind"] == "add" and r["channel"] == "seo"), None) if chans else None
        if seo_row:
            seo, which = seo_row["seo"], "the best plan with SEO raised to %.0f%% of hours (the best plan itself puts %.0f%% there)" % (
                100 * sim["single_channel_min_share"], 100 * best_s["strategy"]["hours"].get("seo", 0))
        else:
            seo, which = best_s["kpis"]["seo"], "the best strategy"
        w("## 4. SEO against real competitors")
        w("")
        w("Measured on %s." % which)
        w("")
        comp = sc.get("competitors", {})
        w("Competitive model calibrated from `founder/seo-competition.json`: median top-10 competitor Authority Score %s, "
          "named competitors median %s / max %s. Our authority p50 (p10-p90): M3 %s, M6 %s, M12 %s (analyst anchors %s)."
          % (comp.get("median_authority_top10", "?"), comp.get("median_authority_named", "?"), comp.get("max_authority_named", "?"),
             fmt_p(seo["authority"].get("m3"), False), fmt_p(seo["authority"].get("m6"), False),
             fmt_p(seo["authority"].get("m12"), False), sc["authority_anchor"]))
        w("")
        w("| tier | searches/mo | KD | top-10 authority | top-10 share M6 / M12 | top-3 share M6 / M12 | clicks/mo M6 p50 | clicks/mo M12 p50 | outranks median competitor by M6 / M12 (week p50) |")
        w("|---|---|---|---|---|---|---|---|---|")
        for t, row in seo["tiers"].items():
            ti = sc["tiers"][t]
            w("| %s | %d | %.0f | %.0f | %s / %s | %s / %s | %.0f | %.0f | %s / %s (%s) |"
              % (t, ti["monthly_volume"], ti["kd"], ti["top10_authority"],
                 pct(row.get("top10_share_m6_p50")), pct(row.get("top10_share_m12_p50")),
                 pct(row.get("top3_share_m6_p50")), pct(row.get("top3_share_m12_p50")),
                 row.get("clicks_per_month_m6", {}).get("p50", 0), row.get("clicks_per_month_m12", {}).get("p50", 0),
                 pct(row["outranks_median_competitor_by_m6"]), pct(row["outranks_median_competitor_by_m12"]),
                 ("week %.0f" % row["first_outrank_week_p50"]) if row["first_outrank_week_p50"] is not None else "never"))
        if sc.get("analyst_expected_clicks"):
            w("")
            w("The analyst's own estimate for a focused plan: %s organic clicks/month (Semrush volumes are usually undercounted for "
              "B2B long-tail; the model's per-run SEO yield uncertainty covers x0.5-x2)." % sc["analyst_expected_clicks"])
        w("")

    w("## 5. Sensitivity (which assumptions matter most)")
    w("")
    if sens:
        w("Each input moved -%d%% / +%d%% on the best search strategy (%d seeds each; base survival %s). Sorted by swing."
          % (sens["delta"] * 100, sens["delta"] * 100, sens["seeds"], pct(sens["base_survival"])))
        w("")
        w("| assumption | survival at -%d%% | survival at +%d%% | swing |" % (sens["delta"] * 100, sens["delta"] * 100))
        w("|---|---|---|---|")
        for r in sens["rows"]:
            w("| `%s` | %s | %s | %.0fpp |" % (r["param"], pct(r["survival_minus"]), pct(r["survival_plus"]), r["swing"] * 100))
    w("")
    w("## 6. How to read this")
    w("")
    w("- `iterations.json`: every relaunch (strategy, KPIs incl. M3/M6/M9/M12 MRR, M3 early warning, SEO and social KPIs, "
      "death-cause histogram, CEO decision and reason).")
    w("- `search.json`: finalists re-run on fresh seeds (`vision` flags few-clicks + cute), with segment mix and channels.")
    w("- `channels.json`: single-channel, leave-one-out and add-social variants of the best strategy, channel x time, answers.")
    w("- `sensitivity.json`: +/-30% swings and the stress worlds. `timeseries.json`: weekly p10/p50/p90 incl. authority, "
      "per-tier clicks and top-10/top-3 shares, social followers.")
    w("- Death causes: no_traffic (too few trials, or traction too late for the M6 bar), low_conversion, price_too_high, "
      "price_too_low, churn, cash_burn, llm_costs, build_too_long (not launched within %d weeks)." % via["max_build_weeks"])
    w("")
    with open(path, "w") as f:
        f.write("\n".join(L))


# --------------------------------------------------------------------------- main
def main(argv=None):
    ap = argparse.ArgumentParser(description="Mascott company simulator v2")
    g = ap.add_mutually_exclusive_group()
    g.add_argument("--quick", action="store_true", help="small smoke-test sizes (< 2 min)")
    g.add_argument("--full", action="store_true", help="default sizes")
    ap.add_argument("--seeds", type=int, default=None, help="override seeds per iteration")
    ap.add_argument("--workers", type=int, default=None, help="worker processes (default: CPU count)")
    ap.add_argument("--out", default=os.path.join(HERE, "results"), help="output directory")
    ap.add_argument("--config", default=os.path.join(HERE, "config.json"))
    ap.add_argument("--max-iterations", type=int, default=None)
    ap.add_argument("--skip-search", action="store_true")
    ap.add_argument("--skip-channels", action="store_true")
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
    seed_info = {"base_seed": sim["base_seed"], "offsets": SEED_OFFSETS}
    R = Runner(workers)
    try:
        log("1/6 relaunch iterations (%d seeds each, target %.0f%%)" % (sim["seeds_iteration"], sim["survival_target"] * 100))
        iters = run_iterations(R, cfg, log)
        with open(os.path.join(a.out, "iterations.json"), "w") as f:
            json.dump({"seeds": dict(seed_info, iterations=[0, sim["seeds_iteration"]]),
                       "survival_target": sim["survival_target"], "iterations": iters}, f, indent=1)
        best_it = max(iters, key=lambda r: (r["kpis"]["survival"], r["kpis"]["mrr_m12"]["p50"]))

        search, n_screened = [], 0
        if not a.skip_search:
            log("2/6 broad search (%d strategies x %d seeds)" % (sim["search_strategies"], sim["seeds_search"]))
            extra = [iters[0]["strategy"], best_it["strategy"]]
            v = copy.deepcopy(best_it["strategy"])
            v["install"] = "few_clicks"
            v["style"] = v["style"] if v["style"] in ("cute", "cute_pro") else "cute_pro"
            extra.append(strat.normalize(v, cfg))
            search, n_screened = run_search(R, cfg, log, extra)
            with open(os.path.join(a.out, "search.json"), "w") as f:
                json.dump({"seeds": dict(seed_info, screen=[0, sim["seeds_search"]],
                                         top=[SEED_OFFSETS["search_top"], SEED_OFFSETS["search_top"] + sim["seeds_search_top"]]),
                           "screened": n_screened, "top": search}, f, indent=1)
        best_strategy = search[0]["strategy"] if search else best_it["strategy"]
        best_vision = next((s["strategy"] for s in search if s["vision"]), None)

        chans = None
        if not a.skip_channels:
            log("3/6 channel experiment on the best strategy")
            chans = run_channels(R, cfg, best_strategy, log)
            with open(os.path.join(a.out, "channels.json"), "w") as f:
                json.dump({"seeds": dict(seed_info, channels=[SEED_OFFSETS["channels"],
                                                              SEED_OFFSETS["channels"] + sim["seeds_channels"]]),
                           "strategy": best_strategy, **chans}, f, indent=1)

        sens, stress = None, None
        named = [("naive", iters[0]["strategy"]), ("best_search" if search else "best_iteration", best_strategy)]
        if best_vision is not None and best_vision is not best_strategy:
            named.append(("best_vision", best_vision))
        if not a.skip_sensitivity:
            log("4/6 sensitivity on the best strategy")
            sens = run_sensitivity(R, cfg, best_strategy, log)
            log("5/6 stress worlds")
            stress = run_stress(R, cfg, named, log)
            with open(os.path.join(a.out, "sensitivity.json"), "w") as f:
                json.dump({"seeds": dict(seed_info, sensitivity=[SEED_OFFSETS["sensitivity"],
                                                                 SEED_OFFSETS["sensitivity"] + sim["seeds_sensitivity"]]),
                           "strategy": best_strategy, "description": strat.describe(best_strategy),
                           "sensitivity": sens, "stress": stress}, f, indent=1)

        log("6/6 weekly time series")
        first_ok = next((r for r in iters if r["kpis"]["survival"] >= sim["survival_target"]), None)
        ts_named = [("naive", iters[0]["strategy"]),
                    ("first_surviving_iteration" if first_ok else "best_iteration (target not reached)",
                     (first_ok or best_it)["strategy"])]
        if search:
            ts_named.append(("best_search", best_strategy))
        if best_vision is not None and best_vision is not best_strategy:
            ts_named.append(("best_vision", best_vision))
        ts = run_timeseries(R, cfg, ts_named)
        with open(os.path.join(a.out, "timeseries.json"), "w") as f:
            json.dump({"seeds": dict(seed_info, timeseries=[SEED_OFFSETS["timeseries"],
                                                            SEED_OFFSETS["timeseries"] + sim["seeds_timeseries"]]),
                       "series": ts}, f)
        meta = {"mode": mode, "runtime_s": time.time() - t0, "sims": R.sims, "workers": workers}
        write_report(os.path.join(a.out, "report.md"), cfg, iters, search, n_screened, chans, sens, stress, meta)
        log("done: %d simulated companies in %.1f s -> %s" % (R.sims, time.time() - t0, os.path.join(a.out, "report.md")))
    finally:
        R.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
