// One station card per planned group: the QR an iPad scans to open that
// group's lesson with that group's kids (see lib/station.ts).

import { isEarlyReader } from "@/lib/young";
import type { Station } from "@/lib/station";
import type { Club } from "./model";
import type { Group } from "./planner";

export function stationFor(club: Club, g: Group, opts: { date: string; lock: boolean; pin?: string }): Station {
  return {
    club: club.name,
    date: opts.date,
    lesson: g.lesson.id,
    lock: opts.lock,
    pin: opts.pin,
    // Easy reading if anyone in the group needs it: read-aloud helps them and doesn't hurt readers.
    easy: g.whole || g.kids.some(({ kid }) => isEarlyReader(kid, false)),
    kids: g.kids.map(({ kid }) => ({ id: kid.id, name: kid.name, animal: kid.animal ?? "♟️" })),
  };
}
