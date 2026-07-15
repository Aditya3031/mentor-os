import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BackgroundStage } from "@/components/bg/background-stage";

export const metadata: Metadata = {
  title: "Terms of Service | FocusFlow",
  description: "The basic terms for using FocusFlow.",
};

const sections = [
  {
    title: "Using FocusFlow",
    body: [
      "FocusFlow is a study and productivity app that provides timers, task tracking, ambience controls, analytics, and AI-assisted study features.",
      "You agree to use FocusFlow responsibly and only for lawful purposes.",
    ],
  },
  {
    title: "Accounts",
    body: [
      "Some features may work without an account. If account features are enabled, you are responsible for keeping your login method secure.",
      "You should not use another person's account or attempt to access data that does not belong to you.",
    ],
  },
  {
    title: "AI Output",
    body: [
      "AI-generated study plans, summaries, and suggestions are provided for convenience and may be inaccurate or incomplete.",
      "You are responsible for reviewing AI output before relying on it for academic, professional, or personal decisions.",
    ],
  },
  {
    title: "Your Content",
    body: [
      "You keep ownership of the tasks, session notes, study goals, and prompts you enter into FocusFlow.",
      "By using sync or AI features, you allow FocusFlow to process that content only as needed to provide the requested app functionality.",
    ],
  },
  {
    title: "No Warranty",
    body: [
      "FocusFlow is provided as-is while the product is being developed.",
      "The app may change, break, or become unavailable. FocusFlow does not guarantee uninterrupted service or perfect data preservation.",
    ],
  },
  {
    title: "Changes",
    body: [
      "These terms may be updated as FocusFlow grows. Continued use of the app after updates means you accept the updated terms.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-stage-base px-5 py-6 sm:px-8 lg:px-10">
      <BackgroundStage />
      <div className="relative z-[5] mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-black/25 bg-black/[0.05] px-4 py-2 text-sm text-text-dim transition-colors hover:bg-black/[0.08] hover:text-text"
        >
          <ArrowLeft className="h-4 w-4" />
          Back home
        </Link>

        <header className="pb-8 pt-12">
          <p className="font-pixel text-[9px] uppercase tracking-[0.2em] text-white/70 [text-shadow:1px_1px_0_rgba(0,0,0,0.6)]">
            Legal
          </p>
          <h1 className="mt-4 text-4xl font-light tracking-tight sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-4 text-sm leading-7 text-text-dim">
            Last updated: May 10, 2026. These starter terms cover the current
            FocusFlow app experience and can be expanded before a wider launch.
          </p>
        </header>

        <div className="space-y-4 pb-16">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-black/25 bg-black/[0.05] p-5 "
            >
              <h2 className="text-lg font-semibold tracking-tight">{section.title}</h2>
              <div className="mt-3 space-y-3 text-sm leading-7 text-text-dim">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
