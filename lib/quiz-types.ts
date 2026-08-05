/**
 * Quiz domain types + mechanical validation. Shared by the server
 * generation route and the client store — keep this file free of
 * client-only or server-only imports.
 */

export interface QuizQuestion {
  q: string;
  /** Exactly 4 options */
  options: string[];
  /** Index into options */
  answer: number;
  explanation: string;
  topic: string;
}

export interface QuizBank {
  id: string;
  subject: string;
  createdAt: number;
  /** Which engine produced it — "cloze" is the zero-LLM fallback */
  source: "gemini" | "groq" | "cloze";
  questions: QuizQuestion[];
}

export interface QuizResult {
  bankId: string;
  subject: string;
  score: number;
  total: number;
  weakTopics: string[];
  at: number;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/**
 * Mechanical validation — this is what lets small free-tier models
 * punch above their weight: reject malformed/duplicate/ungrounded
 * questions instead of paying for a bigger model.
 */
export function validateQuestions(
  raw: unknown,
  sourceChunk: string,
  seen: Set<string>
): QuizQuestion[] {
  const out: QuizQuestion[] = [];
  const arr = Array.isArray(raw)
    ? raw
    : typeof raw === "object" && raw !== null
      ? ((raw as Record<string, unknown>).questions as unknown[])
      : null;
  if (!Array.isArray(arr)) return out;
  const chunkNorm = norm(sourceChunk);

  for (const item of arr) {
    if (typeof item !== "object" || item === null) continue;
    const q = item as Record<string, unknown>;
    if (typeof q.q !== "string" || q.q.length < 12) continue;
    if (!Array.isArray(q.options) || q.options.length !== 4) continue;
    const options = q.options.map((o) => String(o).trim());
    if (new Set(options.map(norm)).size !== 4) continue; // dupes
    const answer = Number(q.answer);
    if (!Number.isInteger(answer) || answer < 0 || answer > 3) continue;
    const key = norm(q.q).slice(0, 80);
    if (seen.has(key)) continue; // duplicate question across chunks
    // Grounding: the correct answer should trace back to the notes.
    const grounded = chunkNorm.includes(norm(options[answer]).slice(0, 60));
    if (!grounded && options[answer].length > 3) {
      // keep ungrounded conceptual questions only sparingly
      if (out.length >= 2) continue;
    }
    seen.add(key);
    out.push({
      q: q.q.trim(),
      options,
      answer,
      explanation: typeof q.explanation === "string" ? q.explanation.trim() : "",
      topic: typeof q.topic === "string" && q.topic ? q.topic.trim() : "general",
    });
  }
  return out;
}

const STOPWORDS = new Set(
  "the a an and or but of to in on for with as by is are was were be been this that those these it its from at which who whom whose what when where how why not no nor so than then too very can will just should would could may might must into over under between".split(
    " "
  )
);

/**
 * Zero-LLM fallback: cloze deletion. Blank the most substantial term
 * of a meaty sentence; distractors come from other sentences' terms.
 * Not as smart as a model — but free, offline, and surprisingly good
 * on dense lecture notes.
 */
export function clozeQuestions(text: string, subject: string, max = 10): QuizQuestion[] {
  const sentences = text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 60 && s.length <= 260);

  const keyword = (s: string) =>
    s
      .split(/[^A-Za-z0-9-]+/)
      .filter((w) => w.length >= 6 && !STOPWORDS.has(w.toLowerCase()))
      .sort((a, b) => b.length - a.length)[0];

  const pool = sentences
    .map((s) => ({ s, k: keyword(s) }))
    .filter((x): x is { s: string; k: string } => Boolean(x.k));

  const allTerms = [...new Set(pool.map((x) => x.k))];
  const out: QuizQuestion[] = [];

  for (const { s, k } of pool) {
    if (out.length >= max) break;
    const distractors = allTerms
      .filter((t) => t.toLowerCase() !== k.toLowerCase())
      .sort((a, b) => Math.abs(a.length - k.length) - Math.abs(b.length - k.length))
      .slice(0, 3);
    if (distractors.length < 3) continue;
    const options = [k, ...distractors].sort(() => Math.random() - 0.5);
    out.push({
      q: s.replace(new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`), "______"),
      options,
      answer: options.indexOf(k),
      explanation: `From your notes: "${s}"`,
      topic: subject,
    });
  }
  return out;
}
