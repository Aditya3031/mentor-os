import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Login / sign-up screen. UI is wired but auth logic is intentionally a no-op —
 * drop in NextAuth, Supabase, or Firebase here.
 */
export default function LoginPage() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-stage-base px-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/3 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,hsl(var(--accent)/0.16),transparent_60%)] blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="mb-10 flex items-center justify-center gap-2.5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[linear-gradient(135deg,hsl(var(--accent)),hsl(var(--accent-alt)))] shadow-glow">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-bg-0" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          </div>
          <span className="text-base font-semibold tracking-tight">
            focus<span className="text-[hsl(var(--accent))]">.</span>flow
          </span>
        </Link>

        <div className="panel">
          <h1 className="text-balance text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1.5 text-sm text-text-dim">Sign in to sync your sessions across devices.</p>

          <form className="mt-7 space-y-3">
            <Field label="Email" type="email" placeholder="you@university.edu" />
            <Field label="Password" type="password" placeholder="••••••••" />
            <button
              type="submit"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,hsl(var(--accent)),hsl(var(--accent-alt)))] px-6 py-3 text-sm font-semibold text-bg-0 shadow-glow transition-transform hover:-translate-y-0.5"
            >
              Sign in
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </form>

          <div className="mt-5 flex items-center gap-3 text-xs text-text-faint">
            <span className="h-px flex-1 bg-white/[0.08]" />
            or
            <span className="h-px flex-1 bg-white/[0.08]" />
          </div>

          <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.14] px-6 py-3 text-sm font-medium text-text transition-colors hover:bg-white/[0.04]">
            Continue with Google
          </button>

          <p className="mt-6 text-center text-xs text-text-dim">
            New here?{" "}
            <Link href="/signup" className="text-text hover:underline">
              Create account
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-text-faint">
          <Link href="/focus" className="hover:text-text-dim">
            Skip — try without an account →
          </Link>
        </p>
      </div>
    </main>
  );
}

function Field({ label, type, placeholder }: { label: string; type: string; placeholder: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-wide text-text-dim">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm transition-colors placeholder:text-text-faint focus:border-white/[0.2] focus:outline-none"
      />
    </label>
  );
}
