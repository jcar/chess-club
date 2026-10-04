"use client";

// Per-device preferences. On a shared club iPad these belong to the device,
// not to a kid.

import { createLocalStore, useLocalStore } from "./store";

export interface Settings {
  /** Easy-reading mode for this device: simpler wording, star marks, read-aloud. */
  young: boolean;
  readAloud: boolean;
  /** Little chimes for right, wrong and passing. */
  sounds: boolean;
  /** Teacher PIN that locks student mode to one lesson (stored only here). */
  pin: string | null;
  lockedLesson: string | null;
}

export const settingsStore = createLocalStore<Settings>("chessclub:settings", {
  young: false,
  readAloud: true,
  sounds: true,
  pin: null,
  lockedLesson: null,
});

export function useSettings(): Settings {
  return useLocalStore(settingsStore);
}
