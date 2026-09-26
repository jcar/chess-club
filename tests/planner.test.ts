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
    for (const minutes of [45, 60] as const) {
      for (const n of [0, 1, 5, 12]) {
        const c = clubWith(n);
        const plan = planSession(c, c.kids.map((k) => k.id), { minutes, ipads: 0 });
        expect(plan.agenda.reduce((t, i) => t + i.minutes, 0)).toBe(minutes);
      }
    }
  });
});
