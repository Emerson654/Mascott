# CFO's note: Mascott

Written 2026-10-13 by the CFO, following `.claude/skills/founder-cfo/SKILL.md`. Inputs: `founder/numbers.json`, with every source listed in `founder/cfo-sources.md`.

> **Read this first.**
> - **All amounts are EUR.** The tool prints a `$` sign. Ignore it.
> - **"A day" means "a month" in every table below.** `days_per_month` is set to 1, so "paying client-months a day" means **paying accounts in that month**. The unit is one paying client-month at a blended **45 EUR** (the ARPA in `marketing-assumptions.json`).
> - **Budget, team and cash are ASSUMED** (`idea.md`): bootstrapped, about 5,000 EUR, founders unpaid. Founder time and support costs are 0 EUR here. The business pays nobody.
> - **Not measured yet:** the LLM cost per conversation and conversations per account. Both are estimates from public per-token prices (see sources).
> - Revenue is shown before VAT. French VAT (20%) and EU B2B reverse charge apply on top. Not financial, tax or legal advice: have an accountant check the SASU structure, VAT/OSS and the tax before money moves.

## The margin
- **Contribution per paying account: 32.64 EUR a month (73%).** That is 45 EUR minus 12.36 EUR of variable costs: LLM 9.00, free-plan inference 1.50, Stripe 1.56 and hosting 0.30.
- **Fixed costs are 219 EUR a month**, with no salaries. **Break-even is 7 paying accounts.** The marketing plan expects 7 in month 2 (average) and 14 by 10 Jan.
- **Profit margin at plan (30 accounts, month 12): 56%.**
- **Year 1:** operating profit **+4,814 EUR** on 10,260 EUR of revenue. After the 2,800 EUR startup spend, the result is **+2,014 EUR**, and the spend is earned back in **month 10**.

## Cash
- **Cash needed before it pays for itself: 2,954 EUR** (lowest point: month 1). That leaves about 2,000 EUR of the ~5,000 EUR untouched.
- In the 5,000 EUR split from `marketing.md`, the "Product, infra and LLM 1,200" bucket is already covered by the monthly lines. Modelled, the first 3 months cost about 920 EUR (657 EUR fixed plus about 260 EUR variable on 21 client-months). The "Reserve 1,000" bucket is not spent.
- Even at half the volume, cash needed is 3,114 EUR. **Cash is not what kills this business. The ramp is.**

## The line to watch: the ramp (volume), then LLM cost per account
| what-if (tool output) | contribution | break-even | year 1 operating | after startup | payback |
| --- | ---: | ---: | ---: | ---: | --- |
| Base (45 EUR, LLM 9.00) | 32.64 (73%) | 7 | +4,814 | +2,014 | month 10 |
| **Volume x0.5** | 32.64 (73%) | 7 | +1,093 | **-1,707** | not in year 1 |
| Volume x0.8 (built-in) | 32.64 | 7 | +3,326 | +526 | month 12 |
| **Price 29** (Starter-heavy mix) | 16.64 (57%) | 14 | +1,166 | **-1,634** | not in year 1 |
| Price 69 | 56.64 (82%) | 4 | +10,286 | +7,486 | month 7 |
| LLM high (2,500 conversations on GPT-5 mini, 16.80) | 24.84 (55%) | 9 | +3,036 | +236 | month 12 |
| LLM high **and** volume x0.5 | 24.84 (55%) | 9 | +204 | -2,596 | not in year 1 |

*Note on the price-29 run:* the tool keeps every variable line fixed, so Stripe stays at 1.56 EUR. The real fee would be about 1.09 EUR, which makes the 29 EUR case about 0.47 EUR per account better than shown.

- **Halving the ramp turns year 1 negative after startup costs.** The ramp is the founder's 610-prospect outreach plan, and it is a target, not a forecast.
- **A Starter-heavy mix (ARPA 29) does the same, and it doubles break-even to 14 accounts.**
- **LLM cost is the swing cost:** between 2.20 and 16.80 EUR per account, contribution moves from 88% to 55%.

