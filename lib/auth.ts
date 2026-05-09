"use client";

import { useEffect, useState } from "react";

/* ============================================================
   Types
   ============================================================ */

export interface User {
  name: string;
  email: string;
  signedInAt: number;
  /** Where the account came from. Useful when you migrate to Supabase. */
  provider: "demo" | "email" | "google";
}

const STORAGE_KEY = "focusflow.user";

/* ============================================================
   Hook — read the current user from anywhere in the app
   ============================================================ */

/**
 * Returns the currently signed-in user, or `null` if signed out.
 * Re-renders on sign in / sign out automatically. Works across browser tabs.
 *
 * Usage:
 *   const user = useUser();
 *   if (!user) return <SignInPrompt />
 */
export function useUser(): User | null {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const load = () => {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          setUser(JSON.parse(raw));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };
    load();
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) load();
    };
    window.addEventListener("storage", onStorage);
    // Custom event for same-tab updates
    window.addEventListener("focusflow:auth", load);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focusflow:auth", load);
    };
  }, []);

  return user;
}

/* ============================================================
   Auth actions — REPLACE THESE BODIES WHEN YOU WIRE SUPABASE
   ============================================================
   Each function returns { ok, error } so the UI can show errors
   uniformly. The demo versions here just validate + write to
   localStorage. The Supabase versions look almost identical from
   the caller's side — just different inside.
   ============================================================ */

export async function signIn(
  email: string,
  password: string
): Promise<{ ok: boolean; error?: string }> {
  // ── DEMO MODE ─────────────────────────────────────────────
  // Replace this body with:
  //   const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  //   if (error) return { ok: false, error: error.message };
  //   return { ok: true };
  // ──────────────────────────────────────────────────────────
  if (!email.trim() || !email.includes("@")) {
    return { ok: false, error: "Enter a valid email address." };
  }
  if (password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters." };
  }
  // Simulate network latency for realistic UX
  await wait(700);

  const user: User = {
    name: email.split("@")[0],
    email: email.toLowerCase().trim(),
    signedInAt: Date.now(),
    provider: "demo",
  };
  setStoredUser(user);
  return { ok: true };
}

export async function signUp(
  name: string,
  email: string,
  password: string
): Promise<{ ok: boolean; error?: string }> {
  // ── DEMO MODE ─────────────────────────────────────────────
  // Replace this body with:
  //   const { data, error } = await supabase.auth.signUp({
  //     email, password,
  //     options: { data: { name } }
  //   });
  //   if (error) return { ok: false, error: error.message };
  //   return { ok: true };
  // ──────────────────────────────────────────────────────────
  if (!name.trim()) return { ok: false, error: "Please enter your name." };
  if (!email.trim() || !email.includes("@"))
    return { ok: false, error: "Enter a valid email address." };
  if (password.length < 6)
    return { ok: false, error: "Password must be at least 6 characters." };

  await wait(900);

  const user: User = {
    name: name.trim(),
    email: email.toLowerCase().trim(),
    signedInAt: Date.now(),
    provider: "demo",
  };
  setStoredUser(user);
  return { ok: true };
}

export async function signInWithGoogle(): Promise<{ ok: boolean; error?: string }> {
  // ── DEMO MODE ─────────────────────────────────────────────
  // Replace this body with:
  //   const { error } = await supabase.auth.signInWithOAuth({
  //     provider: "google",
  //     options: { redirectTo: `${location.origin}/auth/callback` },
  //   });
  //   if (error) return { ok: false, error: error.message };
  //   return { ok: true };
  // ──────────────────────────────────────────────────────────
  return {
    ok: false,
    error: "Google sign-in requires Supabase setup. See AUTH_SETUP.md.",
  };
}

export async function signOut(): Promise<void> {
  // ── DEMO MODE ─────────────────────────────────────────────
  // Replace with: await supabase.auth.signOut();
  // ──────────────────────────────────────────────────────────
  setStoredUser(null);
  // Send the user back to the landing page on sign out.
  window.location.href = "/";
}

/* ============================================================
   Helpers
   ============================================================ */

function setStoredUser(user: User | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
  // Notify same-tab listeners (the `storage` event only fires across tabs).
  window.dispatchEvent(new Event("focusflow:auth"));
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
