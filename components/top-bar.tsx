"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Bell, Maximize2 } from "lucide-react";

/**
 * Glass top bar with brand, "studying now" pill, and quick actions.
 * The live count is a deliberately fake counter to evoke the "study together" feeling.
 */
export function TopBar() {
  const [count, setCount] = useState(14_827);

  useEffect(() => {
    const id = setInterval(() => {
      setCount((n) => {
        const next = n + Math.floor(Math.random() * 11) - 4;
        if (next < 14_000) return 14_000;
        if (next > 16_000) return 16_000;
        return next;
      });
    }, 2400);
    return () => clearInterval(id);
  }, []);

  const toggleZen = () => document.body.classList.toggle("zen");

  return (
    <header className="relative z-10 flex items-center justify-between px-7 py-4">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="grid h-[30px] w-[30px] place-items-center rounded-[9px] bg-[linear-gradient(135deg,hsl(var(--accent)),hsl(var(--accent-alt)))] shadow-glow">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-bg-0" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        </div>
        <span className="text-[15px] font-semibold tracking-tight">
          focus<span className="text-[hsl(var(--accent))]">.</span>flow
        </span>
      </Link>

      <div className="flex items-center gap-2 rounded-full border border-[#7DE0B6]/[0.18] bg-[#7DE0B6]/[0.08] px-3 py-1.5 text-xs text-[#B6EFD3]">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#7DE0B6] shadow-[0_0_12px_#7DE0B6]" />
        <span>
          <b>{count.toLocaleString()}</b> studying now
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button className="grid h-9 w-9 place-items-center rounded-[10px] text-text-dim transition-colors hover:bg-white/[0.04] hover:text-text">
          <Search className="h-[18px] w-[18px]" />
        </button>
        <button onClick={toggleZen} className="grid h-9 w-9 place-items-center rounded-[10px] text-text-dim transition-colors hover:bg-white/[0.04] hover:text-text">
          <Maximize2 className="h-[18px] w-[18px]" />
        </button>
        <button className="grid h-9 w-9 place-items-center rounded-[10px] text-text-dim transition-colors hover:bg-white/[0.04] hover:text-text">
          <Bell className="h-[18px] w-[18px]" />
        </button>
        <span className="mx-1 h-5 w-px bg-white/[0.08]" />
        <button className="grid h-9 w-9 place-items-center rounded-full bg-[linear-gradient(135deg,hsl(var(--accent)),hsl(var(--accent-alt)))] text-[11px] font-semibold text-bg-0">
          A
        </button>
      </div>
    </header>
  );
}
