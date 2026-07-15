import { BackgroundStage } from "@/components/bg/background-stage";
import { TopBar } from "@/components/top-bar";
import { Dock } from "@/components/dock";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { HeatmapPanel } from "@/components/panels/heatmap-panel";

export default function DashboardPage() {
  return (
    <div className="relative flex h-dvh flex-col overflow-hidden">
      <BackgroundStage />
      <TopBar />

      <main className="relative z-[5] mx-auto w-full max-w-5xl flex-1 overflow-y-auto px-4 pb-20 sm:px-7 sm:pb-28">
        <header className="mb-8 mt-2">
          <p className="font-pixel text-[9px] uppercase tracking-[0.2em] text-white/70 [text-shadow:1px_1px_0_rgba(0,0,0,0.6)]">Analytics</p>
          <h1 className="mt-2 text-balance font-pixel text-xl text-white [text-shadow:2px_2px_0_rgba(0,0,0,0.55)] sm:text-2xl">
            Your focus, in detail.
          </h1>
        </header>

        <DashboardStats />

        <DashboardCharts />

        <div className="mt-5">
          <HeatmapPanel />
        </div>
      </main>

      <Dock />
    </div>
  );
}
