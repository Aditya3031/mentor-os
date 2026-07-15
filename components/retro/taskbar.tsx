"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  Target,
  CheckSquare,
  BarChart3,
  History,
  Trophy,
  Palette,
  Settings,
  BrainCircuit,
  UsersRound,
  Video,
  Flame,
  Power,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { formatTime, cn } from "@/lib/utils";
import { signOut, useUser } from "@/lib/auth";

interface Program {
  id: string;
  icon: React.ElementType;
  label: string;
  href: string;
  /** Hide from the taskbar strip below this breakpoint (always in Start) */
  minWidth?: "md" | "lg" | "xl";
}

const PROGRAMS: Program[] = [
  { id: "focus", icon: Target, label: "FOCUS.EXE", href: "/focus" },
  { id: "tasks", icon: CheckSquare, label: "TASKS.SYS", href: "/tasks", minWidth: "md" },
  { id: "stats", icon: BarChart3, label: "STATS.EXE", href: "/dashboard", minWidth: "md" },
  { id: "ai", icon: BrainCircuit, label: "AI.HLP", href: "/ai", minWidth: "lg" },
  { id: "workspace", icon: UsersRound, label: "ROOM.NET", href: "/workspace", minWidth: "xl" },
  { id: "session", icon: Video, label: "LIVE.CAM", href: "/session", minWidth: "xl" },
  { id: "history", icon: History, label: "LOG.TXT", href: "/history", minWidth: "lg" },
  { id: "trophies", icon: Trophy, label: "TROPHY.CAB", href: "/achievements", minWidth: "xl" },
  { id: "themes", icon: Palette, label: "THEMES.CPL", href: "/themes", minWidth: "lg" },
  { id: "settings", icon: Settings, label: "SETUP.INI", href: "/settings", minWidth: "lg" },
];

const MIN_W: Record<NonNullable<Program["minWidth"]>, string> = {
  md: "hidden md:inline-flex",
  lg: "hidden lg:inline-flex",
  xl: "hidden xl:inline-flex",
};

/**
 * The taskbar. Replaces the floating macOS dock: Start menu with
 * every program, quick-launch buttons for the common ones, and a
 * system tray with the live pomodoro readout, streak and clock.
 */
export function Taskbar() {
  const pathname = usePathname();

  return (
    <nav className="zen-hide fixed inset-x-0 bottom-0 z-50 flex h-11 items-center gap-1 border-t-2 border-[var(--edge-light)] bg-chrome px-1 shadow-[0_-1px_0_var(--edge-dark)]">
      <StartMenu />
      <span className="mx-0.5 h-7 w-[2px] flex-shrink-0 bevel-thin-in" />

      <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
        {PROGRAMS.map((p) => {
          const active = pathname?.startsWith(p.href) ?? false;
          const Icon = p.icon;
          return (
            <Link
              key={p.id}
              href={p.href}
              className={cn(
                "btn95 h-8 max-w-[150px] flex-shrink gap-1.5 truncate px-2.5 text-[10px] normal-case",
                p.minWidth && MIN_W[p.minWidth],
                active &&
                  "bevel-in font-bold [background-image:radial-gradient(rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:3px_3px]"
              )}
            >
              <Icon className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="hidden truncate sm:inline">{p.label}</span>
            </Link>
          );
        })}
      </div>

      <SystemTray />
    </nav>
  );
}

function StartMenu() {
  const user = useUser();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="btn95 h-8 flex-shrink-0 gap-1.5 px-3 font-bold data-[state=open]:bevel-in">
          <span className="grid h-4 w-4 place-items-center bg-[var(--title-grad)] text-[9px] text-white">
            ▞
          </span>
          Start
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side="top"
          align="start"
          sideOffset={4}
          className="win95 z-[60] flex min-w-[230px] p-[3px]"
        >
          {/* Classic vertical brand ribbon */}
          <div className="flex w-7 items-end justify-center bg-[var(--title-grad)] pb-2">
            <span className="font-pixel text-[10px] tracking-widest text-white [writing-mode:vertical-rl] rotate-180">
              FOCUSFLOW·95
            </span>
          </div>
          <div className="flex flex-1 flex-col py-1">
            {PROGRAMS.map((p) => {
              const Icon = p.icon;
              return (
                <DropdownMenu.Item key={p.id} asChild>
                  <Link
                    href={p.href}
                    className="flex cursor-pointer items-center gap-2.5 px-3 py-1.5 text-[12px] outline-none data-[highlighted]:bg-[var(--accent-deep)] data-[highlighted]:text-white"
                  >
                    <Icon className="h-4 w-4" />
                    {p.label}
                  </Link>
                </DropdownMenu.Item>
              );
            })}
            <DropdownMenu.Separator className="mx-1 my-1 h-[2px] bevel-thin-in" />
            <DropdownMenu.Item
              onSelect={() => {
                if (user) void signOut();
                else window.location.href = "/login";
              }}
              className="flex cursor-pointer items-center gap-2.5 px-3 py-1.5 text-[12px] outline-none data-[highlighted]:bg-[var(--accent-deep)] data-[highlighted]:text-white"
            >
              <Power className="h-4 w-4" />
              {user ? `Log off ${user.name?.split(" ")[0] ?? ""}…` : "Log on…"}
            </DropdownMenu.Item>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function SystemTray() {
  const running = useStore((s) => s.running);
  const remaining = useStore((s) => s.remaining);
  const mode = useStore((s) => s.mode);
  const streakDays = useStore((s) => s.streakDays);

  const [clock, setClock] = useState("");
  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    tick();
    const id = setInterval(tick, 10_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-shrink-0 items-center gap-1">
      {running && (
        <Link
          href="/focus"
          className="status-cell hidden items-center gap-1.5 font-digits text-[15px] leading-none sm:flex"
          title={`${mode} session running`}
        >
          <span className="h-2 w-2 animate-blink bg-[var(--accent-deep)]" />
          {formatTime(remaining)}
        </Link>
      )}
      {streakDays > 0 && (
        <span className="status-cell hidden items-center gap-1 md:flex" title="Day streak">
          <Flame className="h-3 w-3" />
          {streakDays}
        </span>
      )}
      <span className="status-cell min-w-[64px] text-center" suppressHydrationWarning>
        {clock}
      </span>
    </div>
  );
}
