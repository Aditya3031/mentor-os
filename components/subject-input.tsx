"use client";

import { useStore } from "@/lib/store";

/**
 * Small text input that tags the next focus session with a subject
 * (e.g. "Calculus II", "Essay draft"). Persists to the store so a
 * page refresh doesn't lose what you typed, and gets attached to
 * the next completed session in history.
 */
export function SubjectInput() {
  const currentSubject = useStore((s) => s.currentSubject);
  const setCurrentSubject = useStore((s) => s.setCurrentSubject);

  return (
    <div className="mb-6 w-full max-w-xs">
      <input
        value={currentSubject}
        onChange={(e) => setCurrentSubject(e.target.value)}
        placeholder="What are you working on?"
        maxLength={60}
        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-center text-sm transition-colors placeholder:text-text-faint focus:border-white/[0.18] focus:bg-white/[0.05] focus:outline-none"
      />
    </div>
  );
}
