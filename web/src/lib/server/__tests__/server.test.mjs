// Run: node --test src/lib/server/__tests__/server.test.mjs   (Node >= 22.18 strips TS types natively)
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { generateFallback, mergeAi, sanitizeOnboarding, cannedReply, clampWords } from "../mascot.ts";
import { verifyStripeSignature } from "../stripe.ts";

const HEX = /^#[0-9A-F]{6}$/i;
const SPECIES = ["blob", "cat", "bear", "bunny", "fox", "owl", "robot", "dragon"];

test("sanitize bounds and coerces hostile input", () => {
  const d = sanitizeOnboarding({ prompt: "x".repeat(5000), tone: "evil", goals: "nope", actions: ["answer", "rm -rf"],
    behaviour: { handoffEmail: "not-an-email" }, mascot: { species: "unicorn", primary: "red", accent: "#00ff00", name: "Zed" } });
  assert.equal(d.prompt.length, 600);
  assert.equal(d.tone, "friendly");
  assert.deepEqual(d.goals, []);
  assert.deepEqual(d.actions, ["answer"]);
  assert.equal(d.behaviour.handoffEmail, "");
  assert.deepEqual(d.mascot, { accent: "#00FF00", name: "Zed" });
  assert.doesNotThrow(() => sanitizeOnboarding(null));
});

test("fallback is valid, deterministic and keyword-driven", () => {
  const d = sanitizeOnboarding({ prompt: "a blue robot for our developer API docs", company: { name: "Acme", industry: "devtools" },
    tone: "playful", pages: ["Docs", "Signup"], behaviour: { handoffEmail: "help@acme.io" } });
  const a = generateFallback(d);
  assert.deepEqual(a, generateFallback(d));
  assert.equal(a.source, "fallback");
  assert.equal(a.spec.species, "robot");
  assert.equal(a.spec.primary, "#5B8CFF");
  for (const k of ["primary", "secondary", "accent"]) assert.match(a.spec[k], HEX);
  assert.equal(a.sampleDialog.length, 3);
  assert.ok(a.systemPrompt.includes("Acme") && a.systemPrompt.includes("help@acme.io") && a.systemPrompt.includes("Docs, Signup"));
  assert.ok(a.greeting.includes(a.name));
});

test("fallback guesses species from industry and respects user choices", () => {
  assert.equal(generateFallback(sanitizeOnboarding({ company: { industry: "fintech accounting" } })).spec.species, "owl");
  const user = generateFallback(sanitizeOnboarding({ prompt: "a robot", mascot: { species: "cat", primary: "#112233", name: "Kiki" } }));
  assert.equal(user.spec.species, "cat");
  assert.equal(user.spec.primary, "#112233");
  assert.equal(user.name, "Kiki");
  const any = generateFallback(sanitizeOnboarding({}));
  assert.ok(SPECIES.includes(any.spec.species));
});

test("mergeAi keeps valid AI fields, rejects invalid ones, user choices win", () => {
  const d = sanitizeOnboarding({ prompt: "fox", mascot: { primary: "#000000" } });
  const r = mergeAi(d, { species: "unicorn", primary: "#ABCDEF", secondary: "pink", eyes: "sparkle", name: "Foxy",
    greeting: "Hi!", sampleDialog: [{ q: "a", a: "b" }], systemPrompt: "short" });
  assert.equal(r.source, "ai");
  assert.equal(r.spec.species, "fox");      // invalid enum ignored -> fallback
  assert.equal(r.spec.primary, "#000000");  // user choice wins
  assert.match(r.spec.secondary, HEX);
  assert.equal(r.spec.eyes, "sparkle");
  assert.equal(r.name, "Foxy");
  assert.equal(r.sampleDialog.length, 3);   // incomplete dialog replaced
  assert.ok(r.systemPrompt.length > 200);   // too-short prompt replaced
  assert.equal(mergeAi(d, null).source, "fallback");
});

test("canned replies and word clamp", () => {
  const m = generateFallback(sanitizeOnboarding({ behaviour: { handoffEmail: "team@x.io" } }));
  assert.match(cannedReply(m, "can I talk to a human?"), /team@x\.io/);
  assert.match(cannedReply(m, "what's the price?"), /pricing/);
  assert.equal(clampWords(Array(100).fill("w").join(" "), 60).split(" ").length, 60);
});

test("stripe signature: valid, tampered, expired, wrong secret", () => {
  const secret = "whsec_test", body = '{"type":"checkout.session.completed"}', t = 1_700_000_000;
  const sig = createHmac("sha256", secret).update(`${t}.${body}`).digest("hex");
  const header = `t=${t},v1=deadbeef,v1=${sig}`;
  assert.equal(verifyStripeSignature(body, header, secret, 300, t + 10), true);
  assert.equal(verifyStripeSignature(body + " ", header, secret, 300, t + 10), false);
  assert.equal(verifyStripeSignature(body, header, secret, 300, t + 301), false);
  assert.equal(verifyStripeSignature(body, header, "whsec_other", 300, t), false);
  assert.equal(verifyStripeSignature(body, null, secret), false);
  assert.equal(verifyStripeSignature(body, "garbage", secret), false);
});
