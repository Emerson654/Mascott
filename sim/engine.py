"""Mascott company simulator: company, departments and market model.

Standard library only. One call to ``simulate(cfg, strategy, seed)`` runs one company
week by week (pre-launch build, then up to 52 weeks on the market) and returns a small
dict of KPIs. Every market/cost number comes from ``cfg`` (sim/config.json); the engine
holds no market constants of its own.

Randomness: two streams per seed.
  * ``market`` stream: the "true" state of the world for this seed (per-segment
    conversion, WTP, reply rates, SEO sandbox length, LLM cost ...). It is drawn first
    and in a fixed order, so every strategy faces the same worlds for the same seed
    (common random numbers -> fair strategy comparisons).
  * ``dyn`` stream: week-to-week noise (who replies, who converts, incidents ...).
"""
import math
import random

CHANNELS = ("seo", "geo", "launch", "ads", "badge", "referral", "outreach", "app_store",
            "agency", "free_plan")
WEB_CHANNELS = ("seo", "geo", "launch", "ads", "badge", "referral")
PLATFORMS = ("shopify", "wordpress", "webflow_wix", "js_saas")
HOUR_KEYS = ("engineering", "seo", "geo", "outreach", "app_store", "agency", "launches")
CAUSES = ("no_traffic", "low_conversion", "price_too_high", "price_too_low", "churn",
          "cash_burn", "llm_costs", "build_too_long")
TS_KEYS = ("mrr", "cash", "customers", "free_users", "trials", "vis_seo", "vis_geo",
           "vis_launch", "vis_ads", "vis_badge", "vis_referral", "outreach_contacts",
           "app_installs", "agency_sites")

SQRT2 = math.sqrt(2.0)


# --------------------------------------------------------------------------- helpers
def poisson(rng, lam):
    if lam <= 0.0:
        return 0
    if lam < 30.0:
        limit = math.exp(-lam)
        k = 0
        p = rng.random()
        while p > limit:
            k += 1
            p *= rng.random()
        return k
    x = int(round(rng.gauss(lam, math.sqrt(lam))))
    return x if x > 0 else 0


def binomial(rng, n, p):
    if n <= 0 or p <= 0.0:
        return 0
    if p >= 1.0:
        return n
    if n < 40:
        r = rng.random
        return sum(1 for _ in range(n) if r() < p)
    mean = n * p
    var = mean * (1.0 - p)
    if var < 9.0:
        return min(n, poisson(rng, mean))
    x = int(round(rng.gauss(mean, math.sqrt(var))))
    return min(n, max(0, x))


def norm_cdf(z):
    return 0.5 * (1.0 + math.erf(z / SQRT2))


def lognormal_capped_mean(median, sigma, cap):
    """E[min(X, cap)] for X ~ lognormal(ln median, sigma)."""
    mu = math.log(max(median, 1e-9))
    mean = math.exp(mu + sigma * sigma / 2.0)
    if cap is None or cap <= 0:
        return mean if cap is None else 0.0
    lc = math.log(cap)
    return (mean * norm_cdf((lc - mu - sigma * sigma) / sigma)
            + cap * (1.0 - norm_cdf((lc - mu) / sigma)))


def clamp(x, lo, hi):
    return lo if x < lo else hi if x > hi else x


def percentile(sorted_vals, q):
    if not sorted_vals:
        return 0.0
    if len(sorted_vals) == 1:
        return float(sorted_vals[0])
    pos = (len(sorted_vals) - 1) * q
    lo = int(math.floor(pos))
    hi = min(lo + 1, len(sorted_vals) - 1)
    frac = pos - lo
    return float(sorted_vals[lo] * (1 - frac) + sorted_vals[hi] * frac)


def pcts(vals, nd=1):
    s = sorted(vals)
    return {"p10": round(percentile(s, 0.1), nd), "p50": round(percentile(s, 0.5), nd),
            "p90": round(percentile(s, 0.9), nd)}


# --------------------------------------------------------------------------- market
class MarketDraw:
    """The state of the world for one seed (independent of strategy)."""

    def __init__(self, cfg, rng):
        u = cfg["market"]["uncertainty"]
        self.seg_names = list(cfg["segments"].keys())
        luck = rng.lognormvariate(0.0, u["market_luck_sigma"])
        self.luck = luck
        self.conv_mult, self.wtp_mult, self.churn_mult, self.usage_mult = [], [], [], []
        self.reply_rate, self.cpc_mult = [], []
        for name in self.seg_names:
            seg = cfg["segments"][name]
            self.conv_mult.append(luck * rng.lognormvariate(0.0, u["segment_conv_sigma"]))
            self.wtp_mult.append(rng.lognormvariate(0.0, u["wtp_sigma"]))
            self.churn_mult.append(rng.lognormvariate(0.0, u["churn_sigma"]))
            self.usage_mult.append(rng.lognormvariate(0.0, u["usage_sigma"]))
            lo, hi = seg["reply_rate"]
            self.reply_rate.append(rng.uniform(lo, hi))
            self.cpc_mult.append(rng.lognormvariate(0.0, u["cpc_sigma"]))
        seo = cfg["marketing"]["seo"]
        self.sandbox_weeks = rng.uniform(*seo["sandbox_weeks"])
        self.seo_yield = rng.lognormvariate(0.0, seo["yield_sigma"])
        self.geo_yield = rng.lognormvariate(0.0, cfg["marketing"]["geo"]["yield_sigma"])
        lo, mode, hi = cfg["costs"]["llm_cost_per_conv"]
        self.llm_cpc = rng.triangular(lo, hi, mode)
        self.build_overrun = rng.lognormvariate(0.0, cfg["product"]["build_overrun_sigma"])
        app = cfg["sales"]["app_store"]
        self.app_yield = rng.lognormvariate(0.0, app["yield_sigma"])
        self.app_review_weeks = rng.uniform(*app["review_weeks"])
        self.agency_rate = rng.uniform(*cfg["sales"]["agency"]["partner_signup_rate"])
        ltd = cfg["sales"]["ltd"]
        self.ltd_units = rng.lognormvariate(math.log(ltd["units_median"]), ltd["units_sigma"])
        ref = cfg["marketing"]["referral"]
        self.network_visitors = rng.uniform(*ref["network_launch_visitors"])
        # launch outcomes are part of the world too
        self.launch_visitors = []
        for ev in cfg["marketing"]["launches"]:
            if rng.random() < ev["success_prob"]:
                v = rng.lognormvariate(math.log(ev["visitors_median"]), ev["visitors_sigma"])
            else:
                v = ev["fail_visitors"] * rng.lognormvariate(0.0, 0.4)
            self.launch_visitors.append(v)


