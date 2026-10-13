"""Strategy space, the founder's naive plan, the CEO post-mortem playbook and mutation.

A strategy is a plain JSON-serialisable dict:

    targets            list of segment names (one-segment focus = bonus; many = dilution)
    pricing            model ("tiered" | "per_resolution"), free_plan, free_quota,
                       starter_price/quota, pro_price/quota (pro_price None = one tier),
                       overage_per_100, annual_discount, launch_discount,
                       agency_plan_price (None = none), platform_fee, per_resolution_price
    hours              post-launch shares: engineering, seo, geo, outreach, app_store,
                       agency, launches (normalised by the engine; customer success is
                       need-based with a floor `cs_min_share`)
    cs_min_share       floor of hours reserved for customer success
    prelaunch_marketing_share  share of build-phase hours spent on SEO/outreach/... (waitlist,
                       early content to start the sandbox clock); lengthens the build
    paid_ads_per_month EUR
    scope              platforms (subset of engine.PLATFORMS), actions (1-6)
    style              "cute" | "cute_pro"
    offer              done_for_you, guarantee, presell (pre-launch outreach replies are
                       offered a paid 3-month pilot instead of a trial)
    ltd                enabled, price, week_after_launch
    in_run_adjust      let the CEO move hours during the run (monthly review)
"""
import copy
import math

from engine import PLATFORMS, HOUR_KEYS

AGENCY = "Web agency or freelancer"


# --------------------------------------------------------------------------- basics
def naive_strategy(cfg):
    """Iteration 1: the founder's plan from idea.md / pitch.md."""
    return normalize({
        "name": "naive: all segments, 29/79 + free, SEO/GEO only, broad scope",
        "targets": list(cfg["segments"].keys()),
        "pricing": {"model": "tiered", "free_plan": True, "free_quota": 50,
                    "starter_price": 29, "starter_quota": 1000,
                    "pro_price": 79, "pro_quota": 5000,
                    "overage_per_100": 0.0, "annual_discount": 0.0, "launch_discount": 0.0,
                    "agency_plan_price": None, "platform_fee": 0.0, "per_resolution_price": 0.0},
        "hours": {"engineering": 0.3, "seo": 0.5, "geo": 0.2, "outreach": 0.0,
                  "app_store": 0.0, "agency": 0.0, "launches": 0.0},
        "cs_min_share": 0.05,
        "prelaunch_marketing_share": 0.0,
        "paid_ads_per_month": 0.0,
        "scope": {"platforms": list(PLATFORMS), "actions": 6},
        "style": "cute",
        "offer": {"done_for_you": False, "guarantee": False, "presell": False},
        "ltd": {"enabled": False, "price": 59, "week_after_launch": 4},
        "in_run_adjust": True,
    }, cfg)


def normalize(s, cfg):
    s = copy.deepcopy(s)
    segs = list(cfg["segments"].keys())
    s["targets"] = [t for t in segs if t in s.get("targets", [])] or segs[:1]
    p = s["pricing"]
    p.setdefault("model", "tiered")
    p["starter_price"] = round(max(5.0, float(p.get("starter_price", 29))), 0)
    if p.get("pro_price") is not None:
        p["pro_price"] = round(max(p["starter_price"] * 1.3, float(p["pro_price"])), 0)
    p["starter_quota"] = int(max(100, p.get("starter_quota", 1000)))
    p["pro_quota"] = int(max(p["starter_quota"], p.get("pro_quota", 5000)))
    p["free_quota"] = int(max(10, p.get("free_quota", 50)))
    p["overage_per_100"] = round(max(0.0, p.get("overage_per_100", 0.0)), 2)
    p["annual_discount"] = round(min(0.4, max(0.0, p.get("annual_discount", 0.0))), 2)
    p["launch_discount"] = round(min(0.5, max(0.0, p.get("launch_discount", 0.0))), 2)
    p.setdefault("agency_plan_price", None)
    p["platform_fee"] = round(max(0.0, p.get("platform_fee", 0.0)), 0)
    p["per_resolution_price"] = round(max(0.0, p.get("per_resolution_price", 0.0)), 3)
    if p["model"] == "per_resolution" and p["per_resolution_price"] <= 0:
        p["per_resolution_price"] = 0.15
    h = s["hours"]
    for k in HOUR_KEYS:
        h[k] = max(0.0, float(h.get(k, 0.0)))
    h["engineering"] = max(h["engineering"], 0.08)   # someone has to keep it running
    tot = sum(h[k] for k in HOUR_KEYS)
    for k in HOUR_KEYS:
        h[k] = round(h[k] / tot, 3)
    s["cs_min_share"] = round(min(0.45, max(0.0, s.get("cs_min_share", 0.05))), 3)
    s["prelaunch_marketing_share"] = round(min(0.5, max(0.0, s.get("prelaunch_marketing_share", 0.0))), 3)
    s["paid_ads_per_month"] = round(max(0.0, s.get("paid_ads_per_month", 0.0)), 0)
    sc = s["scope"]
    sc["platforms"] = [x for x in PLATFORMS if x in sc.get("platforms", [])] or ["js_saas"]
    sc["actions"] = int(min(6, max(1, sc.get("actions", 2))))
    s.setdefault("style", "cute")
    s.setdefault("offer", {})
    s["offer"].setdefault("done_for_you", False)
    s["offer"].setdefault("guarantee", False)
    s["offer"].setdefault("presell", False)
    s.setdefault("ltd", {"enabled": False, "price": 59, "week_after_launch": 4})
    s.setdefault("in_run_adjust", True)
    s.setdefault("name", "strategy")
    return s


