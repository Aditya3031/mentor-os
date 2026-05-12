"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Clock,
  Music,
  BarChart3,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

const STORAGE_KEY = "ff_onboarded_v2";

interface Step {
  kicker: string;
  title: string;
  body: string;
  icon: React.ElementType;
}

const STEPS: Step[] = [
  {
    kicker: "Welcome",
    title: "Deep work — finally something you look forward to.",
    body: "FocusFlow is a solo study sanctuary. Pomodoro timer, ambient rooms, AI coaching, and analytics — all in one calm space designed to make studying inviting.",
    icon: Sparkles,
  },
  {
    kicker: "Step 1 of 4",
    title: "Start a focus session.",
    body: "Type what you're working on, pick a duration in Settings, and hit play. The timer auto-cycles into breaks. Your session gets saved with an AI summary when it ends.",
    icon: Clock,
  },
  {
    kicker: "Step 2 of 4",
    title: "Pick a room.",
    body: "Seven curated themes — each with its own ambient sound preset. Aurora, Tokyo Night, Rainy Cafe, Library, Cyberpunk, Cozy Bedroom, Mountain Cabin. Switch any time.",
    icon: Music,
  },
  {
    kicker: "Step 3 of 4",
    title: "Track real momentum.",
    body: "Streak, heatmap, weekly hours, best study hours — all computed from your real sessions, not fake numbers. Achievements unlock as you actually use it.",
    icon: BarChart3,
  },
  {
    kicker: "Step 4 of 4",
    title: "Ask the AI coach anything.",
    body: "Click the brain icon in the dock for a personalized study assistant. Plan your week, break down big tasks, get quizzed, or just type 'I'm distracted' for a kick.",
    icon: CheckCircle2,
  },
];

/**
 * First-run onboarding modal. Multi-step, swipeable.
 * Shows once per browser (gated by localStorage flag).
 * Users can skip at any step.
 */
export function Onboarding() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(STORAGE_KEY)) {
      const t = setTimeout(() => setShow(true), 500);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setShow(false);
  };

  const next = () => {
    if (step >= STEPS.length - 1) {
      dismiss();
    } else {
      setStep(step + 1);
    }
  };

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[600] grid place-items-center bg-[radial-gradient(ellipse_at_center,rgba(15,15,22,0.96),rgba(7,7,11,0.99))] px-6 backdrop-blur-xl"
        >
          <motion.div
            initial={{ y: 12, scale: 0.97 }}
            animate={{ y: 0, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-lg"
          >
            {/* Progress dots */}
            <div className="mb-8 flex justify-center gap-1.5">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  aria-label={`Step ${i + 1}`}
                  className={
                    "h-1.5 rounded-full transition-all " +
                    (i === step
                      ? "w-8 bg-[hsl(var(--accent))]"
                      : i < step
                      ? "w-1.5 bg-[hsl(var(--accent)/0.5)]"
                      : "w-1.5 bg-white/[0.15]")
                  }
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="text-center"
              >
                <div className="mx-auto mb-6 grid h-[72px] w-[72px] place-items-center rounded-[22px] bg-[linear-gradient(135deg,hsl(var(--accent)),hsl(var(--accent-alt)))] shadow-glow">
                  <Icon className="h-9 w-9 text-bg-0" />
                </div>
                <p className="text-xs uppercase tracking-[0.2em] text-text-dim">
                  {current.kicker}
                </p>
                <h1 className="mt-3 text-balance text-[clamp(28px,4vw,36px)] font-light leading-tight tracking-tight">
                  {current.title}
                </h1>
                <p className="mx-auto mt-4 max-w-md text-pretty text-sm leading-relaxed text-text-dim">
                  {current.body}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-10 flex items-center justify-between gap-3">
              <button
                onClick={dismiss}
                className="text-xs text-text-dim transition-colors hover:text-text"
              >
                Skip intro
              </button>
              <button
                onClick={next}
                className="inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(135deg,hsl(var(--accent)),hsl(var(--accent-alt)))] px-6 py-3 text-sm font-semibold text-bg-0 shadow-glow transition-transform hover:-translate-y-0.5"
              >
                {isLast ? "Let's go" : "Next"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
