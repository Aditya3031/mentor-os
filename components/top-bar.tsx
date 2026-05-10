"use client";

import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Search, Bell, Maximize2, LogOut, UserRound } from "lucide-react";
import { signOut, useUser } from "@/lib/auth";

/**
 * Glass top bar with brand, sync status, and quick actions.
 */
export function TopBar() {
  const user = useUser();
  const toggleZen = () => document.body.classList.toggle("zen");
  const initial = (user?.name || user?.email || "U").trim().charAt(0).toUpperCase();
  const statusLabel = user ? "Cloud sync ready" : "Guest mode";

  return (
    <header className="relative z-10 flex items-center justify-between px-7 py-4">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="grid h-[30px] w-[30px] place-items-center rounded-[9px] bg-[linear-gradient(135deg,hsl(var(--accent)),hsl(var(--accent-alt)))] shadow-glow">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-bg-0" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        </div>
        <span className="text-[15px] font-semibold tracking-tight">
          focus<span className="text-[hsl(var(--accent))]">.</span>flow
        </span>
      </Link>

      <div className="flex items-center gap-2 rounded-full border border-[#7DE0B6]/[0.18] bg-[#7DE0B6]/[0.08] px-3 py-1.5 text-xs text-[#B6EFD3]">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#7DE0B6] shadow-[0_0_12px_#7DE0B6]" />
        <span>{statusLabel}</span>
      </div>

      <div className="flex items-center gap-2">
        <button className="grid h-9 w-9 place-items-center rounded-[10px] text-text-dim transition-colors hover:bg-white/[0.04] hover:text-text">
          <Search className="h-[18px] w-[18px]" />
        </button>
        <button onClick={toggleZen} className="grid h-9 w-9 place-items-center rounded-[10px] text-text-dim transition-colors hover:bg-white/[0.04] hover:text-text">
          <Maximize2 className="h-[18px] w-[18px]" />
        </button>
        <button className="grid h-9 w-9 place-items-center rounded-[10px] text-text-dim transition-colors hover:bg-white/[0.04] hover:text-text">
          <Bell className="h-[18px] w-[18px]" />
        </button>
        <span className="mx-1 h-5 w-px bg-white/[0.08]" />
        {user ? (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                aria-label="Open profile menu"
                className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-[linear-gradient(135deg,hsl(var(--accent)),hsl(var(--accent-alt)))] text-[11px] font-semibold text-bg-0 ring-1 ring-white/10 transition-transform hover:scale-105"
              >
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  initial
                )}
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={10}
                className="z-50 w-64 rounded-xl border border-white/[0.1] bg-[#14141d]/95 p-2 text-sm text-text shadow-soft backdrop-blur-xl"
              >
                <div className="px-2.5 py-2">
                  <div className="truncate font-medium">{user.name}</div>
                  <div className="mt-0.5 truncate text-xs text-text-dim">{user.email}</div>
                </div>
                <DropdownMenu.Separator className="my-1 h-px bg-white/[0.08]" />
                <DropdownMenu.Item asChild>
                  <Link
                    href="/settings"
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-text-dim outline-none transition-colors hover:bg-white/[0.06] hover:text-text"
                  >
                    <UserRound className="h-4 w-4" />
                    Profile & settings
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onSelect={() => void signOut()}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-text-dim outline-none transition-colors hover:bg-white/[0.06] hover:text-text"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        ) : (
          <Link
            href="/login"
            aria-label="Sign in"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/[0.12] bg-white/[0.04] text-text-dim transition-colors hover:bg-white/[0.08] hover:text-text"
          >
            <UserRound className="h-[18px] w-[18px]" />
          </Link>
        )}
      </div>
    </header>
  );
}
