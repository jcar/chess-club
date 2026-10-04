// Moving results to the adult who keeps the club, with no server: a QR code
// (or link) whose fragment carries the results. Scanned in Wrap-up, or opened
// by the phone's camera. Two kinds:
//   pass:  one kid passed one lesson on an iPad (kid may be unknown on a "Just me" iPad)
//   batch: a helper's whole check-off sheet for a session

import { check2, fromB64Url, toB64Url } from "./b64url";

export interface PassTransfer {
  kind: "pass";
  date: string;
  lesson: string;
  /** Roster id when the kid picked their name on a station iPad. */
  kidId?: string;
  name?: string;
  animal?: string;
  stars?: number;
}

export interface BatchTransfer {
  kind: "batch";
  date: string;
  /** Kid ids present. */
  present: string[];
  /** [kid id, lesson id] passes. */
  passes: [string, string][];
  from?: string;
}

export type Transfer = PassTransfer | BatchTransfer;

export function transferFragment(t: Transfer): string {
  const wire =
    t.kind === "pass" ? ["p", t.date, t.lesson, t.kidId ?? "", t.name ?? "", t.animal ?? "", t.stars ?? 0] : ["b", t.date, t.present, t.passes, t.from ?? ""];
  const body = toB64Url(JSON.stringify(wire));
  return `q=${body}.${check2(body)}`;
}

/** Parse "#q=…" (or a whole URL containing it). Null if missing or mangled. */
export function parseTransfer(input: string): Transfer | null {
  const m = input.match(/[#&]?q=([A-Za-z0-9_-]+)\.([A-Z0-9]{2})\s*$/);
  if (!m || check2(m[1]) !== m[2]) return null;
  try {
    const w = JSON.parse(fromB64Url(m[1])) as unknown[];
    if (w[0] === "p") {
      const [, date, lesson, kidId, name, animal, stars] = w as [string, string, string, string, string, string, number];
      return { kind: "pass", date, lesson, kidId: kidId || undefined, name: name || undefined, animal: animal || undefined, stars: stars || undefined };
    }
    if (w[0] === "b") {
      const [, date, present, passes, from] = w as [string, string, string[], [string, string][], string];
      return { kind: "batch", date, present, passes, from: from || undefined };
    }
    return null;
  } catch {
    return null;
  }
}
