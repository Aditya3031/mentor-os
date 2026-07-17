import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BackgroundStage } from "@/components/bg/background-stage";

export const metadata: Metadata = {
  title: "Privacy Policy | FocusFlow",
  description: "How FocusFlow handles study data, AI requests, auth, and local storage.",
};

const sections = [
  {
    title: "What FocusFlow Stores",
    body: [
      "FocusFlow stores your timer settings, tasks, ambience preferences, session history, streaks, and achievements so the app can work between visits.",
      "When you use the app without signing in, this data is stored in your browser's local storage on your device.",
    ],
  },
  {
    title: "Accounts And Sync",
    body: [
      "If you choose to sign in after account features are enabled, FocusFlow may use Supabase to store account details and sync app data across your devices.",
      "OAuth providers such as Google or GitHub may share basic profile information with FocusFlow, such as your name, email address, avatar, and provider user id.",
    ],
  },
  {
    title: "AI Features",
    body: [
      "When you use the AI study coach or AI reflection features, the text you submit is sent to Google's Gemini API so a response can be generated.",
      "Do not enter sensitive personal, medical, financial, or confidential information into AI prompts.",
    ],
  },
  {
    title: "What We Do Not Sell",
    body: [
      "FocusFlow does not sell your personal information.",
      "FocusFlow does not use your private tasks or session notes for advertising targeting.",
    ],
  },
  {
    title: "Your Choices",
    body: [
      "You can clear local app data from the Settings page using Clear all data.",
      "If account sync is enabled, you can sign out from the profile menu. Account deletion requests can be handled by contacting the project owner.",
    ],
  },
  {
    title: "Contact",
    body: [
      "For privacy questions, contact the FocusFlow project owner through the support channel linked from the deployed app or repository.",
    ],
  },
];

export default function PrivacyPage() {
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
          <p className="font-pixel text-[9px] uppercase tracking-[0.2em] desk-ink-dim">
            Legal
          </p>
          <h1 className="mt-4 text-4xl font-light tracking-tight sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm leading-7 text-text-dim">
            Last updated: May 10, 2026. This is a practical starter policy for
            FocusFlow while the product is in active development.
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
