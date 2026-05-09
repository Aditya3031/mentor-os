"use client";

import { useEffect } from "react";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useStore } from "@/lib/store";

/**
 * Drives the timer interval and renders play/pause/reset/skip.
 * Mount this once, anywhere on the focus page.
 */
export function TimerControls() {
  // Individual selectors — wrapping multiple values in an object literal
  // would create a new object every render and trigger an infinite loop
  // in Zustand v5. Each useStore call here returns a stable primitive
  // or function reference.
  const running = useStore((s) => s.running);
  const start = useStore((s) => s.start);
  const pause = useStore((s) => s.pause);
  const reset = useStore((s) => s.reset);
  const tick = useStore((s) => s.tick);
  const mode = useStore((s) => s.mode);
  const completeSession = useStore((s) => s.completeSession);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => tick(), 1000);
    return () => clearInterval(id);
  }, [running, tick]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.code === "Space") {
        e.preventDefault();
        running ? pause() : start();
      } else if (e.key.toLowerCase() === "r") reset();
      else if (e.key.toLowerCase() === "s") {
        completeSession();
        toast("Session skipped");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [running, start, pause, reset, completeSession]);

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={reset}
        className="grid h-12 w-12 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-text-dim transition-colors hover:bg-white/[0.08] hover:text-text"
        title="Reset (R)"
      >
        <RotateCcw className="h-[18px] w-[18px]" />
      </button>

      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => (running ? pause() : start())}
        className="grid h-16 w-16 place-items-center rounded-[18px] bg-[linear-gradient(135deg,hsl(var(--accent)),hsl(var(--accent-alt)))] text-bg-0 shadow-glow transition-transform hover:-translate-y-0.5"
        title="Start / Pause (Space)"
      >
        {running ? (
          <Pause className="h-[22px] w-[22px]" fill="currentColor" />
        ) : (
          <Play className="h-[22px] w-[22px]" fill="currentColor" />
        )}
      </motion.button>

      <button
        onClick={() => completeSession()}
        className="grid h-12 w-12 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-text-dim transition-colors hover:bg-white/[0.08] hover:text-text"
        title="Skip (S)"
      >
        <SkipForward className="h-[18px] w-[18px]" />
      </button>
    </div>
  );
}
