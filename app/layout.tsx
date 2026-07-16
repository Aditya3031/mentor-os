import type { Metadata, Viewport } from "next";
import {
  IBM_Plex_Mono,
  VT323,
  Silkscreen,
  Orbitron,
  Share_Tech_Mono,
  Shippori_Mincho,
  Zen_Old_Mincho,
  Audiowide,
  Michroma,
} from "next/font/google";
import { SkinChooser } from "@/components/skin-chooser";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SyncProvider } from "@/components/providers/sync-provider";
import { AudioEngine } from "@/components/audio-engine";
import { ReflectionModal } from "@/components/reflection-modal";
import { PWARegister } from "@/components/pwa-register";
import { Onboarding } from "@/components/onboarding";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";
import "./globals.css";

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const vt323 = VT323({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-digits",
  display: "swap",
});

const silkscreen = Silkscreen({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-pixel",
  display: "swap",
});

/* Cyberpunk skin fonts */
const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-orbitron",
  display: "swap",
});

const shareTech = Share_Tech_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-sharetech",
  display: "swap",
});

/* Outrun / Blueprint skin fonts */
const audiowide = Audiowide({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-audiowide",
  display: "swap",
});

const michroma = Michroma({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-michroma",
  display: "swap",
});

/* Edo skin fonts.
   CJK families ship hundreds of unicode-range subsets; the full css2
   response is ~230KB and can outlast next/font's 3s fetch timeout on
   slow paths. `text` requests only the glyphs we actually render —
   ASCII for body copy plus the curated kanji/kana used by the edo
   skin (EDO_NAMES in lib/skins.ts, seal/menu glyphs, boot lines).
   Add new Japanese UI strings to this set. Glyphs outside it fall
   back to the system serif. */
const shippori = Shippori_Mincho({
  weight: ["400", "700"],
  // next/font requires literal option values — keep in sync with zenMincho below.
  // @ts-expect-error — `text` is a valid next/font/google option missing from the generated typings
  text: " ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:;()+-=_·—…→集中の間務め目標記録今日整頓音九十日誌誉れ装い設え刻作法師範座敷共作同席入室始末書斎印品ようこそはじめに",
  preload: false,
  variable: "--font-shippori",
  display: "swap",
});

const zenMincho = Zen_Old_Mincho({
  weight: ["400", "700"],
  // @ts-expect-error — `text` is a valid next/font/google option missing from the generated typings
  text: " ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:;()+-=_·—…→集中の間務め目標記録今日整頓音九十日誌誉れ装い設え刻作法師範座敷共作同席入室始末書斎印品ようこそはじめに",
  preload: false,
  variable: "--font-zenmincho",
  display: "swap",
});

const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL || "https://focusflow-h9ct.vercel.app"
);

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "FocusFlow - Your Solo Deep-Work Sanctuary",
    template: "%s | FocusFlow",
  },
  description:
    "An immersive study platform with pomodoro timers, ambient focus rooms, AI planning, and analytics for deep work.",
  manifest: "/manifest.json",
  applicationName: "FocusFlow",
  keywords: [
    "focus timer",
    "pomodoro",
    "study planner",
    "deep work",
    "productivity",
    "study app",
  ],
  authors: [{ name: "FocusFlow" }],
  creator: "FocusFlow",
  publisher: "FocusFlow",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "FocusFlow",
    title: "FocusFlow - Your Solo Deep-Work Sanctuary",
    description:
      "Pomodoro timers, ambient focus rooms, AI planning, and progress analytics for serious study sessions.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FocusFlow deep-work study app",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FocusFlow - Your Solo Deep-Work Sanctuary",
    description:
      "Pomodoro timers, ambient focus rooms, AI planning, and progress analytics for serious study sessions.",
    images: ["/og-image.png"],
  },
  appleWebApp: {
    capable: true,
    title: "FocusFlow",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0c4844",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plexMono.variable} ${vt323.variable} ${silkscreen.variable} ${orbitron.variable} ${shareTech.variable} ${shippori.variable} ${zenMincho.variable} ${audiowide.variable} ${michroma.variable}`}
    >
      <body className="font-sans text-text" suppressHydrationWarning>
        {/* Apply persisted skin + theme before first paint to avoid a flash
            of the default look. Reads the zustand persist blob directly. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var s=JSON.parse(localStorage.getItem("focusflow.v1")).state;if(s.skin)document.body.dataset.skin=s.skin;if(s.theme)document.body.dataset.theme=s.theme;}catch(e){}`,
          }}
        />
        <ThemeProvider>
          {children}
          <SyncProvider />
          <PWARegister />
          {/* Mounted globally: drives ambience and tick sfx from store state. */}
          <AudioEngine />
          {/* Pops up automatically after a focus session completes. */}
          <ReflectionModal />
          {/* First-run welcome modal, gated by localStorage flag. */}
          <Onboarding />
          {/* Startup interface chooser — shows before anything on first
              visit, reopenable from the View menu. */}
          <SkinChooser />
        </ThemeProvider>
        {/* Subtle CRT scanlines over everything */}
        <div className="crt-overlay" aria-hidden />
        <Toaster
          position="top-right"
          theme="light"
          toastOptions={{
            style: {
              background: "hsl(var(--chrome))",
              border: "none",
              borderRadius: 0,
              boxShadow:
                "inset -1px -1px 0 var(--edge-black), inset 1px 1px 0 var(--edge-white), inset -2px -2px 0 var(--edge-dark), inset 2px 2px 0 var(--edge-light), 4px 4px 0 rgba(0,0,0,0.45)",
              color: "hsl(var(--text))",
              fontFamily: "var(--font-body), monospace",
              fontSize: "12px",
            },
          }}
        />
        {/* Vercel-native analytics + Core Web Vitals (no extra config needed). */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