def primary_platform(cfg, seg_name):
    return cfg["segments"][seg_name]["platforms"][0]


def describe(s):
    p = s["pricing"]
    if p["model"] == "per_resolution":
        price = "fee %g + %.2f/resolution" % (p["platform_fee"], p["per_resolution_price"])
    else:
        price = "%g/%s" % (p["starter_price"], ("%g" % p["pro_price"]) if p.get("pro_price") else "-")
    if p["free_plan"]:
        price += " +free"
    if p["overage_per_100"]:
        price += " +overage %.1f/100" % p["overage_per_100"]
    if p["annual_discount"]:
        price += " annual-%d%%" % (p["annual_discount"] * 100)
    if p["launch_discount"]:
        price += " early-%d%%" % (p["launch_discount"] * 100)
    if p.get("agency_plan_price"):
        price += " agency %g" % p["agency_plan_price"]
    hrs = ", ".join("%s %d%%" % (k, v * 100) for k, v in s["hours"].items() if v >= 0.03)
    tg = "ALL" if len(s["targets"]) >= 6 else " + ".join(short(t) for t in s["targets"])
    sc = "%s/%d actions" % ("+".join(s["scope"]["platforms"]), s["scope"]["actions"])
    extras = []
    if s["offer"]["done_for_you"]:
        extras.append("DFY setup")
    if s["offer"]["guarantee"]:
        extras.append("guarantee")
    if s["offer"]["presell"]:
        extras.append("presell pilots")
    if s["style"] == "cute_pro":
        extras.append("pro style")
    if s["ltd"]["enabled"]:
        extras.append("LTD %g" % s["ltd"]["price"])
    if s["paid_ads_per_month"]:
        extras.append("ads %g/mo" % s["paid_ads_per_month"])
    if s["prelaunch_marketing_share"]:
        extras.append("prelaunch mkt %d%%" % (s["prelaunch_marketing_share"] * 100))
    return "targets=%s | price=%s | hours: %s | scope=%s | %s" % (tg, price, hrs, sc, ", ".join(extras) or "no extras")


def short(seg):
    return {"Indie hacker / solo SaaS founder": "indie",
            "Small SaaS startup team": "smallSaaS",
            "E-commerce store owner (Shopify / WooCommerce)": "ecom",
            "Web agency or freelancer": "agency",
            "Small business / showcase site": "showcase",
            "Edtech, kids or consumer-app team": "edtech"}.get(seg, seg[:10])


def fingerprint(s):
    """Stable key used to avoid re-testing the same strategy."""
    t = copy.deepcopy(s)
    t.pop("name", None)
    return repr(sorted(_flatten(t)))


def _flatten(d, prefix=""):
    out = []
    for k, v in d.items():
        if isinstance(v, dict):
            out.extend(_flatten(v, prefix + k + "."))
        else:
            out.append((prefix + k, repr(v)))
    return out


def _shift(h, frm, to, frac):
    moved = 0.0
    for k in frm:
        m = h[k] * frac
        h[k] -= m
        moved += m
    h[to] += moved
    return moved


# --------------------------------------------------------------------------- playbook
NICE_PRICES = (9, 12, 15, 19, 24, 29, 35, 39, 45, 49, 59, 69, 79, 89, 99, 119, 149, 199, 249)


