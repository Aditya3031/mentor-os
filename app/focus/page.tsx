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

      <main className="relative z-[5] grid min-h-0 flex-1 grid-cols-1 gap-5 px-7 pb-28 lg:grid-cols-[320px_1fr_340px]">
        {/* Left rail */}
        <aside className="hidden min-h-0 flex-col gap-4 lg:flex">
          <GoalsPanel />
          <TasksPanel />
        </aside>

        {/* Center: focus room */}
        <section className="flex flex-col items-center justify-center p-2.5">
          <Quote />
          <SubjectInput />
          <div className="mb-8">
            <ModeTabs />
          </div>
          <TimerRing />
          <div className="mt-8">
            <TimerControls />
          </div>
        </section>

        {/* Right rail */}
        <aside className="hidden min-h-0 flex-col gap-4 overflow-y-auto lg:flex">
          <SnapshotPanel />
          <HeatmapPanel />
          <AmbiencePanel />
        </aside>
      </main>

      <Dock />
    </div>
  );
}
