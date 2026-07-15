"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";

const DAY_MS = 24 * 60 * 60 * 1000;

export function DashboardStats() {
  const history = useStore((s) => s.history);

  const stats = useMemo(() => {
    const focusSessions = history.filter((h) => h.mode === "focus");
    const totalHours = focusSessions.reduce((sum, h) => sum + h.durationSec / 3600, 0);

    const byDay = new Map<string, number>();
    const bySubject = new Map<string, number>();
    const cutoff = Date.now() - 29 * DAY_MS;
    let last30Hours = 0;

    focusSessions.forEach((h) => {
      const ended = new Date(h.endedAt);
      const dayKey = ended.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      const hours = h.durationSec / 3600;
      byDay.set(dayKey, (byDay.get(dayKey) ?? 0) + hours);
      bySubject.set(h.subject || "Focus session", (bySubject.get(h.subject || "Focus session") ?? 0) + hours);
      if (h.endedAt >= cutoff) last30Hours += hours;
    });

    const bestDay = [...byDay.entries()].sort((a, b) => b[1] - a[1])[0];
    const topSubject = [...bySubject.entries()].sort((a, b) => b[1] - a[1])[0];

    return {
      totalHours: formatHours(totalHours),
      bestDayValue: bestDay ? formatHours(bestDay[1]) : "0h",
      bestDaySub: bestDay?.[0] ?? "No sessions yet",
      avgPerDay: `${(last30Hours / 30).toFixed(1)}h`,
      topSubjectValue: topSubject?.[0] ?? "None yet",
      topSubjectSub: topSubject ? `${formatHours(topSubject[1])} total` : "Add a subject",
    };
  }, [history]);

  return (
    <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
      <Stat label="Total hours" value={stats.totalHours} sub="All time" />
      <Stat label="Best day" value={stats.bestDayValue} sub={stats.bestDaySub} />
      <Stat label="Avg / day" value={stats.avgPerDay} sub="Last 30 days" />
      <Stat label="Top subject" value={stats.topSubjectValue} sub={stats.topSubjectSub} />
    </div>
  );
}

function formatHours(hours: number) {
  if (hours <= 0) return "0h";
  if (hours < 10) return `${hours.toFixed(1)}h`;
  return `${Math.round(hours)}h`;
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="panel min-w-0">
      <div className="font-pixel text-[8px] uppercase tracking-wide text-text-dim">{label}</div>
      <div className="mt-1.5 truncate font-digits text-3xl leading-none text-[var(--accent-deep)]">{value}</div>
      <div className="mt-1 truncate text-[11px] text-text-faint">{sub}</div>
    </div>
  );
}