def reprice_for(s, cfg, seg):
    """Panel-informed pricing when the beachhead changes: Starter near the segment's median WTP
    ('getting expensive' answer), Pro ~2.7x. Returns a log string or ''."""
    p = s["pricing"]
    if p["model"] != "tiered":
        return ""
    wtp = cfg["segments"][seg]["wtp_median"]
    target = min(NICE_PRICES, key=lambda x: abs(x - 0.9 * wtp))
    if 0.75 * target <= p["starter_price"] <= 1.33 * target:
        return ""
    old = (p["starter_price"], p.get("pro_price"))
    p["starter_price"] = target
    if p.get("pro_price"):
        p["pro_price"] = min(NICE_PRICES, key=lambda x: abs(x - 2.7 * target))
    return "; re-priced %g/%s -> %g/%s from the segment's panel WTP" % (
        old[0], ("%g" % old[1]) if old[1] else "-", p["starter_price"],
        ("%g" % p["pro_price"]) if p.get("pro_price") else "-")


def best_segment(summary, cfg, current_targets, metric="mrr"):
    """Segment with the best evidence in the last batch (MRR per run, then conversion)."""
    segs = summary["segments"]
    best, best_v = None, -1.0
    for name, st in segs.items():
        if metric == "wtp":
            v = st["trial_to_paid"] * (1 - st["price_lost_share"]) + 1e-6 * st["mrr_end_per_run"]
        else:
            v = st["mrr_end_per_run"] + 50.0 * st["paid_per_run"] + 100.0 * st["trial_to_paid"]
        if v > best_v:
            best, best_v = name, v
    return best


def a_focus(s, sm, cfg, rng):
    if len(s["targets"]) <= 1:
        return None
    seg = best_segment(sm, cfg, s["targets"])
    st = sm["segments"][seg]
    s["targets"] = [seg]
    plat = primary_platform(cfg, seg)
    if plat not in s["scope"]["platforms"]:
        s["scope"]["platforms"].append(plat)
    rp = reprice_for(s, cfg, seg)
    return ("focus on '%s' only (best evidence: %.1f paid/run, trial->paid %.0f%%, %.0f EUR MRR/run); "
            "one-segment positioning and topical SEO%s" % (seg, st["paid_per_run"], st["trial_to_paid"] * 100,
                                                           st["mrr_end_per_run"], rp))


def a_switch_segment(s, sm, cfg, rng):
    """Pivot the beachhead to the next segment by evidence (all-segment runs), never one already tried."""
    if len(s["targets"]) != 1:
        return None
    ev = sm.get("_segment_evidence") or sm["segments"]
    tried_segs = sm.get("_tried_segments", set()) | set(s["targets"])
    ranked = sorted(ev.items(), key=lambda kv: -(kv[1]["mrr_end_per_run"] + 50.0 * kv[1]["paid_per_run"]
                                                 + 100.0 * kv[1]["trial_to_paid"]))
    nxt = next((name for name, _ in ranked if name not in tried_segs), None)
    if nxt is None:
        return None
    old = s["targets"][0]
    s["targets"] = [nxt]
    plat = primary_platform(cfg, nxt)
    s["scope"]["platforms"] = [plat] if len(s["scope"]["platforms"]) <= 1 else sorted(set(s["scope"]["platforms"]) | {plat})
    if s["hours"]["app_store"] > 0 and not set(s["scope"]["platforms"]) & {"shopify", "wordpress"}:
        s["hours"]["outreach"] += s["hours"]["app_store"]
        s["hours"]["app_store"] = 0.0
    if s["pricing"].get("agency_plan_price") and nxt != AGENCY:
        s["pricing"]["agency_plan_price"] = None
    rp = reprice_for(s, cfg, nxt)
    return ("pivot beachhead from '%s' to '%s' (next-best segment evidence; moves within '%s' stopped paying off)%s"
            % (short(old), short(nxt), short(old), rp))


def a_outreach(s, sm, cfg, rng):
    h = s["hours"]
    if h["outreach"] >= 0.45:
        return None
    moved = _shift(h, ("seo", "geo"), "outreach", 0.5)
    if moved < 0.05:
        h["outreach"] += 0.2
    return ("shift %.0f%% of hours from SEO/GEO to founder-led outreach: SEO sandbox (8-16 wks) means "
            "organic traffic arrives after the M3 deadline" % (max(moved, 0.2) * 100))


