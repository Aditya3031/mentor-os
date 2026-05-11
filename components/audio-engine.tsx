"use client";

import { useAmbienceEngine, useCompletionChimeEngine, useTickEngine } from "@/lib/audio";

/**
 * Headless component — mount once in the root layout.
 * Drives ambience playback and the optional clock-tick sfx.
 * Renders nothing.
 */
export function AudioEngine() {
  useAmbienceEngine();
  useTickEngine();
  useCompletionChimeEngine();
  return null;
}
