"use client";

import { useStore } from "@/lib/store";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

const BLOCKS = 36;

/**
 * The FOCUS.EXE readout: giant pixel digits over a defrag-style
 * block progress bar. (The glowing gradient ring died so this
 * could live.)
 */
export function TimerRing() {
  const remaining = useStore((s) => s.remaining);
  const settings = useStore((s) => s.settings);
  const cycleSession = useStore((s) => s.cycleSession);
  const mode = useStore((s) => s.mode);
  const running = useStore((s) => s.running);

  const total = settings.durations[mode] * 60;
  const progress = total > 0 ? 1 - Math.max(0, Math.min(1, remaining / total)) : 0;
  const filled = Math.round(progress * BLOCKS);
  const label =
    mode === "focus" ? "FOCUS" : mode === "short" ? "SHORT BREAK" : "LONG BREAK";

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {/* Digital readout in a sunken well, like a giant LCD */}
      <div className="well w-full max-w-[430px] px-6 py-3 text-center">
        <div
          className={cn(
            "font-digits text-[clamp(84px,11vw,132px)] leading-none tabular-nums tracking-wide",
            running ? "text-[var(--accent-deep)]" : "text-text-dim"
          )}
        >
          {formatTime(remaining)}
        </div>
        <div className="mt-1 flex items-center justify-center gap-3 pb-1 font-pixel text-[10px] tracking-wider text-text-dim">
          <span>{label}</span>
          <span aria-hidden>·</span>
          <span>
            SESSION {cycleSession}/{settings.durations.cycle}
          </span>
          {running && (
            <span className="h-2 w-2 animate-blink bg-[var(--accent-deep)]" />
          )}
        </div>
      </div>

      {/* Defrag blocks: each square is 1/36th of the session */}
      <div className="well flex w-full max-w-[430px] gap-[3px] p-[5px]">
        {Array.from({ length: BLOCKS }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-4 min-w-0 flex-1 border border-black/25",
              i < filled
                ? "bg-[var(--accent-deep)]"
                : "bg-[var(--paper)]"
            )}
          />
        ))}
      </div>
      <div className="-mt-2 flex w-full max-w-[430px] justify-between font-pixel text-[9px] text-text-faint">
        <span>ELAPSED {Math.round(progress * 100)}%</span>
        <span>{settings.durations[mode]} MIN TOTAL</span>
      </div>
    </div>
  );
}
