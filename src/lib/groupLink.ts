// Group links: what a helper needs for their group today, packed into a URL
// fragment (a QR on the session pack cover). The helper's phone shows the
// lesson script, the kids and a check-off, and sends the ticks back as a
// batch code (lib/transfer.ts). Nothing needs to be set up on the phone.

import { check2, fromB64Url, toB64Url } from "./b64url";
import type { StationKid } from "./station";

export interface GroupLink {
  club: string;
  date: string;
  lesson: string;
  /** e.g. "Early readers" or "Step 2". */
  label: string;
  adult?: string;
  kids: StationKid[];
}

type Wire = [string, string, string, string, string, [string, string, string][]];

export function groupFragment(g: GroupLink): string {
  const wire: Wire = [g.club, g.date, g.lesson, g.label, g.adult ?? "", g.kids.map((k) => [k.id, k.name, k.animal])];
  const body = toB64Url(JSON.stringify(wire));
  return `g=${body}.${check2(body)}`;
}

export function parseGroupFragment(hash: string): GroupLink | null {
  const m = hash.replace(/^#/, "").match(/^g=([A-Za-z0-9_-]+)\.([A-Z0-9]{2})$/);
  if (!m || check2(m[1]) !== m[2]) return null;
  try {
    const [club, date, lesson, label, adult, kids] = JSON.parse(fromB64Url(m[1])) as Wire;
    return { club, date, lesson, label, adult: adult || undefined, kids: kids.map(([id, name, animal]) => ({ id, name, animal })) };
  } catch {
    return null;
  }
}
