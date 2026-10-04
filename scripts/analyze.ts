// npm run analyze -- "<fen>" [depth]: every legal move with its Stockfish score,
// best first. For writing "best" exercises: pick positions with a clear answer.
// Also accepts a move list from the start: npm run analyze -- "e4 e5 Nf3".
import { after } from "@/content/authoring";
import { load } from "@/lib/chess/rules";
import { DEPTH, quitEngines, saveCache, scoreMoves } from "./lib/engineCheck";

async function main() {
  const [arg, d] = process.argv.slice(2);
  if (!arg) {
    console.error('usage: npm run analyze -- "<fen or moves>" [depth]');
    process.exit(1);
  }
  const fen = arg.split("/").length === 8 ? arg : after(arg);
  const scores = await scoreMoves(fen, Number(d) || DEPTH);
  saveCache();
  quitEngines();
  console.log(fen);
  for (const [m, cp] of Object.entries(scores).sort((a, b) => b[1] - a[1])) {
    const san = load(fen).move({ from: m.slice(0, 2), to: m.slice(2, 4), promotion: "q" }).san;
    console.log(`${san.padEnd(8)} ${m.padEnd(6)} ${cp}`);
  }
}

main();
