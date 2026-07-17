# FocusFlow

> Your solo deep-work sanctuary — pomodoro, ambient rooms, and analytics, designed to make studying feel inviting.

FocusFlow is a solo study platform disguised as a retro operating system — **FOCUSFLOW·95**. Boot it up, drag your windows around, run FOCUS.EXE, and let momentum carry you. All the seriousness of deep work, none of the seriousness of design trends.

---

## Two ways to explore

This repository ships two artifacts so you can experience FocusFlow immediately and also build on top of the production codebase.

| File | What it is | When to use it |
|---|---|---|
| `focusflow.html` | A complete, self-contained interactive demo — open it in a browser. All features wired up, all themes, all animations. | To see and feel the product instantly without `npm install`. |
| `app/`, `components/`, `lib/`, `package.json`, etc. | A real Next.js 15 + TypeScript project scaffold with the same design system, theme registry, Zustand store, and key components built out. | To build the production app. Drop these in as the starting point and iterate. |

### Try the demo right now

Just open `focusflow.html` in any modern browser:

```bash
open focusflow.html        # macOS
start focusflow.html       # Windows
xdg-open focusflow.html    # Linux
```

No installation, no build step. Everything works offline once the page loads.

### Run the Next.js project

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. The marketing landing is at `/`, the focus room at `/focus`.

---

## Tech stack

- **Next.js 15** — App Router, React 19, server components by default
- **TypeScript** — strict mode
- **Tailwind CSS** — design tokens via CSS variables for live theme switching
- **Framer Motion** — page transitions, layout animations, the timer ring
- **Zustand** (with `persist`) — single source of truth, persisted to `localStorage`
- **shadcn/ui primitives** (via Radix) — composable accessible building blocks
- **Lucide React** — line icons
- **Recharts** — analytics dashboard
- **dnd-kit** — drag-and-drop tasks
- **cmdk** — command palette (`⌘K`)
- **sonner** — toast notifications
- **next-themes** — system theme detection

---

## Feature map

### 1. Pomodoro engine
- Custom durations for focus / short break / long break / cycle length
- Auto-start next session, ticking ambience, completion sounds, browser notifications
- Circular animated progress ring with gradient stroke and soft glow
- Keyboard shortcuts: `Space` start/pause · `R` reset · `S` skip · `1/2/3` switch modes
- Background tab title sync (`12:34 — Focus · FocusFlow`)

### 2. Study session tracker
- Per-session subject, mode, duration, and pomodoro count saved to history
- Daily streak, weekly graph, productivity heatmap (last 90 days)
- Focus score and most-studied subject

### 3. Ambient mode
- Six built-in tracks: lofi, rain, café, fireplace, keyboard, white noise
- Per-track volume sliders, mix multiple at once
- Each theme room ships with an opinionated ambience preset

### 4. Focus room (the main page)
- Three-column layout: goals + tasks · timer · stats + ambience
- Animated theme background (drifting gradients + particles)
- Optional rain layer for rainy themes
- Quote rotates every 60 seconds
- Live "studying now" pill (intentionally fake — see § Solo together)
- **Zen mode** (`Z`) hides chrome and scales the timer up

### 5. Tasks
- Drag-and-drop reorder (dnd-kit)
- Priority tags, completion progress bar, optimistic toggling
- Persisted across reloads

### 6. Analytics dashboard
- Heatmap calendar (90 days)
- Weekly bar chart
- Subject breakdown doughnut chart
- "Best study hours" curve
- All charts share the active theme accent

### 7. Solo "study together" experience
A live counter at the top of the focus room shows how many people are studying right now. **It's deliberately fabricated** — the number drifts in a believable range (14k–16k). The point is the *feeling* of being part of something, without the noise and obligation of multiplayer. If you connect a real backend later, swap `<TopBar />`'s state for a websocket subscription.

### 8. Themes
Seven curated rooms, each defining its own gradient, accent colors, and ambience preset:
- Aurora (default — deep purples)
- Tokyo Night (neon pink + indigo)
- Rainy Cafe (warm rain on glass)
- Old Library (wood and ink)
- Cyberpunk (electric magenta + teal)
- Cozy Bedroom (soft pinks)
- Mountain Cabin (pine and snow)

Live-switching is instant — accent CSS variables update on `<body data-theme="…">`.

### 9. Gamification
- XP per completed session/task
- Levels (next-level cost = `(level + 1) * 300`)
- Achievements with unlocked / locked states

### 10. UI / UX details — interface modes
On first visit a boot-manager screen asks which interface to load, and the
**entire design language** changes (switchable any time via View → Interface
or THEMES.CPL):

One retro museum piece, six futuristic siblings:

- **FOCUSFLOW·95** — the retro one: beveled gray chrome, pixel fonts, defrag bars, Start menu
- **NETRUNNER** — cyberpunk HUD: black glass, corner-bracket modules, neon edges, `FOCUS//RUN` naming
- **HOLODECK** — augmented hologram: translucent light-field panels, corner ticks, glow hairlines over a dark grid
- **STARSHIP** — deep-space freighter: gunmetal instrument panels, amber readouts, caution stripes, starfield
- **GHOST** — sterile white future: hairline edges, one quiet accent, rounded clean-room surfaces
- **VOID** — OLED black minimal: true-black panels, hairline rings, lowercase type, zero ornament
- **OUTRUN** — synthwave: sunset title bars, striped sun and horizon grid floor, Audiowide chrome

