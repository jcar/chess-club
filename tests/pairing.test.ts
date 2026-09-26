import { describe, expect, it } from "vitest";
import { ladderPairings, roundRobin, swissRound, updateLadder } from "@/lib/club/pairing";
import type { GameResult } from "@/lib/club/model";

const ids = (n: number) => Array.from({ length: n }, (_, i) => `k${i}`);

describe("round robin", () => {
  for (const n of [2, 5, 6, 9]) {
    it(`${n} kids: everyone meets everyone exactly once`, () => {
      const rounds = roundRobin(ids(n));
      const met = new Map<string, number>();
      for (const r of rounds) {
        const seen = new Set<string>();
        for (const p of r) {
          for (const k of [p.white, p.black]) if (k) {
            expect(seen.has(k)).toBe(false); // nobody plays twice in a round
            seen.add(k);
          }
          if (p.black) {
            const key = [p.white, p.black].sort().join("-");
            met.set(key, (met.get(key) ?? 0) + 1);
          }
        }
      }
      expect(met.size).toBe((n * (n - 1)) / 2);
      expect([...met.values()].every((v) => v === 1)).toBe(true);
    });
  }
});

describe("swiss", () => {
  it("avoids rematches and gives the bye to a low scorer", () => {
    const kids = ids(5);
    const games: GameResult[] = [
      { id: "1", date: "d", white: "k0", black: "k1", result: "1-0" },
      { id: "2", date: "d", white: "k2", black: "k3", result: "1-0" },
    ];
    const round = swissRound(kids, games, ["k4"]);
    const bye = round.find((p) => p.black === null)!;
    expect(["k1", "k3"]).toContain(bye.white);
    for (const p of round) if (p.black) expect(games.some((g) => [g.white, g.black].sort().join() === [p.white, p.black].sort().join())).toBe(false);
    const top = round.find((p) => p.white === "k0" || p.black === "k0")!;
    expect([top.white, top.black]).toContain("k2"); // the two winners meet
  });
});

describe("ladder", () => {
  it("pairs neighbours among kids who are here", () => {
    expect(ladderPairings(["a", "b", "c", "d", "e"], ["a", "b", "d", "e"])).toEqual([
      { white: "b", black: "a" },
      { white: "e", black: "d" },
    ]);
  });
  it("a win against a higher rung takes that rung", () => {
    expect(updateLadder(["a", "b", "c", "d"], { white: "d", black: "b", result: "1-0" })).toEqual(["a", "d", "b", "c"]);
    expect(updateLadder(["a", "b"], { white: "b", black: "a", result: "0-1" })).toEqual(["a", "b"]);
    expect(updateLadder(["a", "b"], { white: "b", black: "a", result: "1/2" })).toEqual(["a", "b"]);
  });
});