## Three ways to improve the margin (each one run, not guessed)
1. **Default to a cheaper model and cache prompts.** At 2.20 EUR LLM per account (Gemini 2.5 Flash-Lite pricing, 1,000 conversations), contribution goes from 73% to **88%**. Year 1 goes from +4,814 to **+6,364**, and payback moves to month 8. Escalate to the dearer model only for action turns.
2. **Sell Growth at 49 and keep Starter as a decoy.** At ARPA 49, contribution is 75% and break-even is 6. Year 1 is **+5,726** and payback is month 9. A real 69 EUR price point (for example, A/B report plus actions) would give **+10,286**.
3. **Cap free-plan inference.** At 0.50 EUR instead of 1.50 per paying account (for example, 100 to 30 free conversations, or a smaller model on free), contribution is 75% and year 1 is **+5,042** (+228 EUR). This is small but cheap to do. Hard caps also stop one heavy free user from costing more than a paying one.

## Board money conditions (`founder/board.md`)
- **"Gross margin above ~70% at the entry price": NOT met as priced.** At the blended 45 EUR the base case is 73%, so it passes. But the entry price is Starter at 19 EUR with 1,000 conversations. A Starter account that uses its full cap costs 6.00 + 1.50 + 0.80 + 0.30 = 8.60 EUR, which leaves **55%** (tool run on 19 EUR). To fix it, cut the Starter cap to about 400 conversations, or put Starter on Flash-Lite only.
- **"Cost per conversation measured": NOT met.** It is still an estimate. Log tokens per conversation from pilot #1 and replace the 9.00 EUR line.
- **"5-10 paying pilots within 30 days":** this is the ramp's month 1-2 (2 then 7 average). The whole positive result depends on it.
- **"Inference costs vs cheap flat plans" (risk 5):** handled only if hard caps stay in the offer, as pitch-v2 promises.

---

# Unit economics: Mascott (AI guide with a face for small B2B SaaS; all amounts in EUR, the tool prints a $ sign)

Every number below comes from the input file. Nothing is looked up or guessed.

## One paying client-month

| line | per paying client-month |
| --- | ---: |
| Price | $45.00 |
| LLM inference: 1,500 conversations x ~0.006 EUR (cheap model, actions on) - ESTIMATE, range 2.20-16.80 | -$9.00 |
| Free-plan inference carried per paying account (~8 free accounts x ~30 conv x 0.006) - ESTIMATE | -$1.50 |
| Stripe: ~2.2% blended card fee + 0.25 EUR + 0.7% Billing, on 45 EUR | -$1.56 |
| Hosting share per active site (storage, logs, widget bandwidth) - ESTIMATE | -$0.30 |
| **Contribution** (what each paying client-month leaves to pay the fixed costs) | **$32.64** (73%) |

## The margin that matters

Fixed costs: $219 a month (Tools: AI coding seats, email, analytics, error tracking (ASSUMED) $110, Hosting base: server/serverless, DB, CDN (ASSUMED) $25, Accountant + bank fees, French SASU low tier (ASSUMED) $45, Legal/insurance: RC Pro + DPA upkeep (ASSUMED) $35, Domains: main + outreach domain, ~50 EUR/yr (ASSUMED) $4).

- **Break-even: 7 paying client-months a day.** Below that you lose money every month.
- **Profit margin at your plan** (30 a day): **56%** of every sale, after every cost.

## Year 1, month by month

| month | paying client-months a day | revenue | profit | cumulative (after $2,800 startup) |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 2 | $90 | -$154 | -$2,954 |
| 2 | 7 | $315 | $9 | -$2,944 |
| 3 | 12 | $540 | $173 | -$2,772 |
| 4 | 15 | $675 | $271 | -$2,501 |
| 5 | 17 | $765 | $336 | -$2,165 |
| 6 | 19 | $855 | $401 | -$1,764 |
| 7 | 21 | $945 | $466 | -$1,297 |
| 8 | 23 | $1,035 | $532 | -$766 |
| 9 | 25 | $1,125 | $597 | -$169 |
| 10 | 27 | $1,215 | $662 | $494 |
| 11 | 29 | $1,305 | $728 | $1,221 |
| 12 | 31 | $1,395 | $793 | $2,014 |

- **Year 1 operating profit: $4,814** on $10,260 of revenue.
- After the $2,800 startup spend: $2,014.
- Startup money earned back: month 10.
- Cash you need before it pays for itself: **$2,954**.

## What if

| scenario | margin at plan | break-even a day | year 1 profit |
| --- | ---: | ---: | ---: |
| Base plan | 56% | 7 | $4,814 |
| Price -10% | 51% | 8 | $3,788 |
| Volume -20% | 52% | 7 | $3,326 |
| Unit costs +15% | 52% | 8 | $4,391 |

No red flags in these numbers. They are only as good as the inputs: check every cost against a real quote.
