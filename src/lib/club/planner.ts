// The session planner: turns "who's coming" into teaching groups and a timed
// agenda the adults can actually run. Groups are by step (skill). Early
// readers can learn together as one whole group, whatever their step. Each
// group gets an adult; with fewer adults than groups, adults rotate.

import { STEPS, getLesson } from "@/content/curriculum";
import type { Lesson } from "@/content/types";
import type { Warmup } from "@/content/warmups";
import { isEarlyReader } from "@/lib/young";
import { nextLesson, type Club, type Kid } from "./model";

export interface Group {
  /** Stable key for overrides: "early" or "step-N". */
  key: string;
  step: number;
  /** The whole early-reader group. */
  whole: boolean;
  lesson: Lesson; // what the adult teaches this group
  kids: { kid: Kid; own?: Lesson }[]; // `own` = this kid's next lesson if it differs
  /** iPads given to this group (0 = all paper). */
  ipads: number;
  medium: "ipad" | "paper" | "mixed";
  adult?: string;
  /** False when the adults can't get to every group; they practice on their own. */
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
  /** Copies to print per lesson: worksheets for kids without an iPad. */
  printList: { lesson: Lesson; copies: number }[];
  finished: Kid[]; // kids with nothing left to do (all written lessons passed)
}

export interface PlanOptions {
  /** Session length, 30–90 minutes. */
  minutes: number;
  ipads: number;
  /** Adult names (at least one is assumed). */
  adults?: string[];
  /** Put every early reader in one group on the same lesson. */
  wholeGroup?: boolean;
  /** Group key → lesson id to teach instead of the computed one. */
  overrides?: Record<string, string>;
  warmup?: Warmup;
}

export const MIN_MINUTES = 30;
export const MAX_MINUTES = 90;

/** The lesson most of these kids need; ties go to the earliest. */
function commonLesson(members: { next: Lesson }[]): Lesson {
  const order = STEPS.flatMap((s) => s.lessons);
  const counts = new Map<string, number>();
  for (const m of members) counts.set(m.next.id, (counts.get(m.next.id) ?? 0) + 1);
  return [...counts.keys()].map((id) => getLesson(id)!).sort((a, b) => counts.get(b.id)! - counts.get(a.id)! || order.indexOf(a) - order.indexOf(b))[0];
}

export function planSession(club: Club, presentIds: string[], opts: PlanOptions): Plan {
  const minutes = Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, Math.round(opts.minutes)));
  const adults = opts.adults?.filter((a) => a.trim()).length ? opts.adults.filter((a) => a.trim()) : ["Teacher"];
  const kids = club.kids.filter((k) => presentIds.includes(k.id) && !k.archived);
  const buckets = new Map<string, { step: number; whole: boolean; members: { kid: Kid; next: Lesson }[] }>();
  const finished: Kid[] = [];
  for (const kid of kids) {
    const n = nextLesson(club, kid);
    if (!n) {
      finished.push(kid);
      continue;
    }
    const whole = Boolean(opts.wholeGroup) && isEarlyReader(kid, false);
    const key = whole ? "early" : `step-${n.step}`;
    const b = buckets.get(key) ?? { step: n.step, whole, members: [] };
    b.step = Math.min(b.step, n.step);
    b.members.push({ kid, next: getLesson(n.lessonId)! });
    buckets.set(key, b);
  }

  // The whole group first, then the lowest steps: they get the iPads (read-aloud helps non-readers most).
  let ipadsLeft = Math.max(0, opts.ipads);
  const groups: Group[] = [...buckets.entries()]
    .sort(([ka, a], [kb, b]) => Number(b.whole) - Number(a.whole) || a.step - b.step || ka.localeCompare(kb))
    .map(([key, b]) => {
      // The whole group learns the lesson the lowest-step kids need.
      const pool = b.whole ? b.members.filter((m) => m.next.step === b.step) : b.members;
      const override = opts.overrides?.[key] ? getLesson(opts.overrides[key]) : undefined;
      const lesson = override ?? commonLesson(pool);
      const ipads = Math.min(ipadsLeft, b.members.length);
      ipadsLeft -= ipads;
      return {
        key,
        step: lesson.step,
        whole: b.whole,
        lesson,
        ipads,
        medium: ipads === 0 ? "paper" : ipads === b.members.length ? "ipad" : "mixed",
        taught: true,
        kids: b.members.map((m) => ({ kid: m.kid, own: m.next.id === lesson.id || b.whole ? undefined : m.next })),
      };
    });

  // Each adult takes a group; with more groups than adults, adults rotate
  // between groups (about 3 short teaching slots fit in 45 minutes, 4 in 60).
  const perAdult = groups.length <= adults.length ? 1 : Math.max(1, Math.floor((minutes - 15) / 10));
  const capacity = adults.length * perAdult;
  const ranked = [...groups].sort((a, b) => Number(b.whole) - Number(a.whole) || b.kids.length - a.kids.length || a.step - b.step);
  const taughtSet = new Set(ranked.slice(0, capacity));
  let i = 0;
  for (const g of groups) {
    g.taught = taughtSet.has(g);
    if (g.taught) g.adult = adults[i++ % adults.length];
  }

  return { groups, agenda: buildAgenda(groups, minutes, adults.length, opts.warmup), printList: printList(groups), finished };
}

