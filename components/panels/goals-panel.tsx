"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { useStore } from "@/lib/store";
import { Window } from "@/components/retro/window";

export function GoalsPanel() {
  const sessionsToday = useStore((s) => s.sessionsToday);
  const settings = useStore((s) => s.settings);
  const tasks = useStore((s) => s.tasks);

  const studyHrsToday = useMemo(() => {
    return (sessionsToday * settings.durations.focus) / 60;
  }, [sessionsToday, settings.durations.focus]);

  const tasksDone = useMemo(() => {
    return tasks.filter((t) => t.done).length;
  }, [tasks]);

  const tasksTotal = tasks.length;

  const studyPct = useMemo(() => {
    if (settings.dailyHourGoal === 0) return 0;

    return Math.min(
      100,
      (studyHrsToday / settings.dailyHourGoal) * 100
    );
  }, [studyHrsToday, settings.dailyHourGoal]);

  const pomodoroTarget = settings.durations.cycle * 2;

  const pomodoroPct = useMemo(() => {
    if (pomodoroTarget === 0) return 0;

    return Math.min(
      100,
      (sessionsToday / pomodoroTarget) * 100
    );
  }, [sessionsToday, pomodoroTarget]);

  const taskPct = useMemo(() => {
    if (tasksTotal === 0) return 0;

    return (tasksDone / tasksTotal) * 100;
  }, [tasksDone, tasksTotal]);

  return (
    <Window
      title="GOALS.TXT"
      draggable
      statusBar={
        <span className="status-cell flex-1">{format(new Date(), "EEE, MMM d yyyy")}</span>
      }
    >
      <div className="flex flex-col gap-3.5">
        <Goal
          label="Study time"
          current={`${studyHrsToday.toFixed(1)}h`}
          target={`${settings.dailyHourGoal}h`}
          pct={studyPct}
          variant="primary"
        />

        <Goal
          label="Pomodoros"
          current={String(sessionsToday)}
          target={String(pomodoroTarget)}
          pct={pomodoroPct}
          variant="green"
        />

        <Goal
          label="Tasks complete"
          current={String(tasksDone)}
          target={String(tasksTotal)}
          pct={taskPct}
          variant="amber"
        />
      </div>
    </Window>
  );
}

function Goal({
  label,
  current,
  target,
  pct,
  variant,
}: {
  label: string;
  current: string;
  target: string;
  pct: number;
  variant: "primary" | "green" | "amber";
}) {
  const fill =
    variant === "primary"
      ? "bg-[var(--accent-deep)]"
      : variant === "green"
      ? "bg-[#1e7d4f]"
      : "bg-[#b07a1e]";

  // Classic segmented progress bar: solid blocks in a sunken well.
  const segments = 18;
  const filledSegments = Math.round((pct / 100) * segments);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-[12px]">{label}</span>

        <span className="font-digits text-sm text-text-dim">
          <b className="text-text">{current}</b> / {target}
        </span>
      </div>

      <div className="well flex gap-[2px] p-[3px]">
        {Array.from({ length: segments }, (_, i) => (
          <span
            key={i}
            className={`h-2.5 min-w-0 flex-1 ${
              i < filledSegments ? fill : "bg-transparent"
            }`}
          />
        ))}
      </div>
    </div>
  );
}