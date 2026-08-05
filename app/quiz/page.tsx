"use client";

import { useMemo, useRef, useState } from "react";
import { BackgroundStage } from "@/components/bg/background-stage";
import { TopBar } from "@/components/top-bar";
import { Taskbar } from "@/components/retro/taskbar";
import { Window, Desktop } from "@/components/retro/window";
import { useQuizStore, weakTopics } from "@/lib/quiz-store";
import type { QuizBank, QuizQuestion } from "@/lib/quiz-types";
import { cn } from "@/lib/utils";
import { FileUp, Loader2, Play, Sparkles, Trash2 } from "lucide-react";

/**
 * QUIZ.EXE — generate question banks from your own notes (free-tier
 * LLM chain with a zero-LLM cloze fallback), cache them locally, and
 * drill them. Wrong answers feed the weak-topics list.
 */
export default function QuizPage() {
  const [activeBankId, setActiveBankId] = useState<string | null>(null);
  const banks = useQuizStore((s) => s.banks);
  const activeBank = banks.find((b) => b.id === activeBankId) ?? null;

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden">
      <BackgroundStage />
      <TopBar />
      <main className="relative z-[5] min-h-0 flex-1 overflow-y-auto px-3 pb-16 pt-3 sm:px-7">
        <Desktop className="mx-auto grid w-full max-w-5xl gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <Generator onGenerated={setActiveBankId} activeBankId={activeBankId} onOpen={setActiveBankId} />
          <Player bank={activeBank} />
        </Desktop>
      </main>
      <Taskbar />
    </div>
  );
}

/* ============================================================
   Generator + bank library
   ============================================================ */

