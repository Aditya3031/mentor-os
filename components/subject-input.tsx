"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";

const MAX_RECENT = 5;

/**
 * Subject input + recent-subjects chip row.
 * Tags the next focus session with what you're working on.
 * Quick-pick chips appear underneath, derived from your recent
 * session history (deduplicated, ordered by recency).
 */
export function SubjectInput() {
  const currentSubject = useStore((s) => s.currentSubject);
  const setCurrentSubject = useStore((s) => s.setCurrentSubject);
  const history = useStore((s) => s.history);

  // Unique subjects from recent history, ordered by most-recent use.
  const recentSubjects = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const session of history) {
      const subject = (session.subject || "").trim();
      if (!subject || subject === "Focus session") continue;
      const key = subject.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(subject);
      if (out.length >= MAX_RECENT) break;
    }
    return out;
  }, [history]);

  return (
    <div className="mb-6 w-full max-w-md">
      <input
        value={currentSubject}
        onChange={(e) => setCurrentSubject(e.target.value)}
        placeholder="What are you working on?"
        maxLength={60}
        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-center text-sm transition-colors placeholder:text-text-faint focus:border-white/[0.18] focus:bg-white/[0.05] focus:outline-none"
      />

      {recentSubjects.length > 0 && (
        <div className="mt-2 flex flex-wrap justify-center gap-1.5">
          {recentSubjects.map((subject) => {
            const active =
              subject.toLowerCase() === currentSubject.trim().toLowerCase();
            return (
              <button
                key={subject}
                type="button"
                onClick={() => setCurrentSubject(subject)}
                className={
                  "rounded-full border px-2.5 py-1 text-[11px] transition-colors " +
                  (active
                    ? "border-[hsl(var(--accent)/0.4)] bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))]"
                    : "border-white/[0.08] bg-white/[0.02] text-text-dim hover:bg-white/[0.05] hover:text-text")
                }
              >
                {subject}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
