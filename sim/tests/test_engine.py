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
    for tier in c["marketing"]["seo_competition"]["tiers"].values():
        tier.update(monthly_volume=50000, kd=5, top10_authority=5)
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
    def test_zero_demand_market_dies_at_m6(self):
        c = set_all_segments(cfg(), "trial_to_paid", 0.0)
        c["sales"]["ltd"]["units_median"] = 1
        s = strat.naive_strategy(c)
        sm, res = survival(c, s, 40)
        self.assertEqual(sm["survival"], 0.0)
        for r in res:
            self.assertFalse(r["alive"])
            if r["cause"] != "build_too_long":
                # v2: died exactly at the month-6 check (end of post-launch week 26 = index 25)
                self.assertEqual(r["death_wsl"], BASE_CFG["viability"]["m6_week"] - 1)
                self.assertEqual(r["mrr_m6"], 0.0)
                self.assertEqual(r["mrr_m12"], 0.0)
                self.assertTrue(r["m3_warning"])

    def test_m3_is_only_a_warning(self):
        """v2: a company below the old M3 bar keeps going; it gets the early-warning flag instead."""
        c = cfg()
        s = strong_strategy(c)
        s["offer"]["presell"] = False            # no presold pilots: traction starts later
        s["prelaunch_marketing_share"] = 0.0
        s = strat.normalize(s, c)
        seen_warned_survivor = False
        for i in range(120):
            r = engine.simulate(c, s, i)
            if r["death_wsl"] is not None:
                self.assertNotEqual(r["death_wsl"], c["viability"]["m3_week"] - 1)
            if r["mrr_m3"] < c["viability"]["m3_warning_mrr"] and r["mrr_m3"] > 0:
                self.assertTrue(r["m3_warning"])
            if r["alive"] and (r["mrr_m3"] < 500 or r["cum_rev_m3"] < 1000):
                seen_warned_survivor = True     # would have died under the v1 month-3 rule
        self.assertTrue(seen_warned_survivor, "some company failing the old M3 bar should still survive the year")

    def test_m6_thresholds_come_from_config(self):
        c = set_all_segments(cfg(), "trial_to_paid", 0.0)
        c["viability"]["m6_min_mrr"] = 0
        c["viability"]["m6_min_cum_revenue"] = 0
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
        """SPEC-v2: iteration 1 = the founder's vision."""
        s = strat.naive_strategy(cfg())
        self.assertEqual(len(s["targets"]), 6)
        self.assertEqual((s["pricing"]["starter_price"], s["pricing"]["pro_price"]), (29, 79))
        self.assertTrue(s["pricing"]["free_plan"])
        self.assertEqual(s["hours"]["outreach"] + s["hours"]["app_store"] + s["hours"]["agency"], 0)
        self.assertGreater(s["hours"]["social"], 0)
        self.assertGreater(s["hours"]["seo"], 0)
        self.assertGreater(s["hours"]["geo"], 0)
        self.assertEqual(s["install"], "few_clicks")
        self.assertEqual(s["style"], "cute_pro")
        self.assertTrue(strat.is_vision(s))
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


