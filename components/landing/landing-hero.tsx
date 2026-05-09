import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function LandingHero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center px-6">
      <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
        <div className="absolute -top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,hsl(var(--accent)/0.18),transparent_60%)] blur-3xl" />
      </div>
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <div className="mx-auto mb-8 grid h-[72px] w-[72px] animate-floaty place-items-center rounded-[22px] bg-[linear-gradient(135deg,hsl(var(--accent)),hsl(var(--accent-alt)))] shadow-glow">
          <svg viewBox="0 0 24 24" className="h-9 w-9 text-bg-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        </div>
        <h1 className="text-balance text-[clamp(40px,7vw,80px)] font-light leading-[1.05] tracking-tight">
          Deep work, <span className="font-serif italic text-[hsl(var(--accent))]">finally</span> something you look forward to.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-balance text-base leading-relaxed text-text-dim md:text-lg">
          FocusFlow is your solo deep-work sanctuary. Ambient rooms, focused timers, and a sense of momentum — all designed to make studying feel inviting.
        </p>
        <div className="mt-10 flex items-center justify-center gap-3">
          <Link
            href="/focus"
            className="group inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(135deg,hsl(var(--accent)),hsl(var(--accent-alt)))] px-7 py-3.5 text-sm font-semibold text-bg-0 shadow-glow transition-transform hover:-translate-y-0.5"
          >
            Enter focus room
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-white/[0.14] px-6 py-3.5 text-sm font-medium text-text transition-colors hover:bg-white/[0.04]"
          >
            Sign in
          </Link>
        </div>
        <p className="mt-8 text-xs text-text-faint">
          Free · No card required · Works offline
        </p>
      </div>
    </section>
  );
}
