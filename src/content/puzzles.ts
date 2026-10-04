// Extra practice from the Lichess puzzle database (CC0), built by
// `npm run build:puzzles` into src/content/puzzles/*.json. Each puzzle becomes
// a normal "move" exercise, so the iPad, the worksheets and the validator
// treat it like any hand-written one.

import type { Exercise, PuzzleTheme, Words } from "./types";
import { movesMeeting } from "@/lib/chess/rules";
import mateIn1 from "./puzzles/mateIn1.json";
import hangingPiece from "./puzzles/hangingPiece.json";
import fork from "./puzzles/fork.json";
import pin from "./puzzles/pin.json";
import skewer from "./puzzles/skewer.json";
import opening from "./puzzles/opening.json";
import discoveredAttack from "./puzzles/discoveredAttack.json";
import capturingDefender from "./puzzles/capturingDefender.json";
import deflection from "./puzzles/deflection.json";
import intermezzo from "./puzzles/intermezzo.json";
import pawnEndgame from "./puzzles/pawnEndgame.json";
import rookEndgame from "./puzzles/rookEndgame.json";

export interface Puzzle {
  id: string;
  fen: string;
  answer: string;
  line: string[];
  rating: number;
}

export type { PuzzleTheme };

const SETS: Record<PuzzleTheme, Puzzle[]> = {
  mateIn1,
  hangingPiece,
  fork,
  pin,
  skewer,
  opening,
  discoveredAttack,
  capturingDefender,
  deflection,
  intermezzo,
  pawnEndgame,
  rookEndgame,
};

const PROMPT: Record<PuzzleTheme, (side: string) => Words> = {
  mateIn1: (s) => ({ text: `${s} to move. Checkmate in one.`, kid: `${s} to move. Find checkmate!` }),
  hangingPiece: (s) => ({ text: `${s} to move. Something is free. Take it!`, kid: `${s} to move. Take the free piece!` }),
  fork: (s) => ({ text: `${s} to move. Find the fork.`, kid: `${s} to move. Attack two things at once!` }),
  pin: (s) => ({ text: `${s} to move. Use a pin to win something.`, kid: `${s} to move. Find the pin!` }),
  skewer: (s) => ({ text: `${s} to move. Find the skewer.`, kid: `${s} to move. Find the skewer!` }),
  opening: (s) => ({ text: `${s} to move. Your opponent made an opening mistake. Punish it!`, kid: `${s} to move. Catch the mistake!` }),
  discoveredAttack: (s) => ({ text: `${s} to move. Move one piece to uncover an attack by another.`, kid: `${s} to move. Find the surprise attack!` }),
  capturingDefender: (s) => ({ text: `${s} to move. Remove the defender, then win what it was guarding.`, kid: `${s} to move. Take away the guard!` }),
  deflection: (s) => ({ text: `${s} to move. Pull a defender away from its job.`, kid: `${s} to move. Pull the guard away!` }),
  intermezzo: (s) => ({ text: `${s} to move. Don't take back right away. Find the stronger in-between move.`, kid: `${s} to move. Find the sneaky in-between move!` }),
  pawnEndgame: (s) => ({ text: `${s} to move. Find the winning move in this pawn ending.`, kid: `${s} to move. Find the winning king or pawn move!` }),
  rookEndgame: (s) => ({ text: `${s} to move. Find the winning move in this rook ending.`, kid: `${s} to move. Find the winning rook move!` }),
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
