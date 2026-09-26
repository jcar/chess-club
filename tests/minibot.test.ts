import { describe, expect, it } from "vitest";
import { botMove, outcome } from "@/lib/chess/minibot";
import { board } from "@/content/authoring";
import { load } from "@/lib/chess/rules";

const fixed = () => 0.99; // never sloppy, no jitter surprises

describe("minibot", () => {
  it("promotes when it can", () => {
    expect(botMove(board({ p: ["a2", "h7"], R: "d4" }, "b"), fixed, 0)).toBe("a2a1q");
  });
  it("captures a free piece", () => {
    expect(botMove(board({ p: ["d5", "h7"], R: "e4" }, "b"), fixed, 0)).toBe("d5e4");
  });
  it("doesn't walk a pawn into a free capture", () => {
    const m = botMove(board({ p: ["c7", "h7"], R: "c5" }, "b"), fixed, 0);
    expect(m).not.toBe("c7c6");
  });
  it("detects wins", () => {
    const g = load(board({ P: "a7", p: "h7" }));
    const m = g.move({ from: "a7", to: "a8", promotion: "q" });
    expect(outcome(g.fen(), m, { win: "promote", youPlay: "white" })).toBe("white");
    const g2 = load(board({ R: "a1", p: "a5" }));
    const m2 = g2.move({ from: "a1", to: "a5" });
    expect(outcome(g2.fen(), m2, { win: "captureAll", youPlay: "white" })).toBe("white");
  });
});
