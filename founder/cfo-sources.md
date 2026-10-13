# CFO sources: where every number in `founder/numbers.json` comes from

Written 2026-10-13. Labels used below:
- **INPUT**: taken from a founder-pack file.
- **PUBLIC**: a published price that you can check.
- **ESTIMATE**: the CFO's own reasoning.
- **ASSUMED**: not given by the founder.

All amounts are EUR. The tool prints `$`; ignore the sign.

## How the volume fields work: `days_per_month` = 1

`unit_economics.py` measures volume "per day" and multiplies by `days_per_month`. A SaaS sells subscriptions, not daily units, so **`days_per_month` is set to 1**. With that setting, "per day" means "per month" everywhere:

- `plan_per_day` = paying accounts in a month.
- `ramp_per_day` = paying accounts in each month of year 1.
- "break-even a day" = paying accounts needed each month.

**Why not 30 with accounts / 30?** It would give the same totals. But the report would then show fractional "accounts a day" (0.47) that no one can check against the marketing plan's account counts, so it is not used.

## Price

| field | value | source |
| --- | ---: | --- |
| price | 45.00 | INPUT. `marketing-assumptions.json` → `blended_arpa_eur` 45 (range 35-49), from pitch-v2 prices: Starter 19, Growth 49, Agency 149 EUR/month (`pitch-v2.md`). Both v2 panel buyers chose Growth. Before VAT. |

## Variable cost per paying client-month (12.36)

| line | value | source |
| --- | ---: | --- |
| LLM inference | 9.00 | **ESTIMATE built on PUBLIC per-token prices.** The working is below. |
| Free-plan inference per paying account | 1.50 | **ESTIMATE.** About 8 free accounts per paying account (from `signup_to_paid_rate` 4% over its 60-day window, and from free users who stay free). Each free account uses about 30 of its 100 free conversations, at about 0.006 EUR each: 8 × 30 × 0.006 = 1.44, rounded to 1.50. |
| Stripe | 1.56 | **PUBLIC plus ESTIMATE mix.** The fees are below. |
| Hosting share per site | 0.30 | INPUT. `sim/config.json` → `costs.hosting_per_customer_per_month` 0.30 (estimate there: storage, logs, widget bandwidth). |
| Support time | 0 | INPUT/ASSUMED. Per the brief, founders are unpaid (`sim/config.json` `team.founder_salary_per_month` 0). This is real hidden cost: about 12-15 founder hours per won customer (`marketing.md` §6). |

### Stripe fees

