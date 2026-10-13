"""Unit tests for the Mascott simulator: python3 -m unittest discover -s sim/tests"""
import copy
import json
import os
import random
import sys
import unittest

SIM = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if SIM not in sys.path:
    sys.path.insert(0, SIM)

import engine  # noqa: E402
import run  # noqa: E402
import strategy as strat  # noqa: E402

with open(os.path.join(SIM, "config.json")) as _f:
    BASE_CFG = json.load(_f)


def cfg():
    return copy.deepcopy(BASE_CFG)


def set_all_segments(c, key, value=None, factor=None):
    for seg in c["segments"].values():
        if factor is not None:
            seg[key] = seg[key] * factor
        else:
            seg[key] = value
    return c


def great_market(c):
    """A market where everyone wants it, pays a lot, finds it and never leaves."""
    for seg in c["segments"].values():
        seg.update(visitor_to_signup=0.2, trial_to_paid=0.95, wtp_median=500, wtp_sigma=0.2,
                   style_appeal=1.0, pro_style_appeal=1.0, competition_pressure=0.0,
                   proof_sensitivity=0.0, churn_monthly=0.005, reply_rate=[0.3, 0.4], need_actions=0.0)
    c["marketing"]["seo"]["sandbox_weeks"] = [1, 2]
    c["marketing"]["seo"]["visits_per_page_mature"] = 30
    c["marketing"]["referral"]["network_launch_visitors"] = [3000, 4000]
    c["costs"]["llm_cost_per_conv"] = [0.001, 0.002, 0.003]
    # the naive plan's broad scope takes longer to build than the CEO's 20-week cap;
    # this test is about the market, so give the build all the time it needs
    c["viability"]["max_build_weeks"] = 40
    return c


def strong_strategy(c):
    """Roughly the best plan found by the broad search on the default config."""
    s = strat.naive_strategy(c)
    s["targets"] = ["Small SaaS startup team"]
    s["pricing"].update(free_plan=False, starter_price=39, pro_price=95, annual_discount=0.2)
    s["hours"] = {"engineering": 0.26, "seo": 0.11, "geo": 0.04, "outreach": 0.46, "app_store": 0.0,
                  "agency": 0.0, "launches": 0.11}
    s["scope"] = {"platforms": ["js_saas"], "actions": 2}
    s["offer"].update(done_for_you=True, guarantee=True, presell=True)
    s["style"] = "cute_pro"
    s["prelaunch_marketing_share"] = 0.3
    return strat.normalize(s, c)


def survival(c, s, n):
    res = [engine.simulate(c, s, i) for i in range(n)]
    return engine.summarize(res, c), res


class TestDeathRules(unittest.TestCase):
    def test_zero_demand_market_dies_at_m3(self):
        c = set_all_segments(cfg(), "trial_to_paid", 0.0)
        c["sales"]["ltd"]["units_median"] = 1
        s = strat.naive_strategy(c)
        sm, res = survival(c, s, 40)
        self.assertEqual(sm["survival"], 0.0)
        for r in res:
            self.assertFalse(r["alive"])
            if r["cause"] != "build_too_long":
                # died exactly at the month-3 check (end of post-launch week 13 = index 12)
                self.assertEqual(r["death_wsl"], BASE_CFG["viability"]["m3_week"] - 1)
                self.assertEqual(r["mrr_m3"], 0.0)
                self.assertEqual(r["mrr_m12"], 0.0)

    def test_m3_thresholds_come_from_config(self):
        c = set_all_segments(cfg(), "trial_to_paid", 0.0)
        c["viability"]["m3_min_mrr"] = 0
        c["viability"]["m3_min_cum_revenue"] = 0
        c["viability"]["max_build_weeks"] = 200
        s = strat.naive_strategy(c)
        s["pricing"]["free_plan"] = False
        sm, res = survival(c, s, 20)
        # no revenue at all, but the bar is 0 and cash (5,000) covers ~1.5 years of fixed costs
        self.assertEqual(sm["survival"], 1.0)
        self.assertTrue(all(r["cum_revenue"] == 0 for r in res))

    def test_cash_below_zero_kills(self):
        c = cfg()
        c["viability"]["starting_cash"] = 300
        s = strat.naive_strategy(c)
        sm, res = survival(c, s, 20)
        self.assertEqual(sm["survival"], 0.0)
        for r in res:
            self.assertFalse(r["alive"])
            self.assertLess(r["cash_end"], 0.0)

    def test_build_too_long(self):
        c = cfg()
        c["product"]["base_build_weeks"] = 60
        s = strat.naive_strategy(c)
        sm, res = survival(c, s, 10)
        self.assertEqual(sm["death_causes"]["build_too_long"], 10)

    def test_dead_company_has_no_later_mrr(self):
        c = cfg()
        s = strat.naive_strategy(c)
        for i in range(30):
            r = engine.simulate(c, s, i)
            if not r["alive"] and r["death_wsl"] is not None and r["death_wsl"] < 25:
                self.assertEqual(r["mrr_m6"], 0.0)
                self.assertEqual(r["mrr_m12"], 0.0)


