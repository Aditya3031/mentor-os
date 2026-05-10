import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * POST /api/reflect
 * Body: { subject: string, durationMin: number, userNote: string }
 * Returns: { summary: string } or { error: string }
 *
 * Uses Gemini Flash (cheap + fast) to turn the user's brief note about
 * what they accomplished into a one-line motivating summary saved to history.
 *
 * Server-side only — the API key never touches the client.
 */

export const runtime = "nodejs";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export async function POST(req: Request) {
  // Accept either env var name (Vercel AI SDK convention or Google's own)
  const apiKey =
    process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Gemini API key not configured. Set GEMINI_API_KEY in .env.local." },
      { status: 500 }
    );
  }

  let body: { subject?: string; durationMin?: number; userNote?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const subject = (body.subject || "Focus session").slice(0, 200);
  const durationMin = Number(body.durationMin) || 25;
  const userNote = (body.userNote || "").slice(0, 1000);

  if (!userNote.trim()) {
    return NextResponse.json(
      { error: "Please write a brief note about what you did." },
      { status: 400 }
    );
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 80,
      },
    });

    const prompt = `You are a study coach. Summarize this focus session in ONE specific, encouraging sentence (max 20 words). Be specific to what the person actually did — don't be generic. Don't use quotes. Don't start with "Great job" or similar fluff.

Subject: ${subject}
Duration: ${durationMin} minutes
What they accomplished: ${userNote}

One-sentence summary:`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text().trim().replace(/^["']|["']$/g, "");

    return NextResponse.json({ summary });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || `Could not generate summary with ${GEMINI_MODEL}` },
      { status: 500 }
    );
  }
}
