// Small helpers shared by every route handler: bounded JSON body, clean JSON replies, best-effort rate limit.
import { NextResponse } from "next/server";

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

/** Reads the raw body as text, refusing anything larger than maxBytes. Returns null if too big or unreadable. */
export async function readText(req: Request, maxBytes: number): Promise<string | null> {
  const declared = Number(req.headers.get("content-length") || 0);
  if (declared > maxBytes) return null;
  try {
    const buf = await req.arrayBuffer();
    if (buf.byteLength > maxBytes) return null;
    return new TextDecoder().decode(buf);
  } catch {
    return null;
  }
}

/** Parses a bounded JSON object body. Returns null on oversize, invalid JSON or non-object. */
export async function readJson(req: Request, maxBytes: number): Promise<Record<string, unknown> | null> {
  const text = await readText(req, maxBytes);
  if (text === null) return null;
  try {
    const data: unknown = JSON.parse(text);
    return data && typeof data === "object" && !Array.isArray(data) ? (data as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0] : req.headers.get("x-real-ip") || "unknown").trim();
}

// ponytail: in-memory per-instance limiter, resets on cold start and is not shared across
// serverless instances. Move to Upstash/Vercel KV if abuse shows up.
const buckets = new Map<string, { count: number; reset: number }>();
export function rateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  if (buckets.size > 5000) for (const [k, b] of buckets) if (b.reset < now) buckets.delete(k);
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return false;
  }
  b.count++;
  return b.count > max;
}
