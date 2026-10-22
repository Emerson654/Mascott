// Lead / sale notifications: LEAD_WEBHOOK_URL (Slack, Make, Zapier…) and/or Resend email, else console.
// Never throws: a failed notification must not break the visitor's request.

export async function notify(subject: string, fields: Record<string, string | number | undefined>): Promise<void> {
  const lines = Object.entries(fields)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${k}: ${v}`);
  const text = `${subject}\n${lines.join("\n")}`;
  const tasks: Promise<unknown>[] = [];

  const hook = process.env.LEAD_WEBHOOK_URL;
  if (hook) {
    // `text` makes it render in Slack; the raw fields are there for Make/Zapier.
    tasks.push(post(hook, { "Content-Type": "application/json" }, { text, subject, ...fields }));
  }
  const resendKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_NOTIFY_EMAIL;
  if (resendKey && to) {
    tasks.push(
      post("https://api.resend.com/emails", { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` }, {
        from: process.env.LEAD_FROM_EMAIL || "Mascott <onboarding@resend.dev>",
        to: [to],
        subject: `[Mascott] ${subject}`,
        text,
      }),
    );
  }
  if (!tasks.length) {
    console.log(`[notify] ${text.replace(/\n/g, " | ")}`);
    return;
  }
  await Promise.allSettled(tasks);
}

async function post(url: string, headers: Record<string, string>, body: unknown) {
  try {
    const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body), signal: AbortSignal.timeout(5000) });
    if (!res.ok) console.error(`[notify] ${new URL(url).host} -> ${res.status}`);
  } catch (e) {
    console.error(`[notify] ${new URL(url).host} failed:`, e instanceof Error ? e.message : "error");
  }
}
