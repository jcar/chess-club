// Chess rules for exercises, over chess.js. Beginner exercises use "sandbox"
// positions (a lone rook, three pawns, no kings) that aren't legal chess, so
// every position is loaded with skipValidation. chess.js still generates
// correct moves for them; it just never finds check without a king.

import { Chess, type Move } from "chess.js";
import type { MoveGoal, Square, Uci } from "@/content/types";

export function load(fen: string): Chess {
  return new Chess(fen, { skipValidation: true });
}

export function uciOf(m: Pick<Move, "from" | "to" | "promotion">): Uci {
  return `${m.from}${m.to}${m.promotion ?? ""}`;
}

/** A position is a sandbox when either king is missing. */
export function isSandbox(fen: string): boolean {
  const placement = fen.split(" ")[0];
  return !placement.includes("K") || !placement.includes("k");
}

/** Force the side to move (sandbox exercises let one piece move repeatedly). */
export function withTurn(fen: string, turn: "w" | "b"): string {
  const parts = fen.split(" ");
  parts[1] = turn;
  parts[3] = "-"; // an en-passant square is only valid for the other side
  return parts.join(" ");
}

export function turnOf(fen: string): "w" | "b" {
  return fen.split(" ")[1] === "b" ? "b" : "w";
}

/** Squares the piece on `square` can move to (promotions collapsed to one square). */
export function destinations(fen: string, square: Square): Square[] {
  const piece = load(fen).get(square as never);
  if (!piece) return [];
  const g = load(withTurn(fen, piece.color));
  const out = new Set<Square>();
  for (const m of g.moves({ square: square as never, verbose: true })) out.add(m.to);
  return [...out];
}

export interface Played {
  fen: string;
  uci: Uci;
  san: string;
  captured: boolean;
  check: boolean;
  mate: boolean;
}

/**
 * Play from→to if legal (auto-queen). `keepTurn` hands the move back to the
 * same side, for sandbox drills where one piece moves again and again.
 */
export function play(fen: string, from: Square, to: Square, opts: { keepTurn?: boolean } = {}): Played | null {
  const piece = load(fen).get(from as never);
  if (!piece) return null;
  const g = load(withTurn(fen, piece.color));
  let m: Move;
  try {
    m = g.move({ from, to, promotion: "q" });
  } catch {
    return null;
  }
  const check = g.inCheck();
  const mate = g.isCheckmate();
  const after = opts.keepTurn ? withTurn(g.fen(), piece.color) : g.fen();
  return { fen: after, uci: uciOf(m), san: m.san, captured: Boolean(m.captured), check, mate };
}

/** Every legal move for the side to move that meets the goal. */
export function movesMeeting(fen: string, goal: MoveGoal): Uci[] {
  const g = load(fen);
  const out: Uci[] = [];
  for (const m of g.moves({ verbose: true })) {
    if (goal === "capture" && !m.captured) continue;
    if (goal === "escape" && !g.inCheck()) continue; // every legal move escapes check
    if (goal === "check" || goal === "mate") {
      const after = load(fen);
      after.move(m);
      if (goal === "check" && !after.inCheck()) continue;
      if (goal === "mate" && !after.isCheckmate()) continue;
    }
    out.push(uciOf(m));
  }
  return out;
}

export function moveMeets(fen: string, uci: Uci, goal: MoveGoal): boolean {
  return movesMeeting(fen, goal).includes(uci);
}

/** Does `uci` exist in `answers`, ignoring an omitted promotion letter? */
export function matchesAnswer(uci: Uci, answers: readonly Uci[]): boolean {
  return answers.some((a) => a === uci || a.slice(0, 4) === uci.slice(0, 4));
}

/**
 * Fewest moves for the piece on `square` to visit every star (any order),
 * moving only that piece. Returns null if it can't be done.
 */
export function fewestMovesToStars(fen: string, square: Square, stars: readonly Square[]): number | null {
  const piece = load(fen).get(square as never);
  if (!piece) return null;
  const all = (1 << stars.length) - 1;
  const start = withTurn(fen, piece.color);
  const seen = new Set<string>();
  let frontier: { fen: string; at: Square; mask: number }[] = [{ fen: start, at: square, mask: 0 }];
  for (let depth = 0; depth <= 64 && frontier.length; depth++) {
    const next: typeof frontier = [];
    for (const node of frontier) {
      if (node.mask === all) return depth;
      const key = `${node.at}|${node.mask}|${node.fen.split(" ")[0]}`;
      if (seen.has(key)) continue;
      seen.add(key);
      for (const to of destinations(node.fen, node.at)) {
        const p = play(node.fen, node.at, to, { keepTurn: true });
        if (!p) continue;
        const i = stars.indexOf(to);
        next.push({ fen: p.fen, at: to, mask: i >= 0 ? node.mask | (1 << i) : node.mask });
      }
    }
    frontier = next;
  }
  return null;
}

/** Squares attacked by the side not to move, used for "escape" hints. */
export function kingSquare(fen: string, color: "w" | "b"): Square | null {
  const g = load(fen);
  for (const row of g.board()) for (const cell of row) if (cell && cell.type === "k" && cell.color === color) return cell.square;
  return null;
}
