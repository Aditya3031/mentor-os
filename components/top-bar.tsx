"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { toast } from "sonner";
import { LogOut, UserRound } from "lucide-react";
import { signOut, useUser } from "@/lib/auth";
import { useStore } from "@/lib/store";

/**
 * OS menu bar: brand block + File / View / Help menus (all real),
 * user session on the right. Replaces the old glass top bar.
 */
export function TopBar() {
  const user = useUser();
  const router = useRouter();
  const openSkinChooser = useStore((s) => s.openSkinChooser);

  /** Zen mode = hide chrome + request browser fullscreen. */
  const toggleZen = async () => {
    const enteringZen = !document.body.classList.contains("zen");
    document.body.classList.toggle("zen");
    try {
      if (enteringZen) {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } else if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      // Fullscreen may be rejected — the CSS class alone still works.
    }
  };

  /** If the user exits fullscreen with Esc, un-zen automatically. */
  useEffect(() => {
    const sync = () => {
      if (!document.fullscreenElement) {
        document.body.classList.remove("zen");
      }
    };
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  return (
    <header className="relative z-10 flex h-9 items-center gap-0.5 border-b-2 border-[var(--edge-dark)] bg-chrome px-1.5 shadow-[0_1px_0_var(--edge-light)]">
      <Link
        href="/"
        className="mr-1 flex items-center gap-1.5 px-1.5 font-pixel text-[10px] tracking-wider"
      >
        <span className="grid h-4 w-4 place-items-center bg-[var(--title-grad)] text-[8px] text-white">
          ▞
        </span>
        FOCUSFLOW·95
      </Link>

      <MenuBarMenu label="File">
        <MenuItem onSelect={() => router.push("/focus")}>
          New session
          <MenuHint>Space</MenuHint>
        </MenuItem>
        <MenuItem onSelect={() => router.push("/tasks")}>New task…</MenuItem>
        <MenuSeparator />
        <MenuItem onSelect={() => router.push("/")}>Exit to desktop</MenuItem>
      </MenuBarMenu>

      <MenuBarMenu label="View">
        <MenuItem onSelect={() => void toggleZen()}>
          Zen mode
          <MenuHint>Z</MenuHint>
        </MenuItem>
        <MenuItem onSelect={openSkinChooser}>Interface…</MenuItem>
        <MenuItem onSelect={() => router.push("/themes")}>
          Color schemes…
        </MenuItem>
        <MenuItem onSelect={() => router.push("/dashboard")}>
          Statistics
        </MenuItem>
      </MenuBarMenu>

      <MenuBarMenu label="Help">
        <MenuItem
          onSelect={() =>
            toast("FOCUSFLOW.95", {
              description:
                "Deep-work environment. 640K of focus ought to be enough for anybody.",
            })
          }
        >
          About FOCUSFLOW.95
        </MenuItem>
      </MenuBarMenu>

      <div className="ml-auto flex items-center gap-1">
        {user ? (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="btn95 h-7 gap-1.5 px-2 text-[10px] normal-case data-[state=open]:bevel-in">
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-4 w-4 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <UserRound className="h-3.5 w-3.5" />
                )}
                <span className="hidden max-w-[120px] truncate sm:inline">
                  {user.name || user.email}
                </span>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={4}
                className="win95 z-[60] min-w-[190px] p-[3px] text-[12px]"
              >
                <div className="px-2.5 py-1.5">
                  <div className="truncate font-bold">{user.name}</div>
                  <div className="truncate text-[11px] text-text-dim">
                    {user.email}
                  </div>
                </div>
                <MenuSeparator />
                <MenuItem onSelect={() => router.push("/settings")}>
                  <UserRound className="h-3.5 w-3.5" />
                  Profile & settings
                </MenuItem>
                <MenuItem onSelect={() => void signOut()}>
                  <LogOut className="h-3.5 w-3.5" />
                  Log off
                </MenuItem>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        ) : (
          <Link href="/login" className="btn95 h-7 px-2.5 text-[10px]">
            Log on
          </Link>
        )}
      </div>
    </header>
  );
}

/* ---- Small menu primitives shared by the bar ---- */

function MenuBarMenu({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          aria-label={label}
          className="px-2 py-1 text-[12px] hover:bg-[var(--accent-deep)] hover:text-white data-[state=open]:bg-[var(--accent-deep)] data-[state=open]:text-white"
        >
          <span className="underline decoration-1 underline-offset-2">
            {label.charAt(0)}
          </span>
          {label.slice(1)}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={2}
          className="win95 z-[60] min-w-[190px] p-[3px] text-[12px]"
        >
          {children}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function MenuItem({
  children,
  onSelect,
}: {
  children: React.ReactNode;
  onSelect?: () => void;
}) {
  return (
    <DropdownMenu.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-2 px-2.5 py-1.5 outline-none data-[highlighted]:bg-[var(--accent-deep)] data-[highlighted]:text-white"
    >
      {children}
    </DropdownMenu.Item>
  );
}

function MenuHint({ children }: { children: React.ReactNode }) {
  return <span className="ml-auto pl-6 text-[10px] opacity-60">{children}</span>;
}

function MenuSeparator() {
  return <DropdownMenu.Separator className="mx-1 my-1 h-[2px] bevel-thin-in" />;
}
