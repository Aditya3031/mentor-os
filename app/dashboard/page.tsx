import { BackgroundStage } from "@/components/bg/background-stage";
import { TopBar } from "@/components/top-bar";
import { Dock } from "@/components/dock";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { HeatmapPanel } from "@/components/panels/heatmap-panel";

export default function DashboardPage() {
  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      <BackgroundStage />
      <TopBar />

      <main className="relative z-[5] mx-auto w-full max-w-5xl flex-1 overflow-y-auto px-7 pb-28">
        <header className="mb-8 mt-2">
          <p className="text-xs uppercase tracking-[0.2em] text-text-dim">Analytics</p>
          <h1 className="mt-2 text-balance text-3xl font-light tracking-tight">
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
