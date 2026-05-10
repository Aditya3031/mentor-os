"use client";

import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "./supabase";

/* ============================================================
   Types
   ============================================================ */

export interface User {
  id?: string;
  name: string;
  email: string;
  signedInAt: number;
  avatarUrl?: string;
  /** Where the account came from. */
  provider: "demo" | "email" | "google";
}

const STORAGE_KEY = "focusflow.user";

/* ============================================================
   Hook — read the current user from anywhere in the app
   ============================================================
   Switches automatically: subscribes to Supabase auth state when
   configured, falls back to localStorage in demo mode.
*/

export function useUser(): User | null {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    /* ---- Real Supabase mode ---- */
    if (isSupabaseConfigured && supabase) {
      const mapSession = (session: any): User | null => {
        if (!session?.user) return null;
        const u = session.user;
        return {
          id: u.id,
          name:
            u.user_metadata?.name ??
            u.user_metadata?.full_name ??
            u.email?.split("@")[0] ??
            "Friend",
          email: u.email ?? "",
          signedInAt: Date.parse(u.created_at) || Date.now(),
          avatarUrl: u.user_metadata?.avatar_url ?? u.user_metadata?.picture,
          provider: (u.app_metadata?.provider as User["provider"]) ?? "email",
        };
      };

      // Initial load
      supabase.auth.getSession().then(({ data }) => {
        setUser(mapSession(data.session));
      });

      // Subscribe to changes (sign in / out / token refresh)
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(mapSession(session));
      });

      return () => sub.subscription.unsubscribe();
    }

    /* ---- Demo mode (localStorage) ---- */
    const load = () => {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setUser(null);
        return;
      }
      try {
        setUser(JSON.parse(raw));
      } catch {
        setUser(null);
      }
    };
    load();
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) load();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focusflow:auth", load);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focusflow:auth", load);
    };
  }, []);

  return user;
}

/* ============================================================
   Auth actions
   ============================================================
   Each function detects whether Supabase is configured and routes
   to the appropriate backend. Same shape either way, so the UI
   never has to know.
*/

export async function signIn(
  email: string,
  password: string
): Promise<{ ok: boolean; error?: string }> {
  if (!email.trim() || !email.includes("@")) {
    return { ok: false, error: "Enter a valid email address." };
  }
  if (password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters." };
  }

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  // Demo mode
  await wait(700);
  setStoredUser({
    name: email.split("@")[0],
    email: email.toLowerCase().trim(),
    signedInAt: Date.now(),
    provider: "demo",
  });
  return { ok: true };
}

export async function signUp(
  name: string,
  email: string,
  password: string
): Promise<{ ok: boolean; error?: string }> {
  if (!name.trim()) return { ok: false, error: "Please enter your name." };
  if (!email.trim() || !email.includes("@"))
    return { ok: false, error: "Enter a valid email address." };
  if (password.length < 6)
    return { ok: false, error: "Password must be at least 6 characters." };

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  // Demo mode
  await wait(900);
  setStoredUser({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    signedInAt: Date.now(),
    provider: "demo",
  });
  return { ok: true };
}

export async function signInWithGoogle(): Promise<{ ok: boolean; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }
  return {
    ok: false,
    error: "Google sign-in requires Supabase setup. See AUTH_SETUP.md.",
  };
}

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
  } else {
    setStoredUser(null);
  }
  window.location.href = "/";
}

/* ============================================================
   Helpers (demo mode only)
   ============================================================ */

function setStoredUser(user: User | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
  window.dispatchEvent(new Event("focusflow:auth"));
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