# --------------------------------------------------------------------------- company
class Company:
    """Shared state. Departments read/write it; the weekly loop lives in ``run``."""

    def __init__(self, cfg, strategy, seed, record=False):
        self.cfg = cfg
        self.s = strategy
        self.record = record
        base = cfg["simulation"]["base_seed"]
        self.md = MarketDraw(cfg, random.Random("market-%d-%d" % (base, seed)))
        self.rng = random.Random("dyn-%d-%d" % (base, seed))
        self.seed = seed
        sim = cfg["simulation"]
        self.wpm = sim["weeks_per_month"]
        self.horizon = max(sim["horizon_weeks_after_launch"], sim["min_horizon_weeks"])
        self.trial_weeks = sim["trial_weeks"]
        self.segs = list(cfg["segments"].keys())
        self.S = [cfg["segments"][n] for n in self.segs]
        self.nseg = len(self.segs)
        targets = [t for t in strategy["targets"] if t in cfg["segments"]]
        self.targeted = [n in targets for n in self.segs]
        self.n_targets = max(1, sum(self.targeted))

        team = cfg["team"]
        self.avail_hours = team["hours_per_week"] * (1.0 - team["admin_overhead_share"])

        # ------------- state
        self.week = 0                 # calendar week since start of build
        self.launched = False
        self.launch_week = None
        self.wsl = -1                 # weeks since launch (index of post-launch week)
        self.cash = cfg["viability"]["starting_cash"]
        self.cash_min = self.cash
        self.alive = True
        self.cause = None
        self.death_wsl = None
        self.ledger_in = {"subscriptions": 0.0, "prepaid": 0.0, "ltd": 0.0}
        self.ledger_out = {"llm": 0.0, "payment_fees": 0.0, "hosting": 0.0, "tools": 0.0,
                           "admin": 0.0, "ads": 0.0, "salary": 0.0, "refunds": 0.0}
        self.cum_revenue = 0.0
        self.cum_revenue_m3 = 0.0

        # customers: list of lists
        # [seg, plan, mrr, conv_billed, channel, prepaid_until_wsl, wsl_acq, capped, appstore,
        #  refund_checked, billing_on]   (prepaid = annual plan or presold pilot, paid upfront)
        self.customers = []
        self.mrr = 0.0
        self.mrr_monthly_stripe = 0.0
        self.n_monthly_stripe = 0
        self.mrr_appstore = 0.0
        self.conv_paid = 0.0
        self.free = [0] * self.nseg
        self.trial_queue = {}        # resolve_week -> list of (seg, ch, n, qual)
        self.trials_active = 0
        self.new_customers_week = 0
        self.happy = 0.0
        self.reviews = 0.0
        self.ltd_active = 0
        self.ltd_payouts = {}        # week -> cash

        # ------------- diagnostics
        self.d_trials = 0
        self.d_fit_lost = 0
        self.d_price_lost = 0
        self.d_fit_pass = 0
        self.d_paid = 0
        self.d_churned = 0
        self.d_cust_months = 0.0
        self.d_signups = 0
        self.seg_stats = [[0, 0, 0, 0, 0.0] for _ in range(self.nseg)]  # trials, fit_pass, price_lost, paid, mrr_end
        self.ch_paid = {c: 0 for c in CHANNELS}
        self.ch_hours = {c: 0.0 for c in CHANNELS}
        self.ch_cash = {c: 0.0 for c in CHANNELS}
        self.vis_total = {c: 0.0 for c in WEB_CHANNELS}
        self.in_run_adjustments = []
        self.mrr_m = {}
        self.cust_m = {}
        self.ts = {k: [] for k in TS_KEYS} if record else None
        self._wk = {}

        self.ceo = CEO(self)
        self.product = Product(self)
        self.marketing = Marketing(self)
        self.sales = Sales(self)
        self.cs = CustomerSuccess(self)
        self.finance = Finance(self)
        self._precompute_fit()

    # ---------------------------------------------------------------- fit model
    def _precompute_fit(self):
        cfg, s = self.cfg, self.s
        mk = cfg["marketing"]
        pr = cfg["product"]
        csc = cfg["customer_success"]
        m = cfg["market"]
        offer = s["offer"]
        plats = set(s["scope"]["platforms"])
        n_act = s["scope"]["actions"]
        if self.n_targets == 1:
            focus = 1.0 + mk["focus_conv_bonus"]
        else:
            focus = 1.0 / (1.0 + mk["dilution_per_extra_segment"] * (self.n_targets - 1))
        setup = self.product.setup_minutes
        friction = 0.0 if offer.get("done_for_you") else pr["setup_friction_per_10min"] * setup / 10.0
        self.fit_static = []
        self.proof_floor = []
        self.need_actions = []
        self.churn_static = []
        for i, seg in enumerate(self.S):
            appeal = seg["style_appeal"]
            if s.get("style") == "cute_pro":
                appeal = max(appeal, seg["pro_style_appeal"])
            plat_fit = 1.0 if plats.intersection(seg["platforms"]) else pr["unsupported_platform_fit"]
            # actions: segment that needs actions but product has fewer action types
            act_cov = min(1.0, n_act / 3.0)
            act_fit = 1.0 - seg["need_actions"] * (1.0 - act_cov) * 0.5
            comp = 1.0 - seg["competition_pressure"] * m["competition_conv_effect"]
            pos = focus if self.targeted[i] else mk["non_target_conv_mult"]
            f = (seg["trial_to_paid"] * self.md.conv_mult[i] * appeal * plat_fit * act_fit
                 * comp * pos * max(0.3, 1.0 - friction))
            if offer.get("done_for_you"):
                f *= csc["dfy_conv_mult"]
            self.fit_static.append(f)
            ps = seg["proof_sensitivity"]
            floor = 1.0 - ps
            if offer.get("guarantee"):
                floor = floor + (1.0 - floor) * csc["guarantee_trust_boost"]
            self.proof_floor.append(floor)
            self.need_actions.append(seg["need_actions"] * (1.0 if plat_fit == 1.0 else 0.3))
            ch = (seg["churn_monthly"] * self.md.churn_mult[i]
                  * (1.0 + seg["competition_pressure"] * m["competition_churn_effect"]))
            if offer.get("done_for_you"):
                ch *= csc["dfy_churn_mult"]
            self.churn_static.append(ch)

    def fit_dynamic(self, i):
        m = self.cfg["market"]
        pr = self.cfg["product"]
        floor = self.proof_floor[i]
        proof = floor + (1.0 - floor) * (1.0 - math.exp(-(self.happy + 2.0 * self.reviews) / m["proof_k"]))
        act = 1.0 - self.need_actions[i] * (1.0 - self.product.asr) * pr["action_fail_conv_penalty"]
        feat = 1.0 + pr["feature_conv_max_uplift"] * self.product.feature_level
        inc = 0.85 if self.product.incident_month else 1.0
        return proof * act * feat * self.cs.onboarding_mult * inc

    # ---------------------------------------------------------------- pricing
    def choose_plan(self, i, ch, rng):
        """Sample one prospect's WTP and usage; return (plan, mrr, conv_billed, capped) or None."""
        seg = self.S[i]
        p = self.s["pricing"]
        pb = self.cfg["pricing_behaviour"]
        wtp = math.exp(math.log(seg["wtp_median"] * self.md.wtp_mult[i]) + seg["wtp_sigma"] * rng.gauss(0, 1))
        conv = math.exp(math.log(seg["conv_per_month_median"] * self.md.usage_mult[i])
                        + seg["conv_per_month_sigma"] * rng.gauss(0, 1))
        disc = 1.0
        if self.wsl < 13 and p.get("launch_discount", 0) > 0:
            disc = 1.0 - p["launch_discount"]
        if p.get("model") == "per_resolution":
            bill = (p["platform_fee"] + conv * pb["resolution_rate"] * p["per_resolution_price"]) * disc
            if bill <= wtp:
                return ("usage", bill, conv, False)
            return None
        if ch == "agency" and p.get("agency_plan_price"):
            price = p["agency_plan_price"] * disc
            if price <= wtp:
                quota = p["starter_quota"]
                capped = conv > quota
                return ("agency", price, min(conv, quota), capped)
            return None
        sp, pp = p["starter_price"] * disc, p.get("pro_price")
        pp = pp * disc if pp else None
        needs_pro = rng.random() < seg["pro_need"]
        plan = None
        if needs_pro and pp and wtp >= pp:
            plan = "pro"
        elif wtp >= sp and (not needs_pro or not pp or rng.random() < pb["pro_compromise_starter"]):
            plan = "starter"
        if plan is None:
            return None
        if plan == "starter" and conv > p["starter_quota"] and pp and wtp * pb["overage_tolerance"] >= pp \
                and conv <= p["pro_quota"] and rng.random() < pb["starter_upgrade_if_over_quota"]:
            plan = "pro"
        price = sp if plan == "starter" else pp
        quota = p["starter_quota"] if plan == "starter" else p["pro_quota"]
        capped = False
        billed = conv
        if conv > quota:
            ov = p.get("overage_per_100", 0.0)
            if ov > 0:
                extra = (conv - quota) / 100.0 * ov
                if price + extra <= max(wtp * pb["overage_tolerance"], price * 1.25):
                    price += extra
                else:
                    billed, capped = quota, True
            else:
                billed, capped = quota, True
        return (plan, price, billed, capped)

    def add_customer(self, i, ch, plan_tuple, prepay_weeks=0):
        plan, price, billed, capped = plan_tuple
        p = self.s["pricing"]
        pb = self.cfg["pricing_behaviour"]
        ad = p.get("annual_discount", 0.0)
        if (prepay_weeks == 0 and ad > 0 and plan != "usage"
                and self.rng.random() < pb["annual_uptake_per_10pct_discount"] * ad * 10):
            prepay_weeks = 52
            price *= (1.0 - ad)
        appstore = ch == "app_store"
        wsl = max(0, self.wsl)
        c = [i, plan, price, billed, ch, wsl + prepay_weeks if prepay_weeks else -1, wsl, capped,
             appstore, False, prepay_weeks == 0]
        self.customers.append(c)
        self.mrr += price
        self.conv_paid += billed
        if prepay_weeks:
            cash = price * prepay_weeks / self.wpm
            costs = self.cfg["costs"]
            fee = cash * (costs["app_store_rev_share"] if appstore else costs["stripe_pct"]) \
                + (0 if appstore else costs["stripe_fixed"])
            self.cash += cash - fee
            self.ledger_in["prepaid"] += cash
            self.ledger_out["payment_fees"] += fee
            self.cum_revenue += cash
        else:
            self._billing_on(c)
        self.d_paid += 1
        self.seg_stats[i][3] += 1
        self.ch_paid[ch] += 1
        self.new_customers_week += 1

    def _billing_on(self, c):
        c[10] = True
        if c[8]:
            self.mrr_appstore += c[2]
        else:
            self.mrr_monthly_stripe += c[2]
            self.n_monthly_stripe += 1

    def remove_customer(self, idx):
        c = self.customers[idx]
        self.mrr -= c[2]
        self.conv_paid -= c[3]
        if c[10]:
            if c[8]:
                self.mrr_appstore -= c[2]
            else:
                self.mrr_monthly_stripe -= c[2]
                self.n_monthly_stripe -= 1
        last = self.customers.pop()
        if idx < len(self.customers):
            self.customers[idx] = last
        self.d_churned += 1

    # ---------------------------------------------------------------- funnel
    def enqueue_trials(self, i, ch, n, qual=1.0):
        if n <= 0:
            return
        w = self.week + self.trial_weeks
        self.trial_queue.setdefault(w, []).append((i, ch, n, qual))
        self.trials_active += n
        self.d_trials += n
        self.seg_stats[i][0] += n
        self._wk["trials"] = self._wk.get("trials", 0) + n

    def web_signups(self, i, ch, visitors, mult):
        seg = self.S[i]
        lam = visitors * seg["visitor_to_signup"] * mult
        n = poisson(self.rng, lam)
        if n <= 0:
            return
        self.d_signups += n
        if self.s["pricing"].get("free_plan"):
            nf = binomial(self.rng, n, self.cfg["pricing_behaviour"]["free_direct_share"])
            self.free[i] += nf
            n -= nf
        self.enqueue_trials(i, ch, n)

    def resolve_trials(self):
        entries = self.trial_queue.pop(self.week, None)
        if not entries:
            return
        rng = self.rng
        free_plan = self.s["pricing"].get("free_plan")
        pb = self.cfg["pricing_behaviour"]
        ch_q = {"outreach": self.cfg["sales"]["outreach"]["trial_quality_mult"],
                "agency": self.cfg["sales"]["agency"]["client_quality_mult"],
                "geo": 1.15, "launch": 0.8, "ads": 0.85, "badge": 0.9}
        for (i, ch, n, qual) in entries:
            self.trials_active -= n
            p_fit = clamp(self.fit_static[i] * self.fit_dynamic(i) * ch_q.get(ch, 1.0) * qual, 0.0, 0.95)
            n_fit = binomial(rng, n, p_fit)
            lost_fit = n - n_fit
            self.d_fit_lost += lost_fit
            self.seg_stats[i][1] += n_fit
            self.d_fit_pass += n_fit
            lost_price = 0
            for _ in range(n_fit):
                plan = self.choose_plan(i, ch, rng)
                if plan is None:
                    lost_price += 1
                else:
                    self.add_customer(i, ch, plan)
            self.d_price_lost += lost_price
            self.seg_stats[i][2] += lost_price
            if free_plan:
                self.free[i] += binomial(rng, lost_fit + lost_price, pb["free_after_trial"])

    def free_dynamics(self, month_tick):
        if not self.s["pricing"].get("free_plan"):
            return
        pb = self.cfg["pricing_behaviour"]
        rng = self.rng
        for i in range(self.nseg):
            n = self.free[i]
            if n <= 0:
                continue
            active = n * pb["free_active_share"]
            # upgrade hazard scales with how well the product fits this segment (same multipliers as trials)
            rel = self.fit_static[i] * self.fit_dynamic(i) / max(1e-9, self.S[i]["trial_to_paid"])
            hz = pb["free_upgrade_hazard"] * min(1.5, rel)
            k = poisson(rng, active * hz)
            k = min(k, n)
            for _ in range(k):
                plan = self.choose_plan(i, "free_plan", rng)
                if plan is not None:
                    self.free[i] -= 1
                    self.add_customer(i, "free_plan", plan)
            if month_tick:
                self.free[i] -= binomial(rng, self.free[i], pb["free_monthly_abandon"])

    def total_free(self):
        return sum(self.free)

    # ---------------------------------------------------------------- monthly
    def monthly_churn(self):
        csc = self.cfg["customer_success"]
        pr = self.cfg["product"]
        rng = self.rng
        inc = pr["incident_churn_mult"] if self.product.incident_month else 1.0
        sup = 1.0 + csc["shortfall_churn_mult"] * (1.0 - min(1.0, self.cs.month_ratio))
        feat = 1.0 - pr["feature_churn_max_reduction"] * self.product.feature_level
        base_mult = inc * sup * feat
        asr = self.product.asr
        refund_rate = csc["guarantee_refund_rate"] if self.s["offer"].get("guarantee") else 0.0
        self.d_cust_months += len(self.customers)
        idx = len(self.customers) - 1
        while idx >= 0:
            c = self.customers[idx]
            i = c[0]
            if not c[10] and self.wsl >= c[5]:
                self._billing_on(c)          # prepaid period over: back to monthly billing
            if refund_rate > 0 and not c[9]:
                c[9] = True
                if rng.random() < refund_rate:
                    amt = c[2]               # 'the month is refunded'
                    self.cash -= amt
                    self.ledger_out["refunds"] += amt
                    self.remove_customer(idx)
                    idx -= 1
                    continue
            tenure = self.wsl - c[6]
            if self.wsl < c[5]:              # prepaid: cannot churn before the term ends
                idx -= 1
                continue
            p = self.churn_static[i] * base_mult
            p *= 1.0 + self.need_actions[i] * (1.0 - asr) * pr["action_fail_churn_penalty"]
            if tenure < 9:
                p *= csc["early_tenure_churn_mult"]
            if c[7]:
                p *= csc["capped_usage_churn_mult"]
            if c[4] == "outreach":
                p *= csc["outreach_churn_mult"]
            if rng.random() < min(0.9, p):
                self.remove_customer(idx)
            idx -= 1
        # happy customers = paying customers with >= 1 month tenure (proof / case studies)
        self.happy = sum(1 for c in self.customers if self.wsl - c[6] >= 4)

    # ---------------------------------------------------------------- death
    def die(self, kind):
        self.alive = False
        self.death_wsl = self.wsl
        self.cause = self.diagnose(kind)

    def diagnose(self, kind):
        d = self.cfg["ceo"]["diagnosis"]
        if kind == "build":
            return "build_too_long"
        if kind == "cash":
            if not self.launched:
                return "build_too_long"
            out = sum(self.ledger_out.values())
            if out > 0 and self.ledger_out["llm"] / out > d["llm_cost_share_trigger"]:
                return "llm_costs"
            gross = self.cum_revenue - self.ledger_out["llm"] - self.ledger_out["payment_fees"]
            if self.cum_revenue > 0 and gross < 0:
                return "price_too_low"
            return "cash_burn"
        # m3 rule
        p = self.s["pricing"]
        if p.get("model") == "per_resolution":
            list_arpa = p["platform_fee"] + 20.0
        else:
            list_arpa = 0.7 * p["starter_price"] + 0.3 * (p.get("pro_price") or p["starter_price"])
        need = self.cfg["viability"]["m3_min_mrr"]
        resolved = max(0, self.d_trials - self.trials_active)
        if resolved * d["benchmark_trial_to_paid"] * list_arpa < need:
            return "no_traffic"
        conv = self.d_paid / max(1, resolved)
        if conv < d["benchmark_trial_to_paid"] * 0.75:
            if self.d_price_lost > d["price_lost_share_trigger"] * max(1, self.d_fit_pass):
                return "price_too_high"
            return "low_conversion"
        if self.d_paid > 0 and self.d_churned >= d["churn_share_trigger"] * self.d_paid:
            return "churn"
        n = len(self.customers)
        if n > 0 and self.mrr / n < d["low_arpa_ratio"] * list_arpa:
            return "price_too_low"
        # enough trials, fine conversion/churn/ARPA, still short: traction came too late for the
        # M3 MRR / cumulative-revenue bar -> the fix is earlier demand (presell, outreach, launches)
        return "no_traffic"

    # ---------------------------------------------------------------- main loop
    def run(self):
        cfg = self.cfg
        via = cfg["viability"]
        m3 = via["m3_week"]
        max_build = via["max_build_weeks"]
        rng = self.rng
        while True:
            self._wk = {}
            hours = self.ceo.allocate()
            if not self.launched:
                self.product.build_week(hours["engineering"])
                self.marketing.content_week(hours)
                self.sales.prelaunch_week(hours)
                self.finance.week()
                if self.cash < 0:
                    self.die("cash")
                    break
                self.week += 1
                if self.product.ready():
                    self.launched = True
                    self.launch_week = self.week
                    self.sales.on_launch()
                elif self.week >= max_build:
                    self.die("build")
                    break
                continue
            self.wsl = self.week - self.launch_week
            month_tick = int((self.wsl + 1) / self.wpm) > int(self.wsl / self.wpm)
            self.new_customers_week = 0
            self.product.live_week(hours["engineering"])
            self.marketing.content_week(hours)
            vis = self.marketing.visitors()
            self.sales.live_week(hours)
            self.resolve_trials()
            self.free_dynamics(month_tick)
            self.cs.week(hours["cs"])
            if month_tick:
                self.monthly_churn()
                self.product.incident_month = False
                self.cs.month_reset()
                self.ceo.monthly_review()
            self.finance.week()
            if self.record:
                self._record(vis)
            if self.cash < 0:
                self.die("cash")
                break
            if self.wsl == m3 - 1:
                self.cum_revenue_m3 = self.cum_revenue
                self.mrr_m[3] = self.mrr
                self.cust_m[3] = len(self.customers)
                if self.mrr < via["m3_min_mrr"] or self.cum_revenue < via["m3_min_cum_revenue"]:
                    self.die("m3")
                    break
            if self.wsl == 25:
                self.mrr_m[6] = self.mrr
                self.cust_m[6] = len(self.customers)
            self.week += 1
            if self.wsl >= self.horizon - 1:
                self.mrr_m[12] = self.mrr
                self.cust_m[12] = len(self.customers)
                break
        if self.record:
            self._pad_record()
        return self.result()

    def _record(self, vis):
        ts = self.ts
        ts["mrr"].append(round(self.mrr, 1))
        ts["cash"].append(round(self.cash, 1))
        ts["customers"].append(len(self.customers))
        ts["free_users"].append(self.total_free())
        ts["trials"].append(self._wk.get("trials", 0))
        for k in WEB_CHANNELS:
            ts["vis_" + k].append(round(vis.get(k, 0.0), 1))
        ts["outreach_contacts"].append(round(self._wk.get("contacts", 0), 1))
        ts["app_installs"].append(self._wk.get("installs", 0))
        ts["agency_sites"].append(self._wk.get("agency_sites", 0))

    def _pad_record(self):
        # weeks after death (or never launched): company closed, cash frozen
        n = len(self.ts["mrr"])
        for _ in range(n, self.horizon):
            for k in TS_KEYS:
                self.ts[k].append(round(self.cash, 1) if k == "cash" else 0)

    def result(self):
        for i in range(self.nseg):
            self.seg_stats[i][4] = 0.0
        for c in self.customers:
            self.seg_stats[c[0]][4] += c[2]
        # milestones after death stay at 0 (the company is closed)
        for k in (3, 6, 12):
            self.mrr_m.setdefault(k, 0.0)
            self.cust_m.setdefault(k, 0)
        rev = self.cum_revenue
        direct = self.ledger_out["llm"] + self.ledger_out["payment_fees"] + self.ledger_out["refunds"]
        months = max(1.0, (self.wsl + 1) / self.wpm) if self.launched else 1.0
        avg_cust = self.d_cust_months / max(1.0, months)
        r = {
            "seed": self.seed,
            "alive": self.alive,
            "cause": self.cause,
            "death_wsl": self.death_wsl,
            "build_weeks": self.launch_week if self.launched else self.week,
            "mrr_m3": round(self.mrr_m.get(3, 0.0), 2),
            "mrr_m6": round(self.mrr_m.get(6, 0.0), 2),
            "mrr_m12": round(self.mrr_m.get(12, 0.0), 2),
            "cust_m3": self.cust_m.get(3, 0),
            "cust_m12": self.cust_m.get(12, 0),
            "cum_rev_m3": round(self.cum_revenue_m3, 2),
            "cum_revenue": round(rev, 2),
            "cash_min": round(self.cash_min, 2),
            "cash_end": round(self.cash, 2),
            "gross_margin": round((rev - direct) / rev, 4) if rev > 0 else None,
            "churn_monthly": round(self.d_churned / avg_cust / months, 4) if avg_cust > 0 and self.d_cust_months > 0 else None,
            "llm_cost": round(self.ledger_out["llm"], 2),
            "trials": self.d_trials,
            "paid": self.d_paid,
            "fit_pass": self.d_fit_pass,
            "price_lost": self.d_price_lost,
            "churned": self.d_churned,
            "free_users": self.total_free(),
            "asr": round(self.product.asr, 3),
            "seg": [list(x) for x in self.seg_stats],
            "ch_paid": dict(self.ch_paid),
            "ch_hours": {k: round(v, 1) for k, v in self.ch_hours.items()},
            "ch_cash": {k: round(v, 1) for k, v in self.ch_cash.items()},
            "vis": {k: round(v, 1) for k, v in self.vis_total.items()},
            "ledger_in": {k: round(v, 2) for k, v in self.ledger_in.items()},
            "ledger_out": {k: round(v, 2) for k, v in self.ledger_out.items()},
            "adjusted": list(self.in_run_adjustments),
        }
        if self.record:
            r["ts"] = self.ts
        return r