class TestMarkets(unittest.TestCase):
    def test_trivially_great_market_survives(self):
        c = great_market(cfg())
        sm, _ = survival(c, strat.naive_strategy(c), 40)
        self.assertGreaterEqual(sm["survival"], 0.9)
        self.assertGreater(sm["mrr_m12"]["p50"], 5000)

    def test_naive_plan_is_input_sensitive(self):
        """The naive plan must not be hard-wired: it dies in the base market, lives in a great one."""
        base, _ = survival(cfg(), strat.naive_strategy(cfg()), 60)
        great, _ = survival(great_market(cfg()), strat.naive_strategy(cfg()), 60)
        self.assertLess(base["survival"], 0.5)
        self.assertGreater(great["survival"], base["survival"] + 0.4)

    def test_focused_plan_beats_naive(self):
        c = cfg()
        s = strat.naive_strategy(c)
        s2 = strong_strategy(c)
        a, _ = survival(c, s, 120)
        b, _ = survival(c, s2, 120)
        self.assertGreater(b["survival"], a["survival"])
        self.assertGreater(b["mrr_m3"]["p50"], a["mrr_m3"]["p50"])

    def test_realism_bands(self):
        """Outreach reply rates, LLM cost per conversation and churn stay in their stated ranges."""
        for seg in BASE_CFG["segments"].values():
            lo, hi = seg["reply_rate"]
            self.assertGreaterEqual(lo, 0.01)
            self.assertLessEqual(hi, 0.08)
            self.assertTrue(0.04 <= seg["churn_monthly"] <= 0.08)
        lo, mode, hi = BASE_CFG["costs"]["llm_cost_per_conv"]
        self.assertTrue(0.005 <= lo <= mode <= hi <= 0.03)
        # a focused plan's realised trial->paid and churn stay believable
        c = cfg()
        sm, _ = survival(c, strong_strategy(c), 150)
        self.assertTrue(0.10 <= sm["trial_to_paid"] <= 0.30, sm["trial_to_paid"])
        self.assertTrue(0.03 <= sm["churn_monthly"]["p50"] <= 0.09, sm["churn_monthly"])
        self.assertGreater(sm["gross_margin"]["p50"], 0.5)


