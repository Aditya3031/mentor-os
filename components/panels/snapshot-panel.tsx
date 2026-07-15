"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Flame, Clock, Layers, Zap } from "lucide-react";
import { useStore } from "@/lib/store";
import { Window } from "@/components/retro/window";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Snapshot of the user's progress at a glance.
 * All numbers here are computed from real store state — no hardcoded demo values.
 *   - Streak: from store.streakDays
 *   - This week: sum of focus seconds from history in the last 7 days
 *   - Focus score: today's focus minutes as a percentage of the daily goal
 *   - XP / level: from store.xp + store.level
 */
export function SnapshotPanel() {
  const streakDays = useStore((s) => s.streakDays);
  const sessionsToday = useStore((s) => s.sessionsToday);
  const history = useStore((s) => s.history);
  const settings = useStore((s) => s.settings);
  const level = useStore((s) => s.level);
  const xp = useStore((s) => s.xp);

  const weeklyHours = useMemo(() => {
    const cutoff = Date.now() - SEVEN_DAYS_MS;
    const seconds = history
      .filter((h) => h.endedAt >= cutoff && h.mode === "focus")
      .reduce((acc, h) => acc + h.durationSec, 0);
    return seconds / 3600;
  }, [history]);

  const focusScore = useMemo(() => {
    const todayMinutes = sessionsToday * settings.durations.focus;
    const goalMinutes = settings.dailyHourGoal * 60;
    if (goalMinutes === 0) return 0;
    return Math.min(100, Math.round((todayMinutes / goalMinutes) * 100));
  }, [sessionsToday, settings.durations.focus, settings.dailyHourGoal]);

  const focusScoreLabel =
    focusScore >= 90
      ? "Crushing it"
      : focusScore >= 60
      ? "On track"
      : focusScore >= 30
      ? "Getting started"
      : "Time to focus";

  const xpToNext = (level + 1) * 300;
  const xpNeeded = Math.max(0, xpToNext - xp);

  return (
    <Window
      title="STATS.NFO"
      draggable
      statusBar={
        <Link href="/dashboard" className="status-cell flex-1 hover:underline">
          Open STATS.EXE for full report →
        </Link>
      }
    >
      <div className="grid grid-cols-2 gap-1.5">
        <Stat
          icon={Flame}
          label="Streak"
          value={`${streakDays}d`}
          sub={streakDays > 0 ? "Keep it going" : "Start today"}
        />
        <Stat
          icon={Clock}
          label="This week"
          value={`${weeklyHours.toFixed(1)}h`}
          sub="Last 7 days"
        />
        <Stat
          icon={Layers}
          label="Focus score"
          value={String(focusScore)}
          sub={focusScoreLabel}
        />
        <Stat
          icon={Zap}
          label={`XP · Lvl ${level}`}
          value={xp.toLocaleString()}
          sub={`${xpNeeded} to lvl ${level + 1}`}
        />
      </div>
    </Window>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="well p-2.5">
      <div className="flex items-center gap-1.5 font-pixel text-[8px] uppercase tracking-wide text-text-dim">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="mt-1 font-digits text-[26px] leading-none text-[var(--accent-deep)]">
        {value}
      </div>
      <div className="mt-1 text-[10px] text-text-faint">{sub}</div>
    </div>
  );
}
