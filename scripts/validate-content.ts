// npm run validate: checks every lesson in the curriculum against the rules
// of chess (legal answers, complete answer keys, reachable stars), then asks
// Stockfish about "best" moves and hand-written "any" answers.
import { ALL_LESSONS, STEPS } from "@/content/curriculum";
import { validateExercise, validateLesson } from "@/lib/exercise/validate";
import { puzzleExercises, type PuzzleTheme } from "@/content/puzzles";
import { engineErrors, quitEngines, saveCache } from "./lib/engineCheck";

const ids = new Set<string>();
const errs: string[] = [];
for (const l of ALL_LESSONS) {
  if (ids.has(l.id)) errs.push(`duplicate lesson id ${l.id}`);
  ids.add(l.id);
  const step = STEPS.find((s) => s.n === l.step);
  if (!step?.lessons.includes(l)) errs.push(`${l.id}: listed under the wrong step`);
  errs.push(...validateLesson(l));
}
// Lichess extra-practice sets, once per theme.
const themes = new Set(ALL_LESSONS.map((l) => l.extra).filter(Boolean) as PuzzleTheme[]);
let puzzles = 0;
for (const t of themes) for (const ex of puzzleExercises(t)) {
  puzzles++;
  errs.push(...validateExercise(ex, `puzzles/${t}`));
}
const exercises = ALL_LESSONS.reduce((n, l) => n + l.practice.length + l.check.length, 0);

// Engine pass (skipped where the rules check already failed, to keep errors readable).
async function engine() {
  const jobs = ALL_LESSONS.flatMap((l) => [...l.practice, ...l.check].map((ex) => engineErrors(ex, l.id)));
  const found = await Promise.all(jobs);
  saveCache();
  quitEngines();
  return found.flat();
}

async function main() {
  if (!errs.length) errs.push(...(await engine()));
  report();
}

function report() {
  if (!errs.length) {
    console.log(`✓ ${ALL_LESSONS.length} lessons, ${exercises} exercises, ${puzzles} Lichess puzzles valid.`);
    return;
  }
  console.error(errs.map((e) => `✗ ${e}`).join("\n"));
  console.error(`\n${errs.length} problem(s).`);
  process.exit(1);
}

main();