- 1.5% + 0.25 EUR on standard EEA cards. Source: [Stripe EEA pricing update](https://support.stripe.com/questions/pricing-updates-for-businesses-based-in-the-european-economic-area-(eea)).
- 2.5% + 0.25 EUR on UK cards and 3.25% + 0.25 EUR on international cards (same source).
- Stripe Billing pay-as-you-go: 0.7% of billing volume. Source: [stripe.com/billing/pricing](https://stripe.com/en-us/billing/pricing).
- **ESTIMATE:** a card mix of 60% EEA and 40% UK or international gives 0.6 × 1.5 + 0.4 × 3.25 = 2.2%. Adding 0.7% Billing gives 2.9% + 0.25 EUR. On 45 EUR that is 1.305 + 0.25 = **1.56 EUR**.
- This matches `sim/config.json` `stripe_pct` 0.029 and `stripe_fixed` 0.25.
- A 2% FX fee applies only if prices are charged in a currency other than the payout currency. Price in EUR to avoid it.

### LLM inference working

**Public prices**, from third-party aggregators that cite the official pages. Check them on ai.google.dev and openai.com/api/pricing before relying on them:

| model | input, USD per 1M tokens | output, USD per 1M tokens |
| --- | ---: | ---: |
| Gemini 2.5 Flash-Lite | 0.10 | 0.40 |
| GPT-5 mini | 0.25 | 2.00 |

Sources: [anotherwrapper.com comparison](https://anotherwrapper.com/tools/llm-pricing/gemini-2.5-flash-lite/gpt-5-mini-2025-08-07), [pricepertoken.com](https://pricepertoken.com/pricing-page/model/google-gemini-2.5-flash-lite), [aicostcheck.com](https://aicostcheck.com/compare/gemini-2-5-flash-lite-vs-gpt-5-mini).

**Tokens per conversation (ESTIMATE):**
- About 6 turns.
- Each turn reads about 2,500 input tokens: system prompt about 800, retrieved site content about 1,200, and history about 500 on average. Each turn writes about 150 output tokens.
- So about 15,000 input and 900 output tokens per conversation.
- Multiply by 1.4 for on-site actions (DOM snapshot plus tool calls). The 1.4 is from `sim/config.json` `llm_action_multiplier` and is itself an estimate.
- Result: **about 21,000 input and 1,260 output tokens**.

**Cost per conversation:**
- Gemini 2.5 Flash-Lite: 21k × 0.10 + 1.26k × 0.40, per million = 0.0026 USD, or about **0.0022 EUR**.
- GPT-5 mini: 21k × 0.25 + 1.26k × 2.00, per million = 0.0078 USD, or about **0.0067 EUR**.
- USD to EUR at about 0.86 (ESTIMATE). Prompt caching is not counted, which makes this conservative.

**Conversations per paying account:** 1,000 to 2,500 a month, per the brief. pitch-v2 caps Starter at 1,000 and Growth at 5,000.

**Range per account:**
- Low: 1,000 × 0.0022 = **2.20 EUR**.
- High: 2,500 × 0.0067 = **16.80 EUR**.
- **Base: 1,500 conversations × about 0.006 EUR (mostly GPT-5 mini for reliable actions, with some Flash-Lite) = 9.00 EUR.**
- `sim/config.json` gives 0.005 / 0.012 / 0.03 EUR per conversation on a "mid-tier" model. Our cheap-model base of 0.006 sits between its min and its mode.

## Fixed monthly costs (219, no salaries, all ASSUMED)

| line | value | source |
| --- | ---: | --- |
| Tools | 110 | INPUT. `sim/config.json` `costs.tools_per_month` (estimate: AI coding about 40, plus email, domain, analytics and error tracking about 70). |
| Hosting base | 25 | INPUT. `sim/config.json` `costs.hosting_base_per_month` (estimate). |
| Accountant and bank | 45 | INPUT. `sim/config.json` `costs.accounting_admin_per_month` (estimate: French SASU online accountant, low tier). |
| Legal and insurance | 35 | ESTIMATE. Professional liability (RC Pro) for a small SaaS, plus DPA and privacy upkeep. Get a real insurance quote. |
| Domains | 4 | ESTIMATE. The main domain plus the separate outreach domain (`marketing.md`), about 25 EUR a year each. |
| Salaries | 0 | INPUT/ASSUMED. `idea.md`: no salary in year 1. |

## Startup (2,800 of the ~5,000 EUR)

Taken line by line from the `marketing.md` §6 budget split:

| line | value |
| --- | ---: |
| Outreach stack | 350 |
| SEO tool | 250 |
| Generator and grader inference | 400 |
| Product Hunt and HN assets | 150 |
| GEO and directories | 250 |
| Reviews | 150 |
| Paid test | 400 |
| Contingency | 200 |
| Legal and trust | 350 |
| Refund reserve | 300 |
| **Total** | **2,800** |

**Two buckets from the 5,000 split are left out of `startup` on purpose:**
- **"Product, infra and LLM" 1,200.** It is running cost, already modelled in the fixed and variable lines. Counting it again would double it. Modelled, the first 3 months cost about 920 EUR, inside the 1,200.
- **"Reserve, runway for M4-M6" 1,000.** It is a cash buffer, not spending.

The 5,000 itself is ASSUMED (`idea.md`).

## Ramp (paying accounts in each month)

The ramp is **2, 7, 12, 15, 17, 19, 21, 23, 25, 27, 29, 31**. `plan_per_day` is 30, about month 12.

- **Months 1-3:** INPUT. These are averages of the `marketing.md` weekly table, where paid accounts reach 3-4 by the end of month 1, 9-11 by the end of month 2 and 14 by 10 Jan. The table is a target, not a forecast. Its funnel rates are estimates (`marketing-assumptions.json`: 7% reply, 60% demo, 30% demo→paid). The v2 panel is simulated: 2 of 20 buy in month 1.
- **Months 4-12:** ESTIMATE. About +2 net accounts a month:
  - About 2 a month from continued outreach.
  - About 1-2 from organic and GEO. At month 6, 1,500 visitors × 2% signup × 4% paid ≈ 1.2.
  - Minus 5% monthly churn (`monthly_churn`).
- **Not modelled as a separate line:** the 15% month-1 guarantee refunds (`guarantee_refund_rate`), which the 300 EUR refund reserve covers, and Agency accounts at 149 EUR.

## What-ifs that were run

**Run on `founder/numbers.json`:**
- The tool's built-in cases: price -10%, volume -20%, unit costs +15%.
- `--price 29`, `--price 69`, `--price 49`, `--volume 0.5`, `--volume 0.8`.

**Run on scratch copies with one input changed:**
- The LLM line set to 2.20 (low), and to 16.80 (high).
- The LLM line at 16.80 combined with `--volume 0.5`.
- The free-plan line set to 0.50.
- A Starter-at-cap case: price 19, LLM 6.00 (1,000 × 0.006), Stripe 0.80 (19 × 2.9% + 0.25).

**Known limit:** in the `--price` runs, Stripe stays at 1.56 because the tool keeps variable lines fixed. At 29 EUR the real fee would be about 1.09 EUR.
