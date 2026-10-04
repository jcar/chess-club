// The curriculum ladder. Steps are by skill, not age: a new 6th grader starts
// at Step 1 like everyone else, and a strong 2nd grader can be on Step 5.

import type { Lesson, Step } from "./types";
import { step1 } from "./lessons/step-1";
import { step2 } from "./lessons/step-2";
import { step3 } from "./lessons/step-3";
import { step4 } from "./lessons/step-4";
import { step5 } from "./lessons/step-5";
import { step6 } from "./lessons/step-6";
import { step7 } from "./lessons/step-7";
import { step8 } from "./lessons/step-8";
import { step9 } from "./lessons/step-9";

export const STEPS: Step[] = [
  {
    n: 1,
    title: "Meet the Pieces",
    kidTitle: "Meet the Pieces",
   
    summary: "The board, how every piece moves and captures, and setting up.",
    lessons: step1,
  },
  { n: 2, title: "Capture & Count", kidTitle: "Capture & Count", summary: "Piece values, free pieces, good and bad trades, and reading moves.", lessons: step2 },
  { n: 3, title: "Check & Checkmate", kidTitle: "Check & Checkmate", summary: "Giving check, the three ways out of check, and checkmate in one.", lessons: step3 },
  { n: 4, title: "Special Rules & Draws", kidTitle: "Special Moves", summary: "Castling, promotion, en passant, and every way a game can be drawn.", lessons: step4 },
  { n: 5, title: "Finish the Game", kidTitle: "Finish the Game", summary: "The ladder mate and checkmating with king and queen or king and rook.", lessons: step5 },
  { n: 6, title: "Tactics I + CCA", kidTitle: "Tricks & Traps", summary: "Forks, pins and skewers, and the Checks-Captures-Attacks habit.", lessons: step6 },
  { n: 7, title: "Starting Well", kidTitle: "Starting Well", summary: "Center, develop, castle; opening traps; a first plan with each color.", lessons: step7 },
  { n: 8, title: "Club Player", kidTitle: "Club Player", summary: "Discovered attacks, overloaded defenders, in-between moves; pawn and rook endings; weak pawns.", lessons: step8 },
  { n: 9, title: "Advanced Track", kidTitle: "Advanced Track", summary: "Imbalances, bishops vs. knights, pawn chains, open files, holes and space.", lessons: step9 },
];

export const ALL_LESSONS: Lesson[] = STEPS.flatMap((s) => s.lessons);

export function getStep(n: number): Step | undefined {
  return STEPS.find((s) => s.n === n);
}

export function getLesson(id: string): Lesson | undefined {
  return ALL_LESSONS.find((l) => l.id === id);
}

/** Lessons before/after in ladder order, for next/previous navigation. */
export function neighbors(id: string): { prev?: Lesson; next?: Lesson } {
  const i = ALL_LESSONS.findIndex((l) => l.id === id);
  return { prev: ALL_LESSONS[i - 1], next: ALL_LESSONS[i + 1] };
}
