"use client";

import { useEffect, useState } from "react";
import { Check, Clock3, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import type { TimerMode } from "@/lib/store";

const LIMITS: Record<TimerMode, [number, number]> = {
  focus: [1, 180],
  short: [1, 60],
  long: [1, 120],
};

export function TimerDurationControl() {
  const mode = useStore((s) => s.mode);
  const running = useStore((s) => s.running);
  const duration = useStore((s) => s.settings.durations[s.mode]);
  const setDuration = useStore((s) => s.setDuration);
  const [minutes, setMinutes] = useState(String(duration));

  useEffect(() => {
    setMinutes(String(duration));
  }, [duration, mode]);

  const [min, max] = LIMITS[mode];
  const parsed = Number(minutes);
  const canApply = Number.isFinite(parsed) && parsed >= min && parsed <= max;

  const step = (delta: number) => {
    const next = Math.min(max, Math.max(min, (Number(minutes) || duration) + delta));
    setMinutes(String(next));
    setDuration(mode, next);
  };

  const apply = () => {
    if (!canApply) return;
    setDuration(mode, parsed);
    toast(running ? "Timer updated" : "Duration set");
  };

  return (
    <div className="flex items-center gap-1.5">
      <span className="grid h-8 w-8 place-items-center text-text-dim">
        <Clock3 className="h-4 w-4" />
      </span>
      <button
        onClick={() => step(-1)}
        className="btn95 h-8 w-8 px-0"
        aria-label="Decrease duration"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <label className="sr-only" htmlFor="timer-duration-minutes">
        Timer duration in minutes
      </label>
      <input
        id="timer-duration-minutes"
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={minutes}
        onChange={(e) => setMinutes(e.target.value.replace(/\D/g, "").slice(0, 3))}
        onBlur={apply}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
            apply();
          }
        }}
        className="well h-8 w-16 text-center font-digits text-lg tabular-nums outline-none"
      />
      <span className="text-xs text-text-dim">min</span>
      <button
        onClick={() => step(1)}
        className="btn95 h-8 w-8 px-0"
        aria-label="Increase duration"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={apply}
        disabled={!canApply}
        className="btn95 h-8 w-8 px-0 disabled:opacity-50"
        aria-label="Apply duration"
      >
        <Check className="h-4 w-4" />
      </button>
    </div>
  );
}
