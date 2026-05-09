# Auth Setup — From Demo to Real Supabase

Right now FocusFlow has a fully-functional **demo auth** that stores users in localStorage. This is great for development but isn't real auth — anyone can sign in with any email and there's no password verification, no email confirmation, no cross-device sync.

This guide walks you through swapping the demo for **real Supabase auth** in 5 steps. Total time: ~30 minutes for first-time Supabase users.

---

## What you have right now

- `lib/auth.ts` — exposes `signIn()`, `signUp()`, `signInWithGoogle()`, `signOut()`, and `useUser()`. The bodies are demo (just localStorage), but the **shapes match Supabase exactly**.
- `app/login/page.tsx` — fully polished UI with sign-in/sign-up tabs, Google button, error states, loading spinners.

The plan: keep the UI exactly as is, only replace the function bodies in `lib/auth.ts`.

---

## Step 1 — Create a Supabase project (5 min)

1. Sign up at https://supabase.com (free)
2. Click **New project** → name it `focusflow` → pick a region close to you → set a strong DB password (save it somewhere) → click **Create**
3. Wait ~2 minutes for it to provision
4. Once ready, go to **Settings → API** in the left sidebar
5. Copy these two values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...` — this is safe to expose in client code)

---

## Step 2 — Add env vars (2 min)

Create a file called `.env.local` in your project root (same level as `package.json`). Paste:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Replace with your actual values from Step 1.

**Important:** also add these to **Vercel's environment variables** (Project Settings → Environment Variables) so the deployed version works too. Make sure to redeploy after adding them.

---

## Step 3 — Install Supabase client (1 min)

In your project terminal:

```bash
npm install @supabase/supabase-js @supabase/ssr
```

---

## Step 4 — Create the Supabase client (3 min)

Create a new file `lib/supabase.ts`:

```ts
"use client";

import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

That's it. One file, four lines.

---

## Step 5 — Swap the demo bodies for real Supabase calls (10 min)

Open `lib/auth.ts` and replace each function body. The comment blocks already show you exactly what to write. Concretely:

### `signIn`

Replace the entire function body with:

```ts
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
```

### `signUp`

```ts
export async function signUp(name: string, email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
```

### `signInWithGoogle`

```ts
export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${location.origin}/auth/callback` },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
```

### `signOut`

```ts
export async function signOut() {
  await supabase.auth.signOut();
  window.location.href = "/";
}
```

### `useUser` hook

This is the only nontrivial change — it switches from reading localStorage to subscribing to Supabase auth state:

```ts
export function useUser(): User | null {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Initial load
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          name: data.user.user_metadata?.name ?? data.user.email!.split("@")[0],
          email: data.user.email!,
          signedInAt: Date.parse(data.user.created_at),
          provider: data.user.app_metadata?.provider as User["provider"],
        });
      }
    });

    // Subscribe to changes (sign in / out / token refresh)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          name: session.user.user_metadata?.name ?? session.user.email!.split("@")[0],
          email: session.user.email!,
          signedInAt: Date.parse(session.user.created_at),
          provider: session.user.app_metadata?.provider as User["provider"],
        });
      } else {
        setUser(null);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return user;
}
```

Don't forget to add `import { supabase } from "./supabase";` at the top of `lib/auth.ts`.

---

## Step 6 — Enable Google OAuth (optional, 10 min)

Only needed if you want the Google sign-in button to work.

1. Go to https://console.cloud.google.com → create a new project (or use existing)
2. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
3. Application type: **Web application**
4. **Authorized redirect URIs:** add `https://xxxxx.supabase.co/auth/v1/callback` (use your Supabase project URL)
5. Copy the **Client ID** and **Client Secret**
6. In Supabase: **Authentication → Providers → Google** → paste the values → enable

For local development, also add `http://localhost:3000/auth/callback` to the authorized redirect URIs.

---

## Step 7 — Add the auth callback route (5 min)

After OAuth sign-in, Supabase redirects users back to your app. You need a route to handle that.

Create `app/auth/callback/route.ts`:

```ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/focus";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (toSet) =>
            toSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            ),
        },
      }
    );
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
```

---

## Step 8 — (Optional) Protect routes with middleware

If you want `/focus` to require sign-in, create `middleware.ts` at the project root:

```ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) =>
          toSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          ),
      },
    }
  );
  const { data } = await supabase.auth.getUser();

  // Redirect unauthenticated users away from protected routes
  const protectedPaths = ["/focus", "/dashboard", "/history", "/settings"];
  if (!data.user && protectedPaths.some((p) => request.nextUrl.pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
```

I'd recommend **not** protecting routes initially — let users try the app without an account, encourage sign-up only when they want sync.

---

## Storing user data in Supabase (after auth works)

Once auth is set up, the next step is mirroring tasks/sessions/settings to Supabase Postgres. The schema and RLS policies are already in `PROJECT_PLAN.md` Phase 3 — just paste them into Supabase's SQL editor and you're ready to swap Zustand's `persist` middleware for a Supabase-backed sync layer.

That's a separate ~90-min job — ping me when you're at that step and I'll write the sync layer for you.

---

## Quick sanity test

After Steps 1–5:

1. Restart `npm run dev` (env vars only load on boot)
2. Go to `/login` → switch to "Create account" → enter name/email/password → submit
3. Check your inbox — you should get a confirmation email from Supabase
4. Click the link to confirm
5. Sign in with the same email/password → you should land on `/focus`
6. Open Supabase dashboard → **Authentication → Users** — your account should be there

If you see your user in the Supabase dashboard, **real auth is working.** Everything else (Google, route protection, sync) is incremental.

---

## TL;DR

| Step | What | Time |
|---|---|---|
| 1 | Create Supabase project | 5 min |
| 2 | Add env vars (locally + Vercel) | 2 min |
| 3 | `npm install @supabase/supabase-js @supabase/ssr` | 1 min |
| 4 | Create `lib/supabase.ts` | 3 min |
| 5 | Replace function bodies in `lib/auth.ts` | 10 min |
| 6 | Enable Google OAuth in Google Cloud + Supabase | 10 min (optional) |
| 7 | Create `app/auth/callback/route.ts` | 5 min (only if using OAuth) |
| 8 | Create `middleware.ts` to protect routes | 10 min (optional) |

Steps 1–5 = real working email/password auth in 21 minutes. Steps 6–8 are optional polish.
