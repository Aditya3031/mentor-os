"use client";

/**
 * Client-side quiz persistence. Banks are generated once (server
 * route) and cached here — the free-tier survival strategy. Separate
 * persist key from the main store so cloud sync stays untouched.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { QuizBank, QuizResult } from "./quiz-types";

interface QuizState {
  banks: QuizBank[];
  results: QuizResult[];
  addBank: (bank: QuizBank) => void;
  removeBank: (id: string) => void;
  recordResult: (r: QuizResult) => void;
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set) => ({
      banks: [],
      results: [],
      addBank: (bank) =>
        set((s) => ({ banks: [bank, ...s.banks].slice(0, 30) })),
      removeBank: (id) =>
        set((s) => ({ banks: s.banks.filter((b) => b.id !== id) })),
      recordResult: (r) =>
        set((s) => ({ results: [r, ...s.results].slice(0, 100) })),
    }),
    { name: "mentoros.quiz.v1" }
  )
);

/** Aggregate weak topics across recent results (worst first). */
export function weakTopics(results: QuizResult[], limit = 5): string[] {
  const counts = new Map<string, number>();
  for (const r of results.slice(0, 20))
    for (const t of r.weakTopics) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([t]) => t);
}
