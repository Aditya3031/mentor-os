"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase browser client. Lazily created so the app still boots if you
 * haven't set up Supabase yet (env vars missing → `supabase` is null,
 * `lib/auth.ts` falls back to its demo localStorage backend).
 *
 * To enable real auth + sync:
 * 1. Create a Supabase project at supabase.com
 * 2. Add to your .env.local file (project root):
 *      NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
 *      NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
 * 3. Restart `npm run dev`
 *
 * See AUTH_SETUP.md for full step-by-step.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  url && key && url.startsWith("https://") ? createBrowserClient(url, key) : null;

/** True if env vars are set and the client was created. */
export const isSupabaseConfigured = supabase !== null;
