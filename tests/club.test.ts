import { describe, expect, it } from "vitest";
import { EMPTY_CLUB, addKid, currentStep, mergeClub, parseClub, recordPass, type Club } from "@/lib/club/model";
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