class TestDeterminismAndAccounting(unittest.TestCase):
    def test_same_seed_same_result(self):
        c = cfg()
        s = strat.naive_strategy(c)
        s["targets"] = ["E-commerce store owner (Shopify / WooCommerce)"]
        s["hours"]["app_store"] = 0.2
        s["ltd"]["enabled"] = True
        s["offer"]["guarantee"] = True
        s["pricing"]["annual_discount"] = 0.2
        s = strat.normalize(s, c)
        for seed in (0, 7, 123):
            a = engine.simulate(c, s, seed, record=True)
            b = engine.simulate(c, s, seed, record=True)
            self.assertEqual(json.dumps(a, sort_keys=True), json.dumps(b, sort_keys=True))
        self.assertNotEqual(json.dumps(engine.simulate(c, s, 1), sort_keys=True),
                            json.dumps(engine.simulate(c, s, 2), sort_keys=True))

    def test_parallel_equals_serial(self):
        c = cfg()
        s = strat.naive_strategy(c)
        jobs = [(c, s, range(0, 30))]
        serial = run.Runner(1).evaluate(jobs)[0]
        r = run.Runner(2, chunk=7)
        try:
            par = r.evaluate(jobs)[0]
        finally:
            r.close()
        self.assertEqual(json.dumps(serial, sort_keys=True), json.dumps(par, sort_keys=True))

    def test_market_draw_is_strategy_independent(self):
        """Common random numbers: the 'world' for a seed does not depend on the strategy."""
        c = cfg()
        a = engine.Company(c, strat.naive_strategy(c), 5).md
        s2 = strat.random_strategy(random.Random(1), c)
        b = engine.Company(c, s2, 5).md
        self.assertEqual(a.__dict__, b.__dict__)

    def test_cash_accounting_balances(self):
        c = cfg()
        rng = random.Random(3)
        strategies = [strat.naive_strategy(c)] + [strat.random_strategy(rng, c) for _ in range(15)]
        for s in strategies:
            s["ltd"]["enabled"] = True
            s["offer"]["guarantee"] = True
            s["pricing"]["annual_discount"] = 0.2
            s["paid_ads_per_month"] = 200
            for seed in range(4):
                r = engine.simulate(c, s, seed)
                inflow = sum(r["ledger_in"].values())
                outflow = sum(r["ledger_out"].values())
                expected = c["viability"]["starting_cash"] + inflow - outflow
                self.assertAlmostEqual(r["cash_end"], expected, delta=0.05)
                self.assertLessEqual(r["cash_min"], r["cash_end"] + 1e-6)
                # cumulative revenue is gross billings: subscriptions + prepaid + LTD
                self.assertAlmostEqual(r["cum_revenue"], inflow, delta=0.05)

    def test_llm_cost_scales_with_cost_per_conversation(self):
        c = cfg()
        s = strat.naive_strategy(c)
        s["targets"] = ["Small SaaS startup team"]
        s["hours"]["outreach"] = 0.5
        s = strat.normalize(s, c)
        cheap = copy.deepcopy(c)
        cheap["costs"]["llm_cost_per_conv"] = [0.005, 0.005, 0.005]
        dear = copy.deepcopy(c)
        dear["costs"]["llm_cost_per_conv"] = [0.03, 0.03, 0.03]
        a = sum(engine.simulate(cheap, s, i)["llm_cost"] for i in range(20))
        b = sum(engine.simulate(dear, s, i)["llm_cost"] for i in range(20))
        self.assertGreater(b, 3 * a)


