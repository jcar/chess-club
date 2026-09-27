// One source of truth for "what is the right answer", shared by the iPad
// screens (grading), the worksheet answer keys, and the content validator.

import type { Exercise, Square, Uci } from "@/content/types";
import { destinations, fewestMovesToStars, load } from "@/lib/chess/rules";
import { puzzleLine } from "@/content/puzzles";

export type Answer =
  | { kind: "squares"; squares: Square[] } // reach: all of them; tap: any one of them
  | { kind: "moves"; moves: Uci[] }
  | { kind: "fewest"; moves: number }
  | { kind: "option"; index: number };

export function answerFor(ex: Exercise): Answer {
  switch (ex.kind) {
    case "reach":
      return { kind: "squares", squares: destinations(ex.fen, ex.square).sort() };
    case "tap":
      return { kind: "squares", squares: ex.answers };
    case "move":
      return { kind: "moves", moves: ex.answers };
    case "stars": {
      const n = fewestMovesToStars(ex.fen, ex.square, ex.stars);
      if (n === null) throw new Error(`${ex.id}: stars can't be reached`);
      return { kind: "fewest", moves: n };
    }
    case "choice":
      return { kind: "option", index: ex.answer };
  }
}

/** Short human-readable answer for an answer key, e.g. "Rxe6" or "3 moves". */
export function answerLabel(ex: Exercise): string {
  const a = answerFor(ex);
  switch (a.kind) {
    case "squares":
      return ex.kind === "reach" ? `${a.squares.length} squares` : a.squares.join(" or ");
    case "moves": {
      // Lichess puzzles: show the whole winning line so the teacher sees why.
      const p = puzzleLine(ex.id);
      if (p && ex.kind === "move" && ex.goal !== "mate") return p.line.join(" ");
      return a.moves.map((m) => sanOf(ex.fen!, m)).join(" or ");
    }
    case "fewest":
      return `${a.moves} move${a.moves === 1 ? "" : "s"}`;
    case "option":
      return ex.kind === "choice" ? ex.options[a.index].text : "";
  }
}

export function sanOf(fen: string, uci: Uci): string {
  try {
    const g = load(fen);
    return g.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] ?? "q" }).san;
  } catch {
    return uci;
  }
}
