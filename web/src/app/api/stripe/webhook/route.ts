import { json, readText } from "@/lib/server/http";
import { notify } from "@/lib/server/notify";
import { verifyStripeSignature } from "@/lib/server/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return json({ error: "Webhook not configured" }, 503);
  const raw = await readText(req, 512_000);
  if (raw === null || !verifyStripeSignature(raw, req.headers.get("stripe-signature"), secret))
    return json({ error: "Invalid signature" }, 400);

  let event: { type?: string; data?: { object?: Record<string, unknown> } };
  try {
    event = JSON.parse(raw);
  } catch {
    return json({ error: "Invalid payload" }, 400);
  }
  if (event.type === "checkout.session.completed") {
    const s = event.data?.object || {};
    const details = (s.customer_details || {}) as Record<string, unknown>;
    const meta = (s.metadata || {}) as Record<string, unknown>;
    await notify("New customer (Stripe checkout completed)", {
      email: String(details.email || s.customer_email || ""),
      plan: String(meta.plan || ""),
      billing: String(meta.billing || ""),
      amount: typeof s.amount_total === "number" ? `${(s.amount_total / 100).toFixed(2)} ${String(s.currency || "").toUpperCase()}` : undefined,
      session: String(s.id || ""),
    });
  }
  return json({ received: true });
}
