/**
 * Theme registry. Each room defines a name, gradient preview,
 * accent colors, and an ambience preset that auto-toggles when
 * the user enters that room.
 */

export type ThemeId =
  | "aurora"
  | "tokyo"
  | "cafe"
  | "library"
  | "cyber"
  | "cozy"
  | "cabin"
  | "ocean"
  | "forest"
  | "sunrise"
  | "arctic"
  | "ember";

export interface Theme {
  id: ThemeId;
  name: string;
  subtitle: string;
  /** CSS gradient string for theme card preview */
  gradient: string;
  /** HSL accent color, e.g. "260 100% 80%" */
  accent: string;
  accentAlt: string;
  /** Ambience tracks that auto-enable when entering the room */
  ambiencePreset: AmbienceId[];
  /** Whether this room shows rain animation */
  rain: boolean;
}

export type AmbienceId =
  | "lofi"
  | "rain"
  | "cafe"
  | "fire"
  | "keys"
  | "noise";

export const THEMES: Theme[] = [
  {
    id: "aurora",
    name: "Aurora",
    subtitle: "Deep purples, calm focus",
    gradient: "linear-gradient(135deg,#1a0e3a 0%,#0d0d24 50%,#0a1530 100%)",
    accent: "260 85% 66%",
    accentAlt: "207 90% 60%",
    ambiencePreset: ["lofi"],
    rain: false,
  },
  {
    id: "tokyo",
    name: "Tokyo Night",
    subtitle: "Neon glow, late nights",
    gradient: "linear-gradient(135deg,#2a0e3e 0%,#0e1230 50%,#1a0a3e 100%)",
    accent: "330 90% 60%",
    accentAlt: "230 90% 62%",
    ambiencePreset: ["lofi", "rain"],
    rain: true,
  },
  {
    id: "cafe",
    name: "Rainy Cafe",
    subtitle: "Warm rain, soft lighting",
    gradient: "linear-gradient(135deg,#2a1810 0%,#16100c 50%,#1c1410 100%)",
    accent: "28 65% 50%",
    accentAlt: "22 55% 45%",
    ambiencePreset: ["cafe", "rain"],
    rain: true,
  },
  {
    id: "library",
    name: "Old Library",
    subtitle: "Wood, leather, ink",
    gradient: "linear-gradient(135deg,#241a10 0%,#1a130b 50%,#2a1d10 100%)",
    accent: "36 55% 45%",
    accentAlt: "28 45% 40%",
    ambiencePreset: ["fire", "keys"],
    rain: false,
  },
  {
    id: "cyber",
    name: "Cyberpunk",
    subtitle: "Magenta haze, electric",
    gradient: "linear-gradient(135deg,#2a0530 0%,#001a2e 50%,#280030 100%)",
    accent: "170 100% 34%",
    accentAlt: "320 95% 50%",
    ambiencePreset: ["lofi", "noise"],
    rain: false,
  },
  {
    id: "cozy",
    name: "Cozy Bedroom",
    subtitle: "Soft lamps, rest mode",
    gradient: "linear-gradient(135deg,#2a141c 0%,#1a0e16 50%,#1f1018 100%)",
    accent: "355 70% 60%",
    accentAlt: "0 55% 52%",
    ambiencePreset: ["fire"],
    rain: false,
  },
  {
    id: "cabin",
    name: "Mountain Cabin",
    subtitle: "Pine, snow, stillness",
    gradient: "linear-gradient(135deg,#0e1a24 0%,#0a121a 50%,#101822 100%)",
    accent: "205 48% 48%",
    accentAlt: "210 38% 42%",
    ambiencePreset: ["fire", "noise"],
    rain: true,
  },
  {
    id: "ocean",
    name: "Ocean Desk",
    subtitle: "Blue glass, slow waves",
    gradient: "linear-gradient(135deg,#052032 0%,#07121d 48%,#10334a 100%)",
    accent: "195 85% 40%",
    accentAlt: "214 78% 48%",
    ambiencePreset: ["rain", "noise"],
    rain: false,
  },
  {
    id: "forest",
    name: "Forest Canopy",
    subtitle: "Moss light, grounded calm",
    gradient: "linear-gradient(135deg,#0c2419 0%,#07130f 50%,#1e301d 100%)",
    accent: "142 48% 38%",
    accentAlt: "90 45% 38%",
    ambiencePreset: ["rain", "lofi"],
    rain: true,
  },
  {
    id: "sunrise",
    name: "Sunrise Studio",
    subtitle: "Bright morning momentum",
    gradient: "linear-gradient(135deg,#341527 0%,#241723 45%,#4c2e22 100%)",
    accent: "18 90% 52%",
    accentAlt: "40 85% 48%",
    ambiencePreset: ["lofi", "cafe"],
    rain: false,
  },
  {
    id: "arctic",
    name: "Arctic Lab",
    subtitle: "Clean air, sharp focus",
    gradient: "linear-gradient(135deg,#101f2b 0%,#091116 48%,#1d3035 100%)",
    accent: "190 45% 45%",
    accentAlt: "166 45% 40%",
    ambiencePreset: ["noise"],
    rain: false,
  },
  {
    id: "ember",
    name: "Ember Room",
    subtitle: "Low light, steady heat",
    gradient: "linear-gradient(135deg,#27110d 0%,#130d0b 46%,#351a12 100%)",
    accent: "12 80% 48%",
    accentAlt: "32 75% 44%",
    ambiencePreset: ["fire", "keys"],
    rain: false,
  },
];

/**
 * Ambience tracks live in /public/audio/<folder>/ as numbered files
 * (e.g. lofi-1.mp3 ... lofi-19.mp3). Each time the user enables a
 * category, the audio engine picks a random file from 1..count.
 *
 * To add more files: drop them in the matching folder, rename to
 * `<folder>-<n>.mp3`, then bump the `count` here.
 */
export const AMBIENCE_TRACKS: Record<
  AmbienceId,
  { name: string; folder: string; count: number }
> = {
  lofi:  { name: "Lofi beats",  folder: "lofi",  count: 19 },
  rain:  { name: "Rainfall",    folder: "rain",  count: 13 },
  cafe:  { name: "Café",        folder: "cafe",  count: 18 },
  fire:  { name: "Fireplace",   folder: "fire",  count: 1 },
  keys:  { name: "Keyboard",    folder: "keys",  count: 1 },
  noise: { name: "White noise", folder: "noise", count: 1 },
};

/** Build a public URL for a specific track number in a category. */
export function ambienceTrackUrl(id: AmbienceId, n: number): string {
  const t = AMBIENCE_TRACKS[id];
  return `/audio/${t.folder}/${t.folder}-${n}.mp3`;
}

/** Pick a random track number for a category (1..count). */
export function pickRandomTrack(id: AmbienceId): number {
  const t = AMBIENCE_TRACKS[id];
  return Math.floor(Math.random() * t.count) + 1;
}

export function getTheme(id: ThemeId): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
