import { BackgroundStage } from "@/components/bg/background-stage";
import { TimerRing } from "@/components/timer/timer-ring";
import { TimerControls } from "@/components/timer/timer-controls";
import { ModeTabs } from "@/components/timer/mode-tabs";
import { TimerDurationControl } from "@/components/timer/timer-duration-control";
import { SubjectInput } from "@/components/subject-input";
import { Taskbar } from "@/components/retro/taskbar";
import { Desktop, Window } from "@/components/retro/window";
import { TasksPanel } from "@/components/panels/tasks-panel";
import { GoalsPanel } from "@/components/panels/goals-panel";
import { SnapshotPanel } from "@/components/panels/snapshot-panel";
import { HeatmapPanel } from "@/components/panels/heatmap-panel";
import { AmbiencePanel } from "@/components/panels/ambience-panel";
import { TopBar } from "@/components/top-bar";
import { Quote } from "@/components/quote";

/**
 * The focus room, reimagined as a retro OS desktop:
 *   menu bar on top, taskbar on the bottom, and every panel is a
 *   draggable window. FOCUS.EXE sits in the middle.
 */
export default function FocusPage() {
  return (
    <div className="relative flex h-dvh flex-col overflow-hidden">
      <TopBar />

      {/*
        Desktop = drag bounds for all windows.
        - mobile: single column scroll
        - lg: left rail + center
        - xl: all three rails
      */}
      <Desktop className="z-[5] min-h-0 flex-1 overflow-hidden">
        <BackgroundStage />
        <main className="relative grid h-full min-h-0 grid-cols-1 gap-3 overflow-y-auto p-3 pb-16 lg:grid-cols-[300px_minmax(0,1fr)] lg:overflow-hidden lg:pb-14 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
          {/* Left rail */}
          <aside className="hidden min-h-0 flex-col gap-3 overflow-y-auto lg:flex">
            <GoalsPanel />
            <TasksPanel />
          </aside>

          {/* Center: FOCUS.EXE */}
          <section className="flex min-h-0 flex-col items-center justify-start lg:justify-center lg:overflow-y-auto">
            <Window
              title="FOCUS.EXE"
              draggable
              className="w-full max-w-[520px]"
              bodyClassName="flex flex-col items-center px-4 py-5"
              statusBar={
                <>
                  <span className="status-cell flex-1">Ready.</span>
                  <span className="status-cell">SPACE=run R=reset S=skip Z=zen</span>
                </>
              }
            >
              <Quote />
              <SubjectInput />
              <div className="mb-3">
                <ModeTabs />
              </div>
              <div className="mb-5">
                <TimerDurationControl />
              </div>
              <TimerRing />
              <div className="mt-5">
                <TimerControls />
              </div>
            </Window>
          </section>

          {/* Right rail — xl+ only */}
          <aside className="hidden min-h-0 flex-col gap-3 overflow-y-auto xl:flex">
            <SnapshotPanel />
            <HeatmapPanel />
            <AmbiencePanel />
          </aside>
        </main>
      </Desktop>

      <Taskbar />
    </div>
  );
}
