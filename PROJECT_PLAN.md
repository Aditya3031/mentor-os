# FocusFlow — Project Plan & Handoff

> Pick this up anytime. This file is the source of truth for what's done, what's next, and every decision you'll need to make to ship a real product.

**Last updated:** May 9, 2026 (Phase 1 complete, audio working with real files, real data wired everywhere)
**Current state:** App is fully functional locally. Real data, real audio, all pages working. Not yet deployed.

---

## When you come back, start here

1. Re-read **§ Current State** below to remember where you left off.
2. `cd C:\Users\adity\OneDrive\Desktop\focusflow` and run `npm run dev` — open `localhost:3000`.
3. Look at **§ Phase 2 — Decide: local-first or with accounts?** — that decision gates the next batch of work.
4. Update this file's checkboxes as you go. The "Last updated" date at the top should match your last work session.

---

## Current State

### What's working end-to-end

- [x] **Landing page** at `/` (hero, features, themes showcase, CTA)
- [x] **Login page** at `/login` (UI only — no auth backend yet)
- [x] **Focus room** at `/focus` — animated timer ring, mode tabs, controls, subject input, quote, drag-and-drop tasks, goals panel, snapshot, heatmap, ambience panel
- [x] **Dashboard** at `/dashboard` — bar/pie/line charts driven from real history
- [x] **Settings** at `/settings` — including the new "Clear all data" button
- [x] **History** at `/history` — chronological session list with empty state
- [x] **Themes** at `/themes` — 7-theme picker grid with live preview
- [x] **Achievements** at `/achievements` — 12 milestones, unlock state computed from real stats
- [x] **404** at any unknown route, **Loading** between routes

### Data layer

- [x] Zustand store with `persist` middleware → localStorage
- [x] Session completion pushes to `history`, increments `totalSessions` / `totalMinutes`, awards XP
- [x] Streak logic: only bumps on first session of a new day, resets on gap, doesn't double-count same-day sessions
- [x] `currentSubject` field tagged onto each session for the history list and subject pie chart
- [x] All visible numbers (snapshot, dashboard, heatmap) are computed from store, not hardcoded

### Audio

- [x] Vanilla HTMLAudioElement engine in `lib/audio.ts` — no Howler dependency
- [x] 51 ambience tracks in `public/audio/{lofi,rain,cafe,fire,keys,noise}/` named `<category>-<n>.mp3`
- [x] Each toggle picks a **random track** from that category (variety like a real lofi station)
- [x] Smooth 600ms fade in/out
- [x] Autoplay-blocked tracks queue and start on first user click anywhere
- [x] Volume slider per track, persisted

### Polish + UX

- [x] Glassmorphism panels, floating dock, animated background
- [x] Responsive: 3-column desktop, single-column mobile fallback
- [x] Theme accent colors propagate to all components via CSS vars

### Bugs squashed today

- [x] Zustand v5 selector pattern — switched to individual selectors / useShallow
- [x] dnd-kit hydration mismatch — DndContext now mounts after client hydration
- [x] `deleteTask` → `removeTask` rename (action name was wrong)
- [x] Windows path-length limit — solved by moving project to `OneDrive\Desktop\focusflow`
- [x] PowerShell script execution policy — `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`

### Known gaps (next-stop work)

- [ ] **Audio engine doesn't play `complete.mp3` or `tick.mp3`** — files don't exist yet (only ambience). Engine is wired, just needs the files.
- [ ] **App icons + favicon** — `public/icons/icon-192.png`, `icon-512.png`, `favicon.ico` all missing → console 404s, no PWA install
- [ ] **Open Graph image** for social sharing
- [ ] **Service worker** for offline support (`next-pwa` package)
- [ ] **Login backend** — auth UI exists, needs Supabase or Firebase wiring
- [ ] **Command palette** — exists in HTML demo but not in React app (cmdk package)
- [ ] **First-run onboarding modal** in React (only in HTML demo currently)
- [ ] **Browser notifications** on session complete — code helper exists in `lib/audio.ts`, not yet wired into completeSession
- [ ] **Mobile testing** end-to-end on a real phone (not just dev tools emulator)
- [ ] **Polish pass** on landing + login pages — generated but not refined
- [ ] **Discoverability of ambience toggles** — clicking the row to enable a track isn't obvious; needs a play icon or stronger active state

