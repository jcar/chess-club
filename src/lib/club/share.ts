// Roster links: the roster (names, grades, ids; no progress) packed into the
// URL *fragment*. Browsers never send the part after "#" to the server, so
// GitHub Pages never sees the names. Used to set up club iPads quickly.

import { EMPTY_CLUB, type Club, type Kid } from "./model";
import { fromB64Url, toB64Url } from "@/lib/b64url";

export function rosterFragment(club: Club): string {
  const kids = club.kids.filter((k) => !k.archived).map((k) => [k.id, k.name, k.grade ?? "", k.placedAt ?? 0, k.earlyReader === undefined ? -1 : Number(k.earlyReader), k.animal ?? ""]);
  return "roster=" + toB64Url(JSON.stringify({ n: club.name, k: kids }));
}

/** Parse "#roster=…" into a club holding only the roster. Null if absent or invalid. */
export function parseRosterFragment(hash: string): Club | null {
  const m = hash.replace(/^#/, "").match(/^roster=([A-Za-z0-9_-]+)$/);
  if (!m) return null;
  try {
    const data = JSON.parse(fromB64Url(m[1])) as { n: string; k: [string, string, string, number, number?, string?][] };
    const kids: Kid[] = data.k.map(([id, name, grade, placedAt, er = -1, animal]) => ({ id, name, grade: grade || undefined, placedAt: placedAt || undefined, earlyReader: er === -1 ? undefined : er === 1, animal: animal || undefined }));
    return { ...EMPTY_CLUB, name: data.n, kids, ladder: kids.map((k) => k.id) };
  } catch {
    return null;
  }
}