def a_prelaunch(s, sm, cfg, rng):
    if s["prelaunch_marketing_share"] >= 0.25:
        return None
    s["prelaunch_marketing_share"] = 0.25
    if s["hours"]["outreach"] < 0.1:
        s["hours"]["outreach"] += 0.1
    return ("spend 25% of build-phase hours on presales outreach + first content: builds a waitlist and "
            "starts the SEO sandbox clock before launch (build gets ~33% longer)")


def a_presell(s, sm, cfg, rng):
    if s["offer"]["presell"]:
        return None
    s["offer"]["presell"] = True
    if s["prelaunch_marketing_share"] < 0.2:
        s["prelaunch_marketing_share"] = 0.2
    if s["hours"]["outreach"] < 0.15:
        s["hours"]["outreach"] += 0.15
    return ("presell: offer pre-launch outreach replies a paid 3-month pilot (-20%) so the first euros "
            "arrive at launch instead of after the sandbox (board Offers lens condition #3)")


def a_launches(s, sm, cfg, rng):
    if s["hours"]["launches"] >= 0.05:
        return None
    s["hours"]["launches"] = 0.1
    return "add one-shot launches (Product Hunt, Show HN, directories) for a traffic spike and backlinks"


def a_app_store(s, sm, cfg, rng):
    if s["hours"]["app_store"] >= 0.05:
        return None
    ok = [t for t in s["targets"] if set(cfg["segments"][t]["platforms"]) & {"shopify", "wordpress"}]
    if not ok:
        return None
    plat = "shopify" if "shopify" in cfg["segments"][ok[0]]["platforms"] else "wordpress"
    if plat not in s["scope"]["platforms"]:
        s["scope"]["platforms"].append(plat)
    s["hours"]["app_store"] = 0.12
    return "list on the %s app store: a steady install flow that does not depend on SEO" % plat


def a_agency(s, sm, cfg, rng):
    if s["hours"]["agency"] >= 0.05:
        return None
    s["hours"]["agency"] = 0.12
    if AGENCY not in s["targets"] and len(s["targets"]) < 3:
        s["targets"].append(AGENCY)
    if not s["pricing"].get("agency_plan_price"):
        s["pricing"]["agency_plan_price"] = round(s["pricing"]["starter_price"] * 0.8)
    return "recruit agency partners with a per-client-site plan (one agency = several sites)"


def a_ads(s, sm, cfg, rng):
    if s["paid_ads_per_month"] > 0:
        return None
    s["paid_ads_per_month"] = 300.0
    return "test a small paid-search budget (300 EUR/month) to buy traffic during the sandbox"


def a_narrow(s, sm, cfg, rng):
    sc = s["scope"]
    if len(sc["platforms"]) <= 1 and sc["actions"] <= 2:
        return None
    seg = s["targets"][0] if len(s["targets"]) == 1 else best_segment(sm, cfg, s["targets"])
    plat = primary_platform(cfg, seg)
    sc["platforms"] = [plat]
    sc["actions"] = 2
    return ("narrow scope to %s + 2 actions (shorter build, higher action success rate; board Product lens: "
            "one platform, one action)" % plat)


def a_dfy(s, sm, cfg, rng):
    if s["offer"]["done_for_you"]:
        return None
    s["offer"]["done_for_you"] = True
    return "add done-for-you setup (removes setup friction; costs ~2 support hours per new customer)"


def a_guarantee(s, sm, cfg, rng):
    if s["offer"]["guarantee"]:
        return None
    s["offer"]["guarantee"] = True
    return "add a 'measurable lift in 30 days or refund' guarantee to close the proof gap"


def a_pro_style(s, sm, cfg, rng):
    if s["style"] == "cute_pro":
        return None
    gain = sum(cfg["segments"][t]["pro_style_appeal"] - cfg["segments"][t]["style_appeal"] for t in s["targets"])
    if gain < 0.1:
        return None
    s["style"] = "cute_pro"
    return "add a 'pro/sober' mascot variant: targets find the cute-only style too childish"


def a_cs(s, sm, cfg, rng):
    if s["cs_min_share"] >= 0.2:
        return None
    s["cs_min_share"] = round(s["cs_min_share"] + 0.1, 3)
    return "reserve 10pp more hours for customer success (onboarding uplift, lower churn)"


def a_eng(s, sm, cfg, rng):
    h = s["hours"]
    if h["engineering"] >= 0.45:
        return None
    _shift(h, ("seo", "geo"), "engineering", 0.3)
    h["engineering"] += 0.05
    return "move hours to engineering to raise the on-site action success rate and ship retention features"


