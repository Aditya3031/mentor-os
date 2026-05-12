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

      <ThemeMotionLayer theme={t.id} />
      {mounted && particles && <ParticleLayer />}
      {mounted && t.rain && <RainLayer />}
    </div>
  );
}

function ThemeMotionLayer({ theme }: { theme: ReturnType<typeof getTheme>["id"] }) {
  if (theme === "ocean") return <OceanLayer />;
  if (theme === "forest") return <ForestLayer />;
  if (theme === "sunrise") return <SunriseLayer />;
  if (theme === "arctic") return <ArcticLayer />;
  if (theme === "ember") return <EmberLayer />;
  if (theme === "cyber") return <CyberLayer />;
  if (theme === "library" || theme === "cafe" || theme === "cozy") return <WarmLampLayer />;
  if (theme === "aurora") return <AuroraLayer />;
  if (theme === "tokyo") return <TokyoLayer />;
  if (theme === "cabin") return <CabinLayer />;
  return null;
}

function AuroraLayer() {
  return (
    <div className="absolute inset-0 opacity-70 mix-blend-screen">
      <div className="absolute -left-[18%] top-[8%] h-[42vh] w-[76vw] animate-aurora rounded-full bg-[linear-gradient(90deg,transparent,hsl(var(--accent)/0.18),hsl(var(--accent-alt)/0.13),transparent)] blur-3xl" />
      <div className="absolute -right-[24%] top-[24%] h-[34vh] w-[70vw] animate-aurora-slow rounded-full bg-[linear-gradient(90deg,transparent,hsl(var(--accent-alt)/0.12),hsl(var(--accent)/0.12),transparent)] blur-3xl" />
      <style jsx>{`
        @keyframes aurora {
          0%, 100% { transform: translate3d(-4%, 0, 0) rotate(-8deg) scale(1); }
          50% { transform: translate3d(8%, 8%, 0) rotate(5deg) scale(1.12); }
        }
        @keyframes auroraSlow {
          0%, 100% { transform: translate3d(5%, 0, 0) rotate(8deg) scale(1); }
          50% { transform: translate3d(-7%, -6%, 0) rotate(-4deg) scale(1.08); }
        }
        .animate-aurora { animation: aurora 18s ease-in-out infinite; }
        .animate-aurora-slow { animation: auroraSlow 24s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

function TokyoLayer() {
  return (
    <div className="absolute inset-0 opacity-45">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0,transparent_9%,hsl(var(--accent)/0.16)_10%,transparent_11%,transparent_29%,hsl(var(--accent-alt)/0.12)_30%,transparent_31%)] bg-[length:160px_100%] animate-neon-scan" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(to_top,hsl(var(--accent)/0.11),transparent)]" />
      <style jsx>{`
        @keyframes neonScan {
          from { transform: translateX(-80px); }
          to { transform: translateX(80px); }
        }
        .animate-neon-scan { animation: neonScan 12s linear infinite alternate; }
      `}</style>
    </div>
  );
}

function WarmLampLayer() {
  return (
    <div className="absolute inset-0 opacity-80">
      <div className="absolute left-[6%] top-[-18%] h-[58vh] w-[40vw] rounded-full bg-[radial-gradient(circle,hsl(var(--accent)/0.17),transparent_64%)] blur-2xl animate-lamp-breathe" />
      <div className="absolute bottom-[-20%] right-[8%] h-[48vh] w-[44vw] rounded-full bg-[radial-gradient(circle,hsl(var(--accent-alt)/0.11),transparent_62%)] blur-3xl animate-lamp-breathe-slow" />
      <style jsx>{`
        @keyframes lampBreathe {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.08); }
        }
        .animate-lamp-breathe { animation: lampBreathe 8s ease-in-out infinite; }
        .animate-lamp-breathe-slow { animation: lampBreathe 12s ease-in-out infinite reverse; }
      `}</style>
    </div>
  );
}

function CabinLayer() {
  return (
    <div className="absolute inset-0 opacity-50">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0,transparent_45%,rgba(210,235,255,0.08)_46%,transparent_47%,transparent_100%)] bg-[length:180px_180px] animate-snow-drift" />
      <div className="absolute bottom-[-10%] left-[-10%] h-[45vh] w-[55vw] rounded-full bg-[radial-gradient(circle,hsl(var(--accent)/0.11),transparent_62%)] blur-2xl" />
      <style jsx>{`
        @keyframes snowDrift {
          from { transform: translate3d(-40px, -30px, 0); }
          to { transform: translate3d(40px, 30px, 0); }
        }
        .animate-snow-drift { animation: snowDrift 18s linear infinite alternate; }
      `}</style>
    </div>
  );
}

function OceanLayer() {
  return (
    <div className="absolute inset-0 opacity-55">
      <div className="absolute inset-x-[-10%] bottom-[-12%] h-[58vh] bg-[repeating-radial-gradient(ellipse_at_50%_100%,hsl(var(--accent)/0.18)_0_1px,transparent_2px_22px)] blur-[1px] animate-wave" />
      <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,hsl(var(--accent-alt)/0.09)_42%,transparent_58%)] animate-tide" />
      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: translate3d(-2%, 2%, 0) scaleX(1.05); }
          50% { transform: translate3d(2%, -2%, 0) scaleX(1.16); }
        }
        @keyframes tide {
          0%, 100% { transform: translateX(-8%); opacity: 0.42; }
          50% { transform: translateX(8%); opacity: 0.72; }
        }
        .animate-wave { animation: wave 10s ease-in-out infinite; }
        .animate-tide { animation: tide 16s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

function ForestLayer() {
  return (
    <div className="absolute inset-0 opacity-60">
      <div className="absolute inset-x-[-12%] top-[8%] h-[28vh] bg-[linear-gradient(90deg,transparent,hsl(var(--accent)/0.12),transparent)] blur-3xl animate-mist" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--accent-alt)/0.12),transparent_28%),radial-gradient(circle_at_80%_10%,hsl(var(--accent)/0.1),transparent_24%)] animate-canopy" />
      <style jsx>{`
        @keyframes mist {
          0%, 100% { transform: translateX(-8%) translateY(0); opacity: 0.34; }
          50% { transform: translateX(8%) translateY(16px); opacity: 0.68; }
        }
        @keyframes canopy {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(10px) scale(1.04); }
        }
        .animate-mist { animation: mist 22s ease-in-out infinite; }
        .animate-canopy { animation: canopy 16s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

function SunriseLayer() {
  return (
    <div className="absolute inset-0 opacity-70">
      <div className="absolute -left-[18%] bottom-[-28%] h-[72vh] w-[72vh] rounded-full bg-[radial-gradient(circle,hsl(var(--accent-alt)/0.2),hsl(var(--accent)/0.11)_38%,transparent_68%)] blur-2xl animate-sunrise" />
      <div className="absolute inset-0 bg-[conic-gradient(from_210deg_at_12%_92%,hsl(var(--accent)/0.16),transparent_16%,transparent_100%)] animate-rays" />
      <style jsx>{`
        @keyframes sunrise {
          0%, 100% { transform: scale(1); opacity: 0.62; }
          50% { transform: scale(1.08); opacity: 0.9; }
        }
        @keyframes rays {
          0%, 100% { opacity: 0.28; transform: rotate(-1deg); }
          50% { opacity: 0.55; transform: rotate(2deg); }
        }
        .animate-sunrise { animation: sunrise 12s ease-in-out infinite; }
        .animate-rays { animation: rays 18s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

function ArcticLayer() {
  return (
    <div className="absolute inset-0 opacity-55">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,rgba(210,255,250,0.08)_18%,transparent_36%,transparent_100%)] bg-[length:280px_280px] animate-ice-slide" />
      <div className="absolute right-[-12%] top-[6%] h-[62vh] w-[44vw] skew-x-[-18deg] bg-[linear-gradient(135deg,hsl(var(--accent)/0.12),transparent)] blur-2xl animate-ice-glow" />
      <style jsx>{`
        @keyframes iceSlide {
          from { transform: translate3d(-30px, -30px, 0); }
          to { transform: translate3d(30px, 30px, 0); }
        }
        @keyframes iceGlow {
          0%, 100% { opacity: 0.3; transform: translateY(0) skewX(-18deg); }
          50% { opacity: 0.62; transform: translateY(18px) skewX(-18deg); }
        }
        .animate-ice-slide { animation: iceSlide 20s linear infinite alternate; }
        .animate-ice-glow { animation: iceGlow 11s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

function CyberLayer() {
  return (
    <div className="absolute inset-0 opacity-45">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--accent)/0.08)_1px,transparent_1px)] bg-[length:76px_76px] animate-grid-drift" />
      <div className="absolute inset-x-0 top-1/3 h-px bg-[linear-gradient(90deg,transparent,hsl(var(--accent)/0.5),transparent)] animate-scanline" />
      <style jsx>{`
        @keyframes gridDrift {
          from { transform: perspective(600px) rotateX(52deg) translateY(-60px); }
          to { transform: perspective(600px) rotateX(52deg) translateY(60px); }
        }
        @keyframes scanline {
          0% { transform: translateY(-18vh); opacity: 0; }
          20%, 80% { opacity: 0.7; }
          100% { transform: translateY(38vh); opacity: 0; }
        }
        .animate-grid-drift { animation: gridDrift 12s linear infinite alternate; transform-origin: bottom; }
        .animate-scanline { animation: scanline 5s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

function EmberLayer() {
  const embers = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        id: i,
        left: 8 + Math.random() * 84,
        size: 1 + Math.random() * 3,
        duration: 5 + Math.random() * 7,
        delay: -Math.random() * 8,
        opacity: 0.25 + Math.random() * 0.45,
      })),
    []
  );

  return (
    <div className="absolute inset-0">
      <div className="absolute bottom-[-22%] left-[-8%] h-[50vh] w-[70vw] rounded-full bg-[radial-gradient(circle,hsl(var(--accent)/0.16),transparent_62%)] blur-3xl animate-ember-glow" />
      {embers.map((ember) => (
        <span
          key={ember.id}
          className="absolute bottom-[-8vh] rounded-full bg-[hsl(var(--accent))] shadow-[0_0_12px_hsl(var(--accent)/0.65)]"
          style={{
            left: `${ember.left}%`,
            width: ember.size,
            height: ember.size,
            opacity: ember.opacity,
            animation: `emberRise ${ember.duration}s ease-in infinite`,
            animationDelay: `${ember.delay}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes emberGlow {
          0%, 100% { opacity: 0.45; transform: scale(1); }
          50% { opacity: 0.78; transform: scale(1.08); }
        }
        @keyframes emberRise {
          0% { transform: translate3d(0, 0, 0); opacity: 0; }
          15% { opacity: 0.8; }
          100% { transform: translate3d(24px, -92vh, 0); opacity: 0; }
        }
        .animate-ember-glow { animation: emberGlow 7s ease-in-out infinite; }
      `}</style>
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
