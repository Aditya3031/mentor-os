"use client";

import { BackgroundStage } from "@/components/bg/background-stage";
import { TopBar } from "@/components/top-bar";
import { Dock } from "@/components/dock";
import { useStore } from "@/lib/store";
import { Minus, Plus, Trash2 } from "lucide-react";
import { clamp } from "@/lib/utils";

const LIMITS = {
  focus: [1, 90],
  short: [1, 30],
  long: [5, 60],
  cycle: [2, 10],
} as const;

export default function SettingsPage() {
  const mode = useStore((s) => s.mode);
  const setMode = useStore((s) => s.setMode);
  const settings = useStore((s) => s.settings);

const updateSettings = useStore(
  (s) => s.updateSettings
);

  const stepDuration = (k: keyof typeof LIMITS, d: number) => {
    const [mn, mx] = LIMITS[k];
    updateSettings({
      durations: { ...settings.durations, [k]: clamp(settings.durations[k] + d, mn, mx) },
    });
  };

  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      <BackgroundStage />
      <TopBar />

      <main className="relative z-[5] mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-7 pb-28">
        <header className="mb-8 mt-2">
          <p className="text-xs uppercase tracking-[0.2em] text-text-dim">Preferences</p>
          <h1 className="mt-2 text-balance text-3xl font-light tracking-tight">Settings</h1>
        </header>

        <div className="space-y-3.5">
          <Section title="Timer">
            <NumRow
              label="Focus duration"
              desc="Length of each focus session"
              value={`${settings.durations.focus} min`}
              onMinus={() => stepDuration("focus", -1)}
              onPlus={() => stepDuration("focus", 1)}
            />
            <NumRow
              label="Short break"
              desc="Quick reset between sessions"
              value={`${settings.durations.short} min`}
              onMinus={() => stepDuration("short", -1)}
              onPlus={() => stepDuration("short", 1)}
            />
            <NumRow
              label="Long break"
              desc="Restorative break after a cycle"
              value={`${settings.durations.long} min`}
              onMinus={() => stepDuration("long", -1)}
              onPlus={() => stepDuration("long", 1)}
            />
            <NumRow
              label="Long break every"
              desc="Number of focus sessions per cycle"
              value={String(settings.durations.cycle)}
              onMinus={() => stepDuration("cycle", -1)}
              onPlus={() => stepDuration("cycle", 1)}
            />
          </Section>

          <Section title="Behavior">
            <ToggleRow
              label="Auto-start next session"
              desc="Flow seamlessly between focus and breaks"
              value={settings.autoStart}
              onChange={(v) => updateSettings({ autoStart: v })}
            />
            <ToggleRow
              label="Background ticking"
              desc="Subtle clock tick during focus"
              value={settings.ticking}
              onChange={(v) => updateSettings({ ticking: v })}
            />
            <ToggleRow
              label="Sound effects"
              desc="Completion chimes and clicks"
              value={settings.sfx}
              onChange={(v) => updateSettings({ sfx: v })}
            />
            <ToggleRow
              label="Browser notifications"
              desc="Get pinged when sessions end"
              value={settings.notifications}
              onChange={(v) => {
                updateSettings({ notifications: v });
                if (v && "Notification" in window) Notification.requestPermission();
              }}
            />
          </Section>

          <Section title="Look & feel">
            <ToggleRow
              label="Particles"
              desc="Subtle floating particles in background"
              value={settings.particles}
              onChange={(v) => updateSettings({ particles: v })}
            />
            <NumRow
              label="Daily focus goal"
              desc="Target hours of focus per day"
              value={`${settings.dailyHourGoal}h`}
              onMinus={() => updateSettings({ dailyHourGoal: clamp(settings.dailyHourGoal - 1, 1, 16) })}
              onPlus={() => updateSettings({ dailyHourGoal: clamp(settings.dailyHourGoal + 1, 1, 16) })}
            />
          </Section>

          <Section title="Danger zone">
            <DangerRow
              label="Clear all data"
              desc="Deletes your tasks, session history, settings, achievements, and stats. This cannot be undone."
              onConfirm={() => {
                localStorage.removeItem("focusflow.v1");
                window.location.reload();
              }}
            />
          </Section>
        </div>
      </main>

      <Dock />
    </div>
  );
}

function DangerRow({
  label,
  desc,
  onConfirm,
}: {
  label: string;
  desc: string;
  onConfirm: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[#FF8A8A]/[0.18] bg-[#FF8A8A]/[0.04] px-4 py-3.5">
      <div className="pr-4">
        <div className="text-sm text-[#FF8A8A]">{label}</div>
        <div className="mt-0.5 text-xs text-text-dim">{desc}</div>
      </div>
      <button
        onClick={() => {
          const ok = window.confirm(
            "Clear all FocusFlow data?\n\nThis deletes your tasks, session history, streak, XP, and settings. This cannot be undone."
          );
          if (ok) onConfirm();
        }}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#FF8A8A]/30 bg-[#FF8A8A]/10 px-3 py-2 text-xs font-medium text-[#FF8A8A] transition-colors hover:bg-[#FF8A8A]/20"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Clear data
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-2.5 px-1 text-xs font-semibold uppercase tracking-wide text-text-dim">{title}</h2>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function Row({ label, desc, children }: { label: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5">
      <div>
        <div className="text-sm">{label}</div>
        <div className="mt-0.5 text-xs text-text-dim">{desc}</div>
      </div>
      {children}
    </div>
  );
}

function NumRow({
  label,
  desc,
  value,
  onMinus,
  onPlus,
}: {
  label: string;
  desc: string;
  value: string;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <Row label={label} desc={desc}>
      <div className="flex items-center gap-1.5 rounded-lg bg-white/[0.06] p-1">
        <button onClick={onMinus} className="grid h-6 w-6 place-items-center rounded-md text-text-dim hover:bg-white/[0.08] hover:text-text">
          <Minus className="h-3 w-3" strokeWidth={2.5} />
        </button>
        <span className="min-w-[42px] text-center text-[13px] tabular-nums">{value}</span>
        <button onClick={onPlus} className="grid h-6 w-6 place-items-center rounded-md text-text-dim hover:bg-white/[0.08] hover:text-text">
          <Plus className="h-3 w-3" strokeWidth={2.5} />
        </button>
      </div>
    </Row>
  );
}

function ToggleRow({
  label,
  desc,
  value,
  onChange,
}: {
  label: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Row label={label} desc={desc}>
      <button
        onClick={() => onChange(!value)}
        className={`relative h-[22px] w-10 rounded-full transition-colors ${
          value ? "bg-[linear-gradient(90deg,hsl(var(--accent)),hsl(var(--accent-alt)))]" : "bg-white/[0.1]"
        }`}
      >
        <span
          className="absolute top-0.5 left-0.5 h-[18px] w-[18px] rounded-full bg-white transition-transform"
          style={{ transform: value ? "translateX(18px)" : "translateX(0)" }}
        />
      </button>
    </Row>
  );
}
