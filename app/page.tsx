import { LandingHero } from "@/components/landing/landing-hero";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingThemes } from "@/components/landing/landing-themes";
import { LandingCTA } from "@/components/landing/landing-cta";
import { BackgroundStage } from "@/components/bg/background-stage";

/**
 * Marketing landing page.
 * Cinematic hero -> feature grid -> theme showcase -> CTA.
 *
 * Uses the same animated <BackgroundStage /> as the rest of the app
 * so the visual language is continuous when the user clicks "Enter
 * focus room" — no jarring background swap.
 */
export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <BackgroundStage />
      <div className="relative z-[5]">
        <LandingHero />
        <LandingFeatures />
        <LandingThemes />
        <LandingCTA />
      </div>
    </main>
  );
}
