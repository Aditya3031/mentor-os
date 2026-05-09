"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { getTheme } from "@/lib/themes";

/**
 * Reads the current theme from the Zustand store and applies it
 * to <body data-theme="..."> + sets accent CSS variables.
 *
 * The actual color tokens live in app/globals.css under the
 * body[data-theme="..."] selectors, so the only job here is
 * to keep the body attribute in sync.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeId = useStore((s) => s.theme);

  useEffect(() => {
    const t = getTheme(themeId);
    document.body.dataset.theme = t.id;
    document.documentElement.style.setProperty("--accent", t.accent);
    document.documentElement.style.setProperty("--accent-alt", t.accentAlt);
  }, [themeId]);

  return <>{children}</>;
}
