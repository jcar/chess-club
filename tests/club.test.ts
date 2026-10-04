import { describe, expect, it } from "vitest";
import { EMPTY_CLUB, addKid, applyTransfer, currentStep, fillAnimals, mergeClub, parseClub, recordPass, type Club } from "@/lib/club/model";
import { parseRosterFragment, rosterFragment } from "@/lib/club/share";
import { STEPS } from "@/content/curriculum";

const L1 = STEPS[0].lessons[0].id;
const L2 = STEPS[0].lessons[1].id;

describe("club model", () => {
  it("keeps the first pass date", () => {
    let c = addKid({ ...EMPTY_CLUB }, "Ana");
    const id = c.kids[0].id;
    c = recordPass(c, id, L1, "ipad", "2026-09-01");
    c = recordPass(c, id, L1, "paper", "2026-09-08");
    expect(c.passes[id][L1]).toEqual({ date: "2026-09-01", via: "ipad" });
  });

  it("merges an iPad copy without losing anything", () => {
    let teacher = addKid(addKid({ ...EMPTY_CLUB }, "Ana"), "Ben");
    const [ana, ben] = teacher.kids;
    // The iPad got the roster, then kids passed lessons on it and a new kid was added there.
    let ipad: Club = structuredClone(teacher);
    teacher = recordPass(teacher, ana.id, L1, "teacher", "2026-09-10");
    ipad = recordPass(ipad, ben.id, L1, "ipad", "2026-09-10");
    ipad = recordPass(ipad, ben.id, L2, "ipad", "2026-09-10");
    ipad = recordPass(ipad, ana.id, L1, "ipad", "2026-09-03");
    ipad = addKid(ipad, "Cy");
    const { club, added } = mergeClub(teacher, ipad);
    expect(added).toEqual({ kids: 1, passes: 2, games: 0 }); // Ana's L1 already existed
    expect(club.kids.map((k) => k.name)).toEqual(["Ana", "Ben", "Cy"]);
    expect(Object.keys(club.passes[ben.id]).sort()).toEqual([L1, L2].sort());
    expect(club.passes[ana.id][L1].date).toBe("2026-09-03"); // earliest wins
    expect(club.ladder).toHaveLength(3);
  });

  it("matches kids by name when ids differ", () => {
    const a = addKid({ ...EMPTY_CLUB }, "Ana");
    const b = recordPass(addKid({ ...EMPTY_CLUB }, "ana "), "zzz", L1, "ipad");
    const bKid = b.kids[0];
    const withPass = recordPass(b, bKid.id, L1, "ipad");
    const { club } = mergeClub(a, withPass);
    expect(club.kids).toHaveLength(1);
    expect(club.passes[a.kids[0].id][L1]).toBeDefined();
  });

  it("places kids who already know the early steps", () => {
    let c = addKid({ ...EMPTY_CLUB }, "Ana");
    expect(currentStep(c, c.kids[0])).toBe(1);
    c = { ...c, kids: [{ ...c.kids[0], placedAt: 2 }] };
    expect(currentStep(c, c.kids[0])).toBe(2);
  });

  it("rejects files that aren't club exports", () => {
    expect(() => parseClub("{}")).toThrow(/isn't a Chess Club Kit export/);
    expect(() => parseClub("not json")).toThrow();
    expect(parseClub(JSON.stringify(addKid({ ...EMPTY_CLUB }, "Ana"))).kids[0].name).toBe("Ana");
  });

  it("round-trips a roster link (names only, no progress)", () => {
    let c = addKid(addKid({ ...EMPTY_CLUB, name: "Oak Elementary" }, "Zoë"), "Ben");
    c = recordPass(c, c.kids[0].id, L1, "ipad");
    const back = parseRosterFragment("#" + rosterFragment(c))!;
    expect(back.name).toBe("Oak Elementary");
    expect(back.kids.map((k) => k.name)).toEqual(["Zoë", "Ben"]);
    expect(back.passes).toEqual({});
    expect(parseRosterFragment("#roster=!!!")).toBeNull();
  });
});

describe("easy reading", async () => {
  const { isEarlyReader } = await import("@/lib/young");
  it("is the kid's own setting first, then a K–2 guess, then the device", () => {
    expect(isEarlyReader({ grade: "6", earlyReader: true }, false)).toBe(true);
    expect(isEarlyReader({ grade: "1", earlyReader: false }, true)).toBe(false);
    expect(isEarlyReader({ grade: "K" }, false)).toBe(true);
    expect(isEarlyReader({ grade: "6" }, false)).toBe(false);
    expect(isEarlyReader(null, true)).toBe(true);
  });
  it("survives the roster link", () => {
    const c = addKid(addKid({ ...EMPTY_CLUB }, "Ana", "6"), "Ben", "1");
    c.kids[0].earlyReader = true;
    const back = parseRosterFragment("#" + rosterFragment(c))!;
    expect(back.kids.map((k) => k.earlyReader)).toEqual([true, undefined]);
  });
});

describe("animals", () => {
  it("every new kid gets a different animal, and old files get filled in", () => {
    let c: Club = { ...EMPTY_CLUB };
    for (const n of ["Ana", "Ben", "Cy"]) c = addKid(c, n);
    expect(new Set(c.kids.map((k) => k.animal)).size).toBe(3);
    const old = { ...c, kids: c.kids.map((k) => ({ ...k, animal: undefined })) };
    const filled = fillAnimals(old);
    expect(filled.kids.every((k) => k.animal)).toBe(true);
    expect(new Set(filled.kids.map((k) => k.animal)).size).toBe(3);
  });
  it("the roster link carries animals", () => {
    const c = addKid({ ...EMPTY_CLUB }, "Ana");
    expect(parseRosterFragment("#" + rosterFragment(c))!.kids[0].animal).toBe(c.kids[0].animal);
  });
});

describe("merging kids who share a first name", () => {
  it("keeps two different Mayas apart, but still matches a lone Maya by name", () => {
    let a: Club = addKid({ ...EMPTY_CLUB }, "Maya");
    let b: Club = addKid({ ...EMPTY_CLUB }, "Maya");
    b = addKid(b, "Maya");
    // Two incoming Mayas: we can't tell which (if either) is ours, so all three stay.
    expect(mergeClub(a, b).club.kids).toHaveLength(3);
    a = addKid({ ...EMPTY_CLUB }, "Leo");
    const other = addKid({ ...EMPTY_CLUB }, "leo ");
    expect(mergeClub(a, other).club.kids).toHaveLength(1);
  });
});

describe("applyTransfer", () => {
  it("records a scanned pass and marks the kid present", () => {
    const c = addKid({ ...EMPTY_CLUB }, "Ana");
    const id = c.kids[0].id;
    const { club, applied } = applyTransfer(c, { kind: "pass", date: "2026-10-08", lesson: L1, kidId: id });
    expect(club.passes[id][L1]).toEqual({ date: "2026-10-08", via: "ipad" });
    expect(club.attendance["2026-10-08"]).toEqual([id]);
    expect(applied).toEqual({ passes: 1, present: 1 });
  });
  it("applies a helper batch, skipping unknown kids, and is idempotent", () => {
    let c = addKid({ ...EMPTY_CLUB }, "Ana");
    c = addKid(c, "Ben");
    const [a, b] = c.kids.map((k) => k.id);
    const t = { kind: "batch" as const, date: "2026-10-08", present: [a, b, "nobody"], passes: [[a, L1], [b, L2], ["nobody", L1]] as [string, string][] };
    const once = applyTransfer(c, t);
    expect(once.applied).toEqual({ passes: 2, present: 2 });
    expect(applyTransfer(once.club, t).applied).toEqual({ passes: 0, present: 0 });
  });
  it("an anonymous pass needs the adult to pick the kid", () => {
    const c = addKid({ ...EMPTY_CLUB }, "Ana");
    const t = { kind: "pass" as const, date: "2026-10-08", lesson: L1 };
    expect(applyTransfer(c, t).applied.passes).toBe(0);
    expect(applyTransfer(c, t, c.kids[0].id).applied.passes).toBe(1);
  });
});
