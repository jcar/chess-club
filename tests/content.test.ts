import { describe, expect, it } from "vitest";
import { ALL_LESSONS, STEPS } from "@/content/curriculum";
import { validateLesson } from "@/lib/exercise/validate";
import { answerFor } from "@/lib/exercise/answers";
import { board } from "@/content/authoring";

describe("curriculum", () => {
  // Slow: "win" exercises run a small material search.
  it("every lesson passes validation", () => {
    for (const l of ALL_LESSONS) expect(validateLesson(l), l.id).toEqual([]);
  }, 120_000);

  it("lesson ids are unique and steps are numbered 1..9", () => {
    expect(new Set(ALL_LESSONS.map((l) => l.id)).size).toBe(ALL_LESSONS.length);
    expect(STEPS.map((s) => s.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
});

describe("validator catches bad content", () => {
  const base = { id: "x", prompt: { text: "Do it" } };
  const lesson = (ex: object) => ({ ...ALL_LESSONS[0], id: "t", check: [ex], practice: [{ ...ex, id: "p" }], passMark: 1 }) as never;

  it("flags an illegal answer", () => {
    const errs = validateLesson(lesson({ ...base, kind: "move", goal: "capture", fen: board({ R: "a1", p: "a5" }), answers: ["a1b2"] }));
    expect(errs.join()).toMatch(/not legal/);
  });

  it("flags an incomplete capture key unless strict", () => {
    const ex = { ...base, kind: "move", goal: "capture", fen: board({ R: "a1", p: ["a5", "e1"] }), answers: ["a1a5"] };
    expect(validateLesson(lesson(ex)).join()).toMatch(/missing capture/);
    expect(validateLesson(lesson({ ...ex, strict: true }))).toEqual([]);
  });

  it("checks only legality for \"best\" (Stockfish judges it in npm run validate)", () => {
    const fen = board({ K: "e3", P: "e2", k: "e6" });
    expect(validateLesson(lesson({ ...base, kind: "move", goal: "best", keeps: "win", fen, answers: ["e3e4"] }))).toEqual([]);
    expect(validateLesson(lesson({ ...base, kind: "move", goal: "best", fen, answers: ["e3e5"] })).join()).toMatch(/not legal/);
  });

  it("flags \"best\" without kings and misused margin/keeps", () => {
    expect(validateLesson(lesson({ ...base, kind: "move", goal: "best", fen: board({ R: "a1" }), answers: ["a1a8"] })).join()).toMatch(/needs both kings/);
    const fen = board({ K: "e3", P: "e2", k: "e6" });
    expect(validateLesson(lesson({ ...base, kind: "move", goal: "any", margin: 50, fen, answers: ["e3e4"] })).join()).toMatch(/only apply to goal "best"/);
    expect(validateLesson(lesson({ ...base, kind: "move", goal: "best", margin: 50, keeps: "win", fen, answers: ["e3e4"] })).join()).toMatch(/not both/);
  });

  it("flags mate exercises without kings", () => {
    const errs = validateLesson(lesson({ ...base, kind: "move", goal: "mate", fen: board({ Q: "a1" }), answers: ["a1a8"] }));
    expect(errs.join()).toMatch(/needs both kings/);
  });
});

describe("answers", () => {
  it("derives reach squares from the rules", () => {
    const a = answerFor({ id: "r", kind: "reach", fen: board({ N: "a1" }), square: "a1", prompt: { text: "" } });
    expect(a).toEqual({ kind: "squares", squares: ["b3", "c2"] });
  });
  it("finds the fewest moves to the stars", () => {
    const a = answerFor({ id: "s", kind: "stars", fen: board({ R: "a1" }), square: "a1", stars: ["h8"], prompt: { text: "" } });
    expect(a).toEqual({ kind: "fewest", moves: 2 });
  });
});
