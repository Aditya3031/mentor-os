import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function LandingCTA() {
  return (
    <section className="relative px-6 pb-32">
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/[0.08] bg-white/[0.02] p-12 text-center backdrop-blur-xl">
        <h2 className="text-balance text-[clamp(28px,4vw,44px)] font-light leading-tight tracking-tight">
          Make your next study session
          <br />
          <span className="font-serif italic text-[hsl(var(--accent))]">the one you remember.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-md text-text-dim">
          Open the door, pick a room, and let the timer carry you.
        </p>
        <Link
          href="/focus"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(135deg,hsl(var(--accent)),hsl(var(--accent-alt)))] px-7 py-3.5 text-sm font-semibold text-bg-0 shadow-glow transition-transform hover:-translate-y-0.5"
        >
          Enter focus room
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <p className="mt-12 text-center text-xs text-text-faint">
        © {new Date().getFullYear()} FocusFlow · Built for deep work
      </p>
    </section>
  );
}
