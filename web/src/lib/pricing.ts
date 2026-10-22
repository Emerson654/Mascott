// Single source of truth for Mascott plans and prices (owner: Inès, pricing & Stripe).
// Amounts are EUR, before VAT. Stripe price ids live in env vars
// STRIPE_PRICE_<PLANID>_MONTHLY / STRIPE_PRICE_<PLANID>_YEARLY (see docs/stripe-setup.md).

export type PlanId = "starter" | "growth" | "scale";
export type Billing = "monthly" | "yearly";

export type Plan = {
  id: PlanId;
  name: string;
  tagline: string;
  /** EUR per month, billed monthly. */
  monthly: number;
  /** EUR per month, billed yearly (yearly total = 10 x monthly: 2 months free, about -17%). */
  yearly: number;
  /** Mascot conversations included per month (soft cap: we warn, never surprise-bill). */
  conversations: number;
  /** Websites or apps the mascot can be installed on. */
  sites: number;
  features: string[];
  highlighted?: boolean;
  cta: string;
};

export const CURRENCY = "EUR";
export const GUARANTEE_DAYS = 30;

/** Yearly total = 10 months: "2 months free". Per-month figure kept to the cent. */
const perMonthYearly = (monthly: number) => Math.round(((monthly * 10) / 12) * 100) / 100;

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Your mascot live on one site. Answers questions and points the way.",
    monthly: 19,
    yearly: perMonthYearly(19),
    conversations: 300,
    sites: 1,
    features: [
      "1 mascot on 1 website or app",
      "300 conversations / month",
      "Answers from your pages and docs",
      "Points visitors to the next step",
      "Small \"Made with Mascott\" badge",
      "Email support",
    ],
    cta: "Start with Starter",
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "For SaaS teams that want visitors to actually activate.",
    monthly: 49,
    yearly: perMonthYearly(49),
    conversations: 1500,
    sites: 3,
    features: [
      "Everything in Starter",
      "Up to 3 websites or apps",
      "1,500 conversations / month",
      "Guided actions: clicks, highlights, form help",
      "Onboarding checklists and step-by-step tours",
      "Activation analytics",
      "No Mascott badge",
      "Priority email support",
    ],
    highlighted: true,
    cta: "Get Growth",
  },
  {
    id: "scale",
    name: "Scale",
    tagline: "For bigger traffic, several products, or agencies running client sites.",
    monthly: 149,
    yearly: perMonthYearly(149),
    conversations: 6000,
    sites: 10,
    features: [
      "Everything in Growth",
      "Up to 10 websites or apps",
      "6,000 conversations / month",
      "Several mascots and personalities",
      "Onboarding call with the founders",
      "Fastest support (same business day)",
    ],
    cta: "Get Scale",
  },
];

/**
 * Honest launch offer: real end date, real cap, enforced by the Stripe coupon itself
 * (max_redemptions + redeem_by). Monthly billing only, applied server-side by /api/checkout
 * when STRIPE_LAUNCH_COUPON is set. Set to null after the end date.
 */
export const LAUNCH_OFFER: {
  label: string;
  percentOff: number;
  months: number;
  appliesTo: Billing;
  maxCustomers: number;
  endsAt: string; // ISO date, inclusive (Europe/Paris)
} | null = {
  label: "Founding customers: 30% off your first 3 months",
  percentOff: 30,
  months: 3,
  appliesTo: "monthly",
  maxCustomers: 50,
  endsAt: "2026-12-31",
};

export function getPlan(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

/** True while the launch offer is valid on the given date. */
export function launchOfferActive(now: Date = new Date()): boolean {
  return !!LAUNCH_OFFER && now <= new Date(`${LAUNCH_OFFER.endsAt}T23:59:59+01:00`);
}

/** "€49", "€40.83". Integers without decimals, otherwise 2 decimals. */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: CURRENCY,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** What the customer pays per invoice: monthly price, or the yearly total. */
export function invoiceAmount(plan: Plan, billing: Billing): number {
  return billing === "monthly" ? plan.monthly : plan.monthly * 10;
}
