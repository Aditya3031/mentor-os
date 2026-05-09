"use client";

import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { TimerMode } from "@/lib/store";

const MODES: { id: TimerMode; label: string }[] = [
  { id: "focus", label: "Focus" },
  { id: "short", label: "Short Break" },
  { id: "long", label: "Long Break" },
];

export function ModeTabs() {
  const mode = useStore((s) => s.mode);

const setMode = useStore((s) => s.setMode);

  return (
    <div className="flex gap-1 rounded-xl border border-white/[0.08] bg-white/[0.04] p-1">
      {MODES.map((m) => {
        const active = mode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className="relative px-[18px] py-2 text-xs font-medium text-text-dim transition-colors hover:text-text"
          >
            {active && (
              <motion.span
                layoutId="modeTabActive"
                className="absolute inset-0 rounded-lg bg-white/[0.08] shadow-soft"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className={cn("relative", active && "text-text")}>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}
