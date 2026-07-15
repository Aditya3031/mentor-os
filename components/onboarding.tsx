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
          className="fixed inset-0 z-[600] grid place-items-center bg-black/50 px-4"
        >
          <motion.div
            initial={{ y: 12, scale: 0.97 }}
            animate={{ y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="win95 w-full max-w-lg p-[3px] shadow-deep"
          >
            <div className="title-bar justify-between">
              <span>FOCUSFLOW 95 SETUP — step {step + 1} of {STEPS.length}</span>
              <button onClick={dismiss} className="tb-btn" aria-label="Skip intro">
                ✕
              </button>
            </div>

            <div className="p-6">
              {/* Progress blocks */}
              <div className="well mb-6 flex gap-[3px] p-[4px]">
                {STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    aria-label={`Step ${i + 1}`}
                    className={
                      "h-3 flex-1 " +
                      (i <= step ? "bg-[var(--accent-deep)]" : "bg-transparent")
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
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="text-center"
                >
                  <div className="bevel-out mx-auto mb-5 grid h-16 w-16 place-items-center bg-[var(--title-grad)]">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <p className="font-pixel text-[9px] uppercase tracking-[0.2em] text-text-dim">
                    {current.kicker}
                  </p>
                  <h1 className="mt-2 text-balance font-pixel text-lg leading-snug">
                    {current.title}
                  </h1>
                  <p className="mx-auto mt-3 max-w-md text-pretty text-[13px] leading-relaxed text-text-dim">
                    {current.body}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="mt-8 flex items-center justify-between gap-3">
                <button
                  onClick={dismiss}
                  className="btn95 h-9 px-4 text-[10px]"
                >
                  Skip
                </button>
                <button
                  onClick={next}
                  className="btn95 btn95-primary h-9 px-5 text-[11px]"
                >
                  {isLast ? "Finish" : "Next >"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
