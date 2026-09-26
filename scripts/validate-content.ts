// npm run validate: checks every lesson in the curriculum against the rules
// of chess (legal answers, complete answer keys, reachable stars).
import { ALL_LESSONS, STEPS } from "@/content/curriculum";
import { validateLesson } from "@/lib/exercise/validate";

const ids = new Set<string>();
const errs: string[] = [];
for (const l of ALL_LESSONS) {
  if (ids.has(l.id)) errs.push(`duplicate lesson id ${l.id}`);
  ids.add(l.id);
  const step = STEPS.find((s) => s.n === l.step);
  if (!step?.lessons.includes(l)) errs.push(`${l.id}: listed under the wrong step`);
  errs.push(...validateLesson(l));
}
const exercises = ALL_LESSONS.reduce((n, l) => n + l.practice.length + l.check.length, 0);
if (errs.length) {
  console.error(errs.map((e) => `✗ ${e}`).join("\n"));
  console.error(`\n${errs.length} problem(s).`);
  process.exit(1);
}
console.log(`✓ ${ALL_LESSONS.length} lessons, ${exercises} exercises valid.`);
