// A tiny rule-based opponent for the Step 1 mini-games (Pawn Wars, rook vs.
// pawns, …). No engine: it prefers promoting, then winning captures, then safe
// pawn pushes, with some randomness. `sloppy` (0–1) is how often it just plays
// any legal move, so a kindergartner can beat it.

import type { Move } from "chess.js";
import type { MiniGame, Uci } from "@/content/types";
import { load, uciOf } from "./rules";

const VALUE: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

export type Winner = "white" | "black" | "draw";

function attackedBy(fen: string, square: string, color: "w" | "b"): boolean {
  return load(fen).isAttacked(square as never, color);
}

function lastRank(m: Pick<Move, "piece" | "to" | "color">): boolean {
  return m.piece === "p" && (m.color === "w" ? m.to[1] === "8" : m.to[1] === "1");
}

export function botMove(fen: string, rng: () => number = Math.random, sloppy = 0.15): Uci | null {
  const g = load(fen);
  const moves = g.moves({ verbose: true });
  if (!moves.length) return null;
  if (rng() < sloppy) return uciOf(moves[Math.floor(rng() * moves.length)]);
  const them = g.turn() === "w" ? "b" : "w";
  let best: { m: Move; score: number } | null = null;
  for (const m of moves) {
    let score = rng() * 0.5;
    if (lastRank(m)) score += m.promotion === "q" ? 1001 : 1000;
    if (m.captured) score += VALUE[m.captured] * 10;
    const after = load(fen);
    after.move(m);
    if (attackedBy(after.fen(), m.to, them)) {
      // Is the piece defended? Then trading a pawn for a piece is still fine.
      const defended = attackedBy(after.fen(), m.to, g.turn());
      score -= defended ? VALUE[m.piece] * 3 : VALUE[m.piece] * 10;
    }
    if (m.piece === "p") score += (m.color === "w" ? Number(m.to[1]) : 9 - Number(m.to[1])) * 0.6;
    if (!best || score > best.score) best = { m, score };
  }
  return uciOf(best!.m);
}

/** Result after a move, or null if the game goes on. */
export function outcome(fenAfter: string, lastMove: Pick<Move, "piece" | "to" | "color">, game: MiniGame): Winner | null {
  const mover = lastMove.color === "w" ? "white" : "black";
  if (lastRank(lastMove)) return mover;
  const g = load(fenAfter);
  const counts = { w: 0, b: 0 };
  for (const row of g.board()) for (const c of row) if (c) counts[c.color]++;
  if (game.win === "captureAll" || game.win === "promote") {
    if (counts.w === 0) return "black";
    if (counts.b === 0) return "white";
  }
  if (g.moves().length === 0) return "draw";
  return null;
}
