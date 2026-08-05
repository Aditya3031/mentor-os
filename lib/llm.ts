/**
 * Zero-cost LLM layer — server-side only.
 *
 * Provider fallback chain for structured generation:
 *   1. Gemini Flash (free tier — GEMINI_API_KEY, already used by /api/ai)
 *   2. Groq Llama (free tier — GROQ_API_KEY, optional)
 *   3. throws NoProviderError → callers fall back to non-LLM generation
 *
 * Design rules that keep this free:
 *   - callers batch + cache (generate once per chapter, serve forever)
 *   - JSON mode on every provider (no parsing roulette)
 *   - callers validate output mechanically and silently regenerate
 */

export class NoProviderError extends Error {
  constructor() {
    super("no LLM provider configured");
    this.name = "NoProviderError";
  }
}

export interface LLMResult {
  text: string;
  provider: "gemini" | "groq";
}

interface GenOptions {
  system: string;
  user: string;
  /** Ask the provider for a JSON object response */
  json?: boolean;
  maxTokens?: number;
}

async function callGemini(o: GenOptions): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new NoProviderError();
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: o.system }] },
        contents: [{ role: "user", parts: [{ text: o.user }] }],
        generationConfig: {
          maxOutputTokens: o.maxTokens ?? 2048,
          temperature: 0.4,
          ...(o.json ? { responseMimeType: "application/json" } : {}),
        },
      }),
    }
  );
  if (!res.ok) throw new Error(`gemini ${res.status}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("gemini empty response");
  return text;
}

async function callGroq(o: GenOptions): Promise<string> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new NoProviderError();
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: o.system },
        { role: "user", content: o.user },
      ],
      max_tokens: o.maxTokens ?? 2048,
      temperature: 0.4,
      ...(o.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!res.ok) throw new Error(`groq ${res.status}`);
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("groq empty response");
  return text;
}

/**
 * Try each configured provider in order. Throws NoProviderError only
 * when NO provider has a key; transient provider errors fall through
 * to the next in the chain.
 */
export async function generateText(o: GenOptions): Promise<LLMResult> {
  const chain: { name: LLMResult["provider"]; fn: (o: GenOptions) => Promise<string> }[] = [
    { name: "gemini", fn: callGemini },
    { name: "groq", fn: callGroq },
  ];
  let sawConfigured = false;
  let lastErr: unknown = null;
  for (const p of chain) {
    try {
      const text = await p.fn(o);
      return { text, provider: p.name };
    } catch (err) {
      if (err instanceof NoProviderError) continue;
      sawConfigured = true;
      lastErr = err;
    }
  }
  if (!sawConfigured) throw new NoProviderError();
  throw lastErr instanceof Error ? lastErr : new Error("all providers failed");
}
