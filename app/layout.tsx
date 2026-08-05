import type { Metadata, Viewport } from "next";
import {
  IBM_Plex_Mono,
  VT323,
  Silkscreen,
  Orbitron,
  Share_Tech_Mono,
  Audiowide,
  Michroma,
  Rajdhani,
  Chakra_Petch,
} from "next/font/google";
import { SkinChooser } from "@/components/skin-chooser";
import { AuthGate } from "@/components/auth-gate";
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

/* Holodeck / Ghost / Void skin fonts */
const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-rajdhani",
  display: "swap",
});

const chakra = Chakra_Petch({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-chakra",
  display: "swap",
});

const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL || "https://focusflow-h9ct.vercel.app"
);

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "MENTOR-OS — AI Learning Companion",
    template: "%s | MENTOR-OS",
  },
  description:
    "AI learning companion: quiz generation from your notes, focus sessions, study rooms with voice, streaks and analytics — in seven switchable interface skins.",
  manifest: "/manifest.json",
  applicationName: "MENTOR-OS",
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
    title: "MENTOR-OS — AI Learning Companion",
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
    title: "MENTOR-OS — AI Learning Companion",
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
      className={`${plexMono.variable} ${vt323.variable} ${silkscreen.variable} ${orbitron.variable} ${shareTech.variable} ${audiowide.variable} ${michroma.variable} ${rajdhani.variable} ${chakra.variable}`}
    >
      <body className="font-sans text-text" suppressHydrationWarning>
        {/* Apply persisted skin + theme before first paint to avoid a flash
            of the default look. Reads the zustand persist blob directly. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var s=JSON.parse(localStorage.getItem("focusflow.v1")).state;var ok=["retro95","cyberpunk","holo","starship","ghost","void","outrun"];if(s.skin&&ok.indexOf(s.skin)>-1)document.body.dataset.skin=s.skin;if(s.theme)document.body.dataset.theme=s.theme;}catch(e){}`,
          }}
        />
        <ThemeProvider>
          <AuthGate>{children}</AuthGate>
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
