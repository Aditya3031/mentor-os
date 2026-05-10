"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Send, Loader2, Sparkles, Trash2 } from "lucide-react";
import { BackgroundStage } from "@/components/bg/background-stage";
import { TopBar } from "@/components/top-bar";
import { Dock } from "@/components/dock";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Help me plan my study week",
  "I'm distracted — what should I do right now?",
  "Quiz me on derivatives",
  "Break down: prepare for chem final in 5 days",
];

/**
 * AI study coach — chat interface.
 * Uses Gemini Flash for fast streaming responses. Sends the user's
 * current stats (streak, total hours, current subject) along with each
 * request so answers feel personalized.
 */
export default function AIPage() {
  const streakDays = useStore((s) => s.streakDays);
  const totalMinutes = useStore((s) => s.totalMinutes);
  const currentSubject = useStore((s) => s.currentSubject);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const send = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || busy) return;

    const userMsg: Message = { id: `u_${Date.now()}`, role: "user", content: text };
    const aiId = `a_${Date.now() + 1}`;
    const aiPlaceholder: Message = { id: aiId, role: "assistant", content: "" };

    setMessages((prev) => [...prev, userMsg, aiPlaceholder]);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: {
            streakDays,
            totalHours: Math.round((totalMinutes / 60) * 10) / 10,
            currentSubject: currentSubject || undefined,
          },
        }),
      });

      if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => "Could not reach AI");
        setMessages((prev) =>
          prev.map((m) => (m.id === aiId ? { ...m, content: `Sorry — ${errText}` } : m))
        );
        return;
      }

      // Stream the response, updating the placeholder message as text arrives
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) => (m.id === aiId ? { ...m, content: acc } : m))
        );
      }
    } catch (e: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiId ? { ...m, content: `Sorry — ${e?.message ?? "network error"}.` } : m
        )
      );
    } finally {
      setBusy(false);
    }
  };

  const clear = () => {
    setMessages([]);
    setInput("");
  };

  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      <BackgroundStage />
      <TopBar />

      <main className="relative z-[5] mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-20 sm:px-7 sm:pb-24 min-h-0">
        <header className="mb-4 mt-2 flex items-end justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-text-dim">
              <Sparkles className="h-3 w-3" />
              Powered by Gemini
            </p>
            <h1 className="mt-2 text-balance text-2xl font-light tracking-tight sm:text-3xl">
              AI study coach
            </h1>
          </div>
          {messages.length > 0 && (
            <button
              onClick={clear}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-text-dim transition-colors hover:bg-white/[0.06] hover:text-text"
            >
              <Trash2 className="h-3 w-3" />
              New chat
            </button>
          )}
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto rounded-2xl">
          {messages.length === 0 ? (
            <EmptyState onPick={send} />
          ) : (
            <div className="flex flex-col gap-3 pb-4">
              <AnimatePresence initial={false}>
                {messages.map((m) => (
                  <MessageBubble
                    key={m.id}
                    message={m}
                    streaming={
                      busy &&
                      m.id === messages[messages.length - 1]?.id &&
                      m.role === "assistant"
                    }
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="mt-3 flex items-end gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-2.5 transition-colors focus-within:border-white/[0.2]"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Ask anything — concepts, planning, focus tips…"
            rows={1}
            maxLength={2000}
            disabled={busy}
            className="max-h-32 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-relaxed outline-none placeholder:text-text-faint disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl bg-[linear-gradient(135deg,hsl(var(--accent)),hsl(var(--accent-alt)))] text-bg-0 shadow-glow transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            aria-label="Send"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      </main>

      <Dock />
    </div>
  );
}

/* ---------- Message bubble ---------- */

function MessageBubble({
  message,
  streaming,
}: {
  message: Message;
  streaming: boolean;
}) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "flex w-full gap-2.5",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="mt-1 grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg bg-[linear-gradient(135deg,hsl(var(--accent)/0.25),hsl(var(--accent-alt)/0.25))] text-[hsl(var(--accent))]">
          <BrainCircuit className="h-4 w-4" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-[linear-gradient(135deg,hsl(var(--accent)/0.18),hsl(var(--accent-alt)/0.18))] text-text"
            : "border border-white/[0.08] bg-white/[0.03] text-text"
        )}
      >
        {message.content || (
          <span className="inline-flex gap-1 text-text-dim">
            <Dot delay={0} />
            <Dot delay={0.15} />
            <Dot delay={0.3} />
          </span>
        )}
        {streaming && message.content && (
          <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse rounded-sm bg-[hsl(var(--accent))]" />
        )}
      </div>
    </motion.div>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <motion.span
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ duration: 1.2, repeat: Infinity, delay, ease: "easeInOut" }}
      className="inline-block h-1.5 w-1.5 rounded-full bg-current"
    />
  );
}

/* ---------- Empty state ---------- */

function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 py-10 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[linear-gradient(135deg,hsl(var(--accent)/0.2),hsl(var(--accent-alt)/0.2))] text-[hsl(var(--accent))] shadow-glow">
        <BrainCircuit className="h-7 w-7" />
      </div>
      <div className="max-w-md">
        <h2 className="text-lg font-semibold tracking-tight">
          How can I help today?
        </h2>
        <p className="mt-1.5 text-sm text-text-dim">
          Ask about a concept, plan your study time, or get unstuck. I know
          your streak and what you're working on.
        </p>
      </div>
      <div className="grid w-full max-w-md grid-cols-1 gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-3 text-left text-[13px] leading-snug text-text transition-all hover:-translate-y-0.5 hover:border-white/[0.16] hover:bg-white/[0.04]"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
