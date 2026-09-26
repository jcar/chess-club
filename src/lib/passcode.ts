// Pass codes carry "this kid passed step S, lesson L" from any iPad (or a
// graded paper check) to the teacher's roster, with no server. Format:
// S<step>-L<lesson>-<2-char checksum>, e.g. "S1-L2-7F". The checksum catches
// typos and casual guessing. It is not meant to stop a determined 5th grader.

import { STEPS } from "@/content/curriculum";
import type { Lesson } from "@/content/types";

// No 0/O, 1/I/L, so codes read cleanly off a small screen.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

function checksum(step: number, lesson: number): string {
  let h = 2166136261;
  for (const ch of `chess-club:${step}:${lesson}`) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return ALPHABET[h % ALPHABET.length] + ALPHABET[Math.floor(h / ALPHABET.length) % ALPHABET.length];
}

export function encodePass(step: number, lesson: number): string {
  return `S${step}-L${lesson}-${checksum(step, lesson)}`;
}

export function passCodeFor(l: Lesson): string {
  const step = STEPS.find((s) => s.n === l.step)!;
  return encodePass(l.step, step.lessons.indexOf(l) + 1);
}

/** Parse a typed code (any case, spaces or dashes optional). Null if invalid. */
export function decodePass(input: string): { step: number; lesson: number } | null {
  const m = input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .match(/^S(\d{1,2})L(\d{1,2})([A-Z0-9]{2})$/);
  if (!m) return null;
  const step = Number(m[1]);
  const lesson = Number(m[2]);
  return checksum(step, lesson) === m[3] ? { step, lesson } : null;
}

/** The lesson a valid code refers to, if it exists in this curriculum. */
export function lessonForCode(input: string): Lesson | null {
  const d = decodePass(input);
  if (!d) return null;
  return STEPS.find((s) => s.n === d.step)?.lessons[d.lesson - 1] ?? null;
}

