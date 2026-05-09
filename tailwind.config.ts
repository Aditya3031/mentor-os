import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: { center: true, padding: "1.5rem" },
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-instrument)", "Georgia", "serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      colors: {
        bg: {
          0: "hsl(var(--bg-0))",
          1: "hsl(var(--bg-1))",
          2: "hsl(var(--bg-2))",
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
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glow: "0 0 40px hsl(var(--accent) / 0.35)",
        soft: "0 8px 30px rgba(0,0,0,0.35)",
        deep: "0 20px 60px rgba(0,0,0,0.45)",
      },
      keyframes: {
        drift: {
          "0%": { transform: "translate3d(0,0,0) scale(1)" },
          "100%": { transform: "translate3d(4%,-3%,0) scale(1.05)" },
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
      },
      animation: {
        drift: "drift 24s ease-in-out infinite alternate",
        glowpulse: "glowpulse 4s ease-in-out infinite",
        floaty: "floaty 4s ease-in-out infinite",
        shimmer: "shimmer 2s ease-in-out infinite",
        confetti: "confettiFall 3s ease-out forwards",
      },
      transitionTimingFunction: {
        elegant: "cubic-bezier(0.22, 1, 0.36, 1)",
        out: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
