"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { getTheme } from "@/lib/themes";
import { getSkin } from "@/lib/skins";

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
  const skin = useStore((s) => s.skin);

  useEffect(() => {
    const t = getTheme(themeId);
    document.body.dataset.theme = t.id;
    document.documentElement.style.setProperty("--accent", t.accent);
    document.documentElement.style.setProperty("--accent-alt", t.accentAlt);
  }, [themeId]);

  useEffect(() => {
    // Sanitize retired/unknown persisted skin ids back to the default.
    const valid = getSkin(skin).id;
    if (valid !== skin) useStore.setState({ skin: valid });
    document.body.dataset.skin = valid;
  }, [skin]);

  return <>{children}</>;
}
