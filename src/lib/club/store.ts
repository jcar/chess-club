"use client";

import { createLocalStore, useLocalStore } from "@/lib/store";
import { EMPTY_CLUB, fillAnimals, type Club } from "./model";

/** The club lives only in this browser. Export/import moves it between devices. */
export const clubStore = createLocalStore<Club>("chessclub:club", EMPTY_CLUB, (raw) => fillAnimals({ ...EMPTY_CLUB, ...(raw as Partial<Club>) }));

export function useClub(): Club {
  return useLocalStore(clubStore);
}

/**
 * Anonymous student progress on an iPad nobody is signed into. Lesson id →
 * the date passed and the stars earned. The kid shows the pass code to the teacher.
 */
export interface MyProgress {
  passed: Record<string, { date: string; stars: number }>;
}

export const myStore = createLocalStore<MyProgress>("chessclub:me", { passed: {} });

export function useMyProgress(): MyProgress {
  return useLocalStore(myStore);
}

/** Which roster kid is using this (club) iPad right now, if any. */
export const whoStore = createLocalStore<{ kidId: string | null }>("chessclub:who", { kidId: null });

export function useWho(): { kidId: string | null } {
  return useLocalStore(whoStore);
}

export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
