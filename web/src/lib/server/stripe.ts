// Stripe over plain REST: Checkout Session creation and webhook signature check (node:crypto).
import { createHmac, timingSafeEqual } from "node:crypto";

/** Verifies a `Stripe-Signature` header (t=…,v1=…) against the raw body. Tolerance in seconds. */
export function verifyStripeSignature(rawBody: string, header: string | null, secret: string, toleranceSec = 300, nowSec = Math.floor(Date.now() / 1000)): boolean {
  if (!header || !secret) return false;
  let t = "";
  const sigs: string[] = [];
  for (const part of header.split(",")) {
    const [k, v] = part.trim().split("=", 2);
    if (k === "t") t = v;
    else if (k === "v1" && v) sigs.push(v);
  }
  const ts = Number(t);
  if (!t || !Number.isFinite(ts) || !sigs.length || Math.abs(nowSec - ts) > toleranceSec) return false;
  const expected = Buffer.from(createHmac("sha256", secret).update(`${t}.${rawBody}`, "utf8").digest("hex"));
  return sigs.some((s) => {
    const got = Buffer.from(s);
    return got.length === expected.length && timingSafeEqual(got, expected);
  });
}

/** Creates a subscription Checkout Session. Returns its URL, or null on any Stripe error. */
export async function createCheckoutSession(
  secretKey: string,
  priceId: string,
  origin: string,
  meta: Record<string, string>,
  coupon?: string,
): Promise<string | null> {
  const form = new URLSearchParams({
    mode: "subscription",
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": "1",
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/create/result`,
    billing_address_collection: "auto",
    // Needs Stripe Tax activated in the dashboard, otherwise Stripe rejects the session (we then fall back).
    "automatic_tax[enabled]": "true",
    "tax_id_collection[enabled]": "true",
  });
  // Stripe refuses discounts[] together with allow_promotion_codes: the launch coupon wins.
  if (coupon) form.set("discounts[0][coupon]", coupon);
  else form.set("allow_promotion_codes", "true");
  for (const [k, v] of Object.entries(meta)) form.set(`metadata[${k}]`, v);
  try {
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
      signal: AbortSignal.timeout(10_000),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || typeof data?.url !== "string") {
      console.error(`[stripe] checkout session failed: ${res.status} ${data?.error?.code || ""}`);
      return null;
    }
    return data.url;
  } catch (e) {
    console.error("[stripe] checkout session error:", e instanceof Error ? e.message : "error");
    return null;
  }
}