# --------------------------------------------------------------------------- departments
class CEO:
    """Holds the strategy, allocates weekly hours, monthly in-run review."""

    def __init__(self, co):
        self.co = co
        h = dict(co.s["hours"])
        for k in HOUR_KEYS:
            h.setdefault(k, 0.0)
        tot = sum(h[k] for k in HOUR_KEYS) or 1.0
        self.shares = {k: h[k] / tot for k in HOUR_KEYS}
        self.cs_min = co.s.get("cs_min_share", 0.05)
        self.adjusted_traffic = False

    def allocate(self):
        co = self.co
        avail = co.avail_hours
        out = {k: 0.0 for k in HOUR_KEYS}
        out["cs"] = 0.0
        if not co.launched:
            pm = co.s.get("prelaunch_marketing_share", 0.0)
            mk_keys = ("seo", "geo", "outreach", "launches", "app_store", "agency")
            tot = sum(self.shares[k] for k in mk_keys)
            if tot <= 0:
                pm = 0.0
            for k in mk_keys:
                out[k] = avail * pm * (self.shares[k] / tot if tot > 0 else 0.0)
            out["engineering"] = avail * (1.0 - pm)
            return out
        ads_h = co.cfg["marketing"]["ads"]["management_hours_per_week"] if co.s.get("paid_ads_per_month", 0) > 0 else 0.0
        avail -= ads_h
        csc = co.cfg["customer_success"]
        need = co.cs.need()
        cs = min(max(need, self.cs_min * avail), csc["cs_cap_share"] * avail)
        out["cs"] = cs
        rest = avail - cs
        alloc = {k: rest * self.shares[k] for k in HOUR_KEYS}
        # caps: channels that cannot absorb hours give them back
        spare = 0.0
        cap = co.marketing.launch_hours_cap()
        if alloc["launches"] > cap:
            spare += alloc["launches"] - cap
            alloc["launches"] = cap
        cap = co.sales.app_store_hours_cap()
        if alloc["app_store"] > cap:
            spare += alloc["app_store"] - cap
            alloc["app_store"] = cap
        if spare > 0:
            sink = ("engineering", "seo", "outreach", "geo")
            tot = sum(self.shares[k] for k in sink)
            for k in sink:
                alloc[k] += spare * (self.shares[k] / tot if tot > 0 else 1.0 / len(sink))
        out.update(alloc)
        return out

    def monthly_review(self):
        co = self.co
        ir = co.cfg["ceo"]["in_run"]
        if not ir["enabled"] or not co.s.get("in_run_adjust", True):
            return
        via = co.cfg["viability"]
        behind_pace = co.mrr < via["m3_min_mrr"] * co.wsl / via["m3_week"]
        if (not self.adjusted_traffic and co.wsl >= ir["review_week"]
                and (co.d_trials < ir["min_trials"] or behind_pace)):
            moved = (self.shares["seo"] + self.shares["geo"]) * ir["shift_share"]
            if moved > 0.01:
                self.shares["seo"] *= (1 - ir["shift_share"])
                self.shares["geo"] *= (1 - ir["shift_share"])
                to_launch = 0.0
                if self.shares["launches"] < ir["launch_share"] and co.marketing.launch_hours_cap() > 0:
                    to_launch = min(moved, ir["launch_share"] - self.shares["launches"])
                    self.shares["launches"] += to_launch
                self.shares["outreach"] += moved - to_launch
                co.in_run_adjustments.append("w%d: %d trials, behind M3 pace -> moved %.0f%% of hours from SEO/GEO to outreach%s"
                                             % (co.wsl, co.d_trials, moved * 100,
                                                " and launches" if to_launch else ""))
            self.adjusted_traffic = True
        if co.cs.month_ratio < ir["cs_shortfall_trigger"] and self.cs_min < 0.45:
            self.cs_min += ir["cs_shift"]
            co.in_run_adjustments.append("w%d: support short (%.0f%% covered) -> CS floor %.0f%%"
                                         % (co.wsl, co.cs.month_ratio * 100, self.cs_min * 100))


