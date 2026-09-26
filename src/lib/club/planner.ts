// The session planner: turns "who's here" into teaching groups and a timed
// agenda one adult can actually run. Groups are by step (skill), and the
// teacher rotates between them while the other groups practice or play.

import { STEPS, getLesson } from "@/content/curriculum";
import type { Lesson } from "@/content/types";
import { nextLesson, type Club, type Kid } from "./model";

export interface Group {
  step: number;
  lesson: Lesson; // what the teacher teaches this group
  kids: { kid: Kid; own?: Lesson }[]; // `own` = this kid's next lesson if it differs
  medium: "ipad" | "paper";
  /** False when there are more groups than one adult can teach; they practice on their own. */
  taught: boolean;
}

export interface AgendaItem {
  minutes: number;
  start: number; // minutes from the start
  title: string;
  detail: string;
}

export interface Plan {
  groups: Group[];
  agenda: AgendaItem[];
  /** Copies to print per lesson: worksheets for paper groups. */
  printList: { lesson: Lesson; copies: number }[];
  finished: Kid[]; // kids with nothing left to do (all written lessons passed)
}

export function planSession(club: Club, presentIds: string[], opts: { minutes: 45 | 60; ipads: number }): Plan {
  const kids = club.kids.filter((k) => presentIds.includes(k.id) && !k.archived);
  const byStep = new Map<number, { kid: Kid; next: Lesson }[]>();
  const finished: Kid[] = [];
  for (const kid of kids) {
    const n = nextLesson(club, kid);
    if (!n) {
      finished.push(kid);
      continue;
    }
    const lesson = getLesson(n.lessonId)!;
    if (!byStep.has(n.step)) byStep.set(n.step, []);
    byStep.get(n.step)!.push({ kid, next: lesson });
  }

  // Youngest steps first: they get the iPads (read-aloud helps non-readers most).
  let ipadsLeft = opts.ipads;
  const groups: Group[] = [...byStep.entries()]
    .sort(([a], [b]) => a - b)
    .map(([step, members]) => {
      // Teach the lesson the most kids in this group need; ties go to the earlier lesson.
      const stepLessons = STEPS.find((s) => s.n === step)!.lessons;
      const counts = new Map<string, number>();
      for (const m of members) counts.set(m.next.id, (counts.get(m.next.id) ?? 0) + 1);
      const lesson = [...stepLessons].sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0) || stepLessons.indexOf(a) - stepLessons.indexOf(b))[0];
      const medium: Group["medium"] = ipadsLeft >= members.length ? "ipad" : "paper";
      if (medium === "ipad") ipadsLeft -= members.length;
      return {
        step,
        lesson,
        medium,
        taught: true,
        kids: members.map((m) => ({ kid: m.kid, own: m.next.id === lesson.id ? undefined : m.next })),
      };
    });

  // One adult can teach about 3 groups in 45 minutes (4 in 60). Teach the biggest.
  const max = opts.minutes === 45 ? 3 : 4;
  if (groups.length > max) {
    const keep = new Set([...groups].sort((a, b) => b.kids.length - a.kids.length || a.step - b.step).slice(0, max));
    groups.forEach((g) => (g.taught = keep.has(g)));
  }

  return { groups, agenda: buildAgenda(groups, opts.minutes), printList: printList(groups), finished };
}

function buildAgenda(groups: Group[], total: 45 | 60): AgendaItem[] {
  const items: Omit<AgendaItem, "start">[] = [];
  items.push({ minutes: 5, title: "Welcome & set up", detail: "Kids set up boards (light on the right!) and mark attendance." });
  if (groups.length === 0) {
    items.push({ minutes: total - 10, title: "Free play", detail: "Add kids who are here to get a plan." });
  } else if (groups.length === 1) {
    const g = groups[0];
    items.push({ minutes: g.lesson.minutes, title: `Teach: ${g.lesson.title}`, detail: "Everyone together. Use Present mode or a demo board." });
    items.push({ minutes: g.lesson.activity.minutes, title: `Play: ${g.lesson.activity.title}`, detail: "Pairs at the tables." });
    items.push({ minutes: 8, title: "Practice & pass check", detail: g.medium === "ipad" ? "On the iPads." : "Worksheets." });
  } else {
    // The teacher teaches each group in turn (short version). Groups not being taught practice, then play their game.
    const taught = groups.filter((g) => g.taught);
    const teach = Math.max(6, Math.floor((total - 10 - 12) / taught.length));
    for (const g of taught) {
      const others = groups.filter((o) => o !== g).map((o) => `Step ${o.step}: ${o.medium === "ipad" ? "iPad practice" : "worksheet"} or ${o.lesson.activity.title}`);
      items.push({ minutes: teach, title: `Teach Step ${g.step}: ${g.lesson.title}`, detail: `Others: ${others.join("; ")}.` });
    }
    items.push({ minutes: 12, title: "Club games", detail: "Everyone plays a real game: ladder or casual. Kids who finish do pass checks." });
  }
  // Long lessons can overrun a short session: shrink the middle items to fit.
  const budget = total - 10; // minus welcome and wrap-up
  const middle = items.slice(1);
  const want = middle.reduce((n, i) => n + i.minutes, 0);
  if (want > budget) {
    let spare = budget;
    middle.forEach((i, k) => {
      i.minutes = k === middle.length - 1 ? spare : Math.max(3, Math.floor((i.minutes * budget) / want));
      spare -= i.minutes;
    });
  }
  const used = items.reduce((n, i) => n + i.minutes, 0);
  const left = total - used - 5;
  if (left > 0) items.push({ minutes: left, title: "Free play", detail: "Casual games. Walk around and watch for the lesson's common mistakes." });
  items.push({ minutes: 5, title: "Wrap-up", detail: "Clean up. Ask: what did we learn today? Collect worksheets and pass codes." });

  let t = 0;
  return items.map((i) => {
    const a = { ...i, start: t };
    t += i.minutes;
    return a;
  });
}

function printList(groups: Group[]): Plan["printList"] {
  const copies = new Map<string, { lesson: Lesson; copies: number }>();
  for (const g of groups) {
    if (g.medium !== "paper") continue;
    for (const { own } of g.kids) {
      const l = own ?? g.lesson;
      const e = copies.get(l.id) ?? { lesson: l, copies: 0 };
      e.copies++;
      copies.set(l.id, e);
    }
  }
  return [...copies.values()];
}
