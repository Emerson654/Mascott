// Run: node --test src/lib/server/__tests__/*.test.mjs   (Node >= 22.18 strips TS types natively)
import { test } from "node:test";
import assert from "node:assert/strict";
import { signImage, verifyImage, mascotImageUrl, renderImage } from "../image.ts";
import { generateFallback, mergeAi, sanitizeOnboarding, cleanImages, fallbackScan, sanitizeScan, colorName, artPromptFromSpec } from "../mascot.ts";

const PNG = "data:image/png;base64," + Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(64)]).toString("base64");
const JPEG = "data:image/jpeg;base64," + Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(64)]).toString("base64");

test("image signature: valid, tampered, wrong secret, bad payload", () => {
  const { d, s } = signImage("a glossy orb", 42, "k1");
  assert.deepEqual(verifyImage(d, s, "k1"), { prompt: "a glossy orb", seed: 42 });
  assert.equal(verifyImage(d, s, "k2"), null);
  assert.equal(verifyImage(d, s.slice(0, -1) + (s.endsWith("A") ? "B" : "A"), "k1"), null);
  const other = signImage("another prompt", 42, "k1");
  assert.equal(verifyImage(other.d, s, "k1"), null);
  assert.equal(verifyImage(null, s, "k1"), null);
  assert.equal(verifyImage("bad payload!", s, "k1"), null);
  assert.equal(signImage("x".repeat(2000), 1, "k").d.length < 1300, true); // prompt capped at 900
});

test("signed URL is built from the env secret (dev fallback outside production)", () => {
  const url = mascotImageUrl("a felt fox", 7);
  assert.match(url, /^\/api\/mascot-image\?d=[\w-]+&s=[\w-]+$/);
  const q = new URL(url, "http://x").searchParams;
  assert.equal(verifyImage(q.get("d"), q.get("s"), "mascott-dev-only-image-secret").prompt, "a felt fox");
  const prev = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  delete process.env.MASCOT_IMAGE_SECRET;
  assert.equal(mascotImageUrl("a felt fox", 7), undefined); // prod without secret: disabled
  process.env.MASCOT_IMAGE_SECRET = "prod-secret";
  assert.ok(verifyImage(...[...new URL(mascotImageUrl("p", 1), "http://x").searchParams.values()], "prod-secret"));
  process.env.NODE_ENV = prev;
  delete process.env.MASCOT_IMAGE_SECRET;
});

test("renderImage: Pollinations bytes, rejects non-image, null when all fail", async () => {
  const realFetch = globalThis.fetch;
  try {
    let called = "";
    globalThis.fetch = async (url) => { called = String(url); return new Response(new Uint8Array(500), { headers: { "content-type": "image/jpeg" } }); };
    const img = await renderImage("cute orb", 9);
    assert.equal(img.type, "image/jpeg");
    assert.equal(img.provider, "pollinations");
    assert.match(called, /^https:\/\/image\.pollinations\.ai\/prompt\/cute%20orb\?width=768&height=768&seed=9&nologo=true&model=flux$/);
    globalThis.fetch = async () => new Response("<html>rate limited</html>", { headers: { "content-type": "text/html" } });
    assert.equal(await renderImage("cute orb", 9), null);
    globalThis.fetch = async () => { throw new Error("network"); };
    assert.equal(await renderImage("cute orb", 9), null);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("uploads: only real small JPEG/PNG/WebP data URLs, max 3", () => {
  const fake = "data:image/png;base64," + Buffer.from("<svg onload=alert(1)>").toString("base64");
  const big = "data:image/jpeg;base64," + Buffer.concat([Buffer.from([0xff, 0xd8, 0xff]), Buffer.alloc(460_000)]).toString("base64");
  const out = cleanImages([{ name: "logo.png", dataUrl: PNG }, { dataUrl: fake }, { dataUrl: big }, { dataUrl: "data:image/svg+xml;base64,AAAA" }, { dataUrl: JPEG }, { dataUrl: JPEG }]);
  assert.deepEqual(out.map((x) => x.name), ["logo.png"]); // only first 3 entries looked at, only the real PNG kept
  assert.equal(cleanImages([{ dataUrl: JPEG }, { dataUrl: JPEG }, { dataUrl: JPEG }, { dataUrl: JPEG }]).length, 3);
  assert.deepEqual(cleanImages("nope"), []);
});

test("brand scan fallback: palette from colours, 3-6 valid hex, motifs from notes", () => {
  const s = fallbackScan({ colors: ["#ff7a1a", "nope", "#1B2A4A"], notes: "Freelancers, invoices, calm evenings, paper textures", company: { name: "Billy", industry: "invoicing" } });
  assert.ok(s.palette.length >= 3 && s.palette.length <= 6);
  assert.equal(s.palette[0], "#FF7A1A");
  for (const c of s.palette) assert.match(c, /^#[0-9A-F]{6}$/);
  assert.ok(s.motifs.includes("invoices"));
  assert.ok(s.mood.length > 0 && s.audience.includes("invoicing"));
  const empty = fallbackScan({});
  assert.equal(empty.palette.length, 3);
  assert.equal(sanitizeScan({ palette: ["red"], mood: "" }), undefined);
});

test("generate fallback: thoughts, concept, art prompt from brand colours, varied directions", () => {
  const d = sanitizeOnboarding({
    prompt: "", company: { name: "Billy", industry: "invoicing for freelancers" }, audience: "freelancers", tone: "friendly",
    brand: { colors: ["#FF7A1A", "#1B2A4A"], vibe: ["calm"], notes: "", images: [{ name: "x", dataUrl: PNG }] },
  });
  assert.equal(d.brand.images.length, 1);
  const a = generateFallback(d, 0);
  assert.ok(a.thoughts.length >= 5 && a.thoughts.length <= 7);
  assert.match(a.thoughts[0], /Billy's palette/);
  assert.equal(a.spec.primary, "#FF7A1A");
  assert.ok(a.artPrompt.includes("#FF7A1A") && /no text, no logo/.test(a.artPrompt) && a.artPrompt.length <= 900);
  assert.ok(a.spec.concept);
  const concepts = new Set(Array.from({ length: 12 }, (_, i) => generateFallback(d, i).spec.concept));
  assert.ok(concepts.size >= 2, "variants explore several directions");
  assert.ok([...concepts].some((c) => c.includes("invoice")), "obvious product object is offered");
  assert.equal(colorName("#1B2A4A"), "deep navy");
  assert.ok(artPromptFromSpec({ species: "owl", primary: "#5CC8C0", secondary: "#E3F7F5", accent: "#FFC46B", eyes: "round", accessory: "none", style: "pro" }).includes("#5CC8C0"));
});

test("mergeAi keeps AI art prompt + thoughts, guards bad ones", () => {
  const d = sanitizeOnboarding({ company: { name: "Leafy" } });
  const good = "A cute plant creature, sprout body with glossy leaves in a tiny terracotta pot, palette #4CC98A and #FFF0E3, waving";
  const r = mergeAi(d, { artPrompt: good, thoughts: ["one", "two", "three", "four", "five"], concept: "a sprout in a pot" });
  assert.equal(r.source, "ai");
  assert.ok(r.artPrompt.startsWith(good) && /no text/.test(r.artPrompt)); // guard appended
  assert.equal(r.thoughts.length, 5);
  assert.equal(r.spec.concept, "a sprout in a pot");
  const bad = mergeAi(d, { artPrompt: "tiny", thoughts: ["just one"] });
  assert.equal(bad.artPrompt, generateFallback(d).artPrompt);
  assert.ok(bad.thoughts.length >= 5);
});
