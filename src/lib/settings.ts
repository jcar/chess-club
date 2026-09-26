"use client";

// Per-device preferences. On a shared club iPad these belong to the device,
// not to a kid.

import { createLocalStore, useLocalStore } from "./store";

export interface Settings {
  /** K–2 mode: kid wording, star marks, and read-aloud on by default. */
  young: boolean;
  readAloud: boolean;
  /** Teacher PIN that locks student mode to one lesson (stored only here). */
  pin: string | null;
  lockedLesson: string | null;
}

export const settingsStore = createLocalStore<Settings>("chessclub:settings", {
  young: false,
  readAloud: true,
  pin: null,
  lockedLesson: null,
});

export function useSettings(): Settings {
  return useLocalStore(settingsStore);
}