class Product:
    """Product & Engineering: build phase, action success rate, maintenance, incidents, features."""

    def __init__(self, co):
        self.co = co
        p = co.cfg["product"]
        sc = co.s["scope"]
        n_plat = max(1, len(sc["platforms"]))
        n_act = max(1, sc["actions"])
        self.breadth = (n_plat - 1) + max(0, n_act - 2) / 2.0
        factor = (1 + p["per_extra_platform"] * (n_plat - 1)) * (1 + p["per_extra_action"] * (n_act - 1))
        if co.s.get("style") == "cute_pro":
            factor *= 1 + p["pro_style_factor"]
        self.scope_factor = factor
        self.build_hours_needed = p["base_build_weeks"] * factor * co.md.build_overrun * co.avail_hours
        self.built = 0.0
        self.asr = clamp(p["asr_narrow_start"] - p["asr_breadth_penalty"] * self.breadth, p["asr_floor"], p["asr_max"])
        self.feature_level = 0.0
        self.setup_minutes = (p["setup_minutes_base"] + p["setup_minutes_per_extra_platform"] * (n_plat - 1)
                              + p["setup_minutes_per_action"] * n_act)
        self.maint_need = (p["maintenance_hours_base"] + p["maintenance_hours_per_platform"] * (n_plat - 1)
                           + (p["maintenance_hours_pro_style"] if co.s.get("style") == "cute_pro" else 0))
        self.incident_month = False
        self.incidents = 0

    def build_week(self, h):
        self.built += h

    def ready(self):
        return self.built >= self.build_hours_needed

    def live_week(self, h):
        p = self.co.cfg["product"]
        maint = min(h, self.maint_need)
        deficit = 1.0 - maint / self.maint_need if self.maint_need > 0 else 0.0
        imp = max(0.0, h - maint)
        if imp > 0:
            self.asr += (p["asr_max"] - self.asr) * (1 - math.exp(-imp * 0.5 / (p["asr_hours_scale"] * (1 + self.breadth))))
            self.feature_level += (1 - self.feature_level) * (1 - math.exp(-imp * 0.5 / p["feature_hours_scale"]))
        prob = p["incident_prob_per_week"] * (1 + 0.5 * self.breadth) * (1 + 2 * deficit)
        if self.co.rng.random() < prob:
            self.incident_month = True
            self.incidents += 1


