/**
 * Interface skins — full design languages, not just accent colors.
 * A skin swaps the entire UI chrome (fonts, bevels, windows, desktop)
 * via `body[data-skin="…"]` scopes in globals.css. The 12 accent
 * themes (lib/themes.ts) compose with every skin.
 */

export type SkinId = "retro95" | "cyberpunk" | "edo";

export interface Skin {
  id: SkinId;
  name: string;
  tagline: string;
  /** One-liner shown on the startup chooser */
  description: string;
  /** Boot-menu entry label, keeps the OS fiction */
  bootLabel: string;
  /** Colors for the chooser preview card (independent of active skin) */
  preview: {
    desktop: string;
    chrome: string;
    titleBar: string;
    text: string;
    accent: string;
  };
  /** Landing page BIOS lines for this skin */
  bootLines: string[];
  /** Boot screen text color */
  bootColor: string;
}

export const SKINS: Skin[] = [
  {
    id: "retro95",
    name: "FOCUSFLOW·95",
    tagline: "Retro operating system",
    description:
      "Beveled gray chrome, pixel fonts, defrag bars. The desktop that shipped on a floppy.",
    bootLabel: "FOCUSFLOW.95 [default]",
    preview: {
      desktop: "#0f5852",
      chrome: "#c9c6bc",
      titleBar: "linear-gradient(90deg,#3d2e85,#2d5f9e)",
      text: "#1c1b17",
      accent: "#3d2e85",
    },
    bootLines: [
      "FOCUSFLOW BIOS v9.5 — (C) DEEP WORK SYSTEMS",
      "CPU: HUMAN BRAIN @ 40 Hz ......... OK",
      "MEMORY TEST: 640K FOCUS ......... OK",
      "DETECTING DISTRACTIONS .......... 0 FOUND",
      "MOUNTING C:\\DEEPWORK ............ OK",
      "STARTING FOCUSFLOW.95 ...",
    ],
    bootColor: "#9ee89e",
  },
  {
    id: "cyberpunk",
    name: "NETRUNNER",
    tagline: "Neon terminal HUD",
    description:
      "Black glass, neon edges, scanlines turned up. Study like you're jacked into the grid.",
    bootLabel: "NETRUNNER.SYS [neon]",
    preview: {
      desktop: "#07040d",
      chrome: "#120b1e",
      titleBar: "linear-gradient(90deg,#c026d3,#0891b2)",
      text: "#c8f5f0",
      accent: "#22d3ee",
    },
    bootLines: [
      "NETRUNNER KERNEL 2.077 — DEEP WORK SYSTEMS",
      "NEURAL LINK ..................... SYNCED",
      "ICE DETECTED: PROCRASTINATION ... PURGED",
      "OPTIC IMPLANTS .................. CALIBRATED",
      "LOADING GRID: C:\\DEEPWORK ....... OK",
      "JACKING IN ...",
    ],
    bootColor: "#67e8f9",
  },
  {
    id: "edo",
    name: "SHOSAI",
    tagline: "Old Japan study house",
    description:
      "Washi paper, sumi ink, indigo and vermillion. A quiet Edo-period writing room.",
    bootLabel: "SHOSAI.MODE [washi]",
    preview: {
      desktop: "#1d2742",
      chrome: "#efe6d0",
      titleBar: "linear-gradient(90deg,#232d4f,#3a466e)",
      text: "#2a2118",
      accent: "#b3402a",
    },
    bootLines: [
      "書斎 SHOSAI — DEEP WORK SYSTEMS",
      "GRINDING INK .................... OK",
      "UNROLLING WASHI ................. OK",
      "SWEEPING THE STUDY .............. SPOTLESS",
      "LIGHTING THE LANTERN ............ LIT",
      "OPENING THE SHOJI ...",
    ],
    bootColor: "#e8d5a3",
  },
];

export function getSkin(id: SkinId): Skin {
  return SKINS.find((s) => s.id === id) ?? SKINS[0];
}