class TestStrategyAndConfig(unittest.TestCase):
    def test_every_assumption_has_a_source(self):
        def walk(node, path):
            if isinstance(node, dict):
                numeric = [k for k, v in node.items() if not k.startswith("_")
                           and isinstance(v, (int, float, list)) and not isinstance(v, bool)]
                if numeric and path not in ("simulation.quick",):
                    self.assertIn("_source", node, "block %s has numbers but no _source" % path)
                src = node.get("_source")
                for k, v in node.items():
                    if k.startswith("_"):
                        continue
                    # a nested map documented by its parent's _source entry is a value, not a block
                    if isinstance(v, dict) and (isinstance(src, str) or (isinstance(src, dict) and k in src)):
                        continue
                    walk(v, (path + "." + k) if path else k)
            elif isinstance(node, list):
                for i, v in enumerate(node):
                    if isinstance(v, dict):
                        walk(v, "%s[%d]" % (path, i))
        # launch events and segment entries are documented in their parent block's _source
        c = cfg()
        for ev in c["marketing"]["launches"]:
            ev["_source"] = "see marketing._source.launches"
        walk(c, "")

    def test_segment_names(self):
        self.assertEqual(list(BASE_CFG["segments"].keys()), [
            "Indie hacker / solo SaaS founder", "Small SaaS startup team",
            "E-commerce store owner (Shopify / WooCommerce)", "Web agency or freelancer",
            "Small business / showcase site", "Edtech, kids or consumer-app team"])

    def test_naive_plan_matches_spec(self):
        s = strat.naive_strategy(cfg())
        self.assertEqual(len(s["targets"]), 6)
        self.assertEqual((s["pricing"]["starter_price"], s["pricing"]["pro_price"]), (29, 79))
        self.assertTrue(s["pricing"]["free_plan"])
        self.assertEqual(s["hours"]["outreach"] + s["hours"]["app_store"] + s["hours"]["agency"], 0)
        self.assertEqual(len(s["scope"]["platforms"]), 4)

    def test_random_and_mutated_strategies_are_valid(self):
        c = cfg()
        rng = random.Random(11)
        for _ in range(40):
            s = strat.random_strategy(rng, c)
            m = strat.mutate(s, rng, c)
            for x in (s, m):
                self.assertAlmostEqual(sum(x["hours"].values()), 1.0, delta=0.01)
                self.assertTrue(x["targets"])
                self.assertTrue(set(x["scope"]["platforms"]) <= set(engine.PLATFORMS))
                engine.simulate(c, x, 0)   # runs without error

    def test_post_mortem_changes_strategy_with_reason(self):
        c = cfg()
        s = strat.naive_strategy(c)
        sm, _ = survival(c, s, 40)
        history = [{"iteration": 1, "strategy": s, "kpis": sm, "parent": None, "action": None}]
        new, dec = strat.post_mortem(s, sm, history, random.Random(0), c, set())
        self.assertNotEqual(strat.fingerprint(new), strat.fingerprint(s))
        self.assertIn(dec["cause"], engine.CAUSES)
        self.assertTrue(dec["reason"])
        self.assertTrue(dec["change"])

    def test_post_mortem_reverts_harmful_change(self):
        c = cfg()
        good = strong_strategy(c)
        bad = copy.deepcopy(good)
        bad["pricing"]["starter_price"] = 400
        bad["pricing"]["pro_price"] = 900
        gsm, _ = survival(c, good, 60)
        bsm, _ = survival(c, bad, 60)
        self.assertGreater(gsm["survival"], bsm["survival"] + c["ceo"]["revert_if_drop"])
        history = [{"iteration": 1, "strategy": good, "kpis": gsm, "parent": None, "action": None},
                   {"iteration": 2, "strategy": bad, "kpis": bsm, "parent": 0, "action": "a_raise_price"}]
        tried = set()
        new, dec = strat.post_mortem(bad, bsm, history, random.Random(0), c, tried)
        self.assertTrue(dec["reverted"])
        self.assertEqual(dec["base_iteration"], 1)
        self.assertIn(("*", "a_raise_price"), tried)
        self.assertLess(new["pricing"]["starter_price"], 400)

    def test_scale_config_wildcards(self):
        c = cfg()
        up = run.scale_config(c, "segments.*.reply_rate", 1.3)
        for name, seg in c["segments"].items():
            self.assertAlmostEqual(up["segments"][name]["reply_rate"][1], seg["reply_rate"][1] * 1.3)
        capped = run.scale_config(c, "segments.*.style_appeal", 2.0)
        self.assertTrue(all(s["style_appeal"] <= 0.99 for s in capped["segments"].values()))
        lv = run.scale_config(c, "marketing.launches.*.visitors_median", 0.5)
        self.assertEqual(lv["marketing"]["launches"][0]["visitors_median"],
                         c["marketing"]["launches"][0]["visitors_median"] * 0.5)
        self.assertEqual(c, BASE_CFG)  # original untouched


if __name__ == "__main__":
    unittest.main()
