import { NextResponse } from "next/server";

// Google recommends stable model ids for production; `gemini-2.5-flash`
// is the current price/performance default for text planning.
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export async function POST(request: Request) {
  // Accept either env var name (Google's own or Vercel AI SDK convention).
  const apiKey =
    process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing GEMINI_API_KEY in your environment." },
      { status: 500 }
    );
  }

  let body: { goal?: string; context?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const goal = body.goal?.trim();
  const context = body.context?.trim();

  if (!goal) {
    return NextResponse.json({ error: "Tell the AI what you want to study." }, { status: 400 });
  }

  const prompt = [
    "You are FocusFlow's study planning assistant.",
    "Create a concise, practical deep-work plan for the user's goal.",
    "Return plain text with these sections: Focus Plan, Session Tasks, Suggested Timer, Quick Tips.",
    "Keep it useful, specific, and under 220 words.",
    "",
    `Goal: ${goal}`,
    context ? `Context: ${context}` : "",
  ].join("\n");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 600,
        },
      }),
    }
  );

  if (!response.ok) {
    const detail = await response.text();
    return NextResponse.json(
      { error: "Gemini request failed.", detail },
      { status: response.status }
    );
  }

  const data = await response.json();
  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text ?? "")
      .join("")
      .trim() || "I could not generate a plan. Try a more specific goal.";

  return NextResponse.json({ text });
}
