"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Target,
  CheckSquare,
  BarChart3,
  Palette,
  Timer,
  Music,
  Flame,
  Keyboard,
  Cloud,
  Trophy,
  Globe,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { THEMES } from "@/lib/themes";
import { BackgroundStage } from "@/components/bg/background-stage";
import { Desktop, Window } from "@/components/retro/window";
import { Taskbar } from "@/components/retro/taskbar";
import { cn } from "@/lib/utils";

/* ============================================================
   Boot screen — BIOS text, RAM counter, block progress bar.
   Plays once per browser session; click anywhere to skip.
   ============================================================ */

const BOOT_LINES = [
  "FOCUSFLOW BIOS v9.5 — (C) DEEP WORK SYSTEMS",
  "CPU: HUMAN BRAIN @ 40 Hz ......... OK",
  "MEMORY TEST: 640K FOCUS ......... OK",
  "DETECTING DISTRACTIONS .......... 0 FOUND",
  "MOUNTING C:\\DEEPWORK ............ OK",
  "STARTING FOCUSFLOW.95 ...",
];

function BootScreen({ onDone }: { onDone: () => void }) {
  const [lines, setLines] = useState(0);
  const [bar, setBar] = useState(0);

  useEffect(() => {
    if (sessionStorage.getItem("ff95-booted")) {
      onDone();
      return;
    }
    const lineTimer = setInterval(() => {
      setLines((n) => {
        if (n >= BOOT_LINES.length) {
          clearInterval(lineTimer);
          return n;
        }
        return n + 1;
      });
    }, 260);
    return () => clearInterval(lineTimer);
  }, [onDone]);

  useEffect(() => {
    if (lines < BOOT_LINES.length) return;
    const barTimer = setInterval(() => {
      setBar((b) => {
        if (b >= 20) {
          clearInterval(barTimer);
          sessionStorage.setItem("ff95-booted", "1");
          setTimeout(onDone, 250);
          return b;
        }
        return b + 1;
      });
    }, 55);
    return () => clearInterval(barTimer);
  }, [lines, onDone]);

  const skip = () => {
    sessionStorage.setItem("ff95-booted", "1");
    onDone();
  };

  return (
    <button
      onClick={skip}
      aria-label="Skip boot screen"
      className="fixed inset-0 z-[100] block w-full cursor-pointer bg-black p-6 text-left font-digits text-lg leading-relaxed text-[#9ee89e] sm:p-10 sm:text-xl"
    >
      {BOOT_LINES.slice(0, lines).map((l) => (
        <div key={l}>{l}</div>
      ))}
      {lines >= BOOT_LINES.length && (
        <div className="mt-4 flex gap-[3px]">
          {Array.from({ length: 20 }, (_, i) => (
            <span
              key={i}
              className={cn(
                "h-4 w-3",
                i < bar ? "bg-[#9ee89e]" : "border border-[#9ee89e]/40"
              )}
            />
          ))}
        </div>
      )}
      <span className="mt-6 block animate-blink text-sm text-[#9ee89e]/70">
        ▌ press any key (or click) to skip
      </span>
    </button>
  );
}

/* ============================================================
   Desktop icons — double-clickable, single click also works
   because it's 2026 and we're merciful.
   ============================================================ */

const DESKTOP_ICONS = [
  { icon: Target, label: "FOCUS.EXE", href: "/focus" },
  { icon: CheckSquare, label: "TASKS.SYS", href: "/tasks" },
  { icon: BarChart3, label: "STATS.EXE", href: "/dashboard" },
  { icon: Palette, label: "THEMES.CPL", href: "/themes" },
  { icon: Trophy, label: "TROPHY.CAB", href: "/achievements" },
];

function DesktopIcons() {
  return (
    <div className="pointer-events-auto absolute left-3 top-3 z-[6] hidden flex-col gap-4 lg:flex">
      {DESKTOP_ICONS.map(({ icon: Icon, label, href }) => (
        <Link
          key={label}
          href={href}
          className="group flex w-[76px] flex-col items-center gap-1.5"
        >
          <span className="grid h-10 w-10 place-items-center bg-chrome bevel-out text-text group-hover:marching-ants">
            <Icon className="h-5 w-5" />
          </span>
          <span className="bg-[var(--desktop)] px-1 text-center font-pixel text-[8px] leading-tight text-white [text-shadow:1px_1px_0_rgba(0,0,0,0.7)] group-hover:bg-[var(--accent-deep)]">
            {label}
          </span>
        </Link>
      ))}
    </div>
  );
}

/* ============================================================
   The landing desktop itself
   ============================================================ */

const FEATURES = [
  { icon: Timer, name: "POMODORO.DRV", desc: "Focus / break cycles with keyboard-first controls and a defrag-style progress bar." },
  { icon: Music, name: "MIXER.EXE", desc: "Blend lofi, rain, café, fireplace, keys and noise. Per-channel faders." },
  { icon: BarChart3, name: "STATS.EXE", desc: "90-day defrag map, weekly graphs, subject breakdowns. Real momentum data." },
  { icon: CheckSquare, name: "TASKS.SYS", desc: "Drag-to-reorder task list with priorities. Persists to disk (localStorage)." },
  { icon: Flame, name: "STREAK.SYS", desc: "Daily streaks, XP and levels. The only virus here is momentum." },
  { icon: Keyboard, name: "HOTKEYS.INI", desc: "Space to run. R to reset. S to skip. Z for zen. Hands stay on the keys." },
];

