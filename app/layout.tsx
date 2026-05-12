import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
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

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
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
  themeColor: "#07070b",
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
      className={`${inter.variable} ${instrument.variable} ${jetbrains.variable}`}
    >
      <body className="bg-bg-0 text-text antialiased">
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
        </ThemeProvider>
        <Toaster
          position="top-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "rgba(20,20,29,0.92)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.14)",
              color: "#ECECF2",
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
