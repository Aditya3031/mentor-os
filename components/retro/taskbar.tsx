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
  DoorOpen,
  GraduationCap,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { formatTime, cn } from "@/lib/utils";
import { signOut, useUser } from "@/lib/auth";
import { getSkin, windowTitle, type ChromeStyle } from "@/lib/skins";
import { useRooms } from "@/lib/voice";

interface Program {
  id: string;
  icon: React.ElementType;
  /** Canonical retro name; the active skin derives its own label */
  label: string;
  href: string;
  /** Hide from the bar below this breakpoint (always in the menu) */
  minWidth?: "md" | "lg" | "xl";
}

const PROGRAMS: Program[] = [
  { id: "focus", icon: Target, label: "FOCUS.EXE", href: "/focus" },
  { id: "quiz", icon: GraduationCap, label: "QUIZ.EXE", href: "/quiz", minWidth: "md" },
  { id: "rooms", icon: DoorOpen, label: "ROOMS.NET", href: "/rooms", minWidth: "md" },
  { id: "tasks", icon: CheckSquare, label: "TASKS.SYS", href: "/tasks", minWidth: "md" },
  { id: "stats", icon: BarChart3, label: "STATS.EXE", href: "/dashboard", minWidth: "lg" },
  { id: "ai", icon: BrainCircuit, label: "AI.HLP", href: "/ai", minWidth: "lg" },
  { id: "workspace", icon: UsersRound, label: "ROOM.NET", href: "/workspace", minWidth: "xl" },
  { id: "session", icon: Video, label: "LIVE.CAM", href: "/session", minWidth: "xl" },
  { id: "history", icon: History, label: "LOG.TXT", href: "/history", minWidth: "xl" },
  { id: "trophies", icon: Trophy, label: "TROPHY.CAB", href: "/achievements", minWidth: "xl" },
  { id: "themes", icon: Palette, label: "THEMES.CPL", href: "/themes", minWidth: "lg" },
  { id: "settings", icon: Settings, label: "SETUP.INI", href: "/settings", minWidth: "lg" },
];

const MIN_W: Record<NonNullable<Program["minWidth"]>, string> = {
  md: "hidden md:inline-flex",
  lg: "hidden lg:inline-flex",
  xl: "hidden xl:inline-flex",
};

/** Per-paradigm styling for the nav bar and its items. */
const NAV: Record<
  ChromeStyle,
  {
    bar: string;
    item: string;
    active: string;
    menuLabel: string;
    showIcons: boolean;
  }
> = {
  os: {
    bar: "h-11 gap-1 border-t-2 border-[var(--edge-light)] bg-chrome px-1 shadow-[0_-1px_0_var(--edge-dark)]",
    item: "btn95 h-8 max-w-[150px] gap-1.5 px-2.5 text-[10px] normal-case",
    active:
      "bevel-in font-bold [background-image:radial-gradient(rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:3px_3px]",
    menuLabel: "Start",
    showIcons: true,
  },
  hud: {
    bar: "h-10 gap-0.5 bg-chrome/95 px-2 shadow-[inset_0_1px_0_hsl(var(--accent)/0.6),0_0_18px_hsl(var(--accent)/0.12)]",
    item: "hud-nav h-7 max-w-[150px] px-2.5 text-[9px]",
    active: "hud-nav-active",
    menuLabel: "SYS",
    showIcons: false,
  },
  holo: {
    bar: "h-10 gap-1 bg-chrome/70 px-2 backdrop-blur-md shadow-[inset_0_1px_0_hsl(var(--accent)/0.45),0_0_24px_hsl(var(--accent)/0.1)]",
    item: "h-7 max-w-[150px] px-2.5 font-pixel text-[9px] uppercase tracking-[0.18em] text-text-dim hover:text-[var(--accent-deep)]",
    active:
      "text-[var(--accent-deep)] shadow-[inset_0_-1px_0_hsl(var(--accent)/0.8)] [text-shadow:0_0_10px_hsl(var(--accent)/0.5)]",
    menuLabel: "◇ MENU",
    showIcons: false,
  },
  cockpit: {
    bar: "h-10 gap-1 bg-chrome px-2 shadow-[inset_0_2px_0_rgba(0,0,0,0.5),inset_0_-1px_0_rgba(255,255,255,0.06),0_-2px_10px_rgba(0,0,0,0.4)]",
    item: "h-7 max-w-[150px] px-2.5 font-pixel text-[8px] uppercase tracking-[0.16em] text-text-dim hover:text-text",
    active:
      "bg-black/40 text-[var(--accent-deep)] shadow-[inset_0_0_0_1px_hsl(var(--accent)/0.4)]",
    menuLabel: "CTL",
    showIcons: false,
  },
  ghost: {
    bar: "h-10 gap-1 bg-chrome px-2 shadow-[inset_0_1px_0_rgba(0,0,0,0.08)]",
    item: "h-7 max-w-[150px] px-2.5 text-[11px] text-text-dim hover:text-text",
    active:
      "font-semibold text-[var(--accent-deep)] shadow-[inset_0_-2px_0_var(--accent-deep)]",
    menuLabel: "Menu",
    showIcons: false,
  },
  void: {
    bar: "h-9 gap-1 bg-chrome px-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
    item: "h-7 max-w-[150px] px-2 text-[11px] lowercase tracking-[0.08em] text-text-faint hover:text-text",
    active: "text-[var(--accent-deep)]",
    menuLabel: "menu",
    showIcons: false,
  },
  deck: {
    bar: "h-10 gap-1 bg-chrome px-2 shadow-[inset_0_2px_0_color-mix(in_srgb,var(--accent-deep),transparent_35%),0_0_20px_rgba(0,0,0,0.4)]",
    item: "h-7 max-w-[150px] gap-1.5 px-2.5 font-pixel text-[8px] uppercase tracking-wider text-text-dim hover:text-text",
    active: "text-[var(--accent-deep)] [text-shadow:0_0_8px_currentColor]",
    menuLabel: "▶ MENU",
    showIcons: false,
  },
};