class Marketing:
    """SEO & GEO, one-shot launches, paid ads, free-plan badge."""

    def __init__(self, co):
        self.co = co
        cfg = co.cfg
        mk = cfg["marketing"]
        self.pages = 0.0
        self.pages_eff = 0.0
        self.backlinks = 0.0
        self.first_content_week = None
        self.comp_pages = 0.0
        self.mentions = 0.0
        self.comp_eff = 0.0
        self.mentions_eff = 0.0
        self.launch_prep = 0.0
        self.launch_idx = 0
        self.launch_pending = []     # list of [weeks_left_split_index, visitors, event]
        n = co.nseg
        # traffic split across segments
        tg = co.targeted
        spill = mk["non_target_traffic_share"] if not all(tg) else 0.0

        def split(key):
            tot_t = sum(co.S[i][key] for i in range(n) if tg[i]) or 1.0
            tot_n = sum(co.S[i][key] for i in range(n) if not tg[i]) or 1.0
            return [((1 - spill) * co.S[i][key] / tot_t) if tg[i] else (spill * co.S[i][key] / tot_n)
                    for i in range(n)]
        self.seo_split = split("search_share")
        self.geo_split = split("ai_share")
        # traffic potential scales with the search / AI-query demand of the targeted segments
        seo = mk["seo"]

        def demand(key):
            d = sum(co.S[i][key] for i in range(n) if tg[i]) + spill * sum(co.S[i][key] for i in range(n) if not tg[i])
            return (max(d, 1e-6) / seo["demand_ref_share"]) ** seo["demand_exponent"]
        self.seo_demand = demand("search_share")
        self.geo_demand = demand("ai_share")
        nt = co.n_targets
        self.viral_mix = {co.segs[i]: co.S[i]["search_share"] for i in range(n)}
        self.virals = 0
        self.focus_seo = (1 + mk["seo"]["focus_seo_bonus"]) if nt == 1 else 1.0 / (1 + mk["dilution_per_extra_segment"] * (nt - 1))

    def launch_hours_cap(self):
        evs = self.co.cfg["marketing"]["launches"]
        if self.launch_idx >= len(evs):
            return 0.0
        return max(0.0, sum(e["prep_hours"] for e in evs[self.launch_idx:]) - self.launch_prep)

    def content_week(self, hours):
        co = self.co
        mk = co.cfg["marketing"]
        seo, geo = mk["seo"], mk["geo"]
        new_pages = hours["seo"] / seo["hours_per_page"]
        if new_pages > 0 and self.first_content_week is None:
            self.first_content_week = co.week
        self.pages += new_pages
        self.pages_eff += (self.pages - self.pages_eff) / seo["page_ramp_weeks"]
        self.backlinks += new_pages * seo["backlinks_per_page"]
        cp = hours["geo"] * 0.5 / geo["hours_per_comparison_page"]
        self.comp_pages += cp
        self.mentions += hours["geo"] * 0.5 * geo["mentions_per_hour"] * 2
        self.backlinks += hours["geo"] * 0.5 * geo["mentions_per_hour"] * 0.3
        if cp > 0 and self.first_content_week is None:
            self.first_content_week = co.week
        lag = geo["index_lag_weeks"]
        self.comp_eff += (self.comp_pages - self.comp_eff) / lag
        self.mentions_eff += (self.mentions - self.mentions_eff) / lag
        co.ch_hours["seo"] += hours["seo"]
        co.ch_hours["geo"] += hours["geo"]
        # launches: prep accumulates any time, events fire only once launched
        self.launch_prep += hours["launches"]
        co.ch_hours["launch"] += hours["launches"]
        evs = mk["launches"]
        while co.launched and self.launch_idx < len(evs) and self.launch_prep >= evs[self.launch_idx]["prep_hours"]:
            ev = evs[self.launch_idx]
            self.launch_prep -= ev["prep_hours"]
            v = co.md.launch_visitors[self.launch_idx]
            self.launch_pending.append([0, v, ev])
            self.backlinks += ev["backlinks"]
            self.mentions += ev["mentions"]
            self.launch_idx += 1

    def visitors(self):
        """Generate web visitors this week, push signups into the funnel, return totals by channel."""
        co = self.co
        cfg = co.cfg
        mk = cfg["marketing"]
        seo, geo = mk["seo"], mk["geo"]
        md = co.md
        out = {}
        # --- SEO
        if self.first_content_week is not None:
            age = co.week - self.first_content_week
            sb = seo["sandbox_floor"] + (1 - seo["sandbox_floor"]) / (1 + math.exp(-(age - md.sandbox_weeks) / seo["sandbox_width_weeks"]))
            auth = min(seo["authority_cap"],
                       seo["authority_floor"] + math.log1p(self.backlinks) / math.log1p(seo["authority_ref_backlinks"]))
            v = ((self.pages_eff ** seo["page_exponent"]) * seo["visits_per_page_mature"] * sb * auth
                 * md.seo_yield * self.focus_seo * self.seo_demand)
        else:
            v = 0.0
        out["seo"] = v
        # --- GEO
        lam = (geo["citation_k_pages"] * self.comp_eff + geo["citation_k_mentions"] * self.mentions_eff)
        lam *= 0.6 + 0.4 * min(2.0, math.log1p(self.backlinks) / math.log1p(seo["authority_ref_backlinks"]))
        pc = geo["citation_p_max"] * (1 - math.exp(-lam))
        g = pc * geo["max_referrals_per_week"] * md.geo_yield * self.focus_seo * self.geo_demand
        out["geo"] = g
        for i in range(co.nseg):
            if v > 0:
                co.web_signups(i, "seo", v * self.seo_split[i], 1.0)
            if g > 0:
                co.web_signups(i, "geo", g * self.geo_split[i], geo["signup_mult"])
        # --- launches
        lv = 0.0
        split = mk["launch_week_split"]
        still = []
        for item in self.launch_pending:
            k, vis, ev = item
            wv = vis * split[k]
            lv += wv
            for i, name in enumerate(co.segs):
                share = ev["segment_mix"].get(name, 0.0)
                if share > 0:
                    mult = ev["signup_mult"] * (1.0 if co.targeted[i] else mk["non_target_conv_mult"])
                    co.web_signups(i, "launch", wv * share, mult)
            item[0] += 1
            if item[0] < len(split):
                still.append(item)
        self.launch_pending = still
        out["launch"] = lv
        # --- paid ads
        budget = co.s.get("paid_ads_per_month", 0.0)
        av = 0.0
        if budget > 0:
            wk = budget / co.wpm
            tg = [i for i in range(co.nseg) if co.targeted[i]] or list(range(co.nseg))
            per = wk / len(tg)
            for i in tg:
                clicks = per / (co.S[i]["cpc"] * md.cpc_mult[i])
                av += clicks
                co.web_signups(i, "ads", clicks, mk["ads"]["signup_mult"])
            co.ch_cash["ads"] += wk
        out["ads"] = av
        # --- badge on free sites
        bv = 0.0
        if co.s["pricing"].get("free_plan"):
            fa = co.cfg["pricing_behaviour"]["free_active_share"]
            for i in range(co.nseg):
                if co.free[i] > 0:
                    b = co.free[i] * fa * mk["badge_visitors_per_active_free_user"]
                    bv += b
                    co.web_signups(i, "badge", b, 1.0)
        out["badge"] = bv
        # --- referral: founders' own network at launch + customer word of mouth
        ref = mk["referral"]
        rv = 0.0
        if co.wsl < len(split):
            rv += md.network_visitors * split[co.wsl]
        rv += len(co.customers) * ref["visitors_per_customer_per_week"]
        if rv > 0:
            for i in range(co.nseg):
                co.web_signups(i, "referral", rv * self.seo_split[i], ref["signup_mult"])
        # --- rare viral moment (a tweet/Reddit thread/newsletter feature takes off)
        vr = mk["viral"]
        if co.rng.random() < vr["weekly_prob"] + vr["prob_per_customer"] * len(co.customers):
            vv = co.rng.lognormvariate(math.log(vr["visitors_median"]), vr["visitors_sigma"])
            self.launch_pending.append([0, vv, {"segment_mix": self.viral_mix, "signup_mult": vr["signup_mult"]}])
            self.virals += 1
        out["referral"] = rv
        for k, val in out.items():
            co.vis_total[k] += val
        return out


