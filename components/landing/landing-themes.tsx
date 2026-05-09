import { THEMES } from "@/lib/themes";

export function LandingThemes() {
  return (
    <section className="relative px-6 py-32">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-text-dim">Choose your room</p>
          <h2 className="mt-3 text-balance text-[clamp(28px,4vw,44px)] font-light leading-tight tracking-tight">
            Seven curated environments.
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {THEMES.map((t) => (
            <div
              key={t.id}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/[0.08] transition-all hover:-translate-y-1 hover:border-white/[0.18]"
            >
              <div className="absolute inset-0" style={{ background: t.gradient }} />
              <div
                className="absolute inset-0 mix-blend-screen"
                style={{
                  background: `radial-gradient(circle at 70% 30%, hsl(${t.accent} / 0.4), transparent 50%)`,
                }}
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5">
                <h3 className="text-base font-semibold">{t.name}</h3>
                <p className="mt-0.5 text-xs opacity-80">{t.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
