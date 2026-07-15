"use client";

import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { getTheme } from "@/lib/themes";

/**
 * Retro desktop wallpaper. Flat theme color + dither dots — no blur,
 * no gradients, no glow. Rainy themes get chunky 2px pixel rain.
 */
export function BackgroundStage() {
  const theme = useStore((s) => s.theme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const t = getTheme(theme);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-stage-base" />
      {/* Faint diagonal wallpaper weave, like a tiled .bmp */}
      <div className="absolute inset-0 opacity-[0.05] [background:repeating-linear-gradient(45deg,#fff_0_1px,transparent_1px_12px)]" />
      {mounted && t.rain && <PixelRain />}
    </div>
  );
}

function PixelRain() {
  const drops = useMemo(
    () =>
      Array.from({ length: 46 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        duration: 0.9 + Math.random() * 0.9,
        delay: -Math.random() * 2,
      })),
    []
  );

  return (
    <div className="absolute inset-0 opacity-40">
      {drops.map((d) => (
        <span
          key={d.id}
          className="absolute -top-[10vh] h-3 w-[2px] bg-white/70"
          style={{
            left: `${d.left}%`,
            animation: `pixelfall ${d.duration}s steps(14) infinite`,
            animationDelay: `${d.delay}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes pixelfall {
          to {
            transform: translateY(120vh);
          }
        }
      `}</style>
    </div>
  );
}
