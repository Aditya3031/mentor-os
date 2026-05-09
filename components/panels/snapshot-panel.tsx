"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Flame, Clock, Layers, Zap } from "lucide-react";
import { useStore } from "@/lib/store";

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
    <div className="panel">
      <div className="panel-h">
        <h3>Snapshot</h3>
        <Link href="/dashboard" className="text-xs text-text-dim hover:text-text">
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
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
    </div>
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
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-text-dim">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="mt-1.5 text-[22px] font-medium tracking-tight">{value}</div>
      <div className="mt-0.5 text-[11px] text-text-faint">{sub}</div>
    </div>
  );
}
