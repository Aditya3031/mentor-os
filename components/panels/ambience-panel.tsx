"use client";

import Link from "next/link";
import { Music, CloudRain, Coffee, Flame, Keyboard, Radio } from "lucide-react";
import { useStore } from "@/lib/store";
import { AMBIENCE_TRACKS, type AmbienceId } from "@/lib/themes";
import { cn } from "@/lib/utils";

const ICONS: Record<AmbienceId, React.ElementType> = {
  lofi: Music,
  rain: CloudRain,
  cafe: Coffee,
  fire: Flame,
  keys: Keyboard,
  noise: Radio,
};

export function AmbiencePanel() {
  const ambience = useStore((s) => s.ambience);

const toggleAmbience = useStore(
  (s) => s.toggleAmbience
);

const setAmbienceVolume = useStore(
  (s) => s.setAmbienceVolume
);

  return (
    <div className="panel">
      <div className="panel-h">
        <h3>Ambience</h3>
        <Link href="/themes" className="text-xs text-text-dim hover:text-text">
          Rooms →
        </Link>
      </div>
      <div className="flex flex-col gap-1.5">
        {ambience.map((a) => {
          const Icon = ICONS[a.id];
          return (
            <div
              key={a.id}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-2.5 transition-colors hover:bg-white/[0.04]",
                a.enabled && "border-[hsl(var(--accent)/0.35)] bg-[hsl(var(--accent)/0.06)]"
              )}
              onClick={(e) => {
                if ((e.target as HTMLElement).tagName === "INPUT") return;
                toggleAmbience(a.id);
              }}
            >
              <div
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-lg bg-white/[0.04] text-text-dim transition-all",
                  a.enabled &&
                    "bg-[linear-gradient(135deg,hsl(var(--accent)/0.25),hsl(var(--accent-alt)/0.25))] text-text"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 text-[13px]">{AMBIENCE_TRACKS[a.id].name}</div>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(a.volume * 100)}
                onChange={(e) => setAmbienceVolume(a.id, parseInt(e.target.value) / 100)}
                className="h-1 w-[70px] cursor-pointer appearance-none rounded-full bg-white/[0.08] [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[hsl(var(--accent))] [&::-webkit-slider-thumb]:shadow-[0_0_8px_hsl(var(--accent)/0.5)]"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