def a_lower_price(s, sm, cfg, rng):
    p = s["pricing"]
    if p["model"] == "per_resolution":
        p["per_resolution_price"] *= 0.8
        p["platform_fee"] *= 0.8
        return "cut per-resolution price and platform fee by 20%"
    if p["starter_price"] <= 9:
        return None
    p["starter_price"] = round(p["starter_price"] * 0.8)
    if p.get("pro_price"):
        p["pro_price"] = round(p["pro_price"] * 0.8)
    return ("cut prices 20%% (%.0f%% of fitting trialists had WTP below the price)" % (sm["price_lost_share"] * 100))


def a_launch_discount(s, sm, cfg, rng):
    if s["pricing"]["launch_discount"] > 0:
        return None
    s["pricing"]["launch_discount"] = 0.3
    return "early-bird pricing: -30% for life for customers in the first 3 months"


def a_add_free(s, sm, cfg, rng):
    if s["pricing"]["free_plan"]:
        return None
    s["pricing"]["free_plan"] = True
    return "add a free plan (badge virality + later upgrades), accepting its LLM cost"


def a_focus_wtp(s, sm, cfg, rng):
    if len(s["targets"]) <= 1:
        return None
    seg = best_segment(sm, cfg, s["targets"], metric="wtp")
    s["targets"] = [seg]
    return "focus on '%s', the segment least blocked by price" % seg


def a_raise_price(s, sm, cfg, rng):
    p = s["pricing"]
    if p["model"] == "per_resolution":
        p["per_resolution_price"] *= 1.25
        p["platform_fee"] = max(19, p["platform_fee"] * 1.25)
        return "raise per-resolution pricing 25%"
    if p["starter_price"] >= 150:
        return None
    p["starter_price"] = round(p["starter_price"] * 1.25)
    if p.get("pro_price"):
        p["pro_price"] = round(p["pro_price"] * 1.25)
    return "raise prices 25% (ARPA too low for the M3 MRR bar)"


def a_overage(s, sm, cfg, rng):
    p = s["pricing"]
    if p["model"] == "per_resolution" or p["overage_per_100"] > 0:
        return None
    p["overage_per_100"] = 2.0
    return "bill overage at 2 EUR per 100 conversations above quota (heavy users pay their LLM cost)"


def a_no_free(s, sm, cfg, rng):
    if not s["pricing"]["free_plan"]:
        return None
    s["pricing"]["free_plan"] = False
    return "remove the free plan: free users cost LLM + support and cannibalise trials"


def a_annual(s, sm, cfg, rng):
    if s["pricing"]["annual_discount"] > 0:
        return None
    s["pricing"]["annual_discount"] = 0.17
    return "offer annual billing at -17% (cash upfront, no churn within the year)"


def a_cut_ads(s, sm, cfg, rng):
    if s["paid_ads_per_month"] <= 0:
        return None
    s["paid_ads_per_month"] = 0.0
    return "stop paid ads (cash burn without payback)"


def a_drop_ltd(s, sm, cfg, rng):
    if not s["ltd"]["enabled"]:
        return None
    s["ltd"]["enabled"] = False
    return "drop the lifetime deal (LLM + support load with no MRR)"


def a_add_ltd(s, sm, cfg, rng):
    if s["ltd"]["enabled"]:
        return None
    s["ltd"]["enabled"] = True
    return "run an AppSumo-style lifetime deal for cash and first reviews"


def a_quotas(s, sm, cfg, rng):
    p = s["pricing"]
    if p["model"] == "per_resolution" or p["starter_quota"] <= 300:
        return None
    p["starter_quota"] = int(p["starter_quota"] * 0.5)
    p["pro_quota"] = int(p["pro_quota"] * 0.6)
    p["free_quota"] = max(20, int(p["free_quota"] * 0.5))
    return "halve conversation quotas (heavy-tail usage was eating margin)"


def a_per_resolution(s, sm, cfg, rng):
    p = s["pricing"]
    if p["model"] == "per_resolution":
        return None
    p["model"] = "per_resolution"
    p["platform_fee"] = max(9.0, round(p["starter_price"] * 0.5))
    p["per_resolution_price"] = 0.12
    return "switch to platform fee + per-resolution pricing (revenue scales with LLM cost)"


def a_drop_pro_style(s, sm, cfg, rng):
    if s["style"] != "cute_pro":
        return None
    s["style"] = "cute"
    return "drop the pro style variant (build time)"


def a_cut_prelaunch(s, sm, cfg, rng):
    if s["prelaunch_marketing_share"] <= 0.1:
        return None
    s["prelaunch_marketing_share"] = 0.1
    return "cut pre-launch marketing to 10% of build hours to ship sooner"


