// npm run build:puzzles: turn the Lichess puzzle database (CC0) into small,
// committed JSON slices per theme, for "extra practice" in lessons.
//
// The 300 MB download stays in scripts/.cache/ (gitignored). Get it with:
//   curl -o scripts/.cache/lichess_db_puzzle.csv.zst https://database.lichess.org/lichess_db_puzzle.csv.zst
//
// Lichess puzzle format: FEN is the position BEFORE the opponent's move; Moves
// starts with that opponent move, then the solution. We keep only beginner-rated,
// popular, well-tested puzzles, and store the position after the opponent's
// move plus the first solution move. Lichess guarantees that move is the only
// winning one, which is what makes a one-move answer key fair (on paper too).

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { Chess } from "chess.js";

const SRC = "scripts/.cache/lichess_db_puzzle.csv.zst";
const OUT = "src/content/puzzles";

interface Want {
  theme: string;
  count: number;
  minRating: number;
  maxRating: number;
  /** Max plies in Moves, including the opponent's first move. */
  maxPlies: number;
}

const WANT: Want[] = [
  { theme: "mateIn1", count: 60, minRating: 400, maxRating: 1100, maxPlies: 2 },
  { theme: "hangingPiece", count: 60, minRating: 400, maxRating: 1100, maxPlies: 2 },
  { theme: "fork", count: 60, minRating: 500, maxRating: 1300, maxPlies: 4 },
  { theme: "pin", count: 60, minRating: 500, maxRating: 1400, maxPlies: 4 },
  { theme: "skewer", count: 60, minRating: 500, maxRating: 1400, maxPlies: 4 },
];

export interface Puzzle {
  id: string; // Lichess puzzle id (lichess.org/training/<id>)
  fen: string; // position to solve, side to move is the solver
  answer: string; // UCI of the first (only winning) move
  line: string[]; // full solution in SAN, for the teacher's key
  rating: number;
}

type Row = { id: string; fen: string; moves: string[]; rating: number; rd: number; pop: number; plays: number; themes: string[] };

function parse(line: string): Row | null {
  const c = line.split(",");
  if (c.length < 8 || c[0] === "PuzzleId") return null;
  return { id: c[0], fen: c[1], moves: c[2].split(" "), rating: +c[3], rd: +c[4], pop: +c[5], plays: +c[6], themes: c[7].split(" ") };
}

function toPuzzle(r: Row): Puzzle | null {
  try {
    const g = new Chess(r.fen);
    const [opp, ...solution] = r.moves;
    g.move({ from: opp.slice(0, 2), to: opp.slice(2, 4), promotion: opp[4] });
    const fen = g.fen();
    const line: string[] = [];
    for (const u of solution) line.push(g.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] }).san);
    return { id: r.id, fen, answer: solution[0], line, rating: r.rating };
  } catch {
    return null;
  }
}

async function main() {
  if (!existsSync(SRC)) {
    console.error(`Missing ${SRC}. Download it first (see the comment at the top of this file).`);
    process.exit(1);
  }
  const pools = new Map<string, Row[]>(WANT.map((w) => [w.theme, []]));
  const zstd = spawn("zstdcat", [SRC]);
  const rl = createInterface({ input: zstd.stdout });
  let n = 0;
  for await (const line of rl) {
    n++;
    const r = parse(line);
    if (!r || r.rd > 90 || r.pop < 88 || r.plays < 2000) continue;
    for (const w of WANT) {
      if (r.themes.includes(w.theme) && r.rating >= w.minRating && r.rating <= w.maxRating && r.moves.length <= w.maxPlies) pools.get(w.theme)!.push(r);
    }
  }
  mkdirSync(OUT, { recursive: true });
  for (const w of WANT) {
    const picked: Puzzle[] = [];
    const rows = pools.get(w.theme)!.sort((a, b) => b.pop - a.pop || b.plays - a.plays);
    for (const r of rows) {
      if (picked.length >= w.count) break;
      const p = toPuzzle(r);
      if (p) picked.push(p);
    }
    picked.sort((a, b) => a.rating - b.rating); // easiest first
    writeFileSync(`${OUT}/${w.theme}.json`, JSON.stringify(picked, null, 1) + "\n");
    console.log(`${w.theme}: ${picked.length} puzzles (from ${rows.length} candidates), ratings ${picked[0]?.rating}–${picked.at(-1)?.rating}`);
  }
  console.log(`scanned ${n.toLocaleString()} rows`);
}

main();
