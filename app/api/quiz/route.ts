import { NextRequest, NextResponse } from "next/server";
import { generateText, NoProviderError } from "@/lib/llm";
import {
  validateQuestions,
  clozeQuestions,
  type QuizBank,
  type QuizQuestion,
} from "@/lib/quiz-types";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM = `You generate exam-style multiple-choice questions from a student's study notes.
Rules:
- Questions must be answerable FROM THE PROVIDED NOTES ONLY.
- Return STRICT JSON: {"questions":[{"q":string,"options":[string,string,string,string],"answer":number,"explanation":string,"topic":string}]}
- "answer" is the 0-based index of the correct option.
- Options must be plausible, mutually exclusive, similar length. No "all of the above".
- "topic" is a 1-3 word concept label for tracking weak areas.
- "explanation" is one sentence explaining the correct answer.`;

/** Split notes into a handful of chunks on paragraph boundaries. */
function chunk(text: string, size = 1400, maxChunks = 6): string[] {
  const paras = text.split(/\n{2,}/);
  const chunks: string[] = [];
  let cur = "";
  for (const p of paras) {
    if ((cur + p).length > size && cur) {
      chunks.push(cur);
      cur = "";
    }
    cur += (cur ? "\n\n" : "") + p;
  }
  if (cur.trim()) chunks.push(cur);
  return chunks.slice(0, maxChunks);
}

export async function POST(req: NextRequest) {
  let body: { subject?: string; text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  const subject = (body.subject || "General").slice(0, 60);
  const text = (body.text || "").trim();
  if (text.length < 200) {
    return NextResponse.json(
      { error: "need at least ~200 characters of notes to generate a quiz" },
      { status: 400 }
    );
  }

  const chunks = chunk(text);
  const seen = new Set<string>();
  const questions: QuizQuestion[] = [];
  let provider: QuizBank["source"] | null = null;
  let offline = false;

  for (const c of chunks) {
    if (questions.length >= 24) break;
    try {
      const res = await generateText({
        system: SYSTEM,
        user: `Subject: ${subject}\n\nNotes:\n"""\n${c}\n"""\n\nGenerate 4 multiple-choice questions as strict JSON.`,
        json: true,
        maxTokens: 1600,
      });
      provider = res.provider;
      let parsed: unknown;
      try {
        parsed = JSON.parse(res.text.replace(/^```(json)?|```$/g, "").trim());
      } catch {
        continue; // malformed JSON → skip chunk, validation ethos: silent discard
      }
      questions.push(...validateQuestions(parsed, c, seen));
    } catch (err) {
      if (err instanceof NoProviderError) {
        offline = true;
        break; // no keys at all → cloze everything below
      }
      // transient provider failure on this chunk — keep going
    }
  }

  // Zero-LLM fallback (no keys, or model produced nothing usable)
  if (questions.length < 3) {
    const cloze = clozeQuestions(text, subject, 12);
    if (cloze.length >= 3) {
      questions.length = 0;
      questions.push(...cloze);
      provider = "cloze";
      offline = offline || provider === "cloze";
    }
  }

  if (questions.length < 3) {
    return NextResponse.json(
      { error: "could not build enough valid questions from these notes — add more content" },
      { status: 422 }
    );
  }

  const bank: QuizBank = {
    id: Math.random().toString(36).slice(2, 10),
    subject,
    createdAt: Date.now(),
    source: provider ?? "cloze",
    questions: questions.slice(0, 24),
  };

  return NextResponse.json({ bank, offline });
}
