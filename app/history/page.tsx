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
    <div className="relative flex h-dvh flex-col overflow-hidden">
      <BackgroundStage />
      <TopBar />

      <main className="relative z-[5] mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-4 pb-20 sm:px-7 sm:pb-28">
        <header className="mb-8 mt-2">
          <p className="font-pixel text-[9px] uppercase tracking-[0.2em] text-white/70 [text-shadow:1px_1px_0_rgba(0,0,0,0.6)]">
            Sessions
          </p>
          <h1 className="mt-2 text-balance font-pixel text-xl text-white [text-shadow:2px_2px_0_rgba(0,0,0,0.55)] sm:text-2xl">
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
                className="flex items-start gap-3.5 rounded-xl border border-black/25 bg-black/[0.05] px-3.5 py-3"
              >
                <div className="mt-0.5 grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl bevel-thin bg-chrome text-[var(--accent-deep)]">
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
                      <Sparkles className="mt-0.5 h-3 w-3 flex-shrink-0 text-[var(--accent-deep)]" />
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
