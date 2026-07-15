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
    <div className="mb-5 w-full max-w-md">
      <div className="well flex items-center gap-2 px-3 py-2">
        <span className="select-none font-digits text-base text-text-dim">
          C:\&gt;
        </span>
        <input
          value={currentSubject}
          onChange={(e) => setCurrentSubject(e.target.value)}
          placeholder="what are you working on?"
          maxLength={60}
          className="w-full bg-transparent text-sm outline-none placeholder:text-text-faint"
        />
      </div>

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
                  "px-2.5 py-1 text-[11px] " +
                  (active
                    ? "bevel-in bg-[var(--paper)] font-bold"
                    : "bevel-thin bg-chrome text-text-dim hover:text-text")
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
