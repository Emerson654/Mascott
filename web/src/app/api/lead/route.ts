import { clientIp, json, rateLimited, readJson } from "@/lib/server/http";
import { clean, isEmail } from "@/lib/server/mascot";
import { notify } from "@/lib/server/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Body: { email, company?, plan?, note?, website? }. `website` is a honeypot: keep it hidden and empty in the form. */
export async function POST(req: Request) {
  const body = await readJson(req, 4_000);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!body || !isEmail(email)) return json({ ok: false, error: "Please enter a valid email." }, 400);
  // Bots fill every field: pretend success, notify nobody.
  if (clean(body.website, 200) || rateLimited(`lead:${clientIp(req)}`, 5, 60_000)) return json({ ok: true });
  await notify("New lead", {
    email,
    company: clean(body.company, 120),
    plan: clean(body.plan, 40),
    note: clean(body.note, 1000),
  });
  return json({ ok: true });
}
