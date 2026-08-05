"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthState } from "@/lib/auth";

/**
 * MENTOR·OS is a logged-in product: every route requires a session
 * except the logon screen and legal pages. Works in both auth modes —
 * Supabase when configured, the localStorage demo backend otherwise —
 * so the gate holds even with zero env vars.
 *
 * Client-side guard (matches the client-side auth architecture).
 * TODO: mirror with Next middleware + @supabase/ssr cookies if this
 * ever needs to be tamper-proof rather than UX-level.
 */
const PUBLIC_PATHS = ["/login", "/terms", "/privacy"];

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuthState();
  const pathname = usePathname();
  const router = useRouter();

  const isPublic = PUBLIC_PATHS.some((p) => pathname?.startsWith(p));

  useEffect(() => {
    if (!ready || isPublic) return;
    if (!user) router.replace("/login");
  }, [ready, user, isPublic, pathname, router]);

  if (isPublic) return <>{children}</>;

  // Hold the frame while auth resolves (or while redirecting) so
  // protected content never flashes for signed-out visitors.
  if (!ready || !user) {
    return (
      <div className="fixed inset-0 z-[900] grid place-items-center bg-black">
        <div className="text-center font-digits text-lg text-[#9ee89e]">
          <div className="animate-blink">▚ VERIFYING CREDENTIALS ...</div>
          <div className="mt-2 text-sm opacity-60">
            MENTOR·OS requires a logon session
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