PLAYBOOK = {
    "no_traffic": [a_outreach, a_focus, a_prelaunch, a_presell, a_app_store, a_launches, a_agency,
                   a_switch_segment, a_ads],
    "low_conversion": [a_focus, a_narrow, a_dfy, a_pro_style, a_guarantee, a_switch_segment, a_cs, a_eng],
    "price_too_high": [a_lower_price, a_focus_wtp, a_launch_discount, a_switch_segment, a_add_free],
    "price_too_low": [a_raise_price, a_no_free, a_overage, a_annual],
    "churn": [a_cs, a_eng, a_narrow, a_annual, a_dfy],
    "cash_burn": [a_cut_ads, a_drop_ltd, a_no_free, a_annual],
    "llm_costs": [a_overage, a_quotas, a_no_free, a_per_resolution, a_raise_price],
    "build_too_long": [a_narrow, a_drop_pro_style, a_cut_prelaunch],
}


def dominant_cause(summary):
    dc = summary["death_causes"]
    tot = sum(dc.values())
    if tot == 0:
        return None, 0.0
    cause = max(dc, key=lambda k: dc[k])
    return cause, dc[cause] / tot


def cause_evidence(cause, sm, cfg):
    v = cfg["viability"]
    if cause == "no_traffic":
        return ("median %d trials by end of run, %.0f SEO / %.0f GEO visitors per run; M3 needs %d EUR MRR"
                % (sm["trials"]["p50"], sm["visitors"]["seo"], sm["visitors"]["geo"], v["m3_min_mrr"]))
    if cause in ("low_conversion", "price_too_high"):
        return ("trial->paid %.0f%%, %.0f%% of fitting trialists priced out"
                % (sm["trial_to_paid"] * 100, sm["price_lost_share"] * 100))
    if cause == "churn":
        c = sm["churn_monthly"]
        return "monthly churn p50 %.1f%%" % ((c["p50"] if c else 0) * 100)
    if cause in ("llm_costs", "price_too_low", "cash_burn"):
        g = sm["gross_margin"]
        return ("gross margin p50 %s, LLM cost p50 %.0f EUR, cash min p10 %.0f EUR"
                % (("%.0f%%" % (g["p50"] * 100)) if g else "n/a", sm["llm_cost"]["p50"], sm["cash_min"]["p10"]))
    if cause == "build_too_long":
        return "build weeks p50 %.0f / p90 %.0f" % (sm["build_weeks"]["p50"], sm["build_weeks"]["p90"])
    return ""


def post_mortem(strategy, summary, history, rng, cfg, tried):
    """CEO decision after a failed relaunch.

    history: list of iteration records so far; history[-1] is the run just evaluated and
             carries "parent" (index of the iteration it was derived from) and "action".
    tried:   set of (strategy fingerprint, action) already applied from a given base, plus
             ("*", action) for actions that were reverted (never retried).
    Returns (new_strategy, decision dict).
    """
    ceo = cfg["ceo"]
    cur = history[-1]
    base, base_summary, base_idx = strategy, summary, len(history) - 1
    reverted = None
    pidx = cur.get("parent")
    best_idx = max(range(len(history)), key=lambda k: history[k]["kpis"]["survival"])
    best = history[best_idx]
    if pidx is not None:
        parent = history[pidx]
        if summary["survival"] < parent["kpis"]["survival"] - ceo["revert_if_drop"]:
            reverted = ("survival fell %.0f%% -> %.0f%% after '%s'; reverting to iteration %d and never retrying that move"
                        % (parent["kpis"]["survival"] * 100, summary["survival"] * 100,
                           cur.get("action") or "?", pidx + 1))
            if cur.get("action"):
                tried.add(("*", cur["action"]))
            base, base_summary, base_idx = parent["strategy"], parent["kpis"], pidx
        elif summary["survival"] < best["kpis"]["survival"] - 2 * ceo["revert_if_drop"]:
            reverted = ("survival drifted down to %.0f%% vs %.0f%% at iteration %d through small steps; "
                        "going back to that strategy" % (summary["survival"] * 100, best["kpis"]["survival"] * 100,
                                                         best_idx + 1))
            if cur.get("action"):
                tried.add(("*", cur["action"]))
            base, base_summary, base_idx = best["strategy"], best["kpis"], best_idx
    # CEO memory: per-segment evidence from the broadest run so far, and beachheads already tried
    broad = max(history, key=lambda r: len(r["strategy"]["targets"]))
    base_summary = dict(base_summary)
    base_summary["_segment_evidence"] = broad["kpis"]["segments"]
    base_summary["_tried_segments"] = set(t for r in history if len(r["strategy"]["targets"]) == 1
                                          for t in r["strategy"]["targets"])
    cause, share = dominant_cause(base_summary)
    if cause is None:
        cause, share = "low_conversion", 0.0
    fp = fingerprint(base)
    s = copy.deepcopy(base)
    change = None
    action_name = None
    # the dominant cause's playbook first, then the other observed causes, by frequency
    causes = sorted(base_summary["death_causes"].items(), key=lambda kv: -kv[1])
    order = [cause] + [c for c, n in causes if c != cause and n > 0]
    for c in order:
        for act in PLAYBOOK[c]:
            if (fp, act.__name__) in tried or ("*", act.__name__) in tried:
                continue
            cand = copy.deepcopy(base)
            msg = act(cand, base_summary, cfg, rng)
            if msg:
                s, change, action_name = cand, msg, act.__name__
                if c != cause:
                    change = "(%s playbook exhausted) %s" % (cause, change)
                break
        if change:
            break
    explore = None
    if change is None or rng.random() < ceo["exploration_prob"]:
        s, explore = mutate(s, rng, cfg, n_changes=1, return_log=True)
        if change is None:
            change, action_name = "no playbook move left; exploring", "explore"
    tried.add((fp, action_name))
    s = normalize(s, cfg)
    reason = "%.0f%% of deaths were %s (%s)" % (share * 100, cause, cause_evidence(cause, base_summary, cfg))
    decision = {
        "cause": cause,
        "cause_share": round(share, 3),
        "action": action_name,
        "change": change,
        "exploration": explore,
        "reverted": reverted,
        "base_iteration": base_idx + 1,
        "reason": reason,
    }
    s["name"] = action_name
    return s, decision


