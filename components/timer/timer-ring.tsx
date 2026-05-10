"use client";

import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { formatTime } from "@/lib/utils";

const SIZE = 200;
const RADIUS = 92;
const C = 2 * Math.PI * RADIUS;

/**
 * Animated progress ring with the timer in the middle.
 * Use anywhere — sizes itself to its container.
 */
export function TimerRing() {
  const remaining = useStore((s) => s.remaining);
  const settings = useStore((s) => s.settings);
  const cycleSession = useStore((s) => s.cycleSession);
  const mode = useStore((s) => s.mode);

  const total = settings.durations[mode] * 60;
  const progress = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0;
  const dash = `${C * progress} ${C}`;
  const label =
    mode === "focus" ? "Focus" : mode === "short" ? "Short Break" : "Long Break";

  return (
    <div className="relative grid aspect-square w-[min(360px,76vw,46svh)] place-items-center">
      <div className="pointer-events-none absolute -inset-10 rounded-full bg-[radial-gradient(circle,hsl(var(--accent)/0.18),transparent_60%)] animate-glowpulse" />
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="h-full w-full -rotate-90"
      >
        <defs>
          <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--accent))" />
            <stop offset="100%" stopColor="hsl(var(--accent-alt))" />
          </linearGradient>
        </defs>
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={8}
        />
        <motion.circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="url(#timerGrad)"
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={dash}
          initial={false}
          animate={{ strokeDasharray: dash }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="ring-glow"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
        <div className="text-[clamp(56px,8vw,88px)] font-extralight leading-none tracking-tight tabular-nums">
          {formatTime(remaining)}
        </div>
        <div className="text-xs uppercase tracking-[0.18em] text-text-dim">
          {label}
        </div>
        <div className="mt-1 text-[11px] uppercase tracking-widest text-text-faint">
          Session {cycleSession} · of {settings.durations.cycle}
        </div>
      </div>
    </div>
  );
}