/**
 * Bottom navigation in the active skin's paradigm: a real taskbar for
 * the OS skins, a tmux status line for the terminal, a HUD strip for
 * cyberpunk, a plaque rail for edo, and so on.
 */
export function Taskbar() {
  const pathname = usePathname();
  const skinId = useStore((s) => s.skin);
  const chrome = getSkin(skinId).chrome;
  const nav = NAV[chrome];

  return (
    <nav
      className={cn(
        "zen-hide fixed inset-x-0 bottom-0 z-50 flex items-center",
        nav.bar
      )}
    >
      <NavMenu chrome={chrome} skinId={skinId} />
      {chrome === "os" && <span className="mx-0.5 h-7 w-[2px] flex-shrink-0 bevel-thin-in" />}

      <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
        {PROGRAMS.map((p) => {
          const active = pathname?.startsWith(p.href) ?? false;
          const Icon = p.icon;
          const label = windowTitle(p.label, skinId);
          return (
            <Link
              key={p.id}
              href={p.href}
              className={cn(
                "inline-flex flex-shrink items-center truncate",
                nav.item,
                p.minWidth && MIN_W[p.minWidth],
                active && nav.active
              )}
            >
              {nav.showIcons && <Icon className="h-3.5 w-3.5 flex-shrink-0" />}
              <span className={cn("truncate", nav.showIcons && "hidden sm:inline")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>

      <SystemTray />
    </nav>
  );
}

function NavMenu({ chrome, skinId }: { chrome: ChromeStyle; skinId: ReturnType<typeof useStore.getState>["skin"] }) {
  const user = useUser();
  const skin = getSkin(skinId);

  const trigger =
    chrome === "os" ? (
      <button className="btn95 h-8 flex-shrink-0 gap-1.5 px-3 font-bold data-[state=open]:bevel-in">
        <span className="grid h-4 w-4 place-items-center bg-[var(--title-grad)] text-[9px] text-white">
          ▞
        </span>
        {NAV[chrome].menuLabel}
      </button>
    ) : (
      <button
        className={cn(
          "flex-shrink-0",
          chrome === "hud" && "hud-nav hud-nav-active h-7 px-3 text-[9px]",
          chrome === "holo" &&
            "h-7 px-2.5 font-pixel text-[9px] uppercase tracking-[0.18em] text-[var(--accent-deep)] [text-shadow:0_0_10px_hsl(var(--accent)/0.5)]",
          chrome === "cockpit" &&
            "h-7 bg-black/40 px-3 font-pixel text-[8px] uppercase tracking-[0.16em] text-[var(--accent-deep)] shadow-[inset_0_0_0_1px_hsl(var(--accent)/0.4)]",
          chrome === "ghost" &&
            "h-7 px-2.5 text-[11px] font-semibold text-[var(--accent-deep)]",
          chrome === "void" &&
            "h-7 px-2 text-[11px] lowercase tracking-[0.08em] text-[var(--accent-deep)]",
          chrome === "deck" &&
            "h-7 px-2.5 font-pixel text-[8px] uppercase tracking-wider text-[var(--accent-deep)] [text-shadow:0_0_8px_currentColor]"
        )}
      >
        {NAV[chrome].menuLabel}
      </button>
    );

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side="top"
          align="start"
          sideOffset={4}
          className="win95 z-[60] flex min-w-[230px] p-[3px]"
        >
          {chrome === "os" && (
            <div className="flex w-7 items-end justify-center bg-[var(--title-grad)] pb-2">
              <span className="font-pixel text-[10px] tracking-widest text-white [writing-mode:vertical-rl] rotate-180">
                {skin.name}
              </span>
            </div>
          )}
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
                    {windowTitle(p.label, skinId)}
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
  const roomId = useRooms((s) => s.roomId);
  const voiceStatus = useRooms((s) => s.voiceStatus);

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
      {roomId && (
        <Link
          href="/rooms"
          className="status-cell hidden items-center gap-1.5 sm:flex"
          title={voiceStatus === "connected" ? "In room · voice on" : "In room"}
        >
          <span
            className={cn(
              "h-2 w-2",
              voiceStatus === "connected"
                ? "animate-blink bg-[#3aff9e]"
                : "bg-[var(--accent-deep)]"
            )}
          />
          <DoorOpen className="h-3 w-3" />
        </Link>
      )}
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
