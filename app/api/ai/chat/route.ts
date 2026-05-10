import { GoogleGenerativeAI, Content } from "@google/generative-ai";

/**
 * POST /api/ai/chat
 * Body: {
 *   messages: { role: "user" | "assistant", content: string }[],
 *   context?: { streakDays?: number, totalHours?: number, currentSubject?: string }
 * }
 * Returns: text/plain stream — caller reads with a ReadableStream.
 *
 * Streaming gives the typewriter effect on the client and lets the user
 * start reading before the AI is done. Same model + key as /api/reflect.
 */

export const runtime = "nodejs";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  const apiKey =
    process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    return new Response("Gemini API key not configured.", { status: 500 });
  }

  let body: {
    messages?: ChatMessage[];
    context?: {
      streakDays?: number;
      totalHours?: number;
      currentSubject?: string;
    };
  };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const messages = body.messages?.slice(-20) ?? []; // limit to last 20 turns
  if (messages.length === 0) {
    return new Response("No messages", { status: 400 });
  }

  // Build a personalized system prompt from the user's current stats.
  // Keeps the AI grounded in their actual progress instead of generic.
  const ctx = body.context ?? {};
  const streakLine = ctx.streakDays
    ? `Current streak: ${ctx.streakDays} day${ctx.streakDays === 1 ? "" : "s"}.`
    : "No active streak yet.";
  const hoursLine = ctx.totalHours
    ? `Total focus time logged: ${ctx.totalHours} hours.`
    : "Just getting started — no focus time yet.";
  const subjectLine = ctx.currentSubject
    ? `Currently studying: ${ctx.currentSubject}.`
    : "";

  const systemPrompt = `You are a sharp, friendly study coach inside FocusFlow — a deep-work productivity app for students.

Your job: help with planning, focus, motivation, explaining concepts, breaking down tasks, and quizzing. Be:
- Concise (3–5 sentences usually; long form only when explaining a concept)
- Specific and practical, not generic
- Empathetic but no fluff or cheerleading
- Honest when you don't know something

If they ask to explain a concept, do it clearly with one quick example.
If they're stuck or distracted, give one concrete next action.
If they want a study plan, structure it as a numbered list with time estimates.
Avoid emojis. Avoid "Great question!" — just answer.

User's current context:
${streakLine}
${hoursLine}
${subjectLine}`.trim();

  // Convert our message format to Gemini's `Content[]` format.
  // Gemini calls "user" → "user" and "assistant" → "model".
  const history: Content[] = messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const lastUserMessage = messages[messages.length - 1]?.content ?? "";

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
      },
    });

    const chat = model.startChat({ history });
    const result = await chat.sendMessageStream(lastUserMessage);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (e: any) {
          controller.enqueue(encoder.encode(`\n\n[error: ${e?.message ?? e}]`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (e: any) {
    return new Response(`Error: ${e?.message ?? e}`, { status: 500 });
  }
}