class Sales:
    """Founder-led outreach, app-store listings, agency partners, lifetime deal."""

    def __init__(self, co):
        self.co = co
        sc = co.s["scope"]["platforms"]
        self.stores = [p for p in ("shopify", "wordpress") if p in sc] if co.s["hours"].get("app_store", 0) > 0 else []
        self.listing_hours = 0.0
        self.listed_week = None
        self.app_ongoing = 0.0
        self.waitlist = [0] * co.nseg
        self.demo_debt = 0.0
        self.partners = 0.0
        self.agency_contacts = 0.0
        self.ltd_done = False
        self.ltd_prep = 0.0
        self.contacted = [0] * co.nseg
        self.presold = 0

    def app_store_hours_cap(self):
        if not self.stores:
            return 0.0
        app = self.co.cfg["sales"]["app_store"]
        need = app["listing_hours"] * len(self.stores) - self.listing_hours
        return max(0.0, need) + app["ongoing_hours_cap"]

    def _outreach(self, h, prelaunch):
        co = self.co
        o = co.cfg["sales"]["outreach"]
        h_eff = max(0.0, h - self.demo_debt)
        self.demo_debt = max(0.0, self.demo_debt - h)
        contacts = h_eff * o["contacts_per_hour"]
        co._wk["contacts"] = contacts
        co.ch_hours["outreach"] += h
        if contacts <= 0:
            return
        tg = [i for i in range(co.nseg) if co.targeted[i]] or list(range(co.nseg))
        focus = 1 + o["focus_reply_bonus"] if co.n_targets == 1 else 1.0
        per = contacts / len(tg)
        rng = co.rng
        for i in tg:
            pool_left = co.S[i]["reachable_pool"] - self.contacted[i]
            n = int(min(per, max(0, pool_left)))
            frac = per - int(per)
            if rng.random() < frac:
                n += 1
            self.contacted[i] += n
            replies = binomial(rng, n, co.md.reply_rate[i] * focus)
            pos = binomial(rng, replies, o["positive_reply_share"])
            if pos <= 0:
                continue
            self.demo_debt += pos * o["demo_hours"]
            if prelaunch:
                self.waitlist[i] += pos
            else:
                co.enqueue_trials(i, "outreach", pos)

    def prelaunch_week(self, hours):
        self._outreach(hours["outreach"], True)
        self._listing(hours["app_store"])
        self._agency(hours["agency"], False)

    def on_launch(self):
        """Waitlist from pre-launch outreach: presold pilots pay upfront, the rest start trials."""
        co = self.co
        o = co.cfg["sales"]["outreach"]
        presell = co.s["offer"].get("presell")
        rng = co.rng
        for i in range(co.nseg):
            n = binomial(rng, self.waitlist[i], o["waitlist_to_trial"])
            self.waitlist[i] = 0
            if n <= 0:
                continue
            if presell:
                # paying before trying: fit check without the trial, upfront prepay
                p_fit = clamp(co.fit_static[i] * co.fit_dynamic(i) * o["trial_quality_mult"]
                              * o["presell_fit_mult"], 0.0, 0.95)
                k = binomial(rng, n, p_fit)
                bought = 0
                for _ in range(k):
                    plan = co.choose_plan(i, "outreach", rng)
                    if plan is not None:
                        plan = (plan[0], plan[1] * (1 - o["presell_discount"]), plan[2], plan[3])
                        co.add_customer(i, "outreach", plan, prepay_weeks=o["presell_prepay_weeks"])
                        bought += 1
                n -= bought
                co.d_trials += bought
                co.d_fit_pass += k
                co.seg_stats[i][0] += bought
                co.seg_stats[i][1] += k
                co.d_price_lost += k - bought
                co.seg_stats[i][2] += k - bought
                self.presold += bought
            co.enqueue_trials(i, "outreach", n)

    def _listing(self, h):
        co = self.co
        co.ch_hours["app_store"] += h
        if not self.stores:
            return
        app = co.cfg["sales"]["app_store"]
        need = app["listing_hours"] * len(self.stores)
        if self.listing_hours < need:
            used = min(h, need - self.listing_hours)
            self.listing_hours += used
            h -= used
            if self.listing_hours >= need and self.listed_week is None:
                self.listed_week = co.week + co.md.app_review_weeks
        self.app_ongoing = h

    def _agency(self, h, live):
        co = self.co
        ag = co.cfg["sales"]["agency"]
        co.ch_hours["agency"] += h
        contacts = h * ag["contacts_per_hour"]
        self.partners += poisson(co.rng, contacts * co.md.agency_rate)
        if not live or self.partners <= 0:
            return
        idx = co.segs.index("Web agency or freelancer") if "Web agency or freelancer" in co.segs else 0
        lam = self.partners * ag["client_sites_per_partner_month"] / co.wpm
        n = poisson(co.rng, lam)
        co._wk["agency_sites"] = n
        if n > 0:
            co.enqueue_trials(idx, "agency", n)
        self.partners *= (1 - ag["partner_churn_monthly"] / co.wpm)

    def live_week(self, hours):
        co = self.co
        self._outreach(hours["outreach"], False)
        self._listing(hours["app_store"])
        self._agency(hours["agency"], True)
        # app-store installs
        if self.listed_week is not None and co.week >= self.listed_week and co.launched:
            app = co.cfg["sales"]["app_store"]
            rank = math.sqrt(1 + co.reviews / app["review_k"]) * (1 + app["ongoing_hours_boost"] * self.app_ongoing)
            q = 0.5 + 0.5 * co.product.asr
            tot = 0
            for store in self.stores:
                lam = app["base_installs_per_week"][store] * rank * q * co.md.app_yield
                n = poisson(co.rng, lam)
                tot += n
                for name, share in app["store_segments"][store].items():
                    if name in co.segs and n > 0:
                        k = binomial(co.rng, n, share * app["install_to_trial"])
                        co.enqueue_trials(co.segs.index(name), "app_store", k)
            co._wk["installs"] = tot
            # reviews from happy app-store customers
            happy_app = sum(1 for c in co.customers if c[8] and co.wsl - c[6] >= 4)
            co.reviews += happy_app * app["review_rate_per_happy_customer"] / co.wpm * 0.25
        # lifetime deal
        ltd = co.s.get("ltd") or {}
        if ltd.get("enabled") and not self.ltd_done:
            cfg_l = co.cfg["sales"]["ltd"]
            if co.wsl >= ltd.get("week_after_launch", 4):
                self.ltd_done = True
                appeal = 0.5 + 0.5 * co.product.asr
                units = int(co.md.ltd_units * appeal)
                cash = units * ltd.get("price", 59) * cfg_l["partner_share"]
                pw = co.week + cfg_l["payout_delay_weeks"]
                co.ltd_payouts[pw] = co.ltd_payouts.get(pw, 0.0) + cash
                co.ltd_active = int(units * cfg_l["active_share"])
                co.reviews += units * 0.03
                co.ch_hours["launch"] += cfg_l["prep_hours"]
                co.cs.extra_need += cfg_l["prep_hours"]  # deal page, codes, buyer support spike


