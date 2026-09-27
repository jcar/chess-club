import { describe, expect, it } from "vitest";
import { materialGain, winningMoves } from "@/lib/chess/tactics";
import { board } from "@/content/authoring";
import { puzzleExercises, puzzleLine } from "@/content/puzzles";
import { answerLabel } from "@/lib/exercise/answers";

describe("tactic verifier", () => {
  it("sees a knight fork of king and queen", () => {
    const fen = board({ K: "g1", N: "d5", P: ["f2", "g2", "h2"], k: "g8", q: "c8", p: ["f7", "g7", "h7"] });
    expect(winningMoves(fen)).toEqual(["d5e7"]);
    expect(materialGain(fen, "d5e7")).toBeGreaterThanOrEqual(6);
  });

  it("doesn't count a protected capture as a win", () => {
    const fen = board({ K: "g1", Q: "d1", k: "g8", n: "d5", p: "e6" });
    expect(materialGain(fen, "d1d5")).toBeLessThan(0);
  });

  it("scores checkmate as a win", () => {
    expect(winningMoves(board({ K: "g1", R: "a1", k: "g8", p: ["f7", "g7", "h7"] }))).toContain("a1a8");
  });
});

describe("Lichess puzzles", () => {
  it("each theme has puzzles, easiest first, with the solver to move", () => {
    for (const t of ["mateIn1", "hangingPiece", "fork", "pin", "skewer"] as const) {
      const list = puzzleExercises(t);
      expect(list.length).toBeGreaterThanOrEqual(40);
      const first = list[0];
      expect(first.kind).toBe("move");
      expect(first.orientation).toBe(first.fen!.split(" ")[1] === "w" ? "white" : "black");
    }
  });

  it("answer keys show the full Lichess line", () => {
    const ex = puzzleExercises("fork")[0];
    const line = puzzleLine(ex.id)!.line;
    expect(answerLabel(ex)).toBe(line.join(" "));
  });
});
