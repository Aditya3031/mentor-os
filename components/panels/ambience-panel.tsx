"use client";

import Link from "next/link";
import { Music, CloudRain, Coffee, Flame, Keyboard, Radio } from "lucide-react";
import { useStore } from "@/lib/store";
import { AMBIENCE_TRACKS, type AmbienceId } from "@/lib/themes";
import { cn } from "@/lib/utils";
import { Window } from "@/components/retro/window";

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

  const activeCount = ambience.filter((a) => a.enabled).length;

  return (
    <Window
      title="MIXER.EXE"
      draggable
      statusBar={
        <>
          <span className="status-cell flex-1">
            {activeCount} channel(s) active
          </span>
          <Link href="/themes" className="status-cell hover:underline">
            Rooms →
          </Link>
        </>
      }
    >
      <div className="flex flex-col gap-1">
        {ambience.map((a) => {
          const Icon = ICONS[a.id];
          return (
            <div
              key={a.id}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 p-1.5",
                a.enabled ? "bevel-thin-in bg-[var(--paper)]" : "hover:bevel-thin"
              )}
              onClick={(e) => {
                if ((e.target as HTMLElement).tagName === "INPUT") return;
                toggleAmbience(a.id);
              }}
            >
              <div
                className={cn(
                  "bevel-thin grid h-7 w-7 place-items-center",
                  a.enabled
                    ? "bg-[var(--title-grad)] text-white"
                    : "bg-chrome text-text-dim"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 text-[12px]">{AMBIENCE_TRACKS[a.id].name}</div>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(a.volume * 100)}
                onChange={(e) => setAmbienceVolume(a.id, parseInt(e.target.value) / 100)}
                aria-label={`${AMBIENCE_TRACKS[a.id].name} volume`}
                className="bevel-thin-in h-3 w-[70px] cursor-pointer appearance-none bg-chrome-lo [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-black/40 [&::-webkit-slider-thumb]:bg-chrome [&::-webkit-slider-thumb]:shadow-[inset_1px_1px_0_var(--edge-light),inset_-1px_-1px_0_var(--edge-dark)]"
              />
            </div>
          );
        })}
      </div>
    </Window>
  );
}
