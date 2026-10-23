import { clientIp, json, rateLimited } from "@/lib/server/http";
import { imageSecret, renderImage, verifyImage } from "@/lib/server/image";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// GET /api/mascot-image?d=<base64url {prompt, seed}>&s=<hmac>. Only prompts signed by our server render.
// Responses are immutable, so Vercel's CDN serves repeats without calling us again.
export async function GET(req: Request) {
  const secret = imageSecret();
  if (!secret) return json({ error: "Images disabled" }, 404);
  const q = new URL(req.url).searchParams;
  const payload = verifyImage(q.get("d"), q.get("s"), secret);
  if (!payload) return json({ error: "Invalid signature" }, 403);
  if (rateLimited(`img:${clientIp(req)}`, 30, 60_000)) return json({ error: "Too many requests" }, 429);
  const img = await renderImage(payload.prompt, payload.seed);
  if (!img) return json({ error: "Image unavailable" }, 404);
  return new Response(img.bytes, {
    headers: {
      "Content-Type": img.type,
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "X-Image-Provider": img.provider,
    },
  });
}