# --------------------------------------------------------------------------- search
def random_strategy(rng, cfg):
    segs = list(cfg["segments"].keys())
    r = rng.random()
    if r < 0.5:
        targets = [rng.choice(segs)]
    elif r < 0.85:
        targets = rng.sample(segs, rng.choice([2, 3]))
    else:
        targets = list(segs)
    starter = rng.choice([9, 15, 19, 25, 29, 39, 49, 59, 79, 99])
    pricing = {
        "model": "per_resolution" if rng.random() < 0.12 else "tiered",
        "free_plan": rng.random() < 0.4,
        "free_quota": rng.choice([25, 50, 100]),
        "starter_price": starter,
        "starter_quota": rng.choice([300, 500, 1000, 2000]),
        "pro_price": None if rng.random() < 0.15 else round(starter * rng.uniform(1.8, 3.5)),
        "pro_quota": rng.choice([2000, 5000, 10000]),
        "overage_per_100": rng.choice([0.0, 0.0, 1.0, 2.0, 4.0]),
        "annual_discount": rng.choice([0.0, 0.0, 0.15, 0.2]),
        "launch_discount": rng.choice([0.0, 0.0, 0.0, 0.3]),
        "agency_plan_price": None,
        "platform_fee": rng.choice([9, 19, 29, 49]),
        "per_resolution_price": rng.choice([0.08, 0.12, 0.2, 0.3]),
    }
    hours = {k: rng.random() ** 1.5 for k in HOUR_KEYS}
    for k in ("app_store", "agency", "launches", "geo"):
        if rng.random() < 0.5:
            hours[k] = 0.0
    hours["engineering"] = max(hours["engineering"], 0.1)
    plats = set(primary_platform(cfg, t) for t in targets)
    if rng.random() < 0.3:
        plats |= set(rng.sample(PLATFORMS, rng.randint(1, 3)))
    if AGENCY in targets and hours["agency"] > 0 and rng.random() < 0.6:
        pricing["agency_plan_price"] = round(starter * rng.uniform(0.6, 1.0))
    s = {
        "name": "random",
        "targets": targets,
        "pricing": pricing,
        "hours": hours,
        "cs_min_share": rng.choice([0.03, 0.05, 0.1, 0.15, 0.2]),
        "prelaunch_marketing_share": rng.choice([0.0, 0.0, 0.1, 0.2, 0.3, 0.4]),
        "paid_ads_per_month": rng.choice([0, 0, 0, 0, 150, 300, 600]),
        "scope": {"platforms": list(plats), "actions": rng.choice([1, 2, 2, 3, 4, 6])},
        "style": "cute_pro" if rng.random() < 0.3 else "cute",
        "offer": {"done_for_you": rng.random() < 0.4, "guarantee": rng.random() < 0.3,
                  "presell": rng.random() < 0.35},
        "ltd": {"enabled": rng.random() < 0.12, "price": rng.choice([49, 59, 79, 99]), "week_after_launch": rng.choice([2, 4, 8])},
        "in_run_adjust": True,
    }
    return normalize(s, cfg)


