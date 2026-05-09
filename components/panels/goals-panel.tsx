"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { useStore } from "@/lib/store";

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
    <div className="panel">
      <div className="panel-h">
        <h3>Today's Goals</h3>

        <span className="font-mono text-xs text-text-dim">
          {format(new Date(), "MMM d")}
        </span>
      </div>

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
    </div>
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
      ? "bg-[linear-gradient(90deg,hsl(var(--accent)),hsl(var(--accent-alt)))]"
      : variant === "green"
      ? "bg-[linear-gradient(90deg,#7DE0B6,#B6EFD3)]"
      : "bg-[linear-gradient(90deg,#FFCB6B,#FFB8A2)]";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-[13px]">
          {label}
        </span>

        <span className="text-xs text-text-dim">
          <b className="font-medium text-text">
            {current}
          </b>{" "}
          / {target}
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={`h-full rounded-full ${fill} transition-[width] duration-700 ease-elegant`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}