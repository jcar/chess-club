// A tiny material search used to verify tactics exercises ("win" goal): does a
// move win material against the opponent's best defence? Alpha-beta over
// material only, a few plies deep, with checkmate scored as a huge win. Plenty
// for beginner forks, pins and skewers; not an engine.

import type { Chess, Move } from "chess.js";
import { load, uciOf } from "./rules";

const VALUE: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
const MATE = 100;

function ordered(g: Chess): Move[] {
  // Captures and checks first so alpha-beta cuts early.
  return g.moves({ verbose: true }).sort((a, b) => score(b) - score(a));
  function score(m: Move) {
    return (m.captured ? 10 + VALUE[m.captured] : 0) + (m.san.includes("+") ? 5 : 0);
  }
}

/** Best material swing for the side to move within `depth` plies. */
function search(g: Chess, depth: number, alpha: number, beta: number): number {
  if (g.isCheckmate()) return -MATE;
  if (g.isDraw() || g.isStalemate()) return 0;
  if (depth === 0) return 0;
  let best = -Infinity;
  for (const m of ordered(g)) {
    g.move(m);
    const gain = (m.captured ? VALUE[m.captured] : 0) + (m.promotion ? VALUE[m.promotion] - 1 : 0);
    const v = gain - search(g, depth - 1, -beta + gain, -alpha + gain);
    g.undo();
    if (v > best) best = v;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }
  return best;
}

/** Net material the side to move gains by playing `uci`, against best defence. */
export function materialGain(fen: string, uci: string, depth = 4): number {
  const g = load(fen);
  const m = g.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] ?? "q" });
  const gain = (m.captured ? VALUE[m.captured] : 0) + (m.promotion ? VALUE[m.promotion] - 1 : 0);
  return gain - search(g, depth - 1, -Infinity, Infinity);
}

/** Moves that win at least `min` points of material (a minor piece by default). */
export function winningMoves(fen: string, min = 2, depth = 4): string[] {
  const g = load(fen);
  const seen = new Set<string>();
  return g
    .moves({ verbose: true })
    .map((m) => uciOf({ ...m, promotion: m.promotion ? "q" : undefined }))
    .filter((u) => (seen.has(u) ? false : (seen.add(u), true)))
    .filter((u) => materialGain(fen, u, depth) >= min);
}
