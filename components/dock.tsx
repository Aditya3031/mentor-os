"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DockItem {
  id: string;
  icon: React.ElementType;
  label: string;
  href: string;
}

const ITEMS_LEFT: DockItem[] = [
  { id: "focus", icon: Target, label: "Focus room", href: "/focus" },
  { id: "tasks", icon: CheckSquare, label: "Tasks", href: "/tasks" },
  { id: "stats", icon: BarChart3, label: "Analytics", href: "/dashboard" },
  { id: "ai", icon: BrainCircuit, label: "AI coach", href: "/ai" },
  { id: "workspace", icon: UsersRound, label: "Workspace", href: "/workspace" },
  { id: "history", icon: History, label: "History", href: "/history" },
  { id: "trophies", icon: Trophy, label: "Achievements", href: "/achievements" },
];

const ITEMS_RIGHT: DockItem[] = [
  { id: "themes", icon: Palette, label: "Themes", href: "/themes" },
  { id: "settings", icon: Settings, label: "Settings", href: "/settings" },
];

/**
 * Floating bottom dock — macOS style.
 * Auto-highlights based on the current pathname.
 */
export function Dock() {
  const pathname = usePathname();

  return (
    <motion.nav
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        // `zen-hide` so it fades out when zen mode is active
        "zen-hide fixed bottom-3 left-0 right-0 z-50 mx-auto flex w-[calc(100vw-1rem)] max-w-[22rem] items-center justify-center rounded-[18px] border border-white/[0.08] bg-bg-2/65 shadow-deep backdrop-blur-xl backdrop-saturate-150",
        // Mobile: fixed centered bar, no horizontal scrolling or drift
        "gap-0 overflow-hidden p-1",
        // Desktop: original spacious feel
        "sm:bottom-6 sm:w-fit sm:max-w-none sm:gap-1 sm:overflow-visible sm:p-2"
      )}
    >
      {ITEMS_LEFT.map((item) => (
        <DockButton key={item.id} item={item} active={pathname?.startsWith(item.href) ?? false} />
      ))}
      <span className="mx-0.5 h-[22px] w-px flex-shrink-0 bg-white/[0.08] sm:mx-1" />
      {ITEMS_RIGHT.map((item) => (
        <DockButton key={item.id} item={item} active={pathname?.startsWith(item.href) ?? false} />
      ))}
    </motion.nav>
  );
}

function DockButton({ item, active }: { item: DockItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-label={item.label}
      className={cn(
        // Mobile: smaller (36×36) so all 9 items fit on a 360px screen
        "group relative grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg text-text-dim transition-all duration-300 ease-elegant",
        // Desktop: bigger (44×44) with rounded-xl
        "sm:h-11 sm:w-11 sm:rounded-xl",
        "hover:-translate-y-0.5 hover:bg-white/[0.06] hover:text-text",
        active && "bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))]"
      )}
    >
      <Icon className="h-4 w-4 sm:h-[19px] sm:w-[19px]" />
      {/* Tooltips only on devices with hover (i.e., not phones) */}
      <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-white/[0.08] bg-bg-2 px-2 py-1 text-[11px] opacity-0 transition-opacity sm:block group-hover:opacity-100">
        {item.label}
      </span>
    </Link>
  );
}
