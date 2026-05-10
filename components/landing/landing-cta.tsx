"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Github, LogIn } from "lucide-react";

export function LandingCTA() {
  return (
    <section className="relative overflow-hidden border-t border-white/[0.06] bg-[#0a0a10] px-5 py-20 sm:px-8 lg:px-10">
      <div className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:64px_64px]" />
      <div className="relative mx-auto grid max-w-6xl gap-10 md:grid-cols-[1fr_0.9fr] md:items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-xs font-semibold uppercase tracking-normal text-[#86f7d0]">
            Ready when you are
          </p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-normal text-white md:text-6xl">
            Open the room. Start the streak.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/[0.62]">
            Use it as a guest today, then connect Google or GitHub when you want
            your study history to follow you across devices.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/focus"
              className="group inline-flex items-center gap-2 rounded-full bg-[#86f7d0] px-6 py-3 text-sm font-bold text-[#06120e] transition-transform hover:-translate-y-1"
            >
              Enter focus room
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.05] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.1]"
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5 backdrop-blur-xl"
        >
          {[
            "Animated focus room",
            "Real dashboard stats",
            "Google and GitHub auth ready",
            "Supabase sync layer included",
          ].map((item, i) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.08, duration: 0.5 }}
              className="flex items-center gap-3 border-b border-white/[0.08] py-4 last:border-b-0"
            >
              <CheckCircle2 className="h-5 w-5 text-[#86f7d0]" />
              <span className="text-sm text-white/[0.76]">{item}</span>
            </motion.div>
          ))}
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#0d0d13] px-4 py-3 text-xs text-white/[0.5]">
            <Github className="h-4 w-4" />
            Ship it, redeploy, and keep polishing.
          </div>
        </motion.div>
      </div>

      <footer className="relative mt-16 flex flex-col items-center justify-center gap-3 text-xs text-white/[0.38] sm:flex-row">
        <span>© {new Date().getFullYear()} FocusFlow. Built for deep work.</span>
        <span className="hidden h-3 w-px bg-white/[0.16] sm:block" />
        <Link href="/privacy" className="transition-colors hover:text-white/[0.76]">
          Privacy
        </Link>
        <Link href="/terms" className="transition-colors hover:text-white/[0.76]">
          Terms
        </Link>
      </footer>
    </section>
  );
}
