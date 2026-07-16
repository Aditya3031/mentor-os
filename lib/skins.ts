/**
 * Interface skins — full design languages, not just accent colors.
 * A skin swaps the entire UI chrome (fonts, bevels, windows, desktop)
 * via `body[data-skin="…"]` scopes in globals.css. The 12 accent
 * themes (lib/themes.ts) compose with every skin.
 */

export type SkinId =
  | "retro95"
  | "cyberpunk"
  | "edo"
  | "terminal"
  | "mono"
  | "outrun"
  | "blueprint";

/**
 * Chrome paradigm — how windows and navigation render. This is what
 * makes each skin a standalone design language instead of a recolored
 * OS: only "os" skins get title-bar buttons, Start menus and .EXE names.
 */
export type ChromeStyle =
  | "os" /* retro95, mono — title bars, — □ ✕, Start menu */
  | "hud" /* cyberpunk — angular HUD frames, corner brackets, SYS nav */
  | "tty" /* terminal — tmux-style panes, status-line nav */
  | "paper" /* edo — washi cards with fabric header + hanko seal */
  | "deck" /* outrun — dashboard strips, LED header */
  | "sheet"; /* blueprint — drafting frames with title tabs */

export interface Skin {
  id: SkinId;
  name: string;
  tagline: string;
  /** One-liner shown on the startup chooser */
  description: string;
  /** Boot-menu entry label, keeps the OS fiction */
  bootLabel: string;
  /** Window + navigation paradigm */
  chrome: ChromeStyle;
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
    chrome: "os",
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
    chrome: "hud",
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
    chrome: "paper",
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
  {
    id: "terminal",
    chrome: "tty",
    name: "MAINFRAME",
    tagline: "Phosphor terminal",
    description:
      "A bare CRT terminal. Inverse-video title bars, glowing phosphor — the color scheme picks your phosphor.",
    bootLabel: "MAINFRAME.TTY [phosphor]",
    preview: {
      desktop: "#010402",
      chrome: "#041007",
      titleBar: "linear-gradient(90deg,#63ff8f,#63ff8f)",
      text: "#b8ffcb",
      accent: "#63ff8f",
    },
    bootLines: [
      "MAINFRAME TTY — DEEP WORK SYSTEMS",
      "CONNECT 9600 BAUD ............... CARRIER OK",
      "LOGIN: deepworker ............... AUTHENTICATED",
      "MOTD: NO NEWS. ONLY WORK.",
      "MOUNTING /dev/focus ............. OK",
      "READY.",
    ],
    bootColor: "#7dffa0",
  },
  {
    id: "mono",
    chrome: "os",
    name: "SYSTEM·1",
    tagline: "1-bit monochrome",
    description:
      "Strict black on white. Pinstriped title bars, checkerboard desktop, not a single color anywhere.",
    bootLabel: "SYSTEM1.IMG [1-bit]",
    preview: {
      desktop: "repeating-conic-gradient(#8a8a8a 0% 25%, #a8a8a8 0% 50%) 0 0 / 4px 4px",
      chrome: "#ffffff",
      titleBar: "repeating-linear-gradient(0deg,#000 0 1px,#fff 1px 3px)",
      text: "#000000",
      accent: "#000000",
    },
    bootLines: [
      "SYSTEM 1 — DEEP WORK SYSTEMS",
      "CHECKING DISK ................... OK",
      "COLORS FOUND .................... 2 (PLENTY)",
      "LOADING FINDER .................. OK",
      "EMPTYING TRASH .................. DONE",
      "WELCOME.",
    ],
    bootColor: "#ffffff",
  },
  {
    id: "outrun",
    chrome: "deck",
    name: "OUTRUN",
    tagline: "Synthwave sunset",
    description:
      "Night drive at the edge of the grid. Sunset title bars, horizon floor, pink chrome everything.",
    bootLabel: "OUTRUN.DRV [sunset]",
    preview: {
      desktop: "linear-gradient(180deg,#150a2e 0%,#3b1160 55%,#c13a6d 100%)",
      chrome: "#1c1133",
      titleBar: "linear-gradient(90deg,#ff2d78,#ff8c42)",
      text: "#ffd9ec",
      accent: "#ff5fa2",
    },
    bootLines: [
      "OUTRUN ENGINE — DEEP WORK SYSTEMS",
      "IGNITION ........................ V8 FOCUS",
      "SUNSET .......................... RENDERED",
      "GRID FLOOR ...................... INFINITE",
      "CASSETTE ........................ SIDE A",
      "DRIVE.",
    ],
    bootColor: "#ff6ea9",
  },
  {
    id: "blueprint",
    chrome: "sheet",
    name: "BLUEPRINT",
    tagline: "Drafting table",
    description:
      "Cyanotype paper and white line-work. Every window drawn with a T-square, labels in stencil caps.",
    bootLabel: "BLUEPRINT.DWG [cyanotype]",
    preview: {
      desktop: "#123a6d",
      chrome: "#1e4a80",
      titleBar: "rgba(255,255,255,0.28)",
      text: "#dbe9ff",
      accent: "#ffffff",
    },
    bootLines: [
      "DRAFTING TABLE v1.0 — DEEP WORK SYSTEMS",
      "T-SQUARE ........................ ALIGNED",
      "PAPER: A0 CYANOTYPE ............. PINNED",
      "PENCILS ......................... SHARPENED",
      "SCALE 1:1 (YOUR ACTUAL LIFE)",
      "BEGIN DRAWING ...",
    ],
    bootColor: "#cfe4ff",
  },
];

