// Stockfish checks for "best" exercises (scripts/lib/engineCheck.ts). Spawns
// the engine, so it only runs with ENGINE=1 (npm run validate covers the content).
import { afterAll, describe, expect, it } from "vitest";
import { after, board } from "@/content/authoring";
import type { MoveExercise } from "@/content/types";
import { engineErrors, quitEngines } from "../scripts/lib/engineCheck";

const ex = (e: Partial<MoveExercise> & Pick<MoveExercise, "fen" | "answers">): MoveExercise => ({ id: "x", kind: "move", goal: "best", prompt: { text: "t" }, ...e });

describe.skipIf(!process.env.ENGINE)("engine check", () => {
  afterAll(() => quitEngines());

  it("keeps win: the key must be exactly the winning king moves", async () => {
    const fen = board({ K: "e3", P: "e2", k: "e6" });
    expect(await engineErrors(ex({ fen, keeps: "win", answers: ["e3e4", "e3d4", "e3f4"] }), "t")).toEqual([]);
    expect((await engineErrors(ex({ fen, keeps: "win", answers: ["e3e4"] }), "t")).join()).toMatch(/missing/);
    expect((await engineErrors(ex({ fen, keeps: "win", answers: ["e3e4", "e3d3"] }), "t")).join()).toMatch(/not best/);
  }, 120_000);

  it("keeps draw: the defender must take the opposition", async () => {
    const fen = board({ K: "d5", P: "e4", k: "e7" }, "b");
    expect(await engineErrors(ex({ fen, keeps: "draw", answers: ["e7d7"] }), "t")).toEqual([]);
    expect((await engineErrors(ex({ fen, keeps: "draw", answers: ["e7e8"] }), "t")).join()).toMatch(/not best/);
  }, 120_000);

  it("margin: rejects a bad move even in a strict key", async () => {
    const fen = after("e4 e5");
    expect(await engineErrors(ex({ fen, strict: true, answers: ["g1f3"] }), "t")).toEqual([]);
    expect((await engineErrors(ex({ fen, strict: true, answers: ["d1h5"] }), "t")).join()).toMatch(/not best/);
  }, 120_000);
});
