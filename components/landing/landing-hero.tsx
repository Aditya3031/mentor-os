"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Headphones,
  Play,
  Sparkles,
} from "lucide-react";

const tasks = ["Physics notes", "Essay outline", "Mock test"];
const bars = [54, 78, 38, 92, 64, 46, 82];
const tracks = [
  ["lofi", 76, "#86f7d0"],
  ["rain", 42, "#7aa8ff"],
  ["cafe", 58, "#ffcb6b"],
] as const;

export function LandingHero() {
  return (
    <section className="relative isolate min-h-[88svh] overflow-hidden px-5 pb-16 pt-6 sm:px-8 lg:px-10">
      <AnimatedStage />

      <nav className="relative z-20 mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#86f7d0] text-[#07100d] shadow-[0_0_32px_rgba(134,247,208,0.28)]">
            <Clock3 className="h-5 w-5" />
          </div>
          <span className="text-sm font-semibold tracking-normal text-white">
            focus<span className="text-[#86f7d0]">.</span>flow
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-full border border-white/[0.12] px-4 py-2 text-sm text-white/75 transition-colors hover:border-white/25 hover:text-white sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/focus"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#08080d] transition-transform hover:-translate-y-0.5"
          >
            Open app
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      <div className="relative z-10 mx-auto grid min-h-[72svh] max-w-6xl items-center gap-10 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:py-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#86f7d0]/20 bg-[#86f7d0]/[0.08] px-3 py-1.5 text-xs font-medium text-[#bafbe5]">
            <Sparkles className="h-3.5 w-3.5" />
            Real focus data, synced study flow, cinematic rooms
          </div>
          <h1 className="text-balance text-5xl font-semibold leading-[1.02] tracking-normal text-white md:text-7xl">
            FocusFlow
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-base leading-7 text-white/[0.68] md:text-lg">
            A modern deep-work dashboard with animated timers, ambient rooms,
            live progress, and calm momentum for long study sessions.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/focus"
              className="group inline-flex items-center gap-2 rounded-full bg-[#86f7d0] px-6 py-3 text-sm font-bold text-[#06120e] shadow-[0_18px_50px_rgba(134,247,208,0.22)] transition-transform hover:-translate-y-1"
            >
              Enter focus room
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.14] bg-white/[0.06] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              <BarChart3 className="h-4 w-4" />
              View analytics
            </Link>
          </div>

          <div className="mt-9 grid max-w-lg grid-cols-3 gap-3 text-sm">
            {[
              ["25m", "focus cycle"],
              ["7", "rooms"],
              ["sync", "ready"],
            ].map(([value, label]) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.55 }}
                className="border-l border-white/[0.14] pl-3"
              >
                <div className="font-mono text-xl text-white">{value}</div>
                <div className="mt-1 text-xs uppercase tracking-normal text-white/[0.42]">
                  {label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <ProductPreview />
      </div>
    </section>
  );
}

function AnimatedStage() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 bg-[#07070b]">
      <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:72px_72px]" />
      <motion.div
        className="absolute inset-x-[-20%] top-0 h-72 bg-[linear-gradient(90deg,transparent,rgba(134,247,208,0.18),rgba(255,203,107,0.12),transparent)] blur-3xl"
        animate={{ x: ["-12%", "12%", "-12%"], opacity: [0.45, 0.85, 0.45] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-8rem] left-[-10%] h-96 w-[120%] bg-[linear-gradient(115deg,rgba(134,247,208,0.1),rgba(255,138,138,0.08),rgba(129,181,255,0.1))] blur-3xl"
        animate={{ y: [0, -24, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function ProductPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 28 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="relative min-h-[430px] lg:min-h-[560px]"
    >
      <motion.div
        className="absolute left-2 top-8 w-[78%] rounded-2xl border border-white/[0.12] bg-[#111118]/[0.86] p-4 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:left-8"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-normal text-white/[0.42]">
              Current session
            </div>
            <div className="mt-1 text-lg font-semibold text-white">Organic Chemistry</div>
          </div>
          <div className="rounded-full bg-[#86f7d0]/[0.12] px-3 py-1 text-xs text-[#a9f8dd]">
            synced
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-[190px_1fr]">
          <div className="relative grid aspect-square place-items-center rounded-full border border-white/10 bg-white/[0.03]">
            <motion.div
              className="absolute inset-4 rounded-full border-4 border-[#86f7d0]"
              style={{ borderRightColor: "rgba(255,255,255,0.08)" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
            />
            <div className="text-center">
              <div className="font-mono text-4xl text-white">18:42</div>
              <div className="mt-1 text-xs text-white/[0.45]">deep focus</div>
            </div>
          </div>

          <div className="space-y-3">
            {tasks.map((task, i) => (
              <motion.div
                key={task}
                className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-3"
                animate={{ x: [0, i === 1 ? 8 : 0, 0] }}
                transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
              >
                <CheckCircle2
                  className={`h-4 w-4 ${i === 0 ? "text-[#86f7d0]" : "text-white/[0.28]"}`}
                />
                <span className="text-sm text-white/[0.78]">{task}</span>
              </motion.div>
            ))}
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-3">
              <div className="mb-2 flex items-center justify-between text-xs text-white/[0.45]">
                <span>Last 7 days</span>
                <span>12.5h</span>
              </div>
              <div className="flex h-20 items-end gap-2">
                {bars.map((height, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-t-md bg-[linear-gradient(180deg,#86f7d0,#7aa8ff)]"
                    initial={{ height: 8 }}
                    animate={{ height }}
                    transition={{
                      delay: 0.15 * i,
                      duration: 0.8,
                      repeat: Infinity,
                      repeatType: "mirror",
                      repeatDelay: 2.5,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-10 right-0 w-64 rounded-2xl border border-white/[0.12] bg-[#141016]/[0.88] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.42)] backdrop-blur-2xl"
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="mb-4 flex items-center gap-2">
          <Headphones className="h-4 w-4 text-[#ffcb6b]" />
          <span className="text-sm font-medium text-white">Room mixer</span>
        </div>
        {tracks.map(([label, value, color]) => (
          <div key={label} className="mb-3 last:mb-0">
            <div className="mb-1 flex justify-between text-xs text-white/[0.48]">
              <span>{label}</span>
              <span>{value}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: color }}
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 1.1, delay: 0.25 }}
              />
            </div>
          </div>
        ))}
      </motion.div>

      <motion.div
        className="absolute right-8 top-0 hidden rounded-full border border-white/[0.12] bg-white/[0.08] px-4 py-2 text-sm text-white/75 backdrop-blur-xl sm:flex"
        animate={{ y: [0, -8, 0], opacity: [0.68, 1, 0.68] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <Play className="mr-2 h-4 w-4 text-[#86f7d0]" />
        Personal focus room ready
      </motion.div>
    </motion.div>
  );
}
