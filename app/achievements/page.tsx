"use client";

import { BackgroundStage } from "@/components/bg/background-stage";
import { TopBar } from "@/components/top-bar";
import { Dock } from "@/components/dock";
import { useStore } from "@/lib/store";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { cn } from "@/lib/utils";

export default function AchievementsPage() {
  const totalSessions = useStore((s) => s.totalSessions);
  const totalMinutes = useStore((s) => s.totalMinutes);
  const streakDays = useStore((s) => s.streakDays);

  const snapshot = { totalSessions, totalMinutes, streakDays };
  const unlocked = ACHIEVEMENTS.filter((a) => a.check(snapshot)).length;

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden">
      <BackgroundStage />
      <TopBar />

      <main className="relative z-[5] mx-auto w-full max-w-3xl flex-1 overflow-y-auto px-4 pb-20 sm:px-7 sm:pb-28">
        <header className="mb-8 mt-2 flex items-end justify-between">
          <div>
            <p className="font-pixel text-[9px] uppercase tracking-[0.2em] text-white/70 [text-shadow:1px_1px_0_rgba(0,0,0,0.6)]">
              Milestones
            </p>
            <h1 className="mt-2 text-balance font-pixel text-xl text-white [text-shadow:2px_2px_0_rgba(0,0,0,0.55)] sm:text-2xl">
              Achievements
            </h1>
          </div>
          <div className="text-right">
            <div className="text-2xl font-medium tabular-nums">
              {unlocked} / {ACHIEVEMENTS.length}
            </div>
            <div className="text-[11px] uppercase tracking-wide text-text-dim">
              Unlocked
            </div>
          </div>
        </header>

        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {ACHIEVEMENTS.map((a) => {
            const isUnlocked = a.check(snapshot);
            const Icon = a.icon;
            return (
              <div
                key={a.id}
                className={cn(
                  "rounded-xl border bg-black/[0.05] p-4 text-center transition-all",
                  isUnlocked
                    ? "border-[hsl(var(--accent)/0.3)] bg-[hsl(var(--accent)/0.05)]"
                    : "border-black/25 opacity-50"
                )}
              >
                <div
                  className={cn(
                    "mx-auto mb-2.5 grid h-11 w-11 place-items-center rounded-xl",
                    isUnlocked
                      ? "bg-[linear-gradient(135deg,hsl(var(--accent)/0.2),hsl(var(--accent-alt)/0.2))] text-[hsl(var(--accent))]"
                      : "bg-black/[0.05] text-text-faint"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-[13px] font-semibold">{a.name}</div>
                <div className="mt-1 text-[11px] leading-relaxed text-text-dim">
                  {a.desc}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Dock />
    </div>
  );
}
