"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ThemeId, AmbienceId } from "./themes";

/* ============================================================
   Types
   ============================================================ */

export type TimerMode = "focus" | "short" | "long";

export interface Task {
  id: string;
  text: string;
  done: boolean;
  priority: "low" | "med" | "high";
  createdAt: number;
}

export interface Session {
  id: string;
  subject: string;
  mode: TimerMode;
  durationSec: number;
  pomodoros: number;
  startedAt: number;
  endedAt: number;
  /** What the user typed in the reflection modal after the session ended. */
  userNote?: string;
  /** AI-generated one-line summary of the session. */
  aiSummary?: string;
}

export interface AmbienceTrack {
  id: AmbienceId;
  enabled: boolean;
  volume: number; // 0..1
}

export interface Settings {
  durations: { focus: number; short: number; long: number; cycle: number }; // minutes
  autoStart: boolean;
  ticking: boolean;
  sfx: boolean;
  notifications: boolean;
  particles: boolean;
  font: "inter" | "serif" | "mono";
  animationIntensity: "subtle" | "medium" | "high";
  dailyHourGoal: number;
}

interface FocusFlowState {
  /* Timer */
  mode: TimerMode;
  remaining: number; // seconds
  running: boolean;
  timerEndsAt: number | null;
  cycleSession: number; // 1..settings.durations.cycle
  sessionsToday: number;
  totalSessions: number;
  totalMinutes: number;
  streakDays: number;
  xp: number;
  level: number;
  /** Subject label attached to the next session that completes. */
  currentSubject: string;
  /** YYYY-MM-DD (local) of the most recent completed focus session.
   *  Used to detect day rollovers for streak + sessionsToday. */
  lastSessionDate: string;
  /** Set when a focus session just completed and is awaiting reflection.
   *  The ReflectionModal subscribes to this and shows itself. */
  pendingReflectionSessionId: string | null;
  /** Bumped when a timer naturally reaches zero so audio can react once. */
  timerCompletedAt: number | null;

  /* User */
  theme: ThemeId;
  tasks: Task[];
  history: Session[];
  ambience: AmbienceTrack[];
  settings: Settings;

  /* Actions */
  setMode: (m: TimerMode) => void;
  setRemaining: (s: number) => void;
  setDuration: (mode: TimerMode, minutes: number) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  syncTimer: () => void;
  completeSession: (source?: "elapsed" | "skip") => void;
  setCurrentSubject: (s: string) => void;

  setTheme: (t: ThemeId) => void;
  toggleAmbience: (id: AmbienceId) => void;
  setAmbienceVolume: (id: AmbienceId, v: number) => void;

  addTask: (text: string, priority?: Task["priority"]) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  reorderTasks: (ids: string[]) => void;

  pushSession: (s: Omit<Session, "id">) => void;
  updateSettings: (patch: Partial<Settings>) => void;

  /** Attach a reflection (note + AI summary) to an existing session in history. */
  setSessionReflection: (id: string, userNote: string, aiSummary?: string) => void;
  dismissReflection: () => void;
  hydrateFromSync: (state: Partial<SyncedFocusFlowState>) => void;
}

export interface SyncedFocusFlowState {
  theme: ThemeId;
  tasks: Task[];
  history: Session[];
  ambience: AmbienceTrack[];
  settings: Settings;
  sessionsToday: number;
  totalSessions: number;
  totalMinutes: number;
  streakDays: number;
  xp: number;
  level: number;
  cycleSession: number;
  currentSubject: string;
  lastSessionDate: string;
}

/* ============================================================
   Helpers
   ============================================================ */

/** Returns YYYY-MM-DD in local time (not UTC). */
function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function secondsUntil(timestamp: number): number {
  return Math.max(0, Math.ceil((timestamp - Date.now()) / 1000));
}

/* ============================================================
   Defaults
   ============================================================ */

const DEFAULT_SETTINGS: Settings = {
  durations: { focus: 25, short: 5, long: 15, cycle: 4 },
  autoStart: true,
  ticking: false,
  sfx: true,
  notifications: false,
  particles: true,
  font: "inter",
  animationIntensity: "medium",
  dailyHourGoal: 4,
};

const DEFAULT_AMBIENCE: AmbienceTrack[] = [
  { id: "lofi",  enabled: true,  volume: 0.6 },
  { id: "rain",  enabled: false, volume: 0.5 },
  { id: "cafe",  enabled: false, volume: 0.4 },
  { id: "fire",  enabled: false, volume: 0.5 },
  { id: "keys",  enabled: false, volume: 0.3 },
  { id: "noise", enabled: false, volume: 0.3 },
];

function syncedSnapshot(s: FocusFlowState): SyncedFocusFlowState {
  return {
    theme: s.theme,
    tasks: s.tasks,
    history: s.history,
    ambience: s.ambience,
    settings: s.settings,
    sessionsToday: s.sessionsToday,
    totalSessions: s.totalSessions,
    totalMinutes: s.totalMinutes,
    streakDays: s.streakDays,
    xp: s.xp,
    level: s.level,
    cycleSession: s.cycleSession,
    currentSubject: s.currentSubject,
    lastSessionDate: s.lastSessionDate,
  };
}

