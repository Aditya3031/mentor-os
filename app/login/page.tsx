"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { signIn, signUp, signInWithGoogle } from "@/lib/auth";
import { cn } from "@/lib/utils";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<"submit" | "google" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy("submit");

    const result =
      mode === "signin"
        ? await signIn(email, password)
        : await signUp(name, email, password);

    setBusy(null);

    if (!result.ok) {
      setError(result.error ?? "Something went wrong.");
      return;
    }
    router.push("/focus");
  };

  const handleGoogle = async () => {
    setError(null);
    setBusy("google");
    const result = await signInWithGoogle();
    setBusy(null);
    if (!result.ok) {
      setError(result.error ?? "Could not sign in with Google.");
    }
  };

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-stage-base px-6 py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/3 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,hsl(var(--accent)/0.18),transparent_60%)] blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Brand */}
        <Link href="/" className="mb-10 flex items-center justify-center gap-2.5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[linear-gradient(135deg,hsl(var(--accent)),hsl(var(--accent-alt)))] shadow-glow">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 text-bg-0"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          </div>
          <span className="text-base font-semibold tracking-tight">
            focus<span className="text-[hsl(var(--accent))]">.</span>flow
          </span>
        </Link>

        {/* Mode tabs */}
        <div className="mx-auto mb-6 flex w-fit gap-1 rounded-xl border border-white/[0.08] bg-white/[0.04] p-1">
          {(["signin", "signup"] as Mode[]).map((m) => {
            const active = mode === m;
            return (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
                className="relative px-5 py-1.5 text-xs font-medium text-text-dim transition-colors hover:text-text"
              >
                {active && (
                  <motion.span
                    layoutId="loginTabActive"
                    className="absolute inset-0 rounded-lg bg-white/[0.08] shadow-soft"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className={cn("relative", active && "text-text")}>
                  {m === "signin" ? "Sign in" : "Create account"}
                </span>
              </button>
            );
          })}
        </div>

        <div className="panel">
          <h1 className="text-balance text-2xl font-semibold tracking-tight">
            {mode === "signin" ? "Welcome back" : "Start focusing today"}
          </h1>
          <p className="mt-1.5 text-sm text-text-dim">
            {mode === "signin"
              ? "Sign in to sync your sessions across devices."
              : "Free forever. No card required."}
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-3">
            <AnimatePresence mode="popLayout" initial={false}>
              {mode === "signup" && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Field
                    label="Name"
                    type="text"
                    placeholder="Alex Chen"
                    value={name}
                    onChange={setName}
                    autoFocus
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <Field
              label="Email"
              type="email"
              placeholder="you@university.edu"
              value={email}
              onChange={setEmail}
              autoFocus={mode === "signin"}
            />
            <Field
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={setPassword}
              hint={
                mode === "signin" ? (
                  <Link href="/forgot" className="text-text-dim hover:text-text">
                    Forgot?
                  </Link>
                ) : null
              }
            />

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-start gap-2 rounded-lg border border-[#FF8A8A]/[0.18] bg-[#FF8A8A]/[0.06] p-3 text-xs text-[#FFA8A8]"
                >
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={busy !== null}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,hsl(var(--accent)),hsl(var(--accent-alt)))] px-6 py-3 text-sm font-semibold text-bg-0 shadow-glow transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {busy === "submit" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {mode === "signin" ? "Signing in…" : "Creating account…"}
                </>
              ) : (
                <>
                  {mode === "signin" ? "Sign in" : "Create account"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 flex items-center gap-3 text-xs text-text-faint">
            <span className="h-px flex-1 bg-white/[0.08]" />
            or
            <span className="h-px flex-1 bg-white/[0.08]" />
          </div>

          <button
            onClick={handleGoogle}
            disabled={busy !== null}
            className="mt-4 inline-flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/[0.14] px-6 py-3 text-sm font-medium text-text transition-colors hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy === "google" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </button>

          <p className="mt-6 text-center text-xs text-text-dim">
            {mode === "signin" ? (
              <>
                New here?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setError(null);
                  }}
                  className="text-text underline-offset-4 hover:underline"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setError(null);
                  }}
                  className="text-text underline-offset-4 hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
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

/* ---------- Field component ---------- */

function Field({
  label,
  type,
  placeholder,
  value,
  onChange,
  autoFocus,
  hint,
}: {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
  hint?: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-text-dim">
          {label}
        </span>
        {hint && <span className="text-[11px]">{hint}</span>}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm transition-colors placeholder:text-text-faint focus:border-white/[0.2] focus:outline-none"
      />
    </label>
  );
}

/* ---------- Google icon SVG ---------- */

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
