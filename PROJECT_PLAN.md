# FocusFlow — Project Plan & Handoff

> Pick this up anytime. This file is the source of truth for what's done, what's next, and every decision you'll need to make to ship a real product.

**Last updated:** July 17, 2026
**Current state:** Complete UI replatform on the `retro-os-revamp` branch ([PR #1](https://github.com/Aditya3031/FOCUSFLOW/pull/1), unmerged — merging deploys it): the app is an **interface-skin system**. A startup boot chooser picks between 7 full design languages — FOCUSFLOW·95 (the sole retro), NETRUNNER, HOLODECK, STARSHIP, GHOST, VOID, OUTRUN — each with its own window chrome, navigation and program naming, composing with the 12 accent color schemes. New **study rooms** (`/rooms`): live presence + Discord-style voice (WebRTC mesh, mute/deafen/speaking rings, listen-only fallback; Supabase Realtime in prod, BroadcastChannel LAN mode without env vars). Everything under § Current State below still applies functionally.

### Working on the UI? Rules of the skin system

- All chrome goes through shared primitives — `<Window>` / `<Taskbar>` (components/retro/) plus token classes (`panel`, `well`, `btn95`, `bevel-*`, `status-cell`) and CSS vars. **Never hardcode colors or fonts in components**; skins override the whole layer via `body[data-skin=…]` scopes in app/globals.css.
- Window titles: pass the canonical retro name (`"FOCUS.EXE"`); `windowTitle()` in lib/skins.ts derives every skin's naming from it.
- Text sitting directly on the desktop uses `.desk-ink` / `.desk-ink-dim` so light skins (GHOST) stay readable.
- Never write `-webkit-backdrop-filter` alongside the standard property — Lightning CSS dedupes away the unprefixed one and blur silently dies.
- Local prod builds may need `NODE_OPTIONS=--dns-result-order=ipv4first` (broken IPv6 route to Google Fonts on this machine). Never run `next build` while `next dev` is running — they share `.next` and corrupt it.

---

## When you come back, start here

1. Re-read **§ Current State** to remember where you left off.
2. `cd C:\Users\adity\Desktop\FOCUSFLOW` and run `npm run dev` (or just visit the deployed Vercel URL).
3. The TOP priority right now is **reviewing + merging PR #1** (the entire skin-system UI + study rooms live there). After that: friend testing, and the `/session` WebRTC stream bug below.
4. Update the "Last updated" date and the checkboxes when you make changes.

---

## Current State

### What's working end-to-end

**Pages**
- [x] Landing (`/`) — hero with animated stage, feature grid, theme showcase, CTA, OG image for link previews
- [x] Login + signup (`/login`) — email/password, Google OAuth (UI wired, needs provider setup), GitHub OAuth (UI wired, needs provider setup)
- [x] Focus room (`/focus`) — animated timer ring, mode tabs, controls, subject input with recent-subject chips, quote rotator, drag-and-drop tasks, goals panel, snapshot, heatmap, ambience mixer
- [x] Tasks (`/tasks`) — full-page task management
- [x] Dashboard (`/dashboard`) — bar/pie/line charts driven from real history, stats grid
- [x] Settings (`/settings`) — timer durations, ambience, completion-sound picker, danger-zone "Clear all data"
- [x] History (`/history`) — chronological session list with AI summaries
- [x] Themes (`/themes`) — 7-theme picker; switching auto-applies the matching ambience preset
- [x] Achievements (`/achievements`) — milestones, unlock states computed from real stats
- [x] AI coach (`/ai`) — streaming chat with Gemini Flash, personalized via your stats
- [x] Session room (`/session`) — lobby (create/join), video call infrastructure, collaborative whiteboard
- [x] Workspace (`/workspace`) — shared workspaces with invite codes
- [x] 404 (`/not-found`) and Loading skeletons

**Data layer**
- [x] Zustand store with `persist` middleware → localStorage
- [x] Sessions push to history with AI summary on completion
- [x] Day-rollover streak logic
- [x] Tasks, settings, history, ambience, theme, current subject all persist
- [x] **Cloud sync** via `SyncProvider` → Supabase `focusflow_state` table (debounced writes, hydration on sign-in)

**Audio**
- [x] Vanilla HTMLAudioElement engine — no Howler dependency
- [x] 51 ambience tracks across 6 categories with random pick per toggle
- [x] Smooth 600ms fade in/out
- [x] Autoplay-blocked tracks retry on first interaction
- [x] Selectable completion sound (settings)
- [x] Per-track volume sliders, persisted

**AI**
- [x] **Reflection modal** — auto-pops after focus completion; Gemini generates 1-line summary saved to history
- [x] **AI study coach chat** (`/ai`) — streaming responses, knows your streak/hours/current subject
- [x] **Focus plan generator** (`/api/ai/plan` — legacy endpoint, fallback path)

**Auth**
- [x] Email/password sign in + sign up via Supabase
- [x] OAuth callback route at `/auth/callback` handles confirmation links
- [x] Profile menu with avatar + sign out
- [x] Demo mode fallback when Supabase env vars aren't set

**Live sessions**
- [x] Room lobby — create new room (6-char code) or join existing
- [x] Supabase Realtime channel signaling
- [x] Local camera + mic capture (gets permission on room entry)
- [x] Local screen-share preview (desktop only — mobile browsers don't support `getDisplayMedia`)
- [x] **Collaborative whiteboard** — pen, eraser, color, size; strokes + clear sync across peers via separate broadcast channel; normalized coordinates work across screen sizes
- [x] Toggle camera/mic without dropping connection (track.enabled flips)

**Polish**
- [x] Glassmorphism panels, animated theme-specific backgrounds, drift gradients, floating particles
- [x] Floating macOS-style dock with 9 nav items
- [x] Top bar with brand, search, zen toggle, notifications, profile dropdown
- [x] **Zen mode** — real browser fullscreen + chrome fades out; Esc syncs back
- [x] First-run **onboarding modal** — 4-step walkthrough with progress dots
- [x] Toast notifications via sonner
- [x] **Confetti** on session complete
- [x] Mobile responsive end-to-end (tighter padding, dock shrinks + scrolls, screen share hidden on mobile)
- [x] Browser tab favicon + Apple Touch icon
- [x] OG image (1200×630) for link previews
- [x] PWA installable — manifest + service worker registered, "Install" prompt in Chrome
- [x] **Vercel Analytics + Speed Insights** mounted

---

## Known bugs

- [ ] **WebRTC video/audio doesn't reach peers across the network** — signaling works (both peers see "Connected" + appear in each other's participant list), but media tracks aren't transmitted/rendered. Diagnostic console logs are in place — need to capture browser console output from both peers simultaneously to pinpoint where the chain breaks (offer/answer? ICE? ontrack?). See `lib/use-room.ts` for the logs.
- [ ] **Browsers occasionally fail to start camera/mic** — when this happens, the toast says `NotReadableError` (another app has the camera) or `NotAllowedError` (permission denied). User has to free up the camera and refresh.

---

## What's NOT done yet

**Manual setup steps** (you, not code)
- [ ] **Run the cloud-sync SQL** — paste `supabase/focusflow-sync.sql` into Supabase SQL editor and Run. Without this, signed-in users won't sync data across devices.
- [ ] **Run the collaborative-workspaces SQL** — `supabase/collaborative-workspaces.sql` or its migration version. Needed for `/workspace` to actually work.
- [ ] **Enable Vercel Analytics + Speed Insights** — Vercel dashboard → project → Settings → Analytics → enable both.
- [ ] **Configure Google OAuth** — Google Cloud Console → Create OAuth client → add Supabase callback URL → paste credentials into Supabase Authentication → Providers → Google. See `AUTH_SETUP.md` Step 6.
- [ ] **Configure GitHub OAuth** — github.com → Settings → Developer settings → OAuth Apps → New OAuth App → callback URL = your Supabase project URL + `/auth/v1/callback` → paste credentials into Supabase → Providers → GitHub.
- [ ] **Update Supabase URL Configuration** — Authentication → URL Configuration → set Site URL to deployed Vercel URL, add `localhost:3000/**` and your Vercel URL `/**` to Redirect URLs. Otherwise email confirmation links 404.

**Code TODOs**
- [ ] **Debug WebRTC peer streams** (capture both browsers' `[room ...]` console logs while in a room together — they'll show exactly where it breaks)
- [ ] **`complete.mp3` and `tick.mp3`** still need to be sourced and dropped in `public/audio/`. Without them, session-complete is silent.
- [ ] **TURN production credentials** — currently using the free public OpenRelay TURN; works for personal projects but flaky under load. Swap for Twilio / Cloudflare Calls / Metered.ca paid TURN when launching to real users.
- [ ] **Real-device mobile testing** — Chrome dev tools mobile emulation only approximates. Open the deployed URL on your actual phone and try every page.

**Asset polish**
- [ ] Custom domain (Cloudflare Registrar is cheapest — ~$10/year)
- [ ] App icons in PNG format (currently using SVG which works but Apple Touch + some Android home screens prefer PNG)
- [ ] Marketing screenshots for app stores if you ever go that route

**Legal (mandatory before public launch)**
- [ ] Privacy Policy at `/privacy`
- [ ] Terms of Service at `/terms`
- [ ] Cookie banner if targeting EU users
- [ ] Footer links to both on landing

---

## Phase plan — what to do next

### Phase A: Stabilize (this is where you are)
- [ ] Fix WebRTC video stream bug (capture diagnostic logs from both browsers)
- [ ] Run the SQL migrations in Supabase
- [ ] Configure OAuth providers (Google + GitHub)
- [ ] Source the 2 remaining audio files
- [ ] Real-device mobile test

### Phase B: First real users (~1 week)
- [ ] Friend testing — share your Vercel URL with 5–10 friends, watch them use it, write down every confusion
- [ ] Fix the top 3 UX issues they hit
- [ ] Enable error tracking (Sentry — free tier, one-command install)

### Phase C: Polish for launch
- [ ] Write Privacy Policy + Terms of Service (Termly or Iubenda generate them for ~$10/mo)
- [ ] Custom domain
- [ ] Lighthouse audit — aim for 90+ on Performance, Accessibility, Best Practices, SEO
- [ ] OG image refinements (test how it renders on Twitter, Slack, iMessage)
- [ ] Email collection / waitlist if you want to drip-launch

### Phase D: Launch
- [ ] Write launch post (your blog, Substack, or LinkedIn)
- [ ] Post to: Product Hunt (Tuesday/Wednesday morning), HN as Show HN, r/getmotivated, r/studytips, r/productivity, Indie Hackers, Twitter, TikTok if that fits
- [ ] Be in the comments answering questions the first day

---

## Decisions to make

- [ ] **Domain name:** ____________
- [ ] **TURN provider** when ready (Twilio / Cloudflare Calls / Metered): ____________
- [ ] **Analytics:** Vercel built-in (current) is fine — add Plausible/PostHog only if you need event tracking
- [ ] **Pricing model:** free forever / freemium / one-time / subscription
- [ ] **Target audience priority:** college students / professionals / both
- [ ] **Launch date target:** ____________

---

## Useful commands

```bash
# Develop
cd C:\Users\adity\OneDrive\Desktop\DEV\focusflow
npm run dev                # localhost:3000

# Type check before pushing
npm run type-check

# Build production locally (test before deploying)
npm run build && npm start

# Push to GitHub → Vercel auto-deploys within 90 sec
git add .
git commit -m "..."
git push
```

---

## Reference: cost summary

| Stage | Setup | Monthly | Notes |
|---|---|---|---|
| Current state | Vercel free + Supabase free + Gemini free + domain | ~$1 | What you have now |
| 1k–10k MAU | Vercel Pro + Supabase Pro + Plausible + paid TURN | ~$80 | Growth phase |
| 50k+ MAU | + Sentry team + email service + CDN bandwidth | ~$250 | Real product economics |

---

## Reference: critical files

| Path | What it does |
|---|---|
| `lib/store.ts` | Zustand store — single source of truth for client state |
| `lib/auth.ts` | Supabase auth wrapper with demo fallback |
| `lib/supabase.ts` | Supabase browser client |
| `lib/audio.ts` | Ambience engine + completion sound + tick |
| `lib/use-room.ts` | WebRTC mesh + Supabase Realtime signaling (the buggy one) |
| `lib/webrtc.ts` | STUN/TURN config |
| `components/providers/sync-provider.tsx` | Cloud sync between Zustand and Supabase |
| `app/session/page.tsx` | Live room with video + collab whiteboard |
| `app/ai/page.tsx` | AI chat interface |
| `app/api/ai/chat/route.ts` | Gemini chat streaming endpoint |
| `app/api/reflect/route.ts` | Gemini session-reflection endpoint |
| `supabase/focusflow-sync.sql` | Cloud sync table schema |
| `supabase/collaborative-workspaces.sql` | Workspace schema |

---

## Notes / scratch

**Session: May 13, 2026 — added the kitchen sink**
- Subject autocomplete chips, onboarding multi-step modal, Vercel Analytics + Speed Insights, dynamic OG image, browser favicon + apple-icon, collaborative whiteboard via separate Supabase channel.
- WebRTC video is still broken — built it with proper mesh + STUN + TURN + tie-break logic + acquire-media-on-entry to avoid renegotiation, but media doesn't reach peers. Diagnostic logging is in place; next session, capture both browsers' `[room ...]` console output to pinpoint the break.
- Codex has been pairing on this — built `SyncProvider`, `PWARegister`, theme-specific motion, ambience presets per theme. Worth diffing recent commits before any major refactor to see what's new.

**Next session priority:** WebRTC debugging via captured console logs. Then friend testing.

