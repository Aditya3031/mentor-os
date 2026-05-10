"use client";

import { BackgroundStage } from "@/components/bg/background-stage";
import { TopBar } from "@/components/top-bar";
import { Dock } from "@/components/dock";
import { useStore } from "@/lib/store";
import { Clock, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function HistoryPage() {
  const history = useStore((s) => s.history);

  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      <BackgroundStage />
      <TopBar />

      <main className="relative z-[5] mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-4 pb-20 sm:px-7 sm:pb-28">
        <header className="mb-8 mt-2">
          <p className="text-xs uppercase tracking-[0.2em] text-text-dim">
            Sessions
          </p>
          <h1 className="mt-2 text-balance text-3xl font-light tracking-tight">
            History
          </h1>
        </header>

        {history.length === 0 ? (
          <div className="panel grid place-items-center py-16 text-center">
            <Clock className="mb-3 h-8 w-8 text-text-faint" />
            <p className="text-sm text-text">No sessions yet.</p>
            <p className="mt-1 text-xs text-text-dim">
              Finish your first focus session to start building history.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {history.map((h) => (
              <div
                key={h.id}
                className="flex items-start gap-3.5 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3.5 py-3"
              >
                <div className="mt-0.5 grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl bg-[linear-gradient(135deg,hsl(var(--accent)/0.2),hsl(var(--accent-alt)/0.2))] text-[hsl(var(--accent))]">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="text-sm font-medium">
                      {h.subject || "Focus session"}
                    </div>
                    <div className="text-xs tabular-nums text-text-dim flex-shrink-0">
                      <b className="font-medium text-text">
                        {Math.round(h.durationSec / 60)}
                      </b>{" "}
                      min
                    </div>
                  </div>
                  <div className="mt-0.5 text-[11px] text-text-dim">
                    {formatDistanceToNow(h.endedAt, { addSuffix: true })} ·{" "}
                    {h.pomodoros} pomodoro{h.pomodoros > 1 ? "s" : ""}
                  </div>
                  {h.aiSummary && (
                    <div className="mt-2 flex items-start gap-1.5 rounded-lg border border-[hsl(var(--accent))]/15 bg-[hsl(var(--accent))]/[0.04] px-2.5 py-2 text-[12px] leading-relaxed text-text">
                      <Sparkles className="mt-0.5 h-3 w-3 flex-shrink-0 text-[hsl(var(--accent))]" />
                      <span>{h.aiSummary}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Dock />
    </div>
  );
}