def mutate(s, rng, cfg, n_changes=None, return_log=False):
    """Random local change(s) to a strategy (used by search and CEO exploration)."""
    s = copy.deepcopy(s)
    segs = list(cfg["segments"].keys())
    log = []
    n = n_changes or rng.choice([1, 1, 2, 3])
    for _ in range(n):
        kind = rng.choice(["targets", "price", "price", "hours", "hours", "scope", "offer", "free",
                           "quota", "prelaunch", "ads", "style", "annual", "overage"])
        p = s["pricing"]
        if kind == "targets":
            t = rng.choice(segs)
            if t in s["targets"] and len(s["targets"]) > 1:
                s["targets"].remove(t)
                log.append("drop target %s" % short(t))
            elif t not in s["targets"]:
                if rng.random() < 0.5:
                    s["targets"] = [t]
                    log.append("switch target to %s" % short(t))
                else:
                    s["targets"].append(t)
                    log.append("add target %s" % short(t))
                pl = primary_platform(cfg, t)
                if pl not in s["scope"]["platforms"]:
                    s["scope"]["platforms"].append(pl)
        elif kind == "price":
            f = rng.choice([0.7, 0.8, 1.25, 1.5])
            if p["model"] == "per_resolution":
                p["per_resolution_price"] *= f
                p["platform_fee"] *= f
            else:
                p["starter_price"] *= f
                if p.get("pro_price"):
                    p["pro_price"] *= f
            log.append("prices x%.2f" % f)
        elif kind == "hours":
            keys = list(HOUR_KEYS)
            a, b = rng.sample(keys, 2)
            m = s["hours"][a] * rng.uniform(0.3, 0.8)
            s["hours"][a] -= m
            s["hours"][b] += m + 0.03
            log.append("hours %s -> %s" % (a, b))
        elif kind == "scope":
            sc = s["scope"]
            if rng.random() < 0.5:
                sc["actions"] = max(1, min(6, sc["actions"] + rng.choice([-2, -1, 1, 2])))
                log.append("actions -> %d" % sc["actions"])
            else:
                pl = rng.choice(PLATFORMS)
                if pl in sc["platforms"] and len(sc["platforms"]) > 1:
                    sc["platforms"].remove(pl)
                    log.append("drop platform %s" % pl)
                elif pl not in sc["platforms"]:
                    sc["platforms"].append(pl)
                    log.append("add platform %s" % pl)
        elif kind == "offer":
            k = rng.choice(["done_for_you", "guarantee", "presell"])
            s["offer"][k] = not s["offer"][k]
            log.append("%s=%s" % (k, s["offer"][k]))
        elif kind == "free":
            p["free_plan"] = not p["free_plan"]
            log.append("free_plan=%s" % p["free_plan"])
        elif kind == "quota":
            f = rng.choice([0.5, 2.0])
            p["starter_quota"] = int(p["starter_quota"] * f)
            p["pro_quota"] = int(p["pro_quota"] * f)
            log.append("quotas x%g" % f)
        elif kind == "prelaunch":
            s["prelaunch_marketing_share"] = rng.choice([0.0, 0.1, 0.2, 0.3, 0.4])
            log.append("prelaunch share %.1f" % s["prelaunch_marketing_share"])
        elif kind == "ads":
            s["paid_ads_per_month"] = rng.choice([0, 0, 150, 300, 600])
            log.append("ads %g/mo" % s["paid_ads_per_month"])
        elif kind == "style":
            s["style"] = "cute" if s["style"] == "cute_pro" else "cute_pro"
            log.append("style=%s" % s["style"])
        elif kind == "annual":
            p["annual_discount"] = rng.choice([0.0, 0.15, 0.2])
            log.append("annual discount %.2f" % p["annual_discount"])
        elif kind == "overage":
            p["overage_per_100"] = rng.choice([0.0, 1.0, 2.0, 4.0])
            log.append("overage %.1f/100" % p["overage_per_100"])
    s = normalize(s, cfg)
    if return_log:
        return s, "; ".join(log)
    return s
