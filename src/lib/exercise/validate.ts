// Content checks, run by `npm run validate` and by the unit tests. Every
// problem is a string; an empty list means the lesson is safe to ship.

import type { Exercise, Lesson } from "@/content/types";
import { isSandbox, load, movesMeeting, turnOf } from "@/lib/chess/rules";
import { answerFor } from "./answers";

const SQUARE = /^[a-h][1-8]$/;

export function validateExercise(ex: Exercise, where: string): string[] {
  const errs: string[] = [];
  const at = `${where}/${ex.id}`;
  const fen = ex.fen;
  if (fen) {
    try {
      load(fen);
    } catch (e) {
      return [`${at}: bad FEN (${(e as Error).message})`];
    }
  }
  for (const sq of ex.kidMarks ?? []) if (!SQUARE.test(sq)) errs.push(`${at}: bad kidMark ${sq}`);
  if (!ex.prompt.text.trim()) errs.push(`${at}: empty prompt`);

  switch (ex.kind) {
    case "reach": {
      if (!load(ex.fen).get(ex.square as never)) errs.push(`${at}: no piece on ${ex.square}`);
      else if (answerFor(ex).kind === "squares" && (answerFor(ex) as { squares: string[] }).squares.length === 0) errs.push(`${at}: piece can't move`);
      break;
    }
    case "stars": {
      const piece = load(ex.fen).get(ex.square as never);
      if (!piece) errs.push(`${at}: no piece on ${ex.square}`);
      if (!ex.stars.length) errs.push(`${at}: no stars`);
      for (const s of ex.stars) {
        if (!SQUARE.test(s)) errs.push(`${at}: bad star ${s}`);
        else if (load(ex.fen).get(s as never)) errs.push(`${at}: star on an occupied square ${s}`);
      }
      try {
        answerFor(ex);
      } catch (e) {
        errs.push(`${at}: ${(e as Error).message}`);
      }
      break;
    }
    case "tap":
      if (!ex.answers.length) errs.push(`${at}: no answers`);
      for (const s of ex.answers) if (!SQUARE.test(s)) errs.push(`${at}: bad square ${s}`);
      break;
    case "choice":
      if (ex.options.length < 2) errs.push(`${at}: needs 2+ options`);
      if (!(ex.answer >= 0 && ex.answer < ex.options.length)) errs.push(`${at}: answer index out of range`);
      break;
    case "move": {
      if (!ex.answers.length) {
        errs.push(`${at}: no answers`);
        break;
      }
      if (ex.goal === "check" || ex.goal === "mate") {
        if (isSandbox(ex.fen)) errs.push(`${at}: "${ex.goal}" needs both kings on the board`);
      }
      if (ex.goal === "escape" && !load(ex.fen).inCheck()) errs.push(`${at}: "escape" but the side to move isn't in check`);
      const legal = movesMeeting(ex.fen, "any");
      const meeting = movesMeeting(ex.fen, ex.goal);
      // A promotion is four moves (=Q, =R, =B, =N); the app always promotes to a
      // queen, so compare on from+to only.
      const same = (a: string, b: string) => a.slice(0, 4) === b.slice(0, 4);
      for (const a of ex.answers) {
        if (!legal.some((m) => same(m, a))) errs.push(`${at}: ${a} is not legal for ${turnOf(ex.fen) === "w" ? "White" : "Black"}`);
        else if (!meeting.some((m) => same(m, a))) errs.push(`${at}: ${a} does not meet goal "${ex.goal}"`);
      }
      // The key must be complete, or a kid who finds another correct move gets
      // marked wrong (and so does the worksheet). Mate is never strict.
      if (ex.goal !== "any" && (!ex.strict || ex.goal === "mate")) {
        const missing = [...new Set(meeting.filter((m) => !ex.answers.some((a) => same(m, a))).map((m) => m.slice(0, 4)))];
        if (missing.length) errs.push(`${at}: answer key is missing ${ex.goal} move(s) ${missing.join(", ")}`);
      }
      break;
    }
  }
  return errs;
}

export function validateLesson(lesson: Lesson): string[] {
  const errs: string[] = [];
  const where = lesson.id;
  if (!lesson.practice.length) errs.push(`${where}: no practice`);
  if (!lesson.check.length) errs.push(`${where}: no pass check`);
  if (lesson.passMark < 1 || lesson.passMark > lesson.check.length) errs.push(`${where}: passMark ${lesson.passMark} out of range`);
  const ids = new Set<string>();
  for (const ex of [...lesson.practice, ...lesson.check]) {
    if (ids.has(ex.id)) errs.push(`${where}: duplicate exercise id ${ex.id}`);
    ids.add(ex.id);
    errs.push(...validateExercise(ex, where));
  }
  for (const beat of lesson.script) {
    if (beat.demo) {
      try {
        load(beat.demo.fen);
      } catch {
        errs.push(`${where}: bad demo FEN in "${beat.say.slice(0, 30)}…"`);
      }
    }
  }
  if (lesson.activity.fen) {
    try {
      load(lesson.activity.fen);
    } catch {
      errs.push(`${where}: bad activity FEN`);
    }
  }
  return errs;
}