function Generator({
  onGenerated,
  onOpen,
  activeBankId,
}: {
  onGenerated: (id: string) => void;
  onOpen: (id: string) => void;
  activeBankId: string | null;
}) {
  const banks = useQuizStore((s) => s.banks);
  const addBank = useQuizStore((s) => s.addBank);
  const removeBank = useQuizStore((s) => s.removeBank);
  const results = useQuizStore((s) => s.results);

  const [subject, setSubject] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const weak = weakTopics(results);

  const generate = async () => {
    if (busy || notes.trim().length < 200) {
      setStatus("Paste at least ~200 characters of notes first.");
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject || "General", text: notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      const bank: QuizBank = data.bank;
      addBank(bank);
      onGenerated(bank.id);
      setStatus(
        bank.source === "cloze"
          ? "Built offline (cloze mode — add GEMINI_API_KEY for AI questions)."
          : `Generated via ${bank.source} · ${bank.questions.length} questions cached.`
      );
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "generation failed");
    } finally {
      setBusy(false);
    }
  };

  const readFile = (f: File) => {
    const reader = new FileReader();
    reader.onload = () => setNotes(String(reader.result ?? "").slice(0, 40000));
    reader.readAsText(f);
  };

  return (
    <Window
      title="QUIZGEN.EXE"
      statusBar={
        <>
          <span className="status-cell">{banks.length} banks cached</span>
          <span className="status-cell flex-1 truncate">
            {weak.length ? `weak: ${weak.join(", ")}` : "no weak topics yet"}
          </span>
        </>
      }
    >
      <div className="flex flex-col gap-2">
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          maxLength={60}
          placeholder="subject (e.g. Signals & Systems)"
          className="well w-full px-3 py-2 text-[13px] outline-none placeholder:text-text-faint"
        />
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="paste lecture notes here… (or load a .txt/.md file)"
          rows={7}
          className="well w-full resize-none px-3 py-2 text-[12px] leading-5 outline-none placeholder:text-text-faint"
        />
        <div className="flex flex-wrap items-center gap-1.5">
          <button className="btn95 btn95-primary h-9 gap-1.5 px-4 text-[10px]" onClick={generate} disabled={busy}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {busy ? "Generating…" : "Generate quiz"}
          </button>
          <button className="btn95 h-9 gap-1.5 px-3 text-[10px]" onClick={() => fileRef.current?.click()}>
            <FileUp className="h-3.5 w-3.5" />
            Load .txt
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.md,text/plain"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0])}
          />
          <span className="text-[10px] text-text-faint">{notes.length.toLocaleString()} chars</span>
        </div>
        {status && <div className="bevel-thin px-3 py-2 text-[11px] text-text-dim">{status}</div>}

        {banks.length > 0 && (
          <div className="mt-1 flex flex-col gap-1">
            {banks.map((b) => (
              <div
                key={b.id}
                className={cn(
                  "bevel-thin flex items-center gap-2 px-2.5 py-1.5",
                  b.id === activeBankId && "bevel-in bg-[var(--paper)]"
                )}
              >
                <button className="min-w-0 flex-1 text-left" onClick={() => onOpen(b.id)}>
                  <span className="block truncate text-[12px]">{b.subject}</span>
                  <span className="block text-[10px] text-text-faint">
                    {b.questions.length} Qs · {b.source} · {new Date(b.createdAt).toLocaleDateString()}
                  </span>
                </button>
                <button
                  className="btn95 h-6 w-6 px-0"
                  aria-label={`Delete ${b.subject} bank`}
                  onClick={() => removeBank(b.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Window>
  );
}

/* ============================================================
   Player — drill a bank, grade locally, track weak topics
   ============================================================ */

const QUIZ_SIZE = 8;

function Player({ bank }: { bank: QuizBank | null }) {
  const recordResult = useQuizStore((s) => s.recordResult);
  const [runId, setRunId] = useState(0);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [wrongTopics, setWrongTopics] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const questions = useMemo<QuizQuestion[]>(() => {
    if (!bank) return [];
    return [...bank.questions].sort(() => Math.random() - 0.5).slice(0, QUIZ_SIZE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bank?.id, runId]);

  const reset = () => {
    setIdx(0);
    setPicked(null);
    setWrongTopics([]);
    setScore(0);
    setDone(false);
    setRunId((n) => n + 1);
  };

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    const q = questions[idx];
    if (i === q.answer) setScore((s) => s + 1);
    else setWrongTopics((w) => [...w, q.topic]);
  };

  const next = () => {
    if (idx + 1 >= questions.length) {
      const q = questions[idx];
      const finalScore = picked === q.answer ? score : score;
      recordResult({
        bankId: bank!.id,
        subject: bank!.subject,
        score: finalScore,
        total: questions.length,
        weakTopics: [...new Set(wrongTopics)],
        at: Date.now(),
      });
      setDone(true);
    } else {
      setIdx((i) => i + 1);
      setPicked(null);
    }
  };

  const q = questions[idx];

  return (
    <Window
      title="QUIZ.EXE"
      statusBar={
        <>
          <span className="status-cell">
            {bank ? `${bank.subject}` : "no bank loaded"}
          </span>
          {bank && !done && q && (
            <span className="status-cell">
              {idx + 1} / {questions.length}
            </span>
          )}
          <span className="status-cell flex-1">score: {score}</span>
        </>
      }
    >
      {!bank ? (
        <div className="grid min-h-[260px] place-items-center text-center">
          <div>
            <p className="font-pixel text-[11px] uppercase tracking-wider text-[var(--accent-deep)]">
              No bank loaded
            </p>
            <p className="mx-auto mt-2 max-w-xs text-[12px] text-text-dim">
              Generate a quiz from your notes on the left, or open a cached
              bank. Questions are graded locally — replays are free.
            </p>
          </div>
        </div>
      ) : done ? (
        <div className="grid min-h-[260px] place-items-center text-center">
          <div>
            <p className="font-digits text-5xl text-[var(--accent-deep)]">
              {score}/{questions.length}
            </p>
            <p className="mt-2 text-[12px] text-text-dim">
              {score === questions.length
                ? "Perfect run. Go touch grass."
                : wrongTopics.length
                  ? `Weak topics logged: ${[...new Set(wrongTopics)].join(", ")}`
                  : "Solid."}
            </p>
            <button className="btn95 btn95-primary mt-4 h-9 gap-1.5 px-4 text-[10px]" onClick={reset}>
              <Play className="h-3.5 w-3.5" />
              Run again
            </button>
          </div>
        </div>
      ) : q ? (
        <div className="flex flex-col gap-2">
          <p className="bevel-thin px-3 py-2.5 text-[13px] leading-6">{q.q}</p>
          <div className="flex flex-col gap-1.5">
            {q.options.map((opt, i) => {
              const isCorrect = picked !== null && i === q.answer;
              const isWrongPick = picked === i && i !== q.answer;
              return (
                <button
                  key={i}
                  onClick={() => pick(i)}
                  disabled={picked !== null}
                  className={cn(
                    "btn95 h-auto min-h-9 justify-start px-3 py-2 text-left text-[11px] normal-case tracking-normal",
                    isCorrect && "bevel-in bg-[#3aff9e]/20 text-[var(--accent-deep)] font-bold",
                    isWrongPick && "bevel-in bg-[#ff5a5a]/20 line-through"
                  )}
                >
                  <span className="mr-2 font-digits">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                </button>
              );
            })}
          </div>
          {picked !== null && (
            <div className="bevel-thin px-3 py-2 text-[11px] text-text-dim">
              {q.explanation || "Logged."}
              <span className="ml-2 text-text-faint">[{q.topic}]</span>
            </div>
          )}
          {picked !== null && (
            <button className="btn95 btn95-primary h-9 self-end px-4 text-[10px]" onClick={next}>
              {idx + 1 >= questions.length ? "Finish" : "Next >"}
            </button>
          )}
        </div>
      ) : (
        <div className="py-8 text-center text-[12px] text-text-faint">
          This bank has no questions — regenerate it.
        </div>
      )}
    </Window>
  );
}
