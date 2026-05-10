"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  BrainCircuit,
  Cloud,
  Flame,
  Music,
  TimerReset,
  Trophy,
  UsersRound,
} from "lucide-react";

const FEATURES = [
  {
    icon: TimerReset,
    title: "Timer that feels alive",
    desc: "Animated focus rings, auto-start cycles, session subjects, and gentle pacing built for real study blocks.",
    accent: "#86f7d0",
  },
  {
    icon: Music,
    title: "Ambient sound mixer",
    desc: "Blend lofi, rain, cafe noise, fire, keys, and soft noise without leaving the focus room.",
    accent: "#ffcb6b",
  },
  {
    icon: BarChart3,
    title: "Real momentum data",
    desc: "Dashboard stats, heatmaps, best hours, and subject totals update from your actual completed sessions.",
    accent: "#7aa8ff",
  },
  {
    icon: BrainCircuit,
    title: "Integrated AI",
    desc: "Turn goals into focused study plans, break big tasks into session-sized steps, and get smarter recommendations as you work.",
    accent: "#c99cff",
  },
  {
    icon: UsersRound,
    title: "Collaborative workspace",
    desc: "Create shared rooms for classmates, study groups, or project teams with aligned tasks, focus history, and room context.",
    accent: "#66e3ff",
  },
  {
    icon: Trophy,
    title: "Progress without noise",
    desc: "XP, streaks, levels, and achievements give you a reason to come back without turning work into clutter.",
    accent: "#ff8a8a",
  },
];

export function LandingFeatures() {
  return (
    <section className="relative border-y border-white/[0.06] bg-[#09090f] px-5 py-24 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14 max-w-3xl"
        >
          <p className="text-xs font-semibold uppercase tracking-normal text-[#86f7d0]">
            Built like a study cockpit
          </p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-normal text-white md:text-5xl">
            Every control moves with you.
          </h2>
          <p className="mt-5 text-pretty text-base leading-7 text-white/[0.62]">
            The homepage now mirrors the product: calm surfaces, useful motion,
            and visual feedback that makes progress feel tangible.
          </p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.08, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -8 }}
                className="group relative min-h-[250px] overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.24)] backdrop-blur-xl"
              >
                <motion.div
                  className="absolute inset-x-0 top-0 h-px"
                  style={{ backgroundColor: feature.accent }}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.08, duration: 0.8 }}
                />
                <div
                  className="grid h-11 w-11 place-items-center rounded-xl border border-white/[0.08]"
                  style={{ backgroundColor: `${feature.accent}18`, color: feature.accent }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-8 text-xl font-semibold tracking-normal text-white">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/[0.58]">{feature.desc}</p>
                <motion.div
                  className="absolute bottom-4 right-4 h-14 w-14 rounded-full border border-white/[0.08]"
                  style={{ backgroundColor: `${feature.accent}10` }}
                  animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.9, 0.5] }}
                  transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.article>
            );
          })}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101016] p-5"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-normal text-white/[0.38]">
                  Focus timeline
                </p>
                <h3 className="mt-1 text-lg font-semibold text-white">A quieter way to build streaks</h3>
              </div>
              <Cloud className="h-5 w-5 text-[#7aa8ff]" />
            </div>
            <div className="flex h-28 items-end gap-2">
              {[35, 62, 48, 76, 58, 92, 70, 84, 52, 66, 88, 74].map((h, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-t-lg bg-[linear-gradient(180deg,#86f7d0,#7aa8ff)]"
                  initial={{ height: 8 }}
                  whileInView={{ height: h }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                />
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl border border-white/[0.08] bg-[#121015] p-5"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#ffcb6b]/[0.12] text-[#ffcb6b]">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Tonight’s best hour</p>
                <p className="text-xs text-white/[0.46]">8pm to 9pm</p>
              </div>
            </div>
            <div className="mt-7 h-2 rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-[linear-gradient(90deg,#ffcb6b,#ff8a8a)]"
                initial={{ width: 0 }}
                whileInView={{ width: "78%" }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
              />
            </div>
            <p className="mt-5 text-sm leading-6 text-white/[0.58]">
              FocusFlow learns from your completed sessions and turns effort into visible patterns.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
