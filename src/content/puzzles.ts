// Extra practice from the Lichess puzzle database (CC0), built by
// `npm run build:puzzles` into src/content/puzzles/*.json. Each puzzle becomes
// a normal "move" exercise, so the iPad, the worksheets and the validator
// treat it like any hand-written one.

import type { Exercise, Words } from "./types";
import { movesMeeting } from "@/lib/chess/rules";
import mateIn1 from "./puzzles/mateIn1.json";
import hangingPiece from "./puzzles/hangingPiece.json";
import fork from "./puzzles/fork.json";
import pin from "./puzzles/pin.json";
import skewer from "./puzzles/skewer.json";

export interface Puzzle {
  id: string;
  fen: string;
  answer: string;
  line: string[];
  rating: number;
}

export type PuzzleTheme = "mateIn1" | "hangingPiece" | "fork" | "pin" | "skewer";

const SETS: Record<PuzzleTheme, Puzzle[]> = { mateIn1, hangingPiece, fork, pin, skewer };

const PROMPT: Record<PuzzleTheme, (side: string) => Words> = {
  mateIn1: (s) => ({ text: `${s} to move. Checkmate in one.`, kid: `${s} to move. Find checkmate!` }),
  hangingPiece: (s) => ({ text: `${s} to move. Something is free. Take it!`, kid: `${s} to move. Take the free piece!` }),
  fork: (s) => ({ text: `${s} to move. Find the fork.`, kid: `${s} to move. Attack two things at once!` }),
  pin: (s) => ({ text: `${s} to move. Use a pin to win something.`, kid: `${s} to move. Find the pin!` }),
  skewer: (s) => ({ text: `${s} to move. Find the skewer.`, kid: `${s} to move. Find the skewer!` }),
};

export const PUZZLE_CREDIT = "Extra puzzles from the Lichess puzzle database (lichess.org, CC0).";

const cache = new Map<PuzzleTheme, Exercise[]>();

/** All puzzles for a theme as exercises, easiest first. */
export function puzzleExercises(theme: PuzzleTheme): Exercise[] {
  const hit = cache.get(theme);
  if (hit) return hit;
  const list: Exercise[] = SETS[theme].map((p) => {
    const side = p.fen.split(" ")[1] === "w" ? "White" : "Black";
    const base = { id: `lichess-${p.id}`, fen: p.fen, prompt: PROMPT[theme](side), orientation: side === "White" ? ("white" as const) : ("black" as const) };
    // Mate puzzles accept any checkmate; the others accept Lichess's one winning move.
    return theme === "mateIn1"
      ? { ...base, kind: "move" as const, goal: "mate" as const, answers: movesMeeting(p.fen, "mate") }
      : { ...base, kind: "move" as const, goal: theme === "hangingPiece" ? ("capture" as const) : ("any" as const), answers: [p.answer], strict: true };
  });
  cache.set(theme, list);
  return list;
}

/** The Lichess solution line (SAN) for an exercise id, for answer keys. */
export function puzzleLine(exerciseId: string): { id: string; line: string[] } | null {
  if (!exerciseId.startsWith("lichess-")) return null;
  const id = exerciseId.slice("lichess-".length);
  for (const set of Object.values(SETS)) {
    const p = set.find((x) => x.id === id);
    if (p) return { id, line: p.line };
  }
  return null;
}
