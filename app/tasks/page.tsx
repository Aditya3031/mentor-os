"use client";

import { BackgroundStage } from "@/components/bg/background-stage";
import { TopBar } from "@/components/top-bar";
import { Dock } from "@/components/dock";
import { TasksPanel } from "@/components/panels/tasks-panel";
import { GoalsPanel } from "@/components/panels/goals-panel";

/**
 * Full-page tasks view. Useful on mobile or when you want to focus on
 * task management without the timer in front of you. Same TasksPanel
 * component as the focus room — single source of truth.
 */
export default function TasksPage() {
  return (
    <div className="relative flex h-dvh flex-col overflow-hidden">
      <BackgroundStage />
      <TopBar />

      <main className="relative z-[5] mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-4 pb-20 sm:px-7 sm:pb-28">
        <header className="mb-8 mt-2">
          <p className="font-pixel text-[9px] uppercase tracking-[0.2em] text-white/70 [text-shadow:1px_1px_0_rgba(0,0,0,0.6)]">Today</p>
          <h1 className="mt-2 text-balance font-pixel text-xl text-white [text-shadow:2px_2px_0_rgba(0,0,0,0.55)] sm:text-2xl">
            Tasks
          </h1>
        </header>

        <div className="space-y-4">
          <GoalsPanel />
          <div className="min-h-[400px]">
            <TasksPanel />
          </div>
        </div>
      </main>

      <Dock />
    </div>
  );
}
