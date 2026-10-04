// Station links: everything a borrowed iPad needs for today, packed into a URL
// fragment (printed as a QR code on a station card). Opening one wipes the
// iPad's leftovers from other kids, turns easy reading on or off, can lock the
// iPad to the lesson, and lists just this group's kids so each can tap their
// animal. Nothing about a kid is stored for longer than the session.

import { check2, fromB64Url, toB64Url } from "./b64url";

export interface StationKid {
  id: string;
  name: string;
  animal: string;
}

export interface Station {
  /** Club name, shown on the iPad. */
  club: string;
  /** YYYY-MM-DD this card was made for. */
  date: string;
  lesson?: string;
  /** Keep the iPad on `lesson` until a teacher unlocks it. */
  lock: boolean;
  /** Easy reading (simpler words, read-aloud). */
  easy: boolean;
  pin?: string;
  kids: StationKid[];
}

type Wire = [club: string, date: string, lesson: string, lock: 0 | 1, easy: 0 | 1, pin: string, kids: [string, string, string][]];

export function stationFragment(s: Station): string {
  const wire: Wire = [s.club, s.date, s.lesson ?? "", s.lock ? 1 : 0, s.easy ? 1 : 0, s.pin ?? "", s.kids.map((k) => [k.id, k.name, k.animal])];
  const body = toB64Url(JSON.stringify(wire));
  return `s=${body}.${check2(body)}`;
}

/** Parse "#s=…". Null if missing, mangled or from a different format. */
export function parseStationFragment(hash: string): Station | null {
  const m = hash.replace(/^#/, "").match(/^s=([A-Za-z0-9_-]+)\.([A-Z0-9]{2})$/);
  if (!m || check2(m[1]) !== m[2]) return null;
  try {
    const [club, date, lesson, lock, easy, pin, kids] = JSON.parse(fromB64Url(m[1])) as Wire;
    return { club, date, lesson: lesson || undefined, lock: lock === 1, easy: easy === 1, pin: pin || undefined, kids: kids.map(([id, name, animal]) => ({ id, name, animal })) };
  } catch {
    return null;
  }
}
