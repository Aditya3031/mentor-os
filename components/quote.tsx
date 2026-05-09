"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const QUOTES = [
  { t: "The secret of getting ahead is getting started.", a: "Mark Twain" },
  { t: "Discipline is choosing between what you want now and what you want most.", a: "Abraham Lincoln" },
  { t: "You don't have to be great to start, but you have to start to be great.", a: "Zig Ziglar" },
  { t: "A river cuts through rock, not because of its power, but its persistence.", a: "James N. Watkins" },
  { t: "Small daily improvements are the key to staggering long-term results.", a: "Robin Sharma" },
  { t: "Focus is a matter of deciding what things you're not going to do.", a: "John Carmack" },
  { t: "Quality is not an act, it is a habit.", a: "Aristotle" },
];

export function Quote() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(Math.floor(Math.random() * QUOTES.length));
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % QUOTES.length);
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  const q = QUOTES[idx];

  return (
    <motion.div
      key={idx}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="mb-7 max-w-md text-center text-sm text-text-dim"
    >
      <span className="italic">{q.t}</span>
      <span className="mt-1.5 block text-[11px] uppercase tracking-widest text-text-faint">
        — {q.a}
      </span>
    </motion.div>
  );
}