function buildAgenda(groups: Group[], total: number, adultCount: number, warmup?: Warmup): AgendaItem[] {
  const items: Omit<AgendaItem, "start">[] = [];
  items.push({
    minutes: 5,
    title: warmup ? `Warm-up: ${warmup.title}` : "Welcome & set up",
    detail: warmup ? `${warmup.focus}. Then boards set up (light on the right!).` : "Kids set up boards (light on the right!).",
  });
  const taught = groups.filter((g) => g.taught);
  const parallel = taught.length > 0 && taught.length <= adultCount;
  const where = (g: Group) => (g.medium === "ipad" ? "iPads" : g.medium === "mixed" ? `${g.ipads} iPads + worksheets` : "worksheets");
  if (groups.length === 0) {
    items.push({ minutes: total - 10, title: "Free play", detail: "Add the kids who are coming to get a plan." });
  } else if (parallel) {
    // Every group has its own adult: all groups run the same rhythm side by side.
    const solo = taught.length === 1;
    const g0 = taught[0];
    const teach = Math.max(...taught.map((g) => g.lesson.minutes));
    const play = Math.max(...taught.map((g) => g.lesson.activity.minutes));
    items.push({
      minutes: teach,
      title: solo ? `Teach: ${g0.lesson.title}` : "Teach (each group with its adult)",
      detail: solo ? "Everyone together. Use Present mode or a demo board." : taught.map((g) => `${g.adult}: ${g.lesson.title}`).join("; "),
    });
    items.push({ minutes: play, title: solo ? `Play: ${g0.lesson.activity.title}` : "Table games", detail: solo ? "Pairs at the tables." : taught.map((g) => g.lesson.activity.title).join("; ") });
    items.push({ minutes: 8, title: "Practice & pass check", detail: taught.map((g) => (solo ? where(g) : `Step ${g.step}: ${where(g)}`)).join("; ") + "." });
  } else {
    // Adults rotate: each teaches its groups in turn; the others practice or play their game.
    const slots = Math.ceil(taught.length / adultCount);
    const teach = Math.max(6, Math.floor((total - 10 - 12) / slots));
    for (let s = 0; s < slots; s++) {
      const now = taught.slice(s * adultCount, (s + 1) * adultCount);
      const others = groups.filter((o) => !now.includes(o)).map((o) => `Step ${o.step}: ${where(o)} or ${o.lesson.activity.title}`);
      items.push({
        minutes: teach,
        title: now.map((g) => `Teach Step ${g.step}: ${g.lesson.title}`).join(" + "),
        detail: `${now.map((g) => g.adult).join(", ")} teaching. Others: ${others.join("; ") || "none"}.`,
      });
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
  items.push({ minutes: 5, title: "Wrap-up", detail: "Clean up. Ask: what did we learn today? Tick passes on the Wrap-up page (scan iPad pass codes)." });

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
    // Kids with an iPad don't need paper; the rest get their own lesson's sheet.
    const paperKids = g.kids.slice(g.ipads);
    for (const { own } of paperKids) {
      const l = own ?? g.lesson;
      const e = copies.get(l.id) ?? { lesson: l, copies: 0 };
      e.copies++;
      copies.set(l.id, e);
    }
  }
  return [...copies.values()];
}
