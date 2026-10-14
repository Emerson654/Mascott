#!/usr/bin/env python3
"""Load founder/seo-competition.json (Semrush data from the SEO analyst) into sim/config.json.

    python3 sim/calibrate_seo.py                 # read the default file, update config.json
    python3 sim/calibrate_seo.py --dry-run       # print what would change
    python3 sim/calibrate_seo.py --file path.json --config path/config.json

What it writes under marketing.seo_competition (each with a _source note):
  tiers.<T>.monthly_volume   tier total monthly searches (Semrush, us + fr)
  tiers.<T>.kd               tier average Keyword Difficulty
  tiers.<T>.top10_authority  median of the sampled per-keyword "top-10 median Authority Score"
                             in that tier (falls back to the overall top-10 median)
  tiers.<T>.pages_needed     keywords in the tier x pages per keyword (deeper content for harder tiers)
  ctr                        expected CTR for positions 1-3 / 4-10 / 11-20
  authority_anchor           our expected Authority Score at months 3 / 6 / 12
  rank                       auth_coef, kd_coef, t3, t10, t20 FITTED so that, with the anchor
                             authority and full content depth, the model reproduces the analyst's
                             expected share of keywords in the top 3 / 10 / 20 at months 6 and 12
  competitors                median / max competitor authority (reported, not used in the maths)
  analyst_expected_clicks    the analyst's own clicks/month estimate (for comparison in the report)

The file format is read tolerantly: tiers can be given in `tiers` or `model_inputs`, and missing
pieces keep the current config value (the script says which). Standard library only.
"""
import argparse
import json
import math
import os
import statistics
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DEFAULT_FILE = os.path.join(ROOT, "founder", "seo-competition.json")
DEFAULT_CONFIG = os.path.join(HERE, "config.json")
PAGES_PER_KEYWORD = {"A": 1.5, "B": 3.0, "C": 5.0}   # supporting pages per target keyword


def norm_cdf(z):
    return 0.5 * (1.0 + math.erf(z / math.sqrt(2.0)))


def _num(x):
    try:
        return float(x)
    except (TypeError, ValueError):
        return None


def tier_authority(data, tier, fallback):
    vals = []
    for kw in data.get("keywords", []):
        if str(kw.get("tier")) == tier:
            v = _num(kw.get("top10_median_authority"))
            if v is not None:
                vals.append(v)
    return (statistics.median(vals), len(vals)) if vals else (fallback, 0)


def position_targets(mi):
    """{month: {tier: (cum_top3, cum_top10, cum_top20)}} from model_inputs.position_share_assumptions."""
    out = {}
    for m, tiers in (mi.get("position_share_assumptions") or {}).items():
        for t, b in tiers.items():
            c3 = _num(b.get("1_3")) or 0.0
            c10 = c3 + (_num(b.get("4_10")) or 0.0)
            c20 = c10 + (_num(b.get("11_20")) or 0.0)
            out.setdefault(int(m), {})[t] = (c3, c10, c20)
    return out


def fit_rank(targets, tiers, anchors, rank, months=(6, 12)):
    """Fit auth_coef, kd_coef, t3, t10, t20 (least squares on cumulative shares)."""
    s = rank["kw_sigma"]
    const = rank["depth_coef"] * math.log(2.0) + rank["focus_bonus"]   # full depth, focused content
    obs = []
    for m in months:
        a = anchors.get(m)
        for t, cum in targets.get(m, {}).items():
            if t in tiers and a is not None:
                obs.append((a, tiers[t]["top10_authority"], tiers[t]["kd"], cum))
    if not obs:
        return None, None

    def loss(p):
        ac, kc, t3, t10, t20 = p
        if not (t3 > t10 > t20) or ac <= 0 or kc < 0:
            return 1e9
        e = 0.0
        for a, T, kd, (c3, c10, c20) in obs:
            r = ac * math.log((a + 1.0) / (T + 1.0)) - kc * (kd - rank["kd_ref"]) / 100.0 + const
            e += ((norm_cdf((r - t3) / s) - c3) ** 2 + (norm_cdf((r - t10) / s) - c10) ** 2
                  + (norm_cdf((r - t20) / s) - c20) ** 2)
        return e

    best = None
    for ac in (0.5, 0.75, 1.0, 1.5):
        for kc in (1.0, 2.0, 3.0, 4.0):
            p = [ac, kc, rank["t3"], rank["t10"], rank["t20"]]
            v = loss(p)
            if best is None or v < best[1]:
                best = (p, v)
    p, v = best
    step = [0.25, 0.5, 0.3, 0.3, 0.3]
    for _ in range(60):                       # coordinate descent with shrinking steps
        improved = False
        for i in range(5):
            for d in (-1, 1):
                q = list(p)
                q[i] += d * step[i]
                w = loss(q)
                if w < v:
                    p, v, improved = q, w, True
        if not improved:
            step = [x / 2 for x in step]
            if max(step) < 1e-3:
                break
    rmse = math.sqrt(v / (3 * len(obs)))
    return dict(zip(("auth_coef", "kd_coef", "t3", "t10", "t20"), [round(x, 3) for x in p])), round(rmse, 4)


