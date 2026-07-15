"use client";

import { BackgroundStage } from "@/components/bg/background-stage";
import { TopBar } from "@/components/top-bar";
import { Dock } from "@/components/dock";
import { Desktop, Window } from "@/components/retro/window";
import { useStore } from "@/lib/store";
import { THEMES } from "@/lib/themes";
import { SKINS } from "@/lib/skins";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/**
 * THEMES.CPL — the Display Properties dialog. Each room renders as
 * a little CRT monitor; clicking one applies the color scheme and
 * its ambience preset instantly.
 */
export default function ThemesPage() {
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const skin = useStore((s) => s.skin);
  const setSkin = useStore((s) => s.setSkin);
  const active = THEMES.find((t) => t.id === theme);

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden">
      <TopBar />

      <Desktop className="z-[5] min-h-0 flex-1 overflow-hidden">
        <BackgroundStage />
        <main className="relative z-[6] mx-auto h-full w-full max-w-4xl overflow-y-auto p-4 pb-16 sm:p-6">
          <Window
            title="DISPLAY PROPERTIES — THEMES.CPL"
            draggable
            bodyClassName="p-4"
            statusBar={
              <>
                <span className="status-cell flex-1">
                  Current scheme: {active?.name ?? "Unknown"}
                </span>
                <span className="status-cell">{THEMES.length} schemes installed</span>
              </>
            }
          >
            {/* Interface modes — full design languages */}
            <p className="mb-2 font-pixel text-[10px] uppercase tracking-wider text-text-dim">
              Interface
            </p>
            <div className="mb-5 grid gap-2 sm:grid-cols-3">
              {SKINS.map((s) => {
                const isActive = skin === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSkin(s.id);
                      toast(`${s.name} interface loaded`, {
                        description: s.tagline,
                      });
                    }}
                    className={cn(
                      "flex flex-col gap-1.5 p-2 text-left",
                      isActive ? "bevel-in bg-[var(--paper)]" : "bevel-thin"
                    )}
                  >
                    <span
                      className="bevel-thin block h-10 w-full"
                      style={{ background: s.preview.desktop }}
                    >
                      <span
                        className="ml-2 mt-2 block h-5 w-16"
                        style={{ background: s.preview.chrome }}
                      >
                        <span
                          className="block h-1.5 w-full"
                          style={{ background: s.preview.titleBar }}
                        />
                      </span>
                    </span>
                    <span className={cn("text-[11px]", isActive && "font-bold")}>
                      {s.name}
                    </span>
                    <span className="text-[10px] text-text-faint">
                      {s.tagline}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="mb-2 font-pixel text-[10px] uppercase tracking-wider text-text-dim">
              Color scheme
            </p>
            <p className="mb-4 text-[12px] text-text-dim">
              Select a scheme. Wallpaper, title bars and the ambience preset
              apply immediately — no restart required.
            </p>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {THEMES.map((t) => {
                const isActive = theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id);
                      toast(`${t.name} scheme applied`, {
                        description: "Ambience preset loaded.",
                      });
                    }}
                    className={cn(
                      "flex flex-col items-center gap-2 p-2",
                      isActive && "bevel-in bg-[var(--paper)]"
                    )}
                  >
                    {/* Tiny CRT monitor */}
                    <span className="bevel-out block w-full bg-chrome p-1.5 pb-1">
                      <span
                        className="bevel-in block h-16 w-full"
                        style={{ background: t.gradient }}
                      >
                        <span
                          className="mx-auto mt-3 block h-2 w-8"
                          style={{ background: `hsl(${t.accent})` }}
                        />
                        <span
                          className="mx-auto mt-1 block h-1 w-12"
                          style={{ background: `hsl(${t.accentAlt})` }}
                        />
                      </span>
                      <span className="mx-auto mt-1 block h-1.5 w-8 bg-chrome-lo" />
                    </span>
                    <span className="text-center">
                      <span
                        className={cn(
                          "block text-[11px]",
                          isActive && "font-bold"
                        )}
                      >
                        {t.name}
                      </span>
                      <span className="block text-[10px] text-text-faint">
                        {t.subtitle}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Window>
        </main>
      </Desktop>

      <Dock />
    </div>
  );
}
