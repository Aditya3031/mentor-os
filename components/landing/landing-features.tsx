import { Clock, Music, BarChart3, Trophy, Sparkles, Layers } from "lucide-react";

const FEATURES = [
  { icon: Clock,    title: "Pomodoro, refined",     desc: "Customizable cycles with auto-start, ticking ambience, and a circular progress ring that feels alive." },
  { icon: Music,    title: "Curated rooms",         desc: "Lofi beats, rain on glass, fireplaces, café murmur — mix and match an environment that fits your mood." },
  { icon: BarChart3,title: "Analytics that motivate", desc: "Heatmaps, streaks, focus scores, and best-hour patterns — see your effort compound." },
  { icon: Trophy,   title: "Quiet gamification",    desc: "XP, levels, and achievements designed to nudge — never childish, never noisy." },
  { icon: Sparkles, title: "Cinematic UI",          desc: "Glassmorphism, soft shadows, real animations. Built to feel like a place you want to be." },
  { icon: Layers,   title: "Solo, together",        desc: "A live counter of others studying right now — without the distraction of multiplayer." },
];

export function LandingFeatures() {
  return (
    <section className="relative px-6 py-32">
      <div className="mx-auto max-w-5xl">
        <h2 className="mx-auto max-w-2xl text-balance text-center text-[clamp(28px,4vw,44px)] font-light leading-tight tracking-tight">
          Everything a long study session needs.
          <span className="font-serif italic text-text-dim"> Nothing it doesn't.</span>
        </h2>
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="panel transition-transform duration-500 hover:-translate-y-1 hover:border-white/[0.14]"
              >
                <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-[linear-gradient(135deg,hsl(var(--accent)/0.2),hsl(var(--accent-alt)/0.2))] text-[hsl(var(--accent))]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold tracking-tight">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-text-dim">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
