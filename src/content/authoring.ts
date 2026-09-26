// Helpers for writing lessons. Positions are described by piece placement or by
// move list rather than hand-typed FENs, so a typo can't slip through; the
// validator (npm run validate) then checks every exercise against the rules.

import { Chess } from "chess.js";
import type { Square } from "./types";

type PieceLetter = "K" | "Q" | "R" | "B" | "N" | "P" | "k" | "q" | "r" | "b" | "n" | "p";
export type Placement = Partial<Record<PieceLetter, Square | Square[]>>;

/**
 * FEN from a placement, e.g. board({ R: "d4", p: ["d7", "g4"] }).
 * Uppercase = White, lowercase = Black (FEN letters). No castling rights.
 */
export function board(placement: Placement, turn: "w" | "b" = "w"): string {
  const grid: (string | null)[][] = Array.from({ length: 8 }, () => Array(8).fill(null));
  for (const [letter, where] of Object.entries(placement)) {
    for (const sq of Array.isArray(where) ? where : [where!]) {
      const file = sq.charCodeAt(0) - 97;
      const rank = Number(sq[1]);
      if (file < 0 || file > 7 || !(rank >= 1 && rank <= 8) || sq.length !== 2) throw new Error(`bad square "${sq}"`);
      if (grid[8 - rank][file]) throw new Error(`two pieces on ${sq}`);
      grid[8 - rank][file] = letter;
    }
  }
  const rows = grid.map((row) => {
    let s = "";
    let empty = 0;
    for (const cell of row) {
      if (cell) {
        if (empty) s += empty;
        empty = 0;
        s += cell;
      } else empty++;
    }
    return s + (empty || "");
  });
  return `${rows.join("/")} ${turn} - - 0 1`;
}

export const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
export const EMPTY_FEN = "8/8/8/8/8/8/8/8 w - - 0 1";

/** FEN after SAN moves from the start, e.g. after("e4 e5 Qh5"). Throws on an illegal move. */
export function after(line: string): string {
  const g = new Chess();
  for (const t of line.trim().split(/\s+/)) {
    const san = t.replace(/^\d+\.(\.\.)?/, "");
    if (san) g.move(san);
  }
  return g.fen();
}
