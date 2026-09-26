import { describe, expect, it } from "vitest";
import { destinations, play } from "@/lib/chess/rules";
import { after, board } from "@/content/authoring";
import { outcome } from "@/lib/chess/minibot";
import { load } from "@/lib/chess/rules";

describe("special moves", () => {
  it("castling appears as a king move when rights are given", () => {
    const fen = board({ K: "e1", R: ["a1", "h1"], k: "e8" }, "w", "KQ");
    expect(destinations(fen, "e1")).toEqual(expect.arrayContaining(["g1", "c1"]));
    const p = play(fen, "e1", "g1")!;
    expect(p.san).toBe("O-O");
    expect(load(p.fen).get("f1" as never)).toMatchObject({ type: "r" });
    expect(destinations(board({ K: "e1", R: "h1", k: "e8" }), "e1")).not.toContain("g1"); // no rights
  });

  it("keeps the en-passant square so the capture is available", () => {
    const fen = after("e4 a6 e5 d5");
    expect(destinations(fen, "e5")).toContain("d6");
    const p = play(fen, "e5", "d6")!;
    expect(p.captured).toBe(true);
    expect(load(p.fen).get("d5" as never)).toBeFalsy();
  });

  it("auto-promotes to a queen", () => {
    expect(play(board({ P: "e7" }), "e7", "e8")!.uci).toBe("e7e8q");
  });
});

describe("mate mini-game", () => {
  const game = { win: "mate" as const, youPlay: "white" as const };
  it("checkmate wins, stalemate draws", () => {
    const g = load(board({ K: "b6", Q: "c3", k: "a8" }));
    const m = g.move("Qc8#");
    expect(outcome(g.fen(), m, game)).toBe("white");
    const s = load(board({ K: "b6", Q: "c3", k: "a8" }));
    const m2 = s.move("Qc7");
    expect(outcome(s.fen(), m2, game)).toBe("draw");
  });
});
