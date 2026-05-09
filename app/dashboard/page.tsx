import { BackgroundStage } from "@/components/bg/background-stage";
import { TopBar } from "@/components/top-bar";
import { Dock } from "@/components/dock";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
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

        <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Total hours" value="142h" sub="All time" />
          <Stat label="Best day" value="6.4h" sub="May 4" />
          <Stat label="Avg / day" value="2.6h" sub="Last 30 days" />
          <Stat label="Top subject" value="Calculus" sub="42h total" />
        </div>

        <DashboardCharts />

        <div className="mt-5">
          <HeatmapPanel />
        </div>
      </main>

      <Dock />
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="panel">
      <div className="text-[11px] uppercase tracking-wide text-text-dim">{label}</div>
      <div className="mt-1.5 text-2xl font-medium tracking-tight">{value}</div>
      <div className="mt-0.5 text-[11px] text-text-faint">{sub}</div>
    </div>
  );
}
