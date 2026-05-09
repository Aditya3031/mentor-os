"use client";

import { useEffect, useRef } from "react";
import { useStore } from "./store";
import {
  AMBIENCE_TRACKS,
  ambienceTrackUrl,
  pickRandomTrack,
  type AmbienceId,
} from "./themes";

const FADE_MS = 600;

/**
 * Ambience audio engine — vanilla HTMLAudioElement based, no library.
 *
 * Each category (lofi, rain, cafe, ...) has multiple tracks in
 * /public/audio/<folder>/. When the user toggles a category ON,
 * we pick a random track from that category and play it on loop.
 * Toggle OFF fades out and pauses.
 *
 * Re-toggling ON picks a *new* random track — so you get variety
 * across sessions, like a real lofi station.
 *
 * - Lazy: tracks aren't fetched until enabled (no bandwidth waste)
 * - Smooth: 600ms fade in/out + smooth volume slider response
 * - Resilient: missing files log a warning, don't crash
 */
export function useAmbienceEngine() {
  const ambience = useStore((s) => s.ambience);
  const audiosRef = useRef<Map<AmbienceId, HTMLAudioElement>>(new Map());
  const prevEnabledRef = useRef<Map<AmbienceId, boolean>>(new Map());
  // Tracks whose play() got blocked by browser autoplay policy.
  // We retry them on the first real user gesture.
  const pendingPlayRef = useRef<Set<AmbienceId>>(new Set());

  // Cleanup on unmount
  useEffect(() => {
    const audios = audiosRef.current;
    return () => {
      audios.forEach((a) => a.pause());
      audios.clear();
    };
  }, []);

  // First-interaction retry: any audio that the browser refused to autoplay
  // gets a second chance the moment the user clicks or presses a key anywhere.
  useEffect(() => {
    const retry = () => {
      pendingPlayRef.current.forEach((id) => {
        const audio = audiosRef.current.get(id);
        if (audio && audio.paused) {
          audio.play().catch(() => {});
        }
      });
      pendingPlayRef.current.clear();
    };
    const opts: AddEventListenerOptions = { once: true };
    document.addEventListener("click", retry, opts);
    document.addEventListener("keydown", retry, opts);
    document.addEventListener("touchstart", retry, opts);
    return () => {
      document.removeEventListener("click", retry);
      document.removeEventListener("keydown", retry);
      document.removeEventListener("touchstart", retry);
    };
  }, []);

  useEffect(() => {
    ambience.forEach((track) => {
      const wasEnabled = prevEnabledRef.current.get(track.id) ?? false;
      const justEnabled = track.enabled && !wasEnabled;
      let audio = audiosRef.current.get(track.id);

      // First-time enable OR re-enable after disable: pick a new random track
      if (justEnabled) {
        // Tear down any previous instance so we can swap to a new file
        if (audio) {
          audio.pause();
          audio.src = "";
        }
        const trackNum = pickRandomTrack(track.id);
        const url = ambienceTrackUrl(track.id, trackNum);
        audio = new Audio(url);
        audio.loop = true;
        audio.volume = 0;
        audio.preload = "auto";
        audiosRef.current.set(track.id, audio);
      }

      if (!audio) {
        prevEnabledRef.current.set(track.id, track.enabled);
        return;
      }

      if (track.enabled) {
        if (audio.paused) {
          audio.play().catch((err) => {
            if (err?.name === "NotAllowedError") {
              // Autoplay blocked — queue for retry on next user interaction.
              pendingPlayRef.current.add(track.id);
            } else {
              console.warn(
                `[ambience] Could not play ${track.id}: ${err?.message ?? err}`
              );
            }
          });
        }
        smoothFade(audio, track.volume, FADE_MS);
      } else if (!audio.paused) {
        smoothFade(audio, 0, FADE_MS, () => {
          if (audio && audio.volume === 0) audio.pause();
        });
      }

      prevEnabledRef.current.set(track.id, track.enabled);
    });
  }, [ambience]);
}

/** RAF-driven volume ramp. Clamps to [0,1]. */
function smoothFade(
  audio: HTMLAudioElement,
  target: number,
  duration: number,
  onDone?: () => void
) {
  const start = audio.volume;
  const startTime = performance.now();
  const step = () => {
    const elapsed = performance.now() - startTime;
    const t = Math.min(1, elapsed / duration);
    audio.volume = Math.max(0, Math.min(1, start + (target - start) * t));
    if (t < 1) requestAnimationFrame(step);
    else onDone?.();
  };
  requestAnimationFrame(step);
}

/**
 * Optional clock-tick sfx during focus sessions.
 * Bails when settings.ticking is off or mode isn't focus.
 */
export function useTickEngine() {
  const running = useStore((s) => s.running);
  const mode = useStore((s) => s.mode);
  const ticking = useStore((s) => s.settings.ticking);

  useEffect(() => {
    if (!running || !ticking || mode !== "focus") return;
    const id = window.setInterval(() => playSfx(SFX.tick, 0.15), 1000);
    return () => window.clearInterval(id);
  }, [running, ticking, mode]);
}

/* ============================================================
   Sound effects + browser notifications
   ============================================================ */

const sfxCache = new Map<string, HTMLAudioElement>();

export function playSfx(src: string, volume = 0.5) {
  if (typeof window === "undefined") return;
  let el = sfxCache.get(src);
  if (!el) {
    el = new Audio(src);
    sfxCache.set(src, el);
  }
  el.volume = Math.max(0, Math.min(1, volume));
  el.currentTime = 0;
  el.play().catch(() => {});
}

export const SFX = {
  complete: "/audio/complete.mp3",
  tick: "/audio/tick.mp3",
} as const;

export function notify(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification(title, {
      body,
      icon: "/icons/icon-192.png",
      tag: "focusflow-session",
    });
  } catch {
    // Some contexts (iframes, insecure origins) reject — ignore.
  }
}
