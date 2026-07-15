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
          className="fixed inset-0 z-[400] grid place-items-center bg-black/60 px-6 "
          onClick={handleSkip}
        >
          <motion.div
            initial={{ y: 16, scale: 0.96 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 8, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="win95 w-full max-w-md p-[3px] shadow-deep"
          >
            <div className="title-bar justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                SESSION COMPLETE — REFLECT.LOG
              </span>
              <button
                onClick={handleSkip}
                disabled={busy}
                className="tb-btn"
                aria-label="Skip reflection"
              >
                <X className="h-3 w-3" />
              </button>
            </div>

            <div className="p-5">
            <div className="mb-4">
              <h2 className="font-pixel text-sm uppercase">
                {Math.round(session.durationSec / 60)} min on{" "}
                <span className="text-[var(--accent-deep)]">
                  {session.subject}
                </span>
              </h2>
              <p className="mt-1.5 text-xs text-text-dim">
                What did you actually accomplish? AI will save it to history.
              </p>
            </div>

            <textarea
              autoFocus
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Solved problems 1-8 in chapter 7, got stuck on chain rule with implicit functions. Need to review section 7.4 next time."
              maxLength={500}
              rows={4}
              className="well w-full resize-none p-3 text-sm leading-relaxed outline-none placeholder:text-text-faint"
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

            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={handleSkip}
                disabled={busy}
                className="btn95 h-9 px-4 text-[10px] disabled:opacity-50"
              >
                Skip
              </button>
              <button
                onClick={handleSave}
                disabled={busy || !note.trim()}
                className="btn95 btn95-primary ml-auto h-9 px-4 text-[10px] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    Save with AI summary
                  </>
                )}
              </button>
            </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
