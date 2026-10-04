// The club's data: roster, attendance, passes and game results. Pure functions
// only (no React, no storage), so they are unit-tested and shared by the
// teacher's device and a club iPad. Kids are first names or nicknames only.

import { STEPS } from "@/content/curriculum";

export type PassVia = "ipad" | "paper" | "code" | "teacher";

export interface Kid {
  id: string;
  name: string;
  grade?: string; // "K", "1" … "12"
  /** Easy-reading mode on the iPad (simpler words, read-aloud). Unset = guess from grade. */
  earlyReader?: boolean;
  /** Kids who already play can start higher; earlier steps count as done. */
  placedAt?: number;
  archived?: boolean;
  /** Picture that stands for the kid (emoji), so non-readers can find their name. */
  animal?: string;
}

export interface Pass {
  date: string; // YYYY-MM-DD
  via: PassVia;
}

export interface GameResult {
  id: string;
  date: string;
  white: string; // kid id
  black: string;
  result: "1-0" | "0-1" | "1/2";
}

export interface Club {
  version: 1;
  name: string;
  kids: Kid[];
  /** date → kid ids present */
  attendance: Record<string, string[]>;
  /** kid id → lesson id → pass */
  passes: Record<string, Record<string, Pass>>;
  games: GameResult[];
  /** Ladder order, strongest first (kid ids). */
  ladder: string[];
}

export const EMPTY_CLUB: Club = { version: 1, name: "Chess Club", kids: [], attendance: {}, passes: {}, games: [], ladder: [] };

