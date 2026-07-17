/**
 * Interface skins — full design languages, not just accent colors.
 * A skin swaps the entire UI chrome (fonts, frames, windows, desktop)
 * via `body[data-skin="…"]` scopes in globals.css. The 12 accent
 * themes (lib/themes.ts) compose with every skin.
 *
 * Lineup philosophy: ONE retro museum piece (FOCUSFLOW·95), the rest
 * are futuristic siblings — neon, hologram, deep space, sterile lab,
 * OLED void, synthwave.
 */

export type SkinId =
  | "retro95"
  | "cyberpunk"
  | "holo"
  | "starship"
  | "ghost"
  | "void"
  | "outrun";

/**
 * Chrome paradigm — how windows and navigation render. Only the "os"
 * skin gets title-bar buttons, a Start menu and .EXE names; every
 * other paradigm has its own frame + nav language.
 */
export type ChromeStyle =
  | "os" /* retro95 — title bars, — □ ✕, Start menu */
  | "hud" /* cyberpunk — angular HUD frames, corner brackets */
  | "holo" /* holodeck — translucent AR glass, corner ticks */
  | "cockpit" /* starship — steel panels, caution stripes, rivets */
  | "ghost" /* ghost — white lab minimal, hairline accents */
  | "void" /* void — black OLED, hairline edges, pure type */
  | "deck"; /* outrun — dashboard strips, LED header */

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
    tagline: "The retro one",
    description:
      "Beveled gray chrome, pixel fonts, defrag bars. The desktop that shipped on a floppy — kept exactly as it was.",
    bootLabel: "FOCUSFLOW.95 [retro]",
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
    id: "holo",
    chrome: "holo",
    name: "HOLODECK",
    tagline: "Augmented hologram",
    description:
      "Translucent light-field panels projected over a dark grid. Corner ticks, soft glow, interface as apparition.",
    bootLabel: "HOLODECK.PRJ [hologram]",
    preview: {
      desktop: "#03070f",
      chrome: "#0a1626",
      titleBar: "linear-gradient(90deg,rgba(80,200,255,0.65),rgba(80,200,255,0.15))",
      text: "#c9e9ff",
      accent: "#54c8ff",
    },
    bootLines: [
      "HOLODECK PROJECTOR — DEEP WORK SYSTEMS",
      "EMITTERS ........................ WARM",
      "LIGHT FIELD ..................... COHERENT",
      "PHOTON BUDGET ................... UNLIMITED",
      "RENDERING WORKSPACE ............. 100%",
      "PROJECTION ON.",
    ],
    bootColor: "#8fd8ff",
  },
  {
    id: "starship",
    chrome: "cockpit",
    name: "STARSHIP",
    tagline: "Deep-space freighter",
    description:
      "Gunmetal instrument panels, amber readouts, caution stripes. Long haul, no distractions for 4.3 light-years.",
    bootLabel: "STARSHIP.CTL [deepspace]",
    preview: {
      desktop: "#101318",
      chrome: "#1a1e25",
      titleBar: "linear-gradient(90deg,#2a2f38,#1f242c)",
      text: "#ffd9a0",
      accent: "#ffb454",
    },
    bootLines: [
      "STARSHIP CONTROL — DEEP WORK SYSTEMS",
      "REACTOR ......................... NOMINAL",
      "LIFE SUPPORT .................... NOMINAL",
      "COFFEE .......................... CRITICAL (OK)",
      "COURSE: DEEP WORK ............... LAID IN",
      "ALL HANDS, FOCUS STATIONS.",
    ],
    bootColor: "#ffc97e",
  },
  {
    id: "ghost",
    chrome: "ghost",
    name: "GHOST",
    tagline: "Sterile white future",
    description:
      "A clean-room interface: white surfaces, hairline edges, one quiet accent. The future where everything works.",
    bootLabel: "GHOST.SHL [sterile]",
    preview: {
      desktop: "#e8ecf0",
      chrome: "#ffffff",
      titleBar: "linear-gradient(90deg,#dfe5ea,#f2f5f8)",
      text: "#16181c",
      accent: "#0f8a8a",
    },
    bootLines: [
      "GHOST SHELL — DEEP WORK SYSTEMS",
      "STERILIZING WORKSPACE ........... 99.97%",
      "NOISE ........................... REMOVED",
      "SURFACES ........................ POLISHED",
      "THOUGHTS ........................ ALIGNED",
      "BEGIN.",
    ],
    bootColor: "#dfe5ea",
  },
  {
    id: "void",
    chrome: "void",
    name: "VOID",
    tagline: "OLED black minimal",
    description:
      "Nothing but type on true black. Hairline edges, zero ornament — the interface disappears, the work remains.",
    bootLabel: "VOID.NIL [black]",
    preview: {
      desktop: "#000000",
      chrome: "#0a0a0a",
      titleBar: "linear-gradient(90deg,#151515,#0a0a0a)",
      text: "#e8e8e8",
      accent: "#9a7cff",
    },
    bootLines: [
      "VOID — DEEP WORK SYSTEMS",
      "SCANNING FOR CLUTTER ............ NONE",
      "SCANNING FOR NOISE .............. NONE",
      "SCANNING FOR EXCUSES ............ NONE",
      "NOTHING FOUND. GOOD.",
      "ENTER THE VOID.",
    ],
    bootColor: "#bfaefc",
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
];

export function getSkin(id: SkinId | string): Skin {
  return SKINS.find((s) => s.id === id) ?? SKINS[0];
}

/* ============================================================
   Window / program naming per paradigm.
   Call sites keep passing the canonical retro name ("FOCUS.EXE",
   "GOALS.TXT"); each skin derives its own language from it so
   nothing outside retro95 ever shows a DOS extension.
   ============================================================ */

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
  HLP: "HLP",
  NET: "NET",
  CAM: "CAM",
  COM: "RUN",
  DLL: "LIB",
};

/**
 * Transform a canonical retro window title into the active skin's
 * naming language. Unknown/odd titles pass through sensibly.
 */
export function windowTitle(retroName: string, skin: SkinId | string): string {
  const m = retroName.match(/^([A-Z0-9_·-]+)\.([A-Z]+)$/i);
  if (!m) return retroName; // free-form titles pass through
  const base = m[1].toUpperCase();
  const ext = m[2].toUpperCase();
  const pretty = base.charAt(0) + base.slice(1).toLowerCase();

  switch (skin) {
    case "cyberpunk":
      return `${base}//${HUD_SUFFIX[ext] ?? ext}`;
    case "holo":
      return `◇ ${base}`;
    case "starship":
      return `${base}/CTL`;
    case "ghost":
      return pretty; // clean-room: plain names, no fiction
    case "void":
      return base.toLowerCase();
    case "outrun":
      return base; // big chrome letters
    case "retro95":
    default:
      return retroName;
  }
}