export function LandingDesktop() {
  const [booting, setBooting] = useState(true);
  const setTheme = useStore((s) => s.setTheme);
  const activeTheme = useStore((s) => s.theme);

  // Fake-but-honest "studying now" counter (see README §Solo together).
  const [online, setOnline] = useState(14892);
  useEffect(() => {
    const id = setInterval(() => {
      setOnline((n) =>
        Math.max(14000, Math.min(16000, n + Math.floor(Math.random() * 61) - 30))
      );
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden">
      {booting && <BootScreen onDone={() => setBooting(false)} />}

      <Desktop className="relative z-[5] min-h-0 flex-1 overflow-hidden">
        <BackgroundStage />
        <DesktopIcons />

        <main className="relative z-[6] mx-auto grid h-full max-w-6xl grid-cols-1 content-start gap-4 overflow-y-auto p-4 pb-16 pt-6 sm:p-6 sm:pb-16 lg:grid-cols-12 lg:content-center lg:overflow-hidden lg:pl-28">
          {/* HERO — WELCOME.TXT */}
          <Window
            title="WELCOME.TXT — Notepad"
            draggable
            className="lg:col-span-7"
            bodyClassName="p-5"
            statusBar={
              <>
                <span className="status-cell flex-1">Ln 1, Col 1</span>
                <span className="status-cell">read-only</span>
              </>
            }
          >
            <p className="font-pixel text-[10px] uppercase tracking-widest text-[var(--accent-deep)]">
              Deep Work Systems presents
            </p>
            <h1 className="mt-2 font-pixel text-3xl leading-tight sm:text-4xl">
              FOCUSFLOW·95
            </h1>
            <p className="mt-3 max-w-md text-[13px] leading-6 text-text-dim">
              The deep-work operating system. Pomodoro cycles, ambient sound
              channels, streaks and analytics — and absolutely no feed to
              scroll. Your attention span called; it wants its RAM back.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/focus" className="btn95 btn95-primary h-10 px-5 text-[12px]">
                ▶ Run FOCUS.EXE
              </Link>
              <Link href="/login" className="btn95 h-10 px-5 text-[12px]">
                Log on
              </Link>
            </div>
            <p className="mt-3 font-digits text-sm text-text-faint">
              * no install wizard. no credit card. works offline.
            </p>
          </Window>

          {/* SYSREQ + ONLINE, stacked */}
          <div className="flex flex-col gap-4 lg:col-span-5">
            <Window title="SYSREQ.TXT" draggable bodyClassName="p-4">
              <p className="font-pixel text-[9px] uppercase tracking-wider text-text-dim">
                System requirements
              </p>
              <ul className="mt-2 space-y-1.5 font-digits text-base leading-6">
                <li>✔ One (1) human brain</li>
                <li>✔ 25 spare minutes</li>
                <li>✔ Something worth finishing</li>
                <li>✘ Willpower — the timer has you</li>
              </ul>
            </Window>

            <Window
              title="ONLINE.NET"
              draggable
              icon={<Globe />}
              bodyClassName="p-4"
              statusBar={<span className="status-cell flex-1">connection: excellent</span>}
            >
              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="font-digits text-4xl leading-none text-[var(--accent-deep)]">
                    {online.toLocaleString()}
                  </div>
                  <div className="mt-1 text-[11px] text-text-dim">
                    people in deep work right now
                  </div>
                </div>
                <span className="mb-1 h-2.5 w-2.5 animate-blink bg-[#1e7d4f]" />
              </div>
            </Window>
          </div>

          {/* FEATURES.DLL */}
          <Window
            title="FEATURES.DLL"
            draggable
            className="lg:col-span-7"
            bodyClassName="p-3"
          >
            <div className="grid gap-1.5 sm:grid-cols-2">
              {FEATURES.map(({ icon: Icon, name, desc }) => (
                <div key={name} className="well flex gap-2.5 p-2.5">
                  <span className="bevel-thin grid h-8 w-8 flex-shrink-0 place-items-center bg-chrome">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="font-pixel text-[9px] uppercase">{name}</div>
                    <div className="mt-1 text-[11px] leading-4 text-text-dim">
                      {desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Window>

          {/* THEMES.CPL — live wallpaper switcher */}
          <Window
            title="DISPLAY PROPERTIES"
            draggable
            className="lg:col-span-5"
            bodyClassName="p-4"
            statusBar={
              <span className="status-cell flex-1">
                click a scheme — wallpaper applies instantly
              </span>
            }
          >
            <div className="grid grid-cols-4 gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  title={t.name}
                  className={cn(
                    "flex flex-col items-center gap-1 p-1",
                    activeTheme === t.id && "bevel-in bg-[var(--paper)]"
                  )}
                >
                  <span
                    className="bevel-thin h-9 w-full"
                    style={{ background: `hsl(${t.accent})` }}
                  />
                  <span className="w-full truncate text-center text-[9px]">
                    {t.name}
                  </span>
                </button>
              ))}
            </div>
          </Window>
        </main>
      </Desktop>

      <Taskbar />
    </div>
  );
}
