import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "FocusFlow — Your Solo Deep-Work Sanctuary";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Dynamic Open Graph image — generated at request time by Vercel Edge.
 * No PNG file needed; Next.js produces a 1200×630 image from this JSX.
 * Used on Twitter, iMessage, Slack, Discord link previews.
 */
export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 30% 20%, #2a1a55 0%, transparent 60%), radial-gradient(circle at 70% 80%, #1a3a55 0%, transparent 55%), #07070b",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            width: 110,
            height: 110,
            borderRadius: 28,
            background: "linear-gradient(135deg, #B79CFF, #7CC6FF)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <svg viewBox="0 0 24 24" width="60" height="60" fill="none" stroke="#0a0a12" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        </div>

        <div style={{ fontSize: 80, fontWeight: 300, letterSpacing: -3, marginBottom: 18 }}>
          FocusFlow
        </div>
        <div style={{ fontSize: 30, color: "#9A9AA8", maxWidth: 800, textAlign: "center", lineHeight: 1.3 }}>
          Your solo deep-work sanctuary — pomodoro, ambient rooms, and AI coaching.
        </div>
      </div>
    ),
    { ...size }
  );
}
