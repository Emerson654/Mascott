import { getPlan, launchOfferActive, type Billing } from "@/lib/pricing";
import { json, readJson } from "@/lib/server/http";
import { createCheckoutSession } from "@/lib/server/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FALLBACK_URL = "/pricing#pilot";

export async function POST(req: Request) {
  const body = await readJson(req, 2_000);
  const plan = typeof body?.planId === "string" ? getPlan(body.planId) : undefined;
  const billing = body?.billing === "monthly" || body?.billing === "yearly" ? (body.billing as Billing) : null;
  if (!plan || !billing) return json({ error: "Unknown plan or billing period" }, 400);

  const env = `${plan.id.toUpperCase()}_${billing.toUpperCase()}`;
  const secret = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env[`STRIPE_PRICE_${env}`];
  if (secret && priceId) {
    // Fixed origin from env when set, so a spoofed Host header cannot redirect the buyer elsewhere.
    const origin = (process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin).replace(/\/$/, "");
    const coupon = billing === "monthly" && launchOfferActive() ? process.env.STRIPE_LAUNCH_COUPON : undefined;
    const url = await createCheckoutSession(secret, priceId, origin, { plan: plan.id, billing }, coupon);
    if (url) return json({ url });
  }
  const link = process.env[`NEXT_PUBLIC_STRIPE_LINK_${env}`];
  if (link && /^https:\/\//.test(link)) return json({ url: link });
  return json({ url: FALLBACK_URL });
}
