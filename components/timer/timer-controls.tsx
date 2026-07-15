"use client";

import { useEffect } from "react";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";
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
  const syncTimer = useStore((s) => s.syncTimer);
  const completeSession = useStore((s) => s.completeSession);

  useEffect(() => {
    syncTimer();
    if (!running) return;
    const id = setInterval(() => tick(), 1000);
    return () => clearInterval(id);
  }, [running, tick, syncTimer]);

  useEffect(() => {
    const sync = () => syncTimer();
    window.addEventListener("focus", sync);
    window.addEventListener("pageshow", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      window.removeEventListener("focus", sync);
      window.removeEventListener("pageshow", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [syncTimer]);

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
        completeSession("skip");
        toast("Session skipped");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [running, start, pause, reset, completeSession]);

  return (
    <div className="flex items-center gap-2">
      <button onClick={reset} className="btn95 h-9" title="Reset (R)">
        <RotateCcw className="h-3.5 w-3.5" />
        Reset
      </button>

      <button
        onClick={() => (running ? pause() : start())}
        className="btn95 btn95-primary h-11 min-w-[130px] px-6 text-[13px]"
        title="Start / Pause (Space)"
      >
        {running ? (
          <>
            <Pause className="h-4 w-4" fill="currentColor" />
            Pause
          </>
        ) : (
          <>
            <Play className="h-4 w-4" fill="currentColor" />
            Start
          </>
        )}
      </button>

      <button
        onClick={() => completeSession("skip")}
        className="btn95 h-9"
        title="Skip (S)"
      >
        <SkipForward className="h-3.5 w-3.5" />
        Skip
      </button>
    </div>
  );
}