---

## Phase 2 — Decide: local-first or with accounts?

This is **the** decision that gates everything else. Pick before Phase 3.

### Option A — Local-first, no backend (current state)

- **Pros:** zero cost, zero ops, ships in a day, no privacy policy needed
- **Cons:** no cross-device sync, no real "studying now" counter, no leaderboards if you ever want them
- **Action:** skip Phase 3, jump to Phase 4

### Option B — With auth + cloud sync

- **Pros:** users sign in across devices, real social proof, foundation for any future feature
- **Cons:** more code, ongoing costs, legal obligations (Privacy Policy, ToS), more attack surface
- **Action:** do Phase 3

**Recommendation:** ship Option A first. Get real users. Add Option B once you know they want it.

### Decision log

- [ ] Decision made: ☐ A (local-first) ☐ B (with backend)
- [ ] Date decided: ____________
- [ ] Reason: ____________

---

## Phase 3 — Backend (only if Option B)

**Stack recommendation: Supabase.** Easiest, free tier covers ~50k MAU.

- [ ] Create Supabase project at supabase.com
- [ ] Copy `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`
- [ ] `npm install @supabase/supabase-js @supabase/ssr`
- [ ] Create `lib/supabase/client.ts` and `lib/supabase/server.ts`
- [ ] Build database schema (run in Supabase SQL editor):

```sql
-- profiles (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  level int default 1,
  xp int default 0,
  streak_days int default 0,
  created_at timestamptz default now()
);

-- tasks
create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  text text not null,
  done bool default false,
  priority text default 'med',
  position int default 0,
  created_at timestamptz default now()
);

-- sessions (history)
create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  subject text,
  mode text,
  duration_sec int,
  started_at timestamptz,
  ended_at timestamptz
);

-- enable Row Level Security
alter table profiles enable row level security;
alter table tasks enable row level security;
alter table sessions enable row level security;

-- policies: users only see their own data
create policy "users see own profile" on profiles for all using (auth.uid() = id);
create policy "users own tasks" on tasks for all using (auth.uid() = user_id);
create policy "users own sessions" on sessions for all using (auth.uid() = user_id);
```

- [ ] Wire `app/login/page.tsx` to Supabase auth (email + Google OAuth)
- [ ] Add middleware (`middleware.ts`) gating `/focus` for signed-in users (or allow guest mode)
- [ ] Replace Zustand `persist` localStorage backend with one mirroring writes to Supabase
- [ ] Optional: real "studying now" counter using Supabase Realtime presence

---

## Phase 4 — Asset sourcing

### Audio (mostly done)

- [x] `lofi-1.mp3` ... `lofi-19.mp3` (19 tracks)
- [x] `rain-1.mp3` ... `rain-13.mp3` (13 tracks)
- [x] `cafe-1.mp3` ... `cafe-18.mp3` (18 tracks)
- [x] `fire-1.mp3` (1 track)
- [x] `keys-1.mp3` (1 track)
- [x] `noise-1.mp3` (1 track)
- [ ] `complete.mp3` (~1s pleasant chime for session completion)
- [ ] `tick.mp3` (~50ms soft tick for the "background ticking" setting)

### Visual assets (not started)

