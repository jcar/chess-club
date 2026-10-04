import { describe, expect, it } from "vitest";
import { parseStationFragment, stationFragment, type Station } from "@/lib/station";
import { parseTransfer, transferFragment, type Transfer } from "@/lib/transfer";

const station: Station = {
  club: "Lakewood Chess",
  date: "2026-10-08",
  lesson: "s1-rook",
  lock: true,
  easy: true,
  pin: "1234",
  kids: [
    { id: "a1", name: "Maya", animal: "🐶" },
    { id: "b2", name: "José", animal: "🦊" },
  ],
};

describe("station links", () => {
  it("round-trips, including accents and emoji", () => {
    expect(parseStationFragment("#" + stationFragment(station))).toEqual(station);
  });
  it("rejects a mangled or foreign fragment", () => {
    const frag = stationFragment(station);
    expect(parseStationFragment("#" + frag.replace(/.$/, frag.endsWith("A") ? "B" : "A"))).toBeNull();
    expect(parseStationFragment("#roster=abc")).toBeNull();
    expect(parseStationFragment("")).toBeNull();
  });
  it("keeps optional fields optional", () => {
    const s: Station = { club: "C", date: "2026-10-08", lock: false, easy: false, kids: [] };
    expect(parseStationFragment(stationFragment(s))).toEqual(s);
  });
});

describe("result transfers", () => {
  const pass: Transfer = { kind: "pass", date: "2026-10-08", lesson: "s1-rook", kidId: "a1", name: "Maya", animal: "🐶", stars: 3 };
  const batch: Transfer = { kind: "batch", date: "2026-10-08", present: ["a1", "b2"], passes: [["a1", "s1-rook"]], from: "Ms. Lopez" };
  it("round-trips pass and batch codes, from a bare fragment or a whole URL", () => {
    expect(parseTransfer("#" + transferFragment(pass))).toEqual(pass);
    expect(parseTransfer(`https://x.github.io/chess-club/teach/wrapup/#${transferFragment(batch)}`)).toEqual(batch);
  });
  it("an anonymous pass has no kid", () => {
    const anon: Transfer = { kind: "pass", date: "2026-10-08", lesson: "s1-pawn" };
    expect(parseTransfer(transferFragment(anon))).toEqual(anon);
  });
  it("rejects a bad checksum", () => {
    const f = transferFragment(pass);
    expect(parseTransfer(f.slice(0, -2) + "ZZ")).toBeNull();
    expect(parseTransfer("hello")).toBeNull();
  });
});