export function today(d = new Date()): string {
  const z = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

export function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Picture-first name tags. Easy to tell apart and to say out loud. */
export const ANIMALS = ["🐶", "🐱", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐸", "🐵", "🐧", "🐦", "🦉", "🐢", "🐙", "🦀", "🐳", "🐬", "🦋", "🐝", "🐞", "🦄", "🐴", "🐮", "🐷", "🐰", "🐹", "🦒", "🐘", "🦓", "🦔", "🦕", "🦖", "🐊", "🦩", "🦜", "🐿️", "🦦", "🦥", "🐲"];

/** The first animal nobody in the club has yet (cycles if everyone has one). */
export function freeAnimal(kids: Kid[]): string {
  const used = new Set(kids.map((k) => k.animal));
  return ANIMALS.find((a) => !used.has(a)) ?? ANIMALS[kids.length % ANIMALS.length];
}

/** Give every kid without an animal a free one (older club files have none). */
export function fillAnimals(club: Club): Club {
  if (club.kids.every((k) => k.animal)) return club;
  const kids: Kid[] = [];
  for (const k of club.kids) kids.push(k.animal ? k : { ...k, animal: freeAnimal([...club.kids.filter((x) => x.animal), ...kids]) });
  return { ...club, kids };
}

export function addKid(club: Club, name: string, grade?: string): Club {
  const kid: Kid = { id: newId(), name: name.trim(), grade, animal: freeAnimal(club.kids) };
  return { ...club, kids: [...club.kids, kid], ladder: [...club.ladder, kid.id] };
}

export function updateKid(club: Club, id: string, patch: Partial<Kid>): Club {
  return { ...club, kids: club.kids.map((k) => (k.id === id ? { ...k, ...patch, id } : k)) };
}

export function recordPass(club: Club, kidId: string, lessonId: string, via: PassVia, date = today()): Club {
  const mine = club.passes[kidId] ?? {};
  if (mine[lessonId]) return club; // keep the first pass date
  return { ...club, passes: { ...club.passes, [kidId]: { ...mine, [lessonId]: { date, via } } } };
}

export function removePass(club: Club, kidId: string, lessonId: string): Club {
  const mine = { ...(club.passes[kidId] ?? {}) };
  delete mine[lessonId];
  return { ...club, passes: { ...club.passes, [kidId]: mine } };
}

export function toggleAttendance(club: Club, date: string, kidId: string): Club {
  const present = new Set(club.attendance[date] ?? []);
  if (present.has(kidId)) present.delete(kidId);
  else present.add(kidId);
  return { ...club, attendance: { ...club.attendance, [date]: [...present] } };
}

export function hasPassed(club: Club, kid: Kid, lessonId: string, step: number): boolean {
  if (kid.placedAt && step < kid.placedAt) return true;
  return Boolean(club.passes[kid.id]?.[lessonId]);
}

/** The step a kid is working on: the first written step with a lesson not yet passed. */
export function currentStep(club: Club, kid: Kid): number {
  for (const s of STEPS) {
    if (s.comingSoon) return s.n;
    if (s.lessons.some((l) => !hasPassed(club, kid, l.id, s.n))) return s.n;
  }
  return STEPS[STEPS.length - 1].n;
}

/** The next lesson a kid should do, or null if they've finished everything written. */
export function nextLesson(club: Club, kid: Kid): { step: number; lessonId: string } | null {
  for (const s of STEPS) for (const l of s.lessons) if (!hasPassed(club, kid, l.id, s.n)) return { step: s.n, lessonId: l.id };
  return null;
}

export function stepProgress(club: Club, kid: Kid, step: number): { done: number; total: number } {
  const s = STEPS.find((x) => x.n === step);
  if (!s) return { done: 0, total: 0 };
  return { done: s.lessons.filter((l) => hasPassed(club, kid, l.id, step)).length, total: s.lessons.length };
}

/**
 * Merge another copy of the club (e.g. from the club iPad) into this one.
 * Kids match by id, then by (unique) name. Passes and attendance are unioned (earliest
 * pass wins), games deduped by id. Nothing is ever deleted by a merge.
 */
export function mergeClub(base: Club, incoming: Club): { club: Club; added: { kids: number; passes: number; games: number } } {
  const kids = [...base.kids];
  const incomingIds = new Set(incoming.kids.map((x) => x.id));
  const idMap = new Map<string, string>(); // incoming id → base id
  let addedKids = 0;
  for (const k of incoming.kids) {
    // By id; else by name, but only when the name is unique on BOTH sides and
    // the base kid isn't also in the incoming copy (two kids can share a name).
    const named = (list: Kid[]) => list.filter((x) => x.name.trim().toLowerCase() === k.name.trim().toLowerCase());
    const sameName = named(base.kids);
    const byName = sameName.length === 1 && named(incoming.kids).length === 1 && !incomingIds.has(sameName[0].id) ? sameName[0] : undefined;
    const match = kids.find((b) => b.id === k.id) ?? byName;
    if (match) idMap.set(k.id, match.id);
    else {
      kids.push(kids.some((b) => b.animal && b.animal === k.animal) ? { ...k, animal: freeAnimal(kids) } : k);
      idMap.set(k.id, k.id);
      addedKids++;
    }
  }
  const map = (id: string) => idMap.get(id) ?? id;

  const passes: Club["passes"] = structuredClone(base.passes);
  let addedPasses = 0;
  for (const [kidId, lessons] of Object.entries(incoming.passes)) {
    const target = (passes[map(kidId)] ??= {});
    for (const [lessonId, p] of Object.entries(lessons)) {
      const have = target[lessonId];
      if (!have) addedPasses++;
      if (!have || p.date < have.date) target[lessonId] = p;
    }
  }

  const attendance: Club["attendance"] = structuredClone(base.attendance);
  for (const [date, ids] of Object.entries(incoming.attendance)) {
    attendance[date] = [...new Set([...(attendance[date] ?? []), ...ids.map(map)])];
  }

  const seen = new Set(base.games.map((g) => g.id));
  const newGames = incoming.games.filter((g) => !seen.has(g.id)).map((g) => ({ ...g, white: map(g.white), black: map(g.black) }));

  const ladder = [...base.ladder, ...kids.map((k) => k.id).filter((id) => !base.ladder.includes(id))];

  return {
    club: { ...base, kids, passes, attendance, games: [...base.games, ...newGames], ladder },
    added: { kids: addedKids, passes: addedPasses, games: newGames.length },
  };
}

/** Parse an imported file. Throws a readable error if it isn't a club export. */
export function parseClub(json: string): Club {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    throw new Error("That file isn't a Chess Club Kit export.");
  }
  const c = raw as Partial<Club>;
  if (!c || c.version !== 1 || !Array.isArray(c.kids) || typeof c.passes !== "object") throw new Error("That file isn't a Chess Club Kit export.");
  return fillAnimals({ ...EMPTY_CLUB, ...c } as Club);
}

/** What applying a transfer changed, for the confirmation message. */
export interface Applied {
  passes: number;
  present: number;
}

/**
 * Apply a pass or batch transfer (lib/transfer.ts). A single pass needs a
 * roster kid: `kidId` overrides the one in the transfer (the adult picked who
 * it was). Unknown kid ids in a batch are skipped.
 */
export function applyTransfer(
  club: Club,
  t: { kind: "pass"; date: string; lesson: string; kidId?: string } | { kind: "batch"; date: string; present: string[]; passes: [string, string][] },
  kidId?: string,
): { club: Club; applied: Applied } {
  const known = new Set(club.kids.map((k) => k.id));
  let c = club;
  let passes = 0;
  let present = 0;
  const pass = (kid: string, lesson: string, via: PassVia) => {
    if (!known.has(kid)) return;
    const before = c;
    c = recordPass(c, kid, lesson, via, t.date);
    if (c !== before) passes++;
  };
  const mark = (kid: string) => {
    if (!known.has(kid) || (c.attendance[t.date] ?? []).includes(kid)) return;
    c = toggleAttendance(c, t.date, kid);
    present++;
  };
  if (t.kind === "pass") {
    const who = kidId ?? t.kidId;
    if (who) {
      mark(who);
      pass(who, t.lesson, "ipad");
    }
  } else {
    t.present.forEach(mark);
    for (const [kid, lesson] of t.passes) {
      mark(kid);
      pass(kid, lesson, "teacher");
    }
  }
  return { club: c, applied: { passes, present } };
}
