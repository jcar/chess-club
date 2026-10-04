// Node-side Stockfish UCI driver used by the content validator (copied from
// OpeningLab, ../chess-openings/scripts/lib/engine.ts).
//
// Spawns the single-threaded WASM build once (no SharedArrayBuffer / threads
// needed under Node) and talks UCI over stdio. Reused across every position in
// a validation run — spawning per-position would be far too slow.
//
// UCI scores are already reported from the side-to-move's perspective
// (positive = good for whoever is to move), so no normalization is needed.

import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";

const ENGINE_PATH = "node_modules/stockfish/bin/stockfish-18-lite-single.js";

/** A score is either a forced mate in `mate` plies-to-mate, or a centipawn eval. */
export type Score = { mate: number } | { cp: number };

export interface Line {
  /** First move of the principal variation, in UCI ("e2e4"). */
  move: string;
  score: Score;
}

export interface AnalyzeResult {
  /** PV lines, ordered best-first (index 0 = multipv 1). */
  lines: Line[];
  /** Engine's chosen best move (UCI), or null if none (terminal position). */
  bestmove: string | null;
}

export interface AnalyzeOptions {
  depth?: number;
  multiPV?: number;
}

export class Engine {
  private child: ChildProcessWithoutNullStreams;
  private buf = "";
  private ready: Promise<void>;
  private lineHandlers = new Set<(line: string) => void>();

  constructor() {
    this.child = spawn(process.execPath, [ENGINE_PATH]);
    this.child.stdout.on("data", (d: Buffer) => this.onData(d.toString()));
    this.ready = this.handshake();
  }

  private onData(chunk: string) {
    this.buf += chunk;
    let nl: number;
    while ((nl = this.buf.indexOf("\n")) >= 0) {
      const line = this.buf.slice(0, nl).trim();
      this.buf = this.buf.slice(nl + 1);
      if (line) this.lineHandlers.forEach((h) => h(line));
    }
  }

  private send(cmd: string) {
    this.child.stdin.write(cmd + "\n");
  }

  private waitFor(predicate: (line: string) => boolean): Promise<void> {
    return new Promise((resolve) => {
      const h = (line: string) => {
        if (predicate(line)) {
          this.lineHandlers.delete(h);
          resolve();
        }
      };
      this.lineHandlers.add(h);
    });
  }

  private async handshake(): Promise<void> {
    this.send("uci");
    await this.waitFor((l) => l === "uciok");
    this.send("isready");
    await this.waitFor((l) => l === "readyok");
  }

  /**
   * Analyze a position. Returns the top `multiPV` PV lines (best-first) and the
   * engine's best move. `depth` controls search strength/cost.
   */
  async analyze(
    fen: string,
    { depth = 20, multiPV = 2 }: AnalyzeOptions = {},
  ): Promise<AnalyzeResult> {
    await this.ready;

    // Latest score+move per multipv index, keyed by index (1-based).
    const latest = new Map<number, Line>();

    return new Promise<AnalyzeResult>((resolve) => {
      const handler = (line: string) => {
        if (line.startsWith("info ") && line.includes(" pv ")) {
          const parsed = parseInfoLine(line);
          if (parsed) latest.set(parsed.multipv, parsed.line);
        } else if (line.startsWith("bestmove")) {
          this.lineHandlers.delete(handler);
          const bestmove = line.split(/\s+/)[1] ?? null;
          const lines = [...latest.entries()]
            .sort((a, b) => a[0] - b[0])
            .map(([, l]) => l);
          resolve({ lines, bestmove: bestmove === "(none)" ? null : bestmove });
        }
      };
      this.lineHandlers.add(handler);

      this.send("ucinewgame");
      this.send(`setoption name MultiPV value ${multiPV}`);
      this.send(`position fen ${fen}`);
      this.send(`go depth ${depth}`);
    });
  }

  /** Convenience: the single best move in a position. */
  async bestMove(fen: string, depth = 20): Promise<string | null> {
    const { bestmove } = await this.analyze(fen, { depth, multiPV: 1 });
    return bestmove;
  }

  quit() {
    try {
      this.send("quit");
    } catch {
      /* ignore */
    }
    this.child.kill();
  }
}

/** Parse one `info ... multipv N ... score (cp|mate) X ... pv MOVE ...` line. */
function parseInfoLine(line: string): { multipv: number; line: Line } | null {
  const mp = line.match(/\bmultipv (\d+)/);
  const sc = line.match(/\bscore (cp|mate) (-?\d+)/);
  const pv = line.match(/\bpv (\S+)/);
  if (!sc || !pv) return null;
  const multipv = mp ? Number(mp[1]) : 1;
  const score: Score =
    sc[1] === "mate" ? { mate: Number(sc[2]) } : { cp: Number(sc[2]) };
  return { multipv, line: { move: pv[1], score } };
}

// Lazy singleton so the validator shares one engine process.
let singleton: Engine | null = null;
export function getEngine(): Engine {
  if (!singleton) singleton = new Engine();
  return singleton;
}
export function quitEngine() {
  singleton?.quit();
  singleton = null;
}
