"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { signIn, signUp, signInWithGithub, signInWithGoogle } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { getSkin } from "@/lib/skins";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const brand = getSkin(useStore((s) => s.skin)).name;
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<"submit" | "google" | "github" | null>(null);
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

  const handleGithub = async () => {
    setError(null);
    setBusy("github");
    const result = await signInWithGithub();
    setBusy(null);
    if (!result.ok) {
      setError(result.error ?? "Could not sign in with GitHub.");
    }
  };

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-stage-base px-4 py-10">
      <div className="relative z-10 w-full max-w-md">
        <div className="win95 flex flex-col p-[3px] shadow-deep">
          <div className="title-bar justify-between">
            <span className="flex items-center gap-1.5">
              <span className="grid h-3.5 w-3.5 place-items-center bg-white/20 text-[8px]">
                ▞
              </span>
              Log On to {brand}
            </span>
            <Link href="/" className="tb-btn" aria-label="Close">
              ✕
            </Link>
          </div>

          <div className="p-5">
            {/* Mode tabs */}
            <div className="mb-4 flex gap-1">
              {(["signin", "signup"] as Mode[]).map((m) => {
                const active = mode === m;
                return (
                  <button
                    key={m}
                    onClick={() => {
                      setMode(m);
                      setError(null);
                    }}
                    className={cn(
                      "btn95 h-8 flex-1 text-[10px]",
                      active &&
                        "bevel-in font-bold [background-image:radial-gradient(rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:3px_3px]"
                    )}
                  >
                    {m === "signin" ? "Sign in" : "New user"}
                  </button>
                );
              })}
            </div>

          <h1 className="font-pixel text-sm uppercase tracking-wide">
            {mode === "signin" ? "Welcome back" : "Register new user"}
          </h1>
          <p className="mt-1.5 text-[12px] text-text-dim">
            {mode === "signin"
              ? "Type your credentials to log on and sync sessions."
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
                  className="bevel-in flex items-start gap-2 bg-[var(--paper)] p-3 text-xs text-[#9e2a1e]"
                >
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={busy !== null}
              className="btn95 btn95-primary h-11 w-full text-[12px] disabled:cursor-not-allowed disabled:opacity-60"
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
            <span className="bevel-thin-in h-[2px] flex-1" />
            or
            <span className="bevel-thin-in h-[2px] flex-1" />
          </div>

          <button
            onClick={handleGoogle}
            disabled={busy !== null}
            className="btn95 mt-4 h-10 w-full text-[11px] normal-case disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy === "google" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </button>

          <button
            onClick={handleGithub}
            disabled={busy !== null}
            className="btn95 mt-2 h-10 w-full text-[11px] normal-case disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy === "github" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <GithubIcon />
            )}
            Continue with GitHub
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

        </div>

        <p className="mt-6 text-center font-pixel text-[9px] uppercase tracking-wider text-white/80 [text-shadow:1px_1px_0_rgba(0,0,0,0.6)]">
          <Link href="/focus" className="hover:underline">
            Skip — run as guest →
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
        className="well w-full px-3 py-2.5 text-sm outline-none placeholder:text-text-faint"
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

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 .5A11.5 11.5 0 0 0 8.36 22.9c.58.1.79-.25.79-.56v-2.15c-3.23.7-3.91-1.38-3.91-1.38-.53-1.35-1.29-1.71-1.29-1.71-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.75.41-1.27.74-1.56-2.58-.29-5.29-1.29-5.29-5.73 0-1.27.45-2.3 1.2-3.11-.12-.29-.52-1.48.11-3.07 0 0 .98-.31 3.17 1.19A11.1 11.1 0 0 1 12 5.89c.98 0 1.96.13 2.88.39 2.2-1.5 3.17-1.19 3.17-1.19.63 1.59.23 2.78.11 3.07.75.81 1.2 1.84 1.2 3.11 0 4.45-2.72 5.43-5.3 5.72.42.36.8 1.08.8 2.18v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"
      />
    </svg>
  );
}