def calibrate(data, cfg, log=print):
    sc = cfg["marketing"]["seo_competition"]
    src = sc.setdefault("_source", {})
    mi = data.get("model_inputs", {})
    tag = "founder/seo-competition.json (%s, %s) via sim/calibrate_seo.py" % (
        data.get("source", "Semrush").split(";")[0], data.get("generated", "undated"))
    overall_auth = _num(mi.get("median_competitor_authority_top10")) or 40.0
    tiers_in = data.get("tiers", {})
    names = []
    for t in sorted(sc["tiers"].keys()):
        cur = sc["tiers"][t]
        ti = tiers_in.get(t, {})
        vol = _num(ti.get("total_volume")) or _num(mi.get("winnable_monthly_searches_tier%s" % t)) \
            or _num(mi.get("monthly_searches_tier%s" % t))
        kd = _num(ti.get("avg_kd")) or _num(mi.get("avg_kd_tier%s" % t))
        count = _num(ti.get("count")) or (len(ti.get("keywords", [])) or None)
        auth, n_auth = tier_authority(data, t, overall_auth)
        if vol is None or kd is None:
            log("  tier %s: missing volume/KD in the file, keeping config values" % t)
            continue
        cur["monthly_volume"] = round(vol)
        cur["kd"] = round(kd, 1)
        cur["top10_authority"] = round(auth, 1)
        if count:
            cur["pages_needed"] = round(count * PAGES_PER_KEYWORD.get(t, 2.0))
        names.append(t)
        log("  tier %s: %d searches/mo, KD %.1f, top-10 authority %.1f (%s), pages needed %s"
            % (t, vol, kd, auth, ("median of %d sampled SERPs" % n_auth) if n_auth else "overall median",
               cur["pages_needed"]))
    src["tiers"] = ("%s. monthly_volume = tier total searches/month (us+fr; Semrush undercounts B2B long-tail, "
                    "see marketing.seo.yield_sigma); kd = tier average KD; top10_authority = median of sampled "
                    "per-keyword top-10 median Authority Scores; pages_needed = keywords x %s pages per keyword; "
                    "content_share = share of new pages written for the tier (estimate)" % (tag, PAGES_PER_KEYWORD))
    ctr = {k: _num(mi.get("expected_ctr_pos_%s" % k)) for k in ("1_3", "4_10", "11_20")}
    if all(v is not None for v in ctr.values()):
        sc["ctr"] = ctr
        src["ctr"] = "%s: %s" % (tag, mi.get("ctr_rationale", "analyst CTR assumption"))
        log("  CTR 1-3/4-10/11-20: %s" % ctr)
    anchors = {}
    for m in (3, 6, 12):
        v = _num(mi.get("our_authority_month_%d_estimate" % m))
        if v is not None:
            anchors[m] = v
    if anchors:
        sc["authority_anchor"] = dict([("0", 0)] + [(str(m), anchors[m]) for m in sorted(anchors)])
        src["authority_anchor"] = "%s: %s" % (tag, mi.get("authority_rationale", "analyst estimate"))
        log("  our authority anchors: %s" % sc["authority_anchor"])
    targets = position_targets(mi)
    if targets and anchors:
        fit, rmse = fit_rank(targets, sc["tiers"], anchors, sc["rank"])
        if fit:
            sc["rank"].update(fit)
            src["rank"] = ("r = auth_coef*ln((A+1)/(T+1)) - kd_coef*(KD-kd_ref)/100 + depth_coef*ln(1+min(depth,3)) "
                           "+ focus_bonus + per-run noise; keyword-level r ~ N(r, kw_sigma); share in top 3/10/20 = "
                           "Phi((r-t)/kw_sigma). auth_coef, kd_coef, t3, t10, t20 FITTED by calibrate_seo.py to the "
                           "analyst's position_share_assumptions at months 6 and 12 (RMSE %.3f on cumulative shares), "
                           "assuming full content depth and a focused site; kw_sigma, kd_ref, depth_coef, focus_bonus, "
                           "run_sigma are estimates. 'Outranks the median competitor' = r >= (t3+t10)/2 with depth >= 0.3"
                           % rmse)
            log("  rank model fitted to the analyst's position shares: %s (RMSE %.3f)" % (fit, rmse))
    comps = [c.get("authority_score") for c in data.get("competitors", []) if _num(c.get("authority_score")) is not None]
    sc["competitors"] = {
        "median_authority_top10": overall_auth,
        "median_authority_named": _num(mi.get("median_authority_named_competitors")),
        "max_authority_named": max(comps) if comps else None,
        "n_named": len(comps)}
    src["competitors"] = "%s: reported in the results, not used in the maths (tier top10_authority is)" % tag
    exp = mi.get("expected_google_clicks_per_month") or {}
    if exp:
        sc["analyst_expected_clicks"] = {k.replace("month_", "m"): v.get("total") for k, v in exp.items()}
        src["analyst_expected_clicks"] = "%s: the analyst's own clicks/month estimate (comparison only)" % tag
    return names


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--file", default=DEFAULT_FILE)
    ap.add_argument("--config", default=DEFAULT_CONFIG)
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args(argv)
    if not os.path.exists(a.file):
        print("no %s yet: config keeps its placeholder SEO values" % a.file)
        return 1
    with open(a.file) as f:
        data = json.load(f)
    with open(a.config) as f:
        cfg = json.load(f)
    print("calibrating marketing.seo_competition from %s" % a.file)
    names = calibrate(data, cfg)
    if not names:
        print("nothing usable in the file; config unchanged")
        return 1
    if a.dry_run:
        print(json.dumps(cfg["marketing"]["seo_competition"], indent=2))
        return 0
    with open(a.config, "w") as f:
        json.dump(cfg, f, indent=2)
        f.write("\n")
    print("wrote %s" % a.config)
    return 0


if __name__ == "__main__":
    sys.exit(main())