export function getSkin(id: SkinId): Skin {
  return SKINS.find((s) => s.id === id) ?? SKINS[0];
}

/* ============================================================
   Window / program naming per paradigm.
   Call sites keep passing the canonical retro name ("FOCUS.EXE",
   "GOALS.TXT"); each skin derives its own language from it so
   nothing outside retro95 ever shows a DOS extension.
   ============================================================ */

/** Curated Japanese labels for the edo skin (base name → kanji). */
const EDO_NAMES: Record<string, string> = {
  FOCUS: "集中の間",
  TASKS: "務め",
  GOALS: "目標",
  STATS: "記録",
  SNAPSHOT: "今日",
  DEFRAG: "整頓",
  MIXER: "音の間",
  HEATMAP: "九十日",
  LOG: "日誌",
  HISTORY: "日誌",
  TROPHY: "誉れ",
  THEMES: "装い",
  DISPLAY: "装い",
  SETUP: "設え",
  TIMER: "刻",
  BEHAVIOR: "作法",
  AI: "師範",
  ROOM: "共作",
  ROOMS: "座敷",
  LIVE: "同席",
  WELCOME: "ようこそ",
  README: "はじめに",
  LOGIN: "入室",
  FORMAT: "始末",
};

/** Cyberpunk suffix per DOS extension family. */
const HUD_SUFFIX: Record<string, string> = {
  EXE: "RUN",
  SYS: "SYS",
  TXT: "DAT",
  LOG: "LOG",
  INI: "CFG",
  CPL: "CFG",
  CAB: "VLT",
  NFO: "NFO",
  HLP: "AI",
  NET: "NET",
  CAM: "CAM",
  COM: "RUN",
  DLL: "LIB",
  DWG: "DWG",
  IMG: "IMG",
  TTY: "TTY",
  MODE: "SYS",
  DRV: "DRV",
};

/**
 * Transform a canonical retro window title into the active skin's
 * naming language. Unknown/odd titles pass through sensibly.
 */
export function windowTitle(retroName: string, skin: SkinId): string {
  const m = retroName.match(/^([A-Z0-9_·-]+)\.([A-Z]+)$/i);
  if (!m) return retroName; // free-form titles pass through
  const base = m[1].toUpperCase();
  const ext = m[2].toUpperCase();
  const pretty = base.charAt(0) + base.slice(1).toLowerCase();

  switch (skin) {
    case "retro95":
      return retroName;
    case "mono":
      return pretty; // classic Mac windows: plain names, no extensions
    case "cyberpunk":
      return `${base}//${HUD_SUFFIX[ext] ?? ext}`;
    case "terminal":
      // processes lowercase, documents keep their file look
      return ext === "TXT" || ext === "LOG"
        ? `${base.toLowerCase()}.${ext.toLowerCase()}`
        : `${base.toLowerCase()}`;
    case "edo":
      return EDO_NAMES[base] ?? pretty;
    case "outrun":
      return base; // big chrome letters, no file fiction
    case "blueprint":
      return base; // stencil caps; the sheet-tab chrome carries the look
    default:
      return retroName;
  }
}