class TestV2Mechanics(unittest.TestCase):
    def test_social_channel_accounting(self):
        c = cfg()
        s = strong_strategy(c)
        s["hours"]["social"] = 0.15
        s["social"].update(cm=True, cm_cost=1200, platform_mix={"linkedin": 0.6, "x": 0.3, "shorts": 0.1})
        s = strat.normalize(s, c)
        for seed in range(6):
            r = engine.simulate(c, s, seed)
            led = r["ledger_out"]["social_cm"]
            self.assertAlmostEqual(led, r["ch_cash"]["social"], delta=0.5)
            self.assertAlmostEqual(r["social"]["cm_cost_total"], led, delta=0.5)
            if r["alive"]:
                # CM is paid every week from launch to the end of the horizon
                self.assertAlmostEqual(led, 1200 * 52 / c["simulation"]["weeks_per_month"], delta=5)
            self.assertGreater(r["ch_hours"]["social"], 0)
            expected = c["viability"]["starting_cash"] + sum(r["ledger_in"].values()) - sum(r["ledger_out"].values())
            self.assertAlmostEqual(r["cash_end"], expected, delta=0.05)
            self.assertGreaterEqual(r["social"]["followers"], 800)
        no_social = strat.normalize(dict(s, social={"cm": False, "cm_cost": 900, "platform_mix": {"linkedin": 1}},
                                         hours=dict(s["hours"], social=0.0), install="snippet"), c)
        r0 = engine.simulate(c, no_social, 0)
        self.assertEqual(r0["ledger_out"]["social_cm"], 0.0)
        self.assertEqual(r0["social"]["impressions"], 0)

    def test_cm_costs_cash_and_can_kill(self):
        c = cfg()
        c["viability"]["starting_cash"] = 1500
        s = strong_strategy(c)
        with_cm = strat.normalize(dict(s, social={"cm": True, "cm_cost": 1500, "platform_mix": {"linkedin": 1}}), c)
        a, _ = survival(c, s, 60)
        b, _ = survival(c, with_cm, 60)
        self.assertGreater(b["death_causes"]["cash_burn"], a["death_causes"]["cash_burn"])

    def test_install_effects(self):
        c = cfg()
        snip = strong_strategy(c)
        snip["install"] = "snippet"
        snip = strat.normalize(snip, c)
        few = strat.normalize(dict(snip, install="few_clicks"), c)
        a = engine.Company(c, snip, 3)
        b = engine.Company(c, few, 3)
        self.assertGreater(b.product.build_hours_needed, a.product.build_hours_needed)   # +2-4 build weeks
        self.assertLess(b.product.setup_minutes, a.product.setup_minutes)
        i = a.segs.index("Small SaaS startup team")
        self.assertGreater(b.fit_static[i], a.fit_static[i])                             # higher trial->paid
        a.new_customers_week = b.new_customers_week = 10
        a.trials_active = b.trials_active = 20
        self.assertLess(b.cs.need(), a.cs.need())                                        # fewer support hours
        sa, _ = survival(c, snip, 150)
        sb, _ = survival(c, few, 150)
        self.assertGreater(sb["trial_to_paid"], sa["trial_to_paid"])
        self.assertGreater(sb["build_weeks"]["p50"], sa["build_weeks"]["p50"])

    def _seo_strategy(self, c):
        s = strong_strategy(c)
        s["hours"].update(seo=0.4)
        return strat.normalize(s, c)

    def test_strong_authority_market_blocks_new_domain(self):
        c = cfg()
        for tier in c["marketing"]["seo_competition"]["tiers"].values():
            tier.update(top10_authority=90, kd=80)
        s = self._seo_strategy(c)
        clicks, outranked = 0.0, 0
        for i in range(20):
            r = engine.simulate(c, s, i)
            snap = r["seo"]["snap"].get(6) or r["seo"]["snap"].get(3) or {"tiers": {}}
            clicks += sum(t[2] for t in snap["tiers"].values())
            outranked += sum(1 for v in r["seo"]["first_outrank"].values() if v is not None)
        self.assertLess(clicks / 20, 5)
        self.assertEqual(outranked, 0)

    def test_weak_market_lets_a_new_domain_rank(self):
        c = cfg()
        for tier in c["marketing"]["seo_competition"]["tiers"].values():
            tier.update(top10_authority=3, kd=5)
        s = self._seo_strategy(c)
        clicks, outranked, n = 0.0, 0, 0
        for i in range(20):
            r = engine.simulate(c, s, i)
            if 6 in r["seo"]["snap"]:
                n += 1
                clicks += sum(t[2] for t in r["seo"]["snap"][6]["tiers"].values())
            outranked += 1 if r["seo"]["first_outrank"]["A"] is not None else 0
        self.assertGreater(clicks / max(1, n), 200)
        self.assertGreaterEqual(outranked, 18)

    def test_authority_grows_with_links(self):
        c = cfg()
        s = self._seo_strategy(c)
        lazy = strat.normalize(dict(s, hours=dict(s["hours"], seo=0.05, launches=0.0, geo=0.0)), c)
        a = [engine.simulate(c, s, i)["seo"]["snap"].get(6, {}).get("authority") for i in range(15)]
        b = [engine.simulate(c, lazy, i)["seo"]["snap"].get(6, {}).get("authority") for i in range(15)]
        pairs = [(x, y) for x, y in zip(a, b) if x is not None and y is not None]
        self.assertTrue(pairs)
        self.assertGreater(sum(x for x, _ in pairs), sum(y for _, y in pairs))
        for x, _ in pairs:
            self.assertTrue(0 <= x <= 100)

    def test_channel_period_shares(self):
        c = cfg()
        r = engine.simulate(c, strong_strategy(c), 1)
        total = sum(sum(v) for v in r["ch_period"].values())
        self.assertEqual(total, r["paid"])

    def test_calibrate_seo_loader(self):
        import calibrate_seo
        c = cfg()
        data = {"generated": "test", "source": "unit test",
                "keywords": [{"tier": "A", "top10_median_authority": 30}, {"tier": "B", "top10_median_authority": 50}],
                "tiers": {"A": {"total_volume": 1000, "avg_kd": 10, "count": 10},
                          "B": {"total_volume": 2000, "avg_kd": 40, "count": 4},
                          "C": {"total_volume": 3000, "avg_kd": 75, "count": 2}},
                "model_inputs": {"median_competitor_authority_top10": 45, "expected_ctr_pos_1_3": 0.2,
                                 "expected_ctr_pos_4_10": 0.05, "expected_ctr_pos_11_20": 0.01,
                                 "our_authority_month_3_estimate": 4, "our_authority_month_6_estimate": 10,
                                 "our_authority_month_12_estimate": 18,
                                 "position_share_assumptions": {
                                     "6": {"A": {"1_3": 0.1, "4_10": 0.3, "11_20": 0.2}, "B": {"1_3": 0, "4_10": 0.05, "11_20": 0.1},
                                           "C": {"1_3": 0, "4_10": 0, "11_20": 0}},
                                     "12": {"A": {"1_3": 0.3, "4_10": 0.4, "11_20": 0.1}, "B": {"1_3": 0.05, "4_10": 0.2, "11_20": 0.3},
                                            "C": {"1_3": 0, "4_10": 0, "11_20": 0.05}}}}}
        names = calibrate_seo.calibrate(data, c, log=lambda *_: None)
        sc = c["marketing"]["seo_competition"]
        self.assertEqual(names, ["A", "B", "C"])
        self.assertEqual(sc["tiers"]["A"]["monthly_volume"], 1000)
        self.assertEqual(sc["tiers"]["A"]["top10_authority"], 30)
        self.assertEqual(sc["tiers"]["C"]["top10_authority"], 45)          # fallback to overall median
        self.assertEqual(sc["ctr"]["1_3"], 0.2)
        self.assertEqual(sc["authority_anchor"]["12"], 18)
        self.assertTrue(sc["rank"]["t3"] > sc["rank"]["t10"] > sc["rank"]["t20"])
        self.assertIn("calibrate_seo", sc["_source"]["tiers"])
        engine.simulate(c, strong_strategy(c), 0)                          # calibrated config runs