- [ ] App icon — design 1024×1024 master, export 192×192 and 512×512 PNGs
- [ ] Favicon (use [realfavicongenerator.net](https://realfavicongenerator.net/))
- [ ] Open Graph image (1200×630 PNG) for when links are shared
- [ ] Apple Touch icon (180×180)

---

## Phase 5 — Hosting + domain

- [ ] Buy domain (Cloudflare Registrar — at-cost) — $10–15/yr
  - Suggested: focusflow.app, focusflow.io, focusflow.studio, getfocusflow.com
- [ ] Push code to GitHub (private repo to start)
- [ ] Connect GitHub to Vercel (vercel.com → Import Project)
- [ ] Add env vars in Vercel dashboard (copy from `.env.local`)
- [ ] Configure custom domain in Vercel
- [ ] Verify SSL (automatic, ~5 min)
- [ ] Test production build locally first: `npm run build && npm start`

### Alternatives if Vercel feels expensive later

- **Cloudflare Pages** — cheaper at scale
- **Netlify** — basically Vercel-equivalent
- **Self-host on a VPS** — Hetzner $5/mo, Docker

---

## Phase 6 — Production polish

### Error tracking + analytics

- [ ] Sentry (sentry.io) — free tier is generous; `npm install @sentry/nextjs`
- [ ] Plausible ($9/mo, privacy-friendly) **or** PostHog (free tier) **or** Vercel Analytics

### SEO

- [ ] Real `<meta>` tags in `layout.tsx`
- [ ] Open Graph + Twitter Card meta
- [ ] `app/sitemap.ts` and `app/robots.ts`
- [ ] Submit to Google Search Console once deployed

### Legal (mandatory if collecting any user data)

- [ ] Privacy Policy at `/privacy`
- [ ] Terms of Service at `/terms`
- [ ] Cookie banner (if EU users)
- [ ] Footer link to both pages

### Performance

- [ ] Run Lighthouse on production — aim for 90+ on all categories
- [ ] Lazy-load heavy components (charts, command palette) with `next/dynamic`

---

## Phase 7 — Launch

- [ ] Beta with 5–10 friends for 2 weeks
- [ ] Collect feedback (Tally.so or Google Form)
- [ ] Fix top 5 issues
- [ ] Write launch post
- [ ] Post to: Product Hunt, r/getmotivated, r/studytips, r/productivity, HN, Indie Hackers, Twitter, TikTok/Reels
- [ ] Set up feedback channel (Discord or email)

---

## Decisions to make

- [ ] **Domain name:** ____________
- [ ] **Local-first or with accounts:** A / B
- [ ] **Auth provider** (if B): Supabase / Firebase / NextAuth
- [ ] **Hosting:** Vercel / Cloudflare / Netlify / self-host
- [ ] **Analytics:** Plausible / PostHog / Vercel / GA4 / none
- [ ] **Pricing model:** free forever / freemium / one-time / subscription
- [ ] **Target audience priority:** college students / professionals / both
- [ ] **Launch date target:** ____________

---

## Useful commands

```bash
# Develop
cd C:\Users\adity\OneDrive\Desktop\focusflow
npm run dev                # localhost:3000

# Type check before pushing
npm run type-check

# Build production locally (test before deploying)
npm run build && npm start

# Deploy (after Vercel is connected)
git push origin main       # auto-deploys
```

---

## Reference: cost summary

| Stage | Setup | Monthly | Notes |
|---|---|---|---|
| Local-first only | Domain only | ~$1 | localStorage, no backend (current) |
| With auth + sync, < 1k users | Vercel free + Supabase free + domain | ~$1 | Free tiers cover this |
| 1k–10k MAU | Vercel Pro + Supabase Pro + Plausible | ~$60 | Honest growth phase |
| 50k+ MAU | + Sentry team + email + CDN | ~$200 | Real product economics |

---

## Notes / scratch

**Session: May 9, 2026 — full Phase 1 push + audio integration**
- Real data flows everywhere now. Snapshot, dashboard charts, heatmap, history all read from `store.history`. No more hardcoded demo numbers.
- Streak logic respects day rollovers — multiple sessions on the same day don't double-count.
- Subject input added above the timer; tags every session in history.
- 51 audio files moved into `public/audio/<category>/`, renamed `<category>-N.mp3`. Engine picks random track per category for variety.
- Vanilla HTMLAudioElement engine, no Howler — simpler, no extra dependency.
- Autoplay block handled gracefully — pending tracks retry on first user interaction.
- Three missing pages created: `/themes`, `/achievements`, `/history` — plus `lib/achievements.ts` registry.
- Settings: added "Clear all data" button in a Danger Zone section.
- Big Windows-specific debugging session resolved: PowerShell script policy, path-length limit, OneDrive sync quirks.

**Next session priority:** decide local-first vs accounts (Phase 2). If local-first → focus on Phase 4 visual assets + Phase 5 deploy. If accounts → tackle Phase 3 Supabase wiring.
