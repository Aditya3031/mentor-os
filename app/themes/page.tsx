"use client";

import { BackgroundStage } from "@/components/bg/background-stage";
import { TopBar } from "@/components/top-bar";
import { Dock } from "@/components/dock";
import { useStore } from "@/lib/store";
import { THEMES } from "@/lib/themes";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { toast } from "sonner";

export default function ThemesPage() {
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);

  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      <BackgroundStage />
      <TopBar />

      <main className="relative z-[5] mx-auto w-full max-w-4xl flex-1 overflow-y-auto px-7 pb-28">
        <header className="mb-8 mt-2">
          <p className="text-xs uppercase tracking-[0.2em] text-text-dim">
            Choose your room
          </p>
          <h1 className="mt-2 text-balance text-3xl font-light tracking-tight">
            Seven curated environments.
          </h1>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {THEMES.map((t) => {
            const active = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  toast(`Switched to ${t.name}`);
                }}
                className={cn(
                  "group relative aspect-[4/3] overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:-translate-y-1",
                  active
                    ? "border-[hsl(var(--accent))] shadow-[0_0_0_4px_hsl(var(--accent)/0.15)]"
                    : "border-transparent"
                )}
              >
                <div className="absolute inset-0" style={{ background: t.gradient }} />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(circle at 70% 30%, hsl(${t.accent} / 0.4), transparent 50%)`,
                  }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(circle at 30% 70%, hsl(${t.accentAlt} / 0.3), transparent 50%)`,
                  }}
                />
                {active && (
                  <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-white/20 bg-black/50 px-2.5 py-1 text-[10px] uppercase tracking-wide text-white backdrop-blur-md">
                    <Check className="h-3 w-3" />
                    Active
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-left">
                  <h3 className="text-base font-semibold text-white">{t.name}</h3>
                  <p className="mt-0.5 text-xs text-white/80">{t.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>
      </main>

      <Dock />
    </div>
  );
}
