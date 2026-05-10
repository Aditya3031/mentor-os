import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SyncProvider } from "@/components/providers/sync-provider";
import { AudioEngine } from "@/components/audio-engine";
import { ReflectionModal } from "@/components/reflection-modal";
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

export const metadata: Metadata = {
  title: "FocusFlow — Your Solo Deep-Work Sanctuary",
  description:
    "An immersive solo study platform with pomodoro, ambient rooms, and analytics — designed to make deep work feel inviting.",
  manifest: "/manifest.json",
  applicationName: "FocusFlow",
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
          {/* Mounted globally — drives ambience + tick sfx based on store state. */}
          <AudioEngine />
          {/* Pops up automatically after a focus session completes. */}
          <ReflectionModal />
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
      </body>
    </html>
  );
}
