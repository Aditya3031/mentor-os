"use client";

import { useMemo, useState } from "react";
import { BrainCircuit, Loader2, Sparkles } from "lucide-react";
import { BackgroundStage } from "@/components/bg/background-stage";
import { Dock } from "@/components/dock";
import { TopBar } from "@/components/top-bar";
import { useStore } from "@/lib/store";

export default function AIPage() {
  const tasks = useStore((s) => s.tasks);
  const history = useStore((s) => s.history);
  const [goal, setGoal] = useState("");
  const [context, setContext] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const suggestedContext = useMemo(() => {
    const openTasks = tasks.filter((task) => !task.done).slice(0, 6);
    const recentSubjects = [...new Set(history.slice(0, 8).map((s) => s.subject))].filter(Boolean);

    return [
      openTasks.length ? `Open tasks: ${openTasks.map((task) => task.text).join("; ")}` : "",
      recentSubjects.length ? `Recent subjects: ${recentSubjects.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [history, tasks]);

  const generatePlan = async () => {
    setError("");
    setAnswer("");
    setBusy(true);

    try {
      const res = await fetch("/api/ai/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal,
          context: [context, suggestedContext].filter(Boolean).join("\n\n"),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "AI request failed.");
      }

      setAnswer(data.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI request failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      <BackgroundStage />
      <TopBar />

      <main className="relative z-[5] mx-auto w-full max-w-5xl flex-1 overflow-y-auto px-7 pb-28">
        <header className="mb-8 mt-2">
          <p className="text-xs uppercase tracking-[0.2em] text-text-dim">Integrated AI</p>
          <h1 className="mt-2 text-balance text-3xl font-light tracking-tight">
            Build your next focus plan with Gemini.
          </h1>
        </header>

        <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="panel">
            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-[hsl(var(--accent)/0.16)] text-[hsl(var(--accent))]">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold">AI study coach</h2>
                <p className="text-xs text-text-dim">Goal in, study plan out.</p>
              </div>
            </div>

            <label className="block">
              <span className="text-xs uppercase tracking-wide text-text-dim">Study goal</span>
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Example: Prepare for my chemistry exam on electrochemistry"
                className="mt-2 min-h-28 w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm outline-none placeholder:text-text-faint focus:border-white/[0.18]"
              />
            </label>

            <label className="mt-4 block">
              <span className="text-xs uppercase tracking-wide text-text-dim">Extra context</span>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Deadline, weak topics, available time, preferred session length..."
                className="mt-2 min-h-24 w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm outline-none placeholder:text-text-faint focus:border-white/[0.18]"
              />
            </label>

            <button
              onClick={generatePlan}
              disabled={busy || !goal.trim()}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,hsl(var(--accent)),hsl(var(--accent-alt)))] px-5 py-3 text-sm font-semibold text-bg-0 shadow-glow transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate focus plan
            </button>
          </section>

          <section className="panel min-h-[420px]">
            <div className="panel-h">
              <h3>AI output</h3>
            </div>

            {error && (
              <div className="rounded-xl border border-[#FF8A8A]/[0.18] bg-[#FF8A8A]/[0.06] p-4 text-sm text-[#FFA8A8]">
                {error}
              </div>
            )}

            {!answer && !error && (
              <div className="grid min-h-[320px] place-items-center rounded-xl border border-dashed border-white/[0.1] text-center text-sm text-text-faint">
                Your generated study plan will appear here.
              </div>
            )}

            {answer && (
              <div className="whitespace-pre-wrap rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm leading-7 text-text">
                {answer}
              </div>
            )}
          </section>
        </div>
      </main>

      <Dock />
    </div>
  );
}
