// Stockfish checks for answers the rules can't prove: "best" moves in
// openings, endgames and strategy. Runs only in `npm run validate`; the site
// never ships an engine.
//
// A "best" key must list exactly the moves within `margin` of the top move (or
// that keep the win/draw). With `strict`, the key may be shorter (e.g. "play
// the next move of our plan"), but every listed answer must still qualify.
//
// Every legal move is scored (MultiPV = all moves) at a fixed depth, so a run
// is deterministic. Results are cached in scripts/.cache/engine.json.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { availableParallelism } from "node:os";
import type { Exercise, MoveExercise } from "@/content/types";
import { isSandbox, load, movesMeeting } from "@/lib/chess/rules";
import { Engine, type Score } from "./engine";

const CACHE = "scripts/.cache/engine.json";
const ENGINE_ID = "sf18-lite";

/** Default depth for "best" by margin and for soundness; endgames search deeper. */
export const DEPTH = 16;
export const KEEPS_DEPTH = 24;
/** "best" by margin: accept moves within this many centipawns of the top move. */
export const DEFAULT_MARGIN = 50;
/** keeps "win": at least this good for the side to move. keeps "draw": not worse than -DRAW_FLOOR. */
export const WIN_FLOOR = 300;
export const DRAW_FLOOR = 150;

/** Centipawns from the side to move's view; mates map to ±100000 (sooner is bigger). */
export function toCp(s: Score): number {
  if ("cp" in s) return s.cp;
  return s.mate > 0 ? 100000 - s.mate : -100000 - s.mate;
}

export type Scores = Record<string, number>; // uci (from+to) -> cp

type Cache = Record<string, Scores>;
let cache: Cache | null = null;
function loadCache(): Cache {
  if (!cache) cache = existsSync(CACHE) ? (JSON.parse(readFileSync(CACHE, "utf8")) as Cache) : {};
  return cache;
}
export function saveCache() {
  if (!cache) return;
  mkdirSync("scripts/.cache", { recursive: true });
  writeFileSync(CACHE, JSON.stringify(cache));
}

// A small pool of single-threaded engines, so long runs use several cores.
const pool: Engine[] = [];
const idle: Engine[] = [];
const waiting: ((e: Engine) => void)[] = [];
const POOL_SIZE = Math.max(1, Math.min(6, availableParallelism() - 1));

async function withEngine<T>(fn: (e: Engine) => Promise<T>): Promise<T> {
  let e = idle.pop();
  if (!e && pool.length < POOL_SIZE) {
    e = new Engine();
    pool.push(e);
  }
  if (!e) e = await new Promise<Engine>((r) => waiting.push(r));
  try {
    return await fn(e);
  } finally {
    const next = waiting.shift();
    if (next) next(e);
    else idle.push(e);
  }
}

export function quitEngines() {
  for (const e of pool) e.quit();
  pool.length = 0;
  idle.length = 0;
}

/** Scores for every legal move in `fen` at `depth` (cached). */
export async function scoreMoves(fen: string, depth: number): Promise<Scores> {
  const key = `${ENGINE_ID}|${depth}|${fen}`;
  const c = loadCache();
  if (c[key]) return c[key];
  const legal = movesMeeting(fen, "any");
  const res = await withEngine((e) => e.analyze(fen, { depth, multiPV: legal.length }));
  const scores: Scores = {};
  for (const l of res.lines) scores[l.move.slice(0, 4)] = toCp(l.score);
  for (const m of legal) {
    if (!(m.slice(0, 4) in scores)) throw new Error(`engine skipped ${m} in ${fen}`);
  }
  c[key] = scores;
  saveCache(); // small file; saving each time keeps work if a long run is stopped
  return scores;
}

/** The moves a "best" exercise must accept, with the scores used to decide. */
export async function bestMoves(ex: MoveExercise): Promise<{ accepted: string[]; scores: Scores; top: number }> {
  const scores = await scoreMoves(ex.fen, ex.keeps ? KEEPS_DEPTH : DEPTH);
  const top = Math.max(...Object.values(scores));
  const ok = (cp: number) =>
    ex.keeps === "win" ? cp >= WIN_FLOOR : ex.keeps === "draw" ? cp >= -DRAW_FLOOR : cp >= top - (ex.margin ?? DEFAULT_MARGIN);
  const accepted = Object.keys(scores).filter((m) => ok(scores[m]));
  return { accepted, scores, top };
}

const fmt = (fen: string, scores: Scores, moves: string[]) =>
  moves
    .map((m) => {
      const g = load(fen);
      let san = m;
      try {
        san = g.move({ from: m.slice(0, 2), to: m.slice(2, 4), promotion: "q" }).san;
      } catch {
        /* keep uci */
      }
      return `${san} (${scores[m]})`;
    })
    .join(", ");

/** Engine problems with one exercise (empty when fine or not engine-checked). */
export async function engineErrors(ex: Exercise, where: string): Promise<string[]> {
  if (ex.kind !== "move" || ex.goal !== "best" || isSandbox(ex.fen)) return [];
  const at = `${where}/${ex.id}`;
  const answers = [...new Set(ex.answers.map((a) => a.slice(0, 4)))];
  const { accepted, scores, top } = await bestMoves(ex);
  const errs: string[] = [];
  if (ex.keeps === "win" && top < WIN_FLOOR) errs.push(`${at}: keeps "win" but the position isn't won (best ${top})`);
  if (ex.keeps === "draw" && top >= WIN_FLOOR) errs.push(`${at}: keeps "draw" but the side to move can win (best ${top}); use keeps "win"`);
  if (ex.keeps === "draw" && top < -DRAW_FLOOR) errs.push(`${at}: keeps "draw" but the position is lost (best ${top})`);
  const wrong = answers.filter((a) => !accepted.includes(a));
  const missing = accepted.filter((m) => !answers.includes(m));
  if (wrong.length) errs.push(`${at}: not best by the engine: ${fmt(ex.fen, scores, wrong)}; top ${top}`);
  if (missing.length && !ex.strict) errs.push(`${at}: answer key is missing ${fmt(ex.fen, scores, missing)}`);
  return errs;
}
