"use client";

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
    <div className="flex gap-1">
      {MODES.map((m) => {
        const active = mode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={cn(
              "btn95 h-8 px-3 text-[10px]",
              active &&
                "bevel-in font-bold [background-image:radial-gradient(rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:3px_3px]"
            )}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
