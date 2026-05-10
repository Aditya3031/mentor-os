"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

/**
 * Reflection modal — pops up automatically after a focus session completes.
 * User types what they accomplished → Gemini turns it into a one-line summary
 * → saves to history. Skippable.
 */
export function ReflectionModal() {
  const pendingId = useStore((s) => s.pendingReflectionSessionId);
  const session = useStore((s) =>
    s.history.find((h) => h.id === s.pendingReflectionSessionId)
  );
  const setSessionReflection = useStore((s) => s.setSessionReflection);
  const dismissReflection = useStore((s) => s.dismissReflection);

  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const open = pendingId !== null && session !== undefined;

  const handleSave = async () => {
    if (!session || !note.trim()) return;
    setBusy(true);

    try {
      const res = await fetch("/api/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: session.subject,
          durationMin: Math.round(session.durationSec / 60),
          userNote: note,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        // Save the note anyway, just no AI summary
        setSessionReflection(session.id, note);
        toast.error(data.error ?? "AI summary failed — your note was saved.");
      } else {
        setSessionReflection(session.id, note, data.summary);
        toast.success("Session saved · +5 XP");
      }
      setNote("");
    } catch (e: any) {
      setSessionReflection(session.id, note);
      toast.error("Network error — your note was saved.");
    } finally {
      setBusy(false);
    }
  };

  const handleSkip = () => {
    setNote("");
    dismissReflection();
  };

  return (
    <AnimatePresence>
      {open && session && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[400] grid place-items-center bg-black/60 px-6 backdrop-blur-md"
          onClick={handleSkip}
        >
          <motion.div
            initial={{ y: 16, scale: 0.96 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 8, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-white/[0.14] bg-bg-2/95 p-6 shadow-deep backdrop-blur-xl"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[hsl(var(--accent))]">
                  <Sparkles className="h-3 w-3" />
                  Quick reflection
                </div>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">
                  {Math.round(session.durationSec / 60)} min on{" "}
                  <span className="text-[hsl(var(--accent))]">
                    {session.subject}
                  </span>
                </h2>
                <p className="mt-1 text-xs text-text-dim">
                  What did you actually accomplish? AI will save it to history.
                </p>
              </div>
              <button
                onClick={handleSkip}
                disabled={busy}
                className="grid h-7 w-7 place-items-center rounded-md text-text-dim hover:bg-white/[0.06] hover:text-text"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <textarea
              autoFocus
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Solved problems 1-8 in chapter 7, got stuck on chain rule with implicit functions. Need to review section 7.4 next time."
              maxLength={500}
              rows={4}
              className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.03] p-3.5 text-sm leading-relaxed transition-colors placeholder:text-text-faint focus:border-white/[0.2] focus:outline-none"
              disabled={busy}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  handleSave();
                }
              }}
            />

            <div className="mt-1 flex items-center justify-between text-[11px] text-text-faint">
              <span>{note.length} / 500</span>
              <span className="font-mono">⌘ + Enter to save</span>
            </div>

            <div className="mt-5 flex items-center gap-2">
              <button
                onClick={handleSkip}
                disabled={busy}
                className="rounded-xl border border-white/[0.08] px-5 py-2.5 text-sm font-medium text-text-dim transition-colors hover:bg-white/[0.04] hover:text-text disabled:opacity-50"
              >
                Skip
              </button>
              <button
                onClick={handleSave}
                disabled={busy || !note.trim()}
                className="ml-auto inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(135deg,hsl(var(--accent)),hsl(var(--accent-alt)))] px-5 py-2.5 text-sm font-semibold text-bg-0 shadow-glow transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Save with AI summary
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
