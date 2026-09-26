// Pairings for club games. Pure functions over kid ids.
//  • Round robin: everyone plays everyone (circle method).
//  • Swiss: pair kids with the same score, never the same opponent twice.
//  • Ladder: kids ranked; neighbours play; a win against a higher rung swaps places.

import type { GameResult } from "./model";

export interface Pairing {
  white: string;
  black: string | null; // null = bye
}

/** All rounds of a round robin. Odd counts get a bye each round. */
export function roundRobin(ids: string[]): Pairing[][] {
  const list: (string | null)[] = [...ids];
  if (list.length % 2) list.push(null);
  const n = list.length;
  const rounds: Pairing[][] = [];
  for (let r = 0; r < n - 1; r++) {
    const round: Pairing[] = [];
    for (let i = 0; i < n / 2; i++) {
      const a = list[i];
      const b = list[n - 1 - i];
      if (a === null && b === null) continue;
      // Alternate colours by round so nobody is always White.
      const [w, bl] = (r + i) % 2 === 0 ? [a, b] : [b, a];
      round.push(w === null ? { white: bl!, black: null } : { white: w, black: bl });
    }
    rounds.push(round);
    list.splice(1, 0, list.pop()!); // rotate all but the first
  }
  return rounds;
}

export function scores(ids: string[], games: GameResult[]): Map<string, number> {
  const s = new Map(ids.map((id) => [id, 0]));
  for (const g of games) {
    const pts = g.result === "1-0" ? [1, 0] : g.result === "0-1" ? [0, 1] : [0.5, 0.5];
    if (s.has(g.white)) s.set(g.white, s.get(g.white)! + pts[0]);
    if (s.has(g.black)) s.set(g.black, s.get(g.black)! + pts[1]);
  }
  return s;
}

function played(games: GameResult[], a: string, b: string): boolean {
  return games.some((g) => (g.white === a && g.black === b) || (g.white === b && g.black === a));
}

function whiteCount(games: GameResult[], id: string): number {
  return games.reduce((n, g) => n + (g.white === id ? 1 : g.black === id ? -1 : 0), 0);
}

/**
 * One Swiss round. Kids sorted by score (ties: fewer byes first, then name
 * order as given); each takes the highest-placed opponent they haven't played.
 * The lowest-scoring kid without a bye yet sits out when the count is odd.
 */
export function swissRound(ids: string[], games: GameResult[], byes: string[] = []): Pairing[] {
  const sc = scores(ids, games);
  const order = [...ids].sort((a, b) => sc.get(b)! - sc.get(a)!);
  const out: Pairing[] = [];
  let pool = order;
  if (pool.length % 2) {
    const byeKid = [...pool].reverse().find((id) => !byes.includes(id)) ?? pool[pool.length - 1];
    pool = pool.filter((id) => id !== byeKid);
    out.push({ white: byeKid, black: null });
  }
  const pairs = pairUp(pool, games);
  for (const [a, b] of pairs) {
    // The kid who has had White less often gets White.
    out.unshift(whiteCount(games, a) <= whiteCount(games, b) ? { white: a, black: b } : { white: b, black: a });
  }
  return out;
}

/** Backtracking pairer: avoids rematches when possible, else allows them. */
function pairUp(pool: string[], games: GameResult[]): [string, string][] {
  const tryPair = (rest: string[], allowRematch: boolean): [string, string][] | null => {
    if (!rest.length) return [];
    const [a, ...others] = rest;
    for (let i = 0; i < others.length; i++) {
      const b = others[i];
      if (!allowRematch && played(games, a, b)) continue;
      const tail = tryPair(others.filter((_, j) => j !== i), allowRematch);
      if (tail) return [[a, b], ...tail];
    }
    return null;
  };
  return tryPair(pool, false) ?? tryPair(pool, true)!;
}

/**
 * Ladder pairings for today's kids: neighbours on the ladder play (1v2, 3v4…).
 * On odd weeks the pairs shift by one (2v3, 4v5…) so the top kid isn't stuck.
 */
export function ladderPairings(ladder: string[], present: string[], shift = false): Pairing[] {
  const here = ladder.filter((id) => present.includes(id));
  const out: Pairing[] = [];
  let i = 0;
  if (shift && here.length > 2) {
    out.push({ white: here[0], black: null });
    i = 1;
  }
  for (; i + 1 < here.length; i += 2) out.push({ white: here[i + 1], black: here[i] }); // lower rung gets White
  if (i < here.length) out.push({ white: here[i], black: null });
  return out;
}

/** After a ladder game: if the lower-ranked kid wins, they take the winner's rung and everyone between moves down one. */
export function updateLadder(ladder: string[], game: Pick<GameResult, "white" | "black" | "result">): string[] {
  if (game.result === "1/2") return ladder;
  const winner = game.result === "1-0" ? game.white : game.black;
  const loser = game.result === "1-0" ? game.black : game.white;
  const wi = ladder.indexOf(winner);
  const li = ladder.indexOf(loser);
  if (wi < 0 || li < 0 || wi < li) return ladder; // already above
  const next = ladder.filter((id) => id !== winner);
  next.splice(li, 0, winner);
  return next;
}
