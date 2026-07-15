"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { SKINS, type SkinId } from "@/lib/skins";
import { cn } from "@/lib/utils";

/**
 * Startup interface chooser, styled like a boot manager. Shows on
 * first visit (before anything else) and can be reopened from the
 * View menu or THEMES.CPL. Arrow keys + Enter or click.
 */
export function SkinChooser() {
  const skin = useStore((s) => s.skin);
  const skinChosen = useStore((s) => s.skinChosen);
  const chooserOpen = useStore((s) => s.skinChooserOpen);
  const setSkin = useStore((s) => s.setSkin);
  const closeSkinChooser = useStore((s) => s.closeSkinChooser);

  // Wait for zustand persist to hydrate before deciding to show —
  // otherwise returning users flash the chooser on every load.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const open = mounted && (!skinChosen || chooserOpen);

  const [cursor, setCursor] = useState(() =>
    Math.max(0, SKINS.findIndex((s) => s.id === skin))
  );

  const choose = (id: SkinId) => {
    setSkin(id);
    closeSkinChooser();
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        setCursor((c) => (c + 1) % SKINS.length);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        setCursor((c) => (c - 1 + SKINS.length) % SKINS.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        choose(SKINS[cursor].id);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, cursor]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[800] flex flex-col items-center justify-center bg-black px-4 font-digits text-[#c8c8c8]">
      {/* Boot-manager header */}
      <div className="w-full max-w-2xl">
        <p className="text-xl text-[#e8e8e8] sm:text-2xl">
          FOCUSFLOW STARTUP MANAGER
        </p>
        <p className="mt-1 text-base opacity-60">
          Select the interface to boot. This changes the entire look —
          you can switch any time from View → Interface.
        </p>
        <div className="mt-2 h-[2px] w-full bg-[#3a3a3a]" />
      </div>

      <div className="mt-6 flex w-full max-w-2xl flex-col gap-3">
        {SKINS.map((s, i) => {
          const active = i === cursor;
          return (
            <button
              key={s.id}
              onMouseEnter={() => setCursor(i)}
              onFocus={() => setCursor(i)}
              onClick={() => choose(s.id)}
              className={cn(
                "flex items-stretch gap-4 border-2 p-3 text-left transition-none",
                active
                  ? "border-[#e8e8e8] bg-[#141414]"
                  : "border-[#333] opacity-70 hover:opacity-100"
              )}
            >
              {/* Mini desktop preview */}
              <span
                className="relative hidden w-36 flex-shrink-0 overflow-hidden sm:block"
                style={{ background: s.preview.desktop }}
                aria-hidden
              >
                <span
                  className="absolute left-3 top-3 block h-16 w-24"
                  style={{
                    background: s.preview.chrome,
                    boxShadow: `inset 0 0 0 1px ${s.preview.accent}55`,
                  }}
                >
                  <span
                    className="block h-4 w-full"
                    style={{ background: s.preview.titleBar }}
                  />
                  <span
                    className="mx-2 mt-2 block h-2 w-2/3"
                    style={{ background: s.preview.accent }}
                  />
                  <span
                    className="mx-2 mt-1 block h-1.5 w-1/2"
                    style={{ background: `${s.preview.text}44` }}
                  />
                </span>
                <span
                  className="absolute inset-x-0 bottom-0 block h-3"
                  style={{ background: s.preview.chrome }}
                />
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline gap-x-3">
                  <span
                    className={cn(
                      "text-xl",
                      active ? "text-white" : "text-[#c8c8c8]"
                    )}
                  >
                    {active ? "▶ " : "  "}
                    {s.bootLabel}
                  </span>
                  <span className="text-sm opacity-60">{s.tagline}</span>
                </span>
                <span className="mt-1 block text-sm leading-5 opacity-70">
                  {s.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-6 animate-blink text-sm opacity-60">
        ↑↓ select · ENTER boot · or click
      </p>
    </div>
  );
}
