"use client";

import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { getTheme } from "@/lib/themes";

/**
 * Animated theme background. Renders behind everything (z-0).
 * - Dual radial gradients drifting on opposite cycles
 * - Floating particles (toggleable in settings)
 * - Rain layer (auto-on for rainy themes)
 */
export function BackgroundStage() {
  const theme = useStore((s) => s.theme);
  const particles = useStore((s) => s.settings.particles);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const t = getTheme(theme);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-stage-base transition-[background] duration-1000 ease-elegant" />

      <div className="absolute -inset-[20%] animate-drift bg-[radial-gradient(circle_at_30%_30%,hsl(var(--accent)/0.18),transparent_35%),radial-gradient(circle_at_70%_60%,hsl(var(--accent-alt)/0.14),transparent_40%)] blur-[40px]" />

      {mounted && particles && <ParticleLayer />}
      {mounted && t.rain && <RainLayer />}
    </div>
  );
}

function ParticleLayer() {
  const parts = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 1 + Math.random() * 3,
        duration: 15 + Math.random() * 25,
        delay: -Math.random() * 25,
        opacity: 0.15 + Math.random() * 0.4,
      })),
    []
  );

  return (
    <div className="absolute inset-0">
      {parts.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-white/50"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animation: `floatUp ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      <style jsx>{`
        @keyframes floatUp {
          0% {
            transform: translateY(110vh) translateX(0);
            opacity: 0;
          }

          10% {
            opacity: 0.6;
          }

          90% {
            opacity: 0.6;
          }

          100% {
            transform: translateY(-10vh) translateX(20px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

function RainLayer() {
  const drops = useMemo(
    () =>
      Array.from({ length: 80 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        duration: 0.5 + Math.random() * 0.6,
        delay: -Math.random() * 1.5,
      })),
    []
  );

  return (
    <div className="absolute inset-0 opacity-55">
      {drops.map((d) => (
        <span
          key={d.id}
          className="absolute -top-[20vh] h-20 w-px bg-[linear-gradient(to_bottom,transparent,rgba(180,200,255,0.55))]"
          style={{
            left: `${d.left}%`,
            animation: `rainfall ${d.duration}s linear infinite`,
            animationDelay: `${d.delay}s`,
          }}
        />
      ))}

      <style jsx>{`
        @keyframes rainfall {
          to {
            transform: translateY(140vh);
          }
        }
      `}</style>
    </div>
  );
}