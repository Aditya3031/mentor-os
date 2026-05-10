"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { THEMES } from "@/lib/themes";

export function LandingThemes() {
  return (
    <section className="relative bg-[#07070b] px-5 py-24 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl"
          >
            <p className="text-xs font-semibold uppercase tracking-normal text-[#ffcb6b]">
              Choose your atmosphere
            </p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-normal text-white md:text-5xl">
              Rooms with personality, not noise.
            </h2>
          </motion.div>
          <Link
            href="/themes"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.05] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.1]"
          >
            Explore rooms
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {THEMES.slice(0, 6).map((theme, i) => (
            <motion.div
              key={theme.id}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.06, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -8, scale: 1.015 }}
              className="group relative min-h-[260px] overflow-hidden rounded-2xl border border-white/[0.08] shadow-[0_24px_80px_rgba(0,0,0,0.28)]"
            >
              <motion.div
                className="absolute inset-0"
                style={{ background: theme.gradient }}
                animate={{ scale: [1, 1.06, 1], filter: ["saturate(1)", "saturate(1.18)", "saturate(1)"] }}
                transition={{ duration: 8 + i, repeat: Infinity, ease: "easeInOut" }}
              />
              <div
                className="absolute inset-0 opacity-70 mix-blend-screen"
                style={{
                  background: `linear-gradient(135deg, hsl(${theme.accent} / 0.42), transparent 55%)`,
                }}
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.05),rgba(0,0,0,0.72))]" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <div className="mb-4 flex gap-1.5">
                  {[0, 1, 2].map((dot) => (
                    <motion.span
                      key={dot}
                      className="h-1.5 w-8 rounded-full bg-white/70"
                      animate={{ opacity: [0.35, 1, 0.35] }}
                      transition={{
                        delay: dot * 0.25,
                        duration: 2.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </div>
                <h3 className="text-xl font-semibold tracking-normal text-white">{theme.name}</h3>
                <p className="mt-1 text-sm text-white/[0.72]">{theme.subtitle}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
