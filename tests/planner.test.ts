import { describe, expect, it } from "vitest";
import { planSession } from "@/lib/club/planner";
import { EMPTY_CLUB, addKid, recordPass, updateKid, type Club } from "@/lib/club/model";
import { STEPS } from "@/content/curriculum";

function clubWith(n: number): Club {
  let c: Club = { ...EMPTY_CLUB };
  for (let i = 0; i < n; i++) c = addKid(c, `Kid ${i}`, "3");
  return c;
}

describe("planSession", () => {
  it("puts new kids in one Step 1 group on the first lesson", () => {
    const c = clubWith(4);
    const plan = planSession(c, c.kids.map((k) => k.id), { minutes: 45, ipads: 0 });
    expect(plan.groups).toHaveLength(1);
    expect(plan.groups[0].step).toBe(1);
    expect(plan.groups[0].lesson.id).toBe(STEPS[0].lessons[0].id);
    expect(plan.groups[0].medium).toBe("paper");
    expect(plan.printList[0].copies).toBe(4);
  });

  it("teaches the lesson most of the group needs and notes kids who differ", () => {
    let c = clubWith(3);
    const [a, b] = c.kids;
    const l1 = STEPS[0].lessons[0].id;
    c = recordPass(c, a.id, l1, "teacher");
    c = recordPass(c, b.id, l1, "teacher");
    const plan = planSession(c, c.kids.map((k) => k.id), { minutes: 45, ipads: 10 });
    const g = plan.groups[0];
    expect(g.lesson.id).toBe(STEPS[0].lessons[1].id);
    expect(g.kids.filter((k) => k.own).map((k) => k.own!.id)).toEqual([l1]);
    expect(g.medium).toBe("ipad");
  });

  it("gives iPads to the lowest step first and paper to the rest", () => {
    let c = clubWith(4);
    c = updateKid(c, c.kids[2].id, { placedAt: 2 });
    c = updateKid(c, c.kids[3].id, { placedAt: 2 });
    const plan = planSession(c, c.kids.map((k) => k.id), { minutes: 60, ipads: 2 });
    expect(plan.groups.map((g) => [g.step, g.medium])).toEqual([
      [1, "ipad"],
      [2, "paper"],
    ]);
  });

  it("agenda always adds up to the session length", () => {
    for (let minutes = 30; minutes <= 90; minutes += 5) {
      for (const n of [0, 1, 5, 12]) {
        for (const adults of [["A"], ["A", "B"], ["A", "B", "C", "D"]]) {
          let c = clubWith(n);
          // Spread kids over three steps so there are several groups.
          c.kids.forEach((k, i) => (c = updateKid(c, k.id, { placedAt: (i % 3) + 1 })));
          const plan = planSession(c, c.kids.map((k) => k.id), { minutes, ipads: 3, adults });
          expect(plan.agenda.reduce((t, i) => t + i.minutes, 0), `${minutes}m ${n} kids ${adults.length} adults`).toBe(minutes);
        }
      }
    }
  });

  it("gives each group its own adult when there are enough", () => {
    let c = clubWith(6);
    c.kids.forEach((k, i) => (c = updateKid(c, k.id, { placedAt: (i % 3) + 1 })));
    const plan = planSession(c, c.kids.map((k) => k.id), { minutes: 45, ipads: 0, adults: ["Ms. Lopez", "Jason", "Ana"] });
    expect(plan.groups.map((g) => g.adult)).toEqual(["Ms. Lopez", "Jason", "Ana"]);
    expect(plan.groups.every((g) => g.taught)).toBe(true);
    expect(plan.agenda[1].title).toBe("Teach (each group with its adult)");
  });

  it("splits iPads inside a group and prints paper only for the rest", () => {
    const c = clubWith(5);
    const plan = planSession(c, c.kids.map((k) => k.id), { minutes: 45, ipads: 3 });
    expect(plan.groups[0]).toMatchObject({ medium: "mixed", ipads: 3 });
    expect(plan.printList[0].copies).toBe(2);
  });

  it("puts early readers in one whole group on the lowest step's lesson", () => {
    let c = clubWith(2); // grade 3: readers
    c = addKid(c, "Kinder", "K");
    c = addKid(c, "First", "1");
    c = updateKid(c, c.kids[3].id, { placedAt: 2 }); // a first grader who already knows Step 1
    c = updateKid(c, c.kids[1].id, { placedAt: 3 });
    const plan = planSession(c, c.kids.map((k) => k.id), { minutes: 45, ipads: 0, wholeGroup: true });
    const whole = plan.groups.find((g) => g.whole)!;
    expect(whole.kids.map((k) => k.kid.name).sort()).toEqual(["First", "Kinder"]);
    expect(whole.lesson.id).toBe(STEPS[0].lessons[0].id);
    expect(plan.groups[0]).toBe(whole); // first in line for iPads
  });

  it("lets the adult override a group's lesson", () => {
    const c = clubWith(3);
    const pawn = STEPS[0].lessons.find((l) => l.id === "s1-pawn")!;
    const plan = planSession(c, c.kids.map((k) => k.id), { minutes: 45, ipads: 0, overrides: { "step-1": pawn.id } });
    expect(plan.groups[0].lesson.id).toBe(pawn.id);
  });
});
