import { BackgroundStage } from "@/components/bg/background-stage";
import { TimerRing } from "@/components/timer/timer-ring";
import { TimerControls } from "@/components/timer/timer-controls";
import { ModeTabs } from "@/components/timer/mode-tabs";
import { SubjectInput } from "@/components/subject-input";
import { Dock } from "@/components/dock";
import { TasksPanel } from "@/components/panels/tasks-panel";
import { GoalsPanel } from "@/components/panels/goals-panel";
import { SnapshotPanel } from "@/components/panels/snapshot-panel";
import { HeatmapPanel } from "@/components/panels/heatmap-panel";
import { AmbiencePanel } from "@/components/panels/ambience-panel";
import { TopBar } from "@/components/top-bar";
import { Quote } from "@/components/quote";

/**
 * Main focus room. Three-column layout:
 *   ┌──────┬──────────────┬──────┐
 *   │goals │   timer ring │ stat │
 *   │tasks │   + ambient  │ heat │
 *   │      │   bg + dock  │ amb. │
 *   └──────┴──────────────┴──────┘
 */
export default function FocusPage() {
  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      <BackgroundStage />

      <TopBar />

      {/*
        Responsive grid:
        - default (mobile / narrow):  single column, side rails hidden
        - lg  (≥1024px laptops):       2 columns — left rail + center
        - xl  (≥1280px+ wider):        3 columns — all three rails

        Each rail scrolls independently so short laptops (1366×768, 1280×800)
        don't push content under the dock.
      */}
      <main className="relative z-[5] grid min-h-0 flex-1 grid-cols-1 gap-4 px-3 pb-20 sm:px-7 sm:pb-24 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-5 xl:grid-cols-[280px_minmax(0,1fr)_300px]">
        {/* Left rail */}
        <aside className="hidden min-h-0 flex-col gap-4 overflow-y-auto lg:flex">
          <GoalsPanel />
          <TasksPanel />
        </aside>

        {/* Center: focus room — scrolls if content doesn't fit (e.g., on 768px-tall screens) */}
        <section className="flex min-h-0 flex-col items-center justify-center overflow-y-auto py-2">
          <Quote />
          <SubjectInput />
          <div className="mb-5">
            <ModeTabs />
          </div>
          <TimerRing />
          <div className="mt-6">
            <TimerControls />
          </div>
        </section>

        {/* Right rail — only visible on xl+ screens to avoid squeezing the timer */}
        <aside className="hidden min-h-0 flex-col gap-4 overflow-y-auto xl:flex">
          <SnapshotPanel />
          <HeatmapPanel />
          <AmbiencePanel />
        </aside>
      </main>

      <Dock />
    </div>
  );
}