function persistedSnapshot(s: FocusFlowState) {
  return {
    ...syncedSnapshot(s),
    mode: s.mode,
    remaining: s.remaining,
    running: s.running,
    timerEndsAt: s.timerEndsAt,
  };
}

export function getSyncedStateSnapshot(): SyncedFocusFlowState {
  return syncedSnapshot(useStore.getState());
}

/* ============================================================
   Store
   ============================================================ */

export const useStore = create<FocusFlowState>()(
  persist(
    (set, get) => ({
      mode: "focus",
      remaining: DEFAULT_SETTINGS.durations.focus * 60,
      running: false,
      timerEndsAt: null,
      cycleSession: 1,
      sessionsToday: 0,
      totalSessions: 0,
      totalMinutes: 0,
      // Start everyone at zero — real data builds as the user uses the app.
      streakDays: 0,
      xp: 0,
      level: 1,
      currentSubject: "",
      lastSessionDate: "",
      pendingReflectionSessionId: null,
      timerCompletedAt: null,

      theme: "aurora",
      // Start with no tasks — empty state is welcoming and honest.
      tasks: [],
      history: [],
      ambience: DEFAULT_AMBIENCE,
      settings: DEFAULT_SETTINGS,

      /* Timer */
      setMode: (m) => {
        const { settings } = get();
        set({
          mode: m,
          remaining: settings.durations[m] * 60,
          running: false,
          timerEndsAt: null,
        });
      },
      setRemaining: (seconds) => {
        const next = Math.max(0, Math.round(seconds));
        set((s) => ({
          remaining: next,
          timerEndsAt: s.running ? Date.now() + next * 1000 : null,
        }));
      },
      setDuration: (timerMode, minutes) =>
        set((s) => {
          const max = timerMode === "focus" ? 180 : timerMode === "short" ? 60 : 120;
          const nextMinutes = clampNumber(Math.round(minutes), 1, max);
          const nextSettings = {
            ...s.settings,
            durations: { ...s.settings.durations, [timerMode]: nextMinutes },
          };

          if (s.mode !== timerMode) {
            return { settings: nextSettings };
          }

          const nextRemaining = nextMinutes * 60;
          return {
            settings: nextSettings,
            remaining: nextRemaining,
            timerEndsAt: s.running ? Date.now() + nextRemaining * 1000 : null,
          };
        }),
      start: () => {
        const s = get();
        if (s.remaining <= 0) {
          s.completeSession("elapsed");
          return;
        }
        set({ running: true, timerEndsAt: Date.now() + s.remaining * 1000 });
      },
      pause: () => {
        const s = get();
        if (s.running && s.timerEndsAt) {
          const remaining = secondsUntil(s.timerEndsAt);
          if (remaining <= 0) {
            s.completeSession("elapsed");
            return;
          }
          set({ running: false, remaining, timerEndsAt: null });
          return;
        }
        set({ running: false, timerEndsAt: null });
      },
      reset: () => {
        const { mode, settings } = get();
        set({
          remaining: settings.durations[mode] * 60,
          running: false,
          timerEndsAt: null,
        });
      },
      tick: () => {
        const { remaining, running, timerEndsAt, completeSession } = get();
        const nextRemaining =
          running && timerEndsAt ? secondsUntil(timerEndsAt) : Math.max(0, remaining - 1);

        if (nextRemaining <= 0) {
          completeSession("elapsed");
          return;
        }
        set({ remaining: nextRemaining });
      },
      syncTimer: () => {
        const s = get();
        if (!s.running) return;

        if (!s.timerEndsAt) {
          set({ timerEndsAt: Date.now() + s.remaining * 1000 });
          return;
        }

        const remaining = secondsUntil(s.timerEndsAt);
        if (remaining <= 0) {
          s.completeSession("elapsed");
          return;
        }
        set({ remaining });
      },
      completeSession: (source = "elapsed") => {
        const s = get();
        const { mode, cycleSession, settings, currentSubject } = s;
        const timerCompletedAt = source === "elapsed" ? Date.now() : s.timerCompletedAt;

        if (mode === "focus") {
          const endedAt = Date.now();
          const durationSec = settings.durations.focus * 60;

          // Push the completed focus session into history so the
          // dashboard, history page, and snapshot can all show real numbers.
          const newSession: Session = {
            id: `s_${endedAt}`,
            subject: currentSubject || "Focus session",
            mode: "focus",
            durationSec,
            pomodoros: 1,
            startedAt: endedAt - durationSec * 1000,
            endedAt,
          };

          // Streak + sessionsToday rollover.
          // Only update when a new day starts; multiple sessions on the
          // same day don't bump the streak.
          const todayKey = dateKey(new Date());
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayKey = dateKey(yesterday);

          let nextStreak = s.streakDays;
          let nextSessionsToday = s.sessionsToday + 1;

          if (s.lastSessionDate !== todayKey) {
            // First focus session of today — recompute streak.
            if (s.lastSessionDate === yesterdayKey) {
              nextStreak = s.streakDays + 1; // continued the streak
            } else {
              nextStreak = 1; // first ever, or gap reset
            }
            nextSessionsToday = 1;
          }

          const next = cycleSession >= settings.durations.cycle ? "long" : "short";
          const nextRemaining = settings.durations[next] * 60;
          const nextRunning = settings.autoStart;
          set({
            history: [newSession, ...s.history].slice(0, 200),
            mode: next,
            remaining: nextRemaining,
            running: nextRunning,
            timerEndsAt: nextRunning ? Date.now() + nextRemaining * 1000 : null,
            sessionsToday: nextSessionsToday,
            totalSessions: s.totalSessions + 1,
            totalMinutes: s.totalMinutes + settings.durations.focus,
            cycleSession:
              cycleSession >= settings.durations.cycle ? 1 : cycleSession + 1,
            xp: s.xp + 25,
            streakDays: nextStreak,
            lastSessionDate: todayKey,
            // Trigger the reflection modal for this session
            pendingReflectionSessionId: newSession.id,
            timerCompletedAt,
          });
        } else {
          const nextRemaining = settings.durations.focus * 60;
          const nextRunning = settings.autoStart;
          set({
            mode: "focus",
            remaining: nextRemaining,
            running: nextRunning,
            timerEndsAt: nextRunning ? Date.now() + nextRemaining * 1000 : null,
            timerCompletedAt,
          });
        }
      },
      setCurrentSubject: (s) => set({ currentSubject: s }),

      /* Theme */
      setTheme: (t) => set({ theme: t }),

      toggleAmbience: (id) =>
        set((s) => ({
          ambience: s.ambience.map((a) =>
            a.id === id ? { ...a, enabled: !a.enabled } : a
          ),
        })),
      setAmbienceVolume: (id, v) =>
        set((s) => ({
          ambience: s.ambience.map((a) =>
            a.id === id ? { ...a, volume: v } : a
          ),
        })),

      /* Tasks */
      addTask: (text, priority = "med") =>
        set((s) => ({
          tasks: [
            ...s.tasks,
            {
              id: `t_${Date.now()}`,
              text: text.trim(),
              done: false,
              priority,
              createdAt: Date.now(),
            },
          ],
        })),
      toggleTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
        })),
      removeTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
      reorderTasks: (ids) =>
        set((s) => ({
          tasks: ids
            .map((id) => s.tasks.find((t) => t.id === id))
            .filter((t): t is Task => Boolean(t)),
        })),

      pushSession: (sess) =>
        set((s) => ({
          history: [{ ...sess, id: `s_${Date.now()}` }, ...s.history].slice(0, 200),
        })),

      updateSettings: (patch) =>
        set((s) => {
          const settings = {
            ...s.settings,
            ...patch,
            durations: {
              ...s.settings.durations,
              ...patch.durations,
            },
          };
          const currentDurationChanged =
            patch.durations?.[s.mode] !== undefined &&
            patch.durations[s.mode] !== s.settings.durations[s.mode];

          return {
            settings,
            ...(!s.running && currentDurationChanged
              ? { remaining: settings.durations[s.mode] * 60, timerEndsAt: null }
              : {}),
          };
        }),

      setSessionReflection: (id, userNote, aiSummary) =>
        set((s) => ({
          history: s.history.map((h) =>
            h.id === id ? { ...h, userNote, aiSummary } : h
          ),
          pendingReflectionSessionId: null,
        })),

      dismissReflection: () => set({ pendingReflectionSessionId: null }),

      hydrateFromSync: (state) =>
        set((s) => {
          const settings = {
            ...DEFAULT_SETTINGS,
            ...state.settings,
            durations: {
              ...DEFAULT_SETTINGS.durations,
              ...state.settings?.durations,
            },
          };

          return {
            theme: state.theme ?? s.theme,
            tasks: state.tasks ?? s.tasks,
            history: state.history ?? s.history,
            ambience: state.ambience ?? s.ambience,
            settings,
            sessionsToday: state.sessionsToday ?? s.sessionsToday,
            totalSessions: state.totalSessions ?? s.totalSessions,
            totalMinutes: state.totalMinutes ?? s.totalMinutes,
            streakDays: state.streakDays ?? s.streakDays,
            xp: state.xp ?? s.xp,
            level: state.level ?? s.level,
            cycleSession: state.cycleSession ?? s.cycleSession,
            currentSubject: state.currentSubject ?? s.currentSubject,
            lastSessionDate: state.lastSessionDate ?? s.lastSessionDate,
            running: false,
            timerEndsAt: null,
            remaining: settings.durations[s.mode] * 60,
          };
        }),
    }),
    {
      name: "focusflow.v1",
      storage: createJSONStorage(() => localStorage),
      partialize: persistedSnapshot,
    }
  )
);