class CustomerSuccess:
    """Support load and onboarding quality."""

    def __init__(self, co):
        self.co = co
        self.onboarding_mult = 1.0
        self.ratio = 1.0
        self.month_hours = 0.0
        self.month_need = 0.0
        self.month_ratio = 1.0
        self.extra_need = 0.0

    def need(self):
        co = self.co
        c = co.cfg["customer_success"]
        n = (len(co.customers) * c["hours_per_paid_customer_per_week"]
             + co.total_free() * c["hours_per_free_user_per_week"]
             + co.ltd_active * c["hours_per_ltd_user_per_week"]
             + co.trials_active * c["hours_per_trial_per_week"]
             + self.extra_need)
        if co.s["offer"].get("done_for_you"):
            n += co.new_customers_week * c["dfy_setup_hours"]
        return n

    def week(self, h):
        co = self.co
        c = co.cfg["customer_success"]
        need = self.need()
        self.extra_need = 0.0
        self.ratio = h / need if need > 0 else 1.5
        r = min(1.0, self.ratio)
        self.onboarding_mult = c["onboarding_min"] + (c["onboarding_max"] - c["onboarding_min"]) * r
        self.month_hours += h
        self.month_need += need

    def month_reset(self):
        self.month_ratio = self.month_hours / self.month_need if self.month_need > 0 else 1.5
        self.month_hours = 0.0
        self.month_need = 0.0