All 12 color schemes compose with every interface. The default retro OS look:
- Draggable, beveled windows with gradient title bars (FOCUS.EXE, TASKS.SYS, MIXER.EXE…)
- Taskbar with Start menu, quick-launch programs, live pomodoro readout and tray clock
- BIOS boot sequence on the landing page (once per browser session)
- VT323 pixel digits, Silkscreen chrome labels, IBM Plex Mono body
- Defrag-block progress bars instead of glowing rings; subtle CRT scanline overlay
- Login as an OS logon dialog, themes as a Display Properties panel, onboarding as SETUP.EXE
- First-run onboarding wizard, confetti on session completion

---

## Architecture

```
focusflow/
├── app/
│   ├── layout.tsx               # Fonts, ThemeProvider, Toaster
│   ├── globals.css              # Design tokens + theme CSS vars + utility classes
│   ├── page.tsx                 # Landing (server-rendered)
│   ├── focus/page.tsx           # Main focus room
│   ├── dashboard/page.tsx       # Analytics
│   ├── login/page.tsx           # Auth UI (ready for Supabase / Firebase wiring)
│   ├── settings/page.tsx
│   ├── themes/page.tsx
│   └── history/page.tsx
├── components/
│   ├── providers/theme-provider.tsx
│   ├── bg/background-stage.tsx  # Drifting gradients, particles, rain
│   ├── timer/
│   │   ├── timer-ring.tsx       # SVG progress ring + center display
│   │   ├── timer-controls.tsx   # Start/pause/reset/skip + keybinds
│   │   └── mode-tabs.tsx
│   ├── panels/
│   │   ├── goals-panel.tsx
│   │   ├── tasks-panel.tsx      # dnd-kit sortable list
│   │   ├── snapshot-panel.tsx
│   │   ├── heatmap-panel.tsx
│   │   └── ambience-panel.tsx
│   ├── landing/                 # Hero / features / themes / CTA
│   ├── dock.tsx                 # Floating bottom dock
│   ├── top-bar.tsx
│   └── quote.tsx
├── lib/
│   ├── store.ts                 # Zustand + persist (single source of truth)
│   ├── themes.ts                # Theme + ambience registries
│   └── utils.ts                 # cn(), formatTime(), formatDuration(), …
├── public/
│   ├── audio/                   # lofi.mp3, rain.mp3, etc. (you provide)
│   └── manifest.json            # PWA manifest
├── tailwind.config.ts
├── next.config.ts
└── tsconfig.json
```

### State

Everything lives in a single Zustand store at `lib/store.ts` with `persist` middleware. The `partialize` config keeps transient flags (`running`, `remaining`) out of `localStorage` so the timer doesn't resume mid-tick on reload.

### Themes

Themes are defined declaratively in `lib/themes.ts`. The `ThemeProvider` component reads the active theme from the store and:
1. Sets `document.body.dataset.theme = id` (CSS variables in `globals.css` swap based on this)
2. Sets `--accent` and `--accent-alt` CSS custom properties on `:root` for direct use in inline styles and gradients

Adding a new theme = add one entry to the `THEMES` array + one block in `globals.css`.

### Animations

- Background drift: pure CSS keyframes
- Timer ring: Framer Motion `<motion.circle>` animating `strokeDashoffset`
- Mode tabs: Framer Motion `layoutId` for the active highlight
- Tasks: `<AnimatePresence>` + `layout` for smooth reorder

---

## Roadmap / forward-compatible architecture

The scaffolding is intentionally structured to absorb each of these without rewrites:

- **Auth** — drop in NextAuth, Supabase, or Firebase. Add a `lib/auth.ts` and gate `/focus` with middleware.
- **Cloud sync** — replace `persist`'s localStorage backend with a custom storage that mirrors to your DB.
- **PWA install** — `public/manifest.json` is already wired in `layout.tsx`. Add a service worker for offline caching.
- **Electron desktop** — wrap with `electron-next`, the app already drag-handles via `-webkit-app-region`.
- **Mobile** — design tokens map cleanly to NativeWind / Expo. Components without DOM-specific APIs port directly.
- **Real "studying now"** — replace the mock counter in `top-bar.tsx` with a WebSocket subscription.
- **Audio engine** — add Howler.js, point it at the `AMBIENCE_TRACKS` registry, and the panels are already wired.

---

## Keyboard shortcuts

| Key | Action |
|---|---|
| `Space` | Start / pause timer |
| `R` | Reset current session |
| `S` | Skip to next session |
| `1` / `2` / `3` | Switch to Focus / Short break / Long break |
| `Z` | Toggle Zen (fullscreen) mode |
| `⌘K` / `Ctrl+K` | Open command palette |
| `Esc` | Close modal / exit Zen |

---

## License

MIT — go build something great.
