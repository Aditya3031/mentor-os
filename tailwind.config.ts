import type { Config } from "tailwindcss";
// ESM import (not require) so the config loads under both Turbopack and webpack.
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: { center: true, padding: "1.5rem" },
    /*
     * Retro OS: no rounded corners, anywhere. Overriding the whole
     * scale (not extending) squares off every `rounded-*` in the app.
     */
    borderRadius: {
      none: "0",
      sm: "0",
      DEFAULT: "0",
      md: "0",
      lg: "0",
      xl: "0",
      "2xl": "0",
      "3xl": "0",
      full: "0",
    },
    extend: {
      fontFamily: {
        /* All routed through --ui-* so interface skins can swap families */
        sans: ["var(--ui-body)"],
        serif: ["var(--ui-digits)"],
        mono: ["var(--ui-body)"],
        pixel: ["var(--ui-display)"],
        digits: ["var(--ui-digits)"],
      },
      colors: {
        bg: {
          0: "hsl(var(--bg-0))",
          1: "hsl(var(--bg-1))",
          2: "hsl(var(--bg-2))",
        },
        chrome: {
          DEFAULT: "hsl(var(--chrome))",
          hi: "hsl(var(--chrome-hi))",
          lo: "hsl(var(--chrome-lo))",
        },
        surface: "hsl(var(--surface))",
        border: "hsl(var(--border))",
        text: {
          DEFAULT: "hsl(var(--text))",
          dim: "hsl(var(--text-dim))",
          faint: "hsl(var(--text-faint))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          alt: "hsl(var(--accent-alt))",
        },
      },
      /* Hard pixel shadows — no soft blur in this OS */
      boxShadow: {
        glow: "3px 3px 0 rgba(0,0,0,0.4)",
        soft: "2px 2px 0 rgba(0,0,0,0.35)",
        deep: "5px 5px 0 rgba(0,0,0,0.45)",
        hard: "4px 4px 0 var(--edge-black)",
      },
      keyframes: {
        drift: {
          "0%": { transform: "translate3d(0,0,0)" },
          "100%": { transform: "translate3d(0,0,0)" },
        },
        glowpulse: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
        confettiFall: {
          to: { transform: "translateY(110vh) rotate(720deg)", opacity: "0" },
        },
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
      },
      animation: {
        drift: "drift 24s ease-in-out infinite alternate",
        glowpulse: "glowpulse 4s ease-in-out infinite",
        floaty: "floaty 4s ease-in-out infinite",
        shimmer: "shimmer 2s ease-in-out infinite",
        confetti: "confettiFall 3s ease-out forwards",
        blink: "blink 1.1s step-end infinite",
      },
      transitionTimingFunction: {
        elegant: "steps(4, end)",
        out: "steps(4, end)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
