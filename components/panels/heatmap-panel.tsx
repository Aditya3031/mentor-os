"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { Window } from "@/components/retro/window";

const DAYS = 90;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Returns YYYY-MM-DD in local time. */
function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * 90-day study heatmap, computed from real session history.
 * Each cell shows hours of focus on that day, mapped to a 0–4 intensity level.
 */
export function HeatmapPanel() {
  const history = useStore((s) => s.history);

  const cells = useMemo(() => {
    // Group history into a date-keyed map of total focus seconds.
    const totals = new Map<string, number>();
    history.forEach((h) => {
      if (h.mode !== "focus") return;
      const k = dateKey(new Date(h.endedAt));
      totals.set(k, (totals.get(k) ?? 0) + h.durationSec);
    });

    // Build the last 90 days, oldest first → newest at bottom-right.
    const today = Date.now();
    return Array.from({ length: DAYS }, (_, i) => {
      const date = new Date(today - (DAYS - 1 - i) * MS_PER_DAY);
      const seconds = totals.get(dateKey(date)) ?? 0;
      const hours = seconds / 3600;

      // Level thresholds: 0h, <0.5h, <1.5h, <3h, ≥3h.
      let level = 0;
      if (hours >= 3) level = 4;
      else if (hours >= 1.5) level = 3;
      else if (hours >= 0.5) level = 2;
      else if (hours > 0) level = 1;

      return {
        level,
        hours,
        label: date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
      };
    });
  }, [history]);

  // Defrag block palette: empty disk → fully optimized.
  const levelClass = [
    "bg-[var(--paper)]",
    "bg-[hsl(var(--accent)/0.3)]",
    "bg-[hsl(var(--accent)/0.55)]",
    "bg-[hsl(var(--accent)/0.8)]",
    "bg-[var(--accent-deep)]",
  ];

  const studied = cells.filter((c) => c.level > 0).length;

  return (
    <Window
      title="DEFRAG.LOG — 90 DAYS"
      draggable
      statusBar={
        <>
          <span className="status-cell flex-1">
            {studied}/{DAYS} days optimized
          </span>
        </>
      }
    >
      <div
        className="well grid gap-[2px] p-[4px]"
        style={{ gridTemplateColumns: "repeat(15, 1fr)" }}
      >
        {cells.map((c, i) => (
          <div
            key={i}
            className={`${levelClass[c.level]} aspect-square border border-black/15`}
            title={`${c.label}: ${c.hours.toFixed(1)}h focus`}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between font-pixel text-[8px] uppercase tracking-wide text-text-faint">
        <span>Less</span>
        <div className="flex items-center gap-[2px]">
          {levelClass.map((cls, i) => (
            <span key={i} className={`${cls} h-[9px] w-[9px] border border-black/15`} />
          ))}
        </div>
        <span>More</span>
      </div>
    </Window>
  );
}
