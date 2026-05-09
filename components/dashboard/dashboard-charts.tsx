"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useStore } from "@/lib/store";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Color palette for the subject pie chart (cycles if more than 6 subjects). */
const SUBJECT_COLORS = [
  "hsl(var(--accent))",
  "hsl(var(--accent-alt))",
  "#7DE0B6",
  "#FFCB6B",
  "#FFB8A2",
  "#A8C8E0",
];

const tooltipStyle = {
  contentStyle: {
    background: "#14141d",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    padding: 10,
    fontSize: 12,
  },
  itemStyle: { color: "#ECECF2" },
  cursor: { fill: "rgba(255,255,255,0.04)" },
};

function labelHour(h: number) {
  if (h === 0) return "12am";
  if (h < 12) return `${h}am`;
  if (h === 12) return "12pm";
  return `${h - 12}pm`;
}

/**
 * Three charts driven entirely from store.history:
 *  - Last 7 days bar chart (focus hours per weekday)
 *  - Time-by-subject doughnut (sums minutes grouped by subject)
 *  - Best-study-hours line (focus minutes grouped by hour-of-day)
 *
 * All recompute when history changes (useMemo).
 */
export function DashboardCharts() {
  const history = useStore((s) => s.history);

  const weekData = useMemo(() => {
    // Build a 7-day window ending today. Bucket sessions by local day.
    const today = new Date();
    const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today.getTime() - (6 - i) * MS_PER_DAY);
      return { date: d, day: labels[d.getDay()], hrs: 0 };
    });

    history.forEach((h) => {
      if (h.mode !== "focus") return;
      const ended = new Date(h.endedAt);
      const bucket = days.find(
        (d) =>
          d.date.getFullYear() === ended.getFullYear() &&
          d.date.getMonth() === ended.getMonth() &&
          d.date.getDate() === ended.getDate()
      );
      if (bucket) bucket.hrs += h.durationSec / 3600;
    });

    return days.map((d) => ({ day: d.day, hrs: parseFloat(d.hrs.toFixed(1)) }));
  }, [history]);

  const subjectData = useMemo(() => {
    const totals = new Map<string, number>();
    history.forEach((h) => {
      if (h.mode !== "focus") return;
      const k = h.subject || "Untitled";
      totals.set(k, (totals.get(k) ?? 0) + h.durationSec);
    });
    return Array.from(totals.entries())
      .map(([name, sec], i) => ({
        name,
        hrs: parseFloat((sec / 3600).toFixed(1)),
        c: SUBJECT_COLORS[i % SUBJECT_COLORS.length],
      }))
      .sort((a, b) => b.hrs - a.hrs)
      .slice(0, 6);
  }, [history]);

  const hourData = useMemo(() => {
    const totals = new Array(24).fill(0);
    history.forEach((h) => {
      if (h.mode !== "focus") return;
      const startHour = new Date(h.startedAt).getHours();
      totals[startHour] += h.durationSec / 3600;
    });
    return totals.map((hrs, h) => ({
      h: h % 6 === 0 ? labelHour(h) : "",
      hrs: parseFloat(hrs.toFixed(2)),
    }));
  }, [history]);

  const empty = history.length === 0;

  return (
    <div className="space-y-3.5">
      <ChartCard title="Last 7 days">
        {empty ? (
          <Empty />
        ) : (
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={weekData}>
              <XAxis
                dataKey="day"
                stroke="#5C5C6A"
                axisLine={false}
                tickLine={false}
                fontSize={11}
              />
              <YAxis
                stroke="#5C5C6A"
                axisLine={false}
                tickLine={false}
                fontSize={11}
                tickFormatter={(v) => `${v}h`}
              />
              <Tooltip
                {...tooltipStyle}
                formatter={(v: number) => [`${v}h`, "Focus"]}
              />
              <Bar
                dataKey="hrs"
                fill="hsl(var(--accent))"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Time by subject">
        {subjectData.length === 0 ? (
          <Empty />
        ) : (
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie
                data={subjectData}
                dataKey="hrs"
                nameKey="name"
                innerRadius={40}
                outerRadius={62}
                paddingAngle={2}
              >
                {subjectData.map((s) => (
                  <Cell
                    key={s.name}
                    fill={s.c}
                    stroke="#14141d"
                    strokeWidth={3}
                  />
                ))}
              </Pie>
              <Tooltip
                {...tooltipStyle}
                formatter={(v: number, n: string) => [`${v}h`, n]}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Best study hours">
        {empty ? (
          <Empty />
        ) : (
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={hourData}>
              <XAxis
                dataKey="h"
                stroke="#5C5C6A"
                axisLine={false}
                tickLine={false}
                fontSize={11}
              />
              <YAxis
                stroke="#5C5C6A"
                axisLine={false}
                tickLine={false}
                fontSize={11}
              />
              <Tooltip
                {...tooltipStyle}
                formatter={(v: number) => [`${v}h`, "Focus"]}
              />
              <Line
                type="monotone"
                dataKey="hrs"
                stroke="hsl(var(--accent-alt))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="panel">
      <h4 className="mb-3 text-xs font-medium uppercase tracking-wide text-text-dim">
        {title}
      </h4>
      {children}
    </div>
  );
}

function Empty() {
  return (
    <div className="grid h-[140px] place-items-center text-center text-xs text-text-faint">
      Complete a focus session to start seeing data.
    </div>
  );
}
