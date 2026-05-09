import { LandingHero } from "@/components/landing/landing-hero";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingThemes } from "@/components/landing/landing-themes";
import { LandingCTA } from "@/components/landing/landing-cta";

/**
 * Marketing landing page — renders fully on the server.
 * Cinematic hero -> feature grid -> theme showcase -> CTA.
 */
export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-stage-base">
      <LandingHero />
      <LandingFeatures />
      <LandingThemes />
      <LandingCTA />
    </main>
  );
}