class Finance:
    """Cash, revenue, costs. Weekly accrual of monthly bills."""

    def __init__(self, co):
        self.co = co
        cfg = co.cfg
        sc = co.s["scope"]
        self.action_mult = 1 + (cfg["costs"]["llm_action_multiplier"] - 1) * min(1.0, sc["actions"] / 3.0)
        pb = cfg["pricing_behaviour"]
        p = co.s["pricing"]
        fq = p.get("free_quota", 50)
        self.free_conv = [lognormal_capped_mean(s["conv_per_month_median"] * co.md.usage_mult[i],
                                                s["conv_per_month_sigma"], fq) * pb["free_active_share"]
                          for i, s in enumerate(co.S)]
        lt = cfg["sales"]["ltd"]
        self.ltd_conv = lognormal_capped_mean(lt["conv_per_month_median"], 1.0, lt["conv_cap"])

    def week(self):
        co = self.co
        cfg = co.cfg
        c = cfg["costs"]
        wpm = co.wpm
        out = co.ledger_out
        tools = c["tools_per_month"] / wpm
        admin = c["accounting_admin_per_month"] / wpm
        salary = cfg["team"]["founder_salary_per_month"] / wpm
        hosting = c["hosting_base_per_month"] / wpm
        cash_in = 0.0
        llm = fees = ads = 0.0
        if co.launched:
            nfree = co.total_free()
            hosting += c["hosting_per_customer_per_month"] * (len(co.customers) + 0.2 * nfree + 0.2 * co.ltd_active) / wpm
            years = max(0.0, co.week) / 52.0
            cpc = co.md.llm_cpc * ((1 - c["llm_price_decline_per_year"]) ** years) * self.action_mult
            conv = co.conv_paid
            if co.s["pricing"].get("free_plan"):
                conv += sum(co.free[i] * self.free_conv[i] for i in range(co.nseg))
            conv += co.ltd_active * self.ltd_conv
            llm = conv / wpm * cpc
            sub = (co.mrr_monthly_stripe + co.mrr_appstore) / wpm
            fees = (c["stripe_pct"] * co.mrr_monthly_stripe + c["stripe_fixed"] * co.n_monthly_stripe
                    + c["app_store_rev_share"] * co.mrr_appstore) / wpm
            cash_in += sub
            co.ledger_in["subscriptions"] += sub
            co.cum_revenue += sub
            ads = co.s.get("paid_ads_per_month", 0.0) / wpm
        ltd = co.ltd_payouts.pop(co.week, 0.0)
        if ltd:
            cash_in += ltd
            co.ledger_in["ltd"] += ltd
            co.cum_revenue += ltd
        out["tools"] += tools
        out["admin"] += admin
        out["salary"] += salary
        out["hosting"] += hosting
        out["llm"] += llm
        out["payment_fees"] += fees
        out["ads"] += ads
        co.cash += cash_in - (tools + admin + salary + hosting + llm + fees + ads)
        if co.cash < co.cash_min:
            co.cash_min = co.cash


# --------------------------------------------------------------------------- API
def simulate(cfg, strategy, seed, record=False):
    """Run one company for one seed. Returns a dict of KPIs (see Company.result)."""
    return Company(cfg, strategy, seed, record=record).run()


def summarize(results, cfg):
    """Aggregate per-seed results into the KPI block used by iterations/search outputs."""
    n = len(results)
    segs = list(cfg["segments"].keys())
    alive = [r for r in results if r["alive"]]
    causes = {c: 0 for c in CAUSES}
    for r in results:
        if not r["alive"]:
            causes[r["cause"]] = causes.get(r["cause"], 0) + 1
    gm = [r["gross_margin"] for r in results if r["gross_margin"] is not None]
    ch = [r["churn_monthly"] for r in results if r["churn_monthly"] is not None]
    seg_tot = [[0, 0, 0, 0, 0.0] for _ in segs]
    for r in results:
        for i, row in enumerate(r["seg"]):
            for j in range(5):
                seg_tot[i][j] += row[j]
    seg_out = {}
    for i, name in enumerate(segs):
        t, fp, pl, paid, mrr = seg_tot[i]
        seg_out[name] = {
            "trials_per_run": round(t / n, 2),
            "paid_per_run": round(paid / n, 2),
            "trial_to_paid": round(paid / t, 4) if t else 0.0,
            "price_lost_share": round(pl / fp, 4) if fp else 0.0,
            "mrr_end_per_run": round(mrr / n, 1),
        }
    channels = {}
    for c in CHANNELS:
        paid = sum(r["ch_paid"].get(c, 0) for r in results)
        hours = sum(r["ch_hours"].get(c, 0.0) for r in results)
        cash = sum(r["ch_cash"].get(c, 0.0) for r in results)
        if paid == 0 and hours == 0 and cash == 0:
            continue
        channels[c] = {
            "paid_per_run": round(paid / n, 2),
            "hours_per_paid": round(hours / paid, 1) if paid else None,
            "cash_per_paid": round(cash / paid, 1) if paid else None,
            "cac_eur_incl_hours": round((cash + hours * cfg["team"]["hour_value_eur"]) / paid, 1) if paid else None,
        }
    adj = sum(1 for r in results if r["adjusted"])
    trials = sum(r["trials"] for r in results)
    paid = sum(r["paid"] for r in results)
    return {
        "n": n,
        "survival": round(len(alive) / n, 4) if n else 0.0,
        "passed_m3": round(sum(1 for r in results if r["alive"] or (r["death_wsl"] is not None and r["death_wsl"] > 12)) / n, 4),
        "death_causes": causes,
        "mrr_m3": pcts([r["mrr_m3"] for r in results]),
        "mrr_m6": pcts([r["mrr_m6"] for r in results]),
        "mrr_m12": pcts([r["mrr_m12"] for r in results]),
        "customers_m3": pcts([r["cust_m3"] for r in results]),
        "customers_m12": pcts([r["cust_m12"] for r in results]),
        "cum_revenue": pcts([r["cum_revenue"] for r in results]),
        "cash_min": pcts([r["cash_min"] for r in results]),
        "build_weeks": pcts([r["build_weeks"] for r in results]),
        "gross_margin": pcts(gm, 3) if gm else None,
        "churn_monthly": pcts(ch, 4) if ch else None,
        "llm_cost": pcts([r["llm_cost"] for r in results]),
        "trials": pcts([r["trials"] for r in results]),
        "trial_to_paid": round(paid / trials, 4) if trials else 0.0,
        "price_lost_share": round(sum(r["price_lost"] for r in results) / max(1, sum(r["fit_pass"] for r in results)), 4),
        "visitors": {k: round(sum(r["vis"].get(k, 0) for r in results) / n, 1) for k in WEB_CHANNELS},
        "segments": seg_out,
        "channels": channels,
        "in_run_adjusted_share": round(adj / n, 4),
    }
