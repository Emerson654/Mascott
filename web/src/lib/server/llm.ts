// Provider chain: Google Gemini (GEMINI_API_KEY) then xAI Grok (XAI_API_KEY). Plain fetch, no SDK.
// Every call shares one deadline; any error or timeout returns null so callers can fall back.

export type ChatMsg = { role: "user" | "assistant"; content: string };
/** images: inline JPEG/PNG/WebP (base64) attached to the last user message; Gemini only, xAI ignores them. */
type Opts = { system: string; messages: ChatMsg[]; schema?: object; maxTokens: number; timeoutMs: number; images?: { mime: string; data: string }[] };

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const XAI_URL = "https://api.x.ai/v1/chat/completions";

export function hasProvider(): boolean {
  return !!(process.env.GEMINI_API_KEY || process.env.XAI_API_KEY);
}

async function gemini(o: Opts, signal: AbortSignal): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const model = process.env.GEMINI_MODEL || "gemini-flash-lite-latest";
  const res = await fetch(`${GEMINI_URL}/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    signal,
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: o.system }] },
      contents: o.messages.map((m, i) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [
          ...(i === o.messages.length - 1 && m.role === "user" ? (o.images ?? []).map((im) => ({ inlineData: { mimeType: im.mime, data: im.data } })) : []),
          { text: m.content },
        ],
      })),
      generationConfig: {
        temperature: o.schema ? 0.9 : 0.6,
        maxOutputTokens: o.maxTokens,
        ...(o.schema ? { responseMimeType: "application/json", responseSchema: o.schema } : {}),
        // 2.5 models "think" by default, which eats the token budget and the 10 s deadline.
        ...(/2\.5-flash/.test(model) ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
      },
    }),
  });
  if (!res.ok) throw new Error(`gemini ${res.status}`);
  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts;
  const text = Array.isArray(parts) ? parts.filter((p: { thought?: boolean }) => !p.thought).map((p: { text?: string }) => p.text || "").join("") : "";
  return text || null;
}

async function xai(o: Opts, signal: AbortSignal): Promise<string | null> {
  const key = process.env.XAI_API_KEY;
  if (!key) return null;
  const res = await fetch(XAI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    signal,
    body: JSON.stringify({
      model: process.env.XAI_MODEL || "grok-3-mini",
      max_tokens: o.maxTokens,
      temperature: o.schema ? 0.9 : 0.6,
      ...(o.schema ? { response_format: { type: "json_object" } } : {}),
      messages: [
        { role: "system", content: o.schema ? `${o.system}\nReply with one JSON object matching this schema: ${JSON.stringify(o.schema)}` : o.system },
        ...o.messages,
      ],
    }),
  });
  if (!res.ok) throw new Error(`xai ${res.status}`);
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  return typeof text === "string" && text ? text : null;
}

/** Returns the first provider's text, or null if none is configured / all fail / deadline passes. */
export async function complete(o: Opts): Promise<string | null> {
  const deadline = Date.now() + o.timeoutMs;
  for (const [name, provider] of [["gemini", gemini], ["xai", xai]] as const) {
    const left = deadline - Date.now();
    if (left < 500) return null;
    try {
      const out = await provider(o, AbortSignal.timeout(left));
      if (out) return out;
    } catch (e) {
      console.error(`[llm] ${name} failed:`, e instanceof Error ? e.message : "error");
    }
  }
  return null;
}

/** Parses a model's JSON answer, tolerating ```json fences. */
export function parseJson(text: string | null): unknown {
  if (!text) return null;
  const s = text.replace(/^\s*```(?:json)?/i, "").replace(/```\s*$/, "").trim();
  try {
    return JSON.parse(s);
  } catch {
    const a = s.indexOf("{"), b = s.lastIndexOf("}");
    if (a < 0 || b <= a) return null;
    try {
      return JSON.parse(s.slice(a, b + 1));
    } catch {
      return null;
    }
  }
}
