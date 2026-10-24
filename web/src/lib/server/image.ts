// Signed mascot artwork URLs and the image provider chain behind GET /api/mascot-image.
// The HMAC stops anyone from using the route as a free image proxy: only prompts we signed render.
// No value imports from the app so `node --test` can load this file directly.
import { createHmac, timingSafeEqual } from "node:crypto";

export const MAX_PROMPT = 900;
const DEV_SECRET = "mascott-dev-only-image-secret"; // not a secret: only used outside production
// Anonymous endpoint (default model, ~5 s; free tier = 1 image / 45 s per IP). With POLLINATIONS_API_KEY, the keyed gateway.
const POLLINATIONS_FREE = "https://image.pollinations.ai/prompt";
const POLLINATIONS_KEYED = "https://gen.pollinations.ai/image";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const MAX_BYTES = 8_000_000;

/** MASCOT_IMAGE_SECRET, or a constant dev secret outside production. Null in production without it (route disabled). */
export function imageSecret(): string | null {
  return process.env.MASCOT_IMAGE_SECRET || (process.env.NODE_ENV !== "production" ? DEV_SECRET : null);
}

function mac(d: string, secret: string): string {
  return createHmac("sha256", secret).update(d).digest("base64url");
}

export function signImage(prompt: string, seed: number, secret: string): { d: string; s: string } {
  const d = Buffer.from(JSON.stringify({ prompt: prompt.slice(0, MAX_PROMPT), seed: Math.abs(Math.trunc(seed)) % 2 ** 31 })).toString("base64url");
  return { d, s: mac(d, secret) };
}

/** Returns the signed payload, or null if the signature or the payload is invalid. Timing-safe. */
export function verifyImage(d: unknown, s: unknown, secret: string): { prompt: string; seed: number } | null {
  if (typeof d !== "string" || typeof s !== "string" || d.length > 2000 || !/^[\w-]+$/.test(d)) return null;
  const want = Buffer.from(mac(d, secret)), got = Buffer.from(s);
  if (want.length !== got.length || !timingSafeEqual(want, got)) return null;
  try {
    const o = JSON.parse(Buffer.from(d, "base64url").toString("utf8"));
    if (typeof o?.prompt !== "string" || !o.prompt || o.prompt.length > MAX_PROMPT || !Number.isInteger(o.seed) || o.seed < 0) return null;
    return { prompt: o.prompt, seed: o.seed };
  } catch {
    return null;
  }
}

/** Relative URL of the signed artwork, or undefined when images are disabled (client then shows the SVG). */
export function mascotImageUrl(prompt: string, seed: number): string | undefined {
  const secret = imageSecret();
  if (!secret || !prompt) return undefined;
  const { d, s } = signImage(prompt, seed, secret);
  return `/api/mascot-image?d=${d}&s=${s}`;
}

export function randomSeed(): number {
  return Math.floor(Math.random() * 2 ** 31);
}

type Img = { bytes: ArrayBuffer; type: string; provider: string };

async function geminiImage(prompt: string, signal: AbortSignal): Promise<Img | null> {
  const key = process.env.GEMINI_API_KEY, model = process.env.GEMINI_IMAGE_MODEL;
  if (!key || !model) return null;
  const res = await fetch(`${GEMINI_URL}/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    signal,
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: "1:1" } },
    }),
  });
  if (!res.ok) throw new Error(`gemini-image ${res.status}`);
  const data = await res.json();
  const parts: { inlineData?: { mimeType?: string; data?: string } }[] = data?.candidates?.[0]?.content?.parts ?? [];
  const img = parts.find((p) => p.inlineData?.data && p.inlineData.mimeType?.startsWith("image/"))?.inlineData;
  if (!img?.data) return null;
  const buf = Buffer.from(img.data, "base64");
  return { bytes: buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer, type: img.mimeType!, provider: "gemini" };
}

async function pollinations(prompt: string, seed: number, signal: AbortSignal): Promise<Img | null> {
  const key = process.env.POLLINATIONS_API_KEY;
  const url = `${key ? POLLINATIONS_KEYED : POLLINATIONS_FREE}/${encodeURIComponent(prompt)}?width=768&height=768&seed=${seed}&nologo=true`;
  const res = await fetch(url, { signal, headers: key ? { Authorization: `Bearer ${key}` } : {} });
  const type = (res.headers.get("content-type") || "").split(";")[0].trim();
  if (!res.ok || !/^image\/(png|jpeg|webp)$/.test(type)) throw new Error(`pollinations ${res.status} ${type}`);
  const bytes = await res.arrayBuffer();
  if (bytes.byteLength < 100 || bytes.byteLength > MAX_BYTES) throw new Error(`pollinations size ${bytes.byteLength}`);
  return { bytes, type, provider: "pollinations" };
}

/** Gemini image (only if GEMINI_IMAGE_MODEL is set) then Pollinations. Null if every provider fails. */
export async function renderImage(prompt: string, seed: number, timeoutMs = 25_000): Promise<Img | null> {
  for (const [name, run] of [["gemini", () => geminiImage(prompt, AbortSignal.timeout(timeoutMs))], ["pollinations", () => pollinations(prompt, seed, AbortSignal.timeout(timeoutMs))]] as const) {
    try {
      const out = await run();
      if (out) return out;
    } catch (e) {
      console.error(`[image] ${name} failed:`, e instanceof Error ? e.message : "error");
    }
  }
  return null;
}
