// Roster links: the roster (names, grades, ids; no progress) packed into the
// URL *fragment*. Browsers never send the part after "#" to the server, so
// GitHub Pages never sees the names. Used to set up club iPads quickly.

import { EMPTY_CLUB, type Club, type Kid } from "./model";

function toB64Url(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64Url(s: string): string {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

export function rosterFragment(club: Club): string {
  const kids = club.kids.filter((k) => !k.archived).map((k) => [k.id, k.name, k.grade ?? "", k.placedAt ?? 0, k.earlyReader === undefined ? -1 : Number(k.earlyReader)]);
  return "roster=" + toB64Url(JSON.stringify({ n: club.name, k: kids }));
}

/** Parse "#roster=…" into a club holding only the roster. Null if absent or invalid. */
export function parseRosterFragment(hash: string): Club | null {
  const m = hash.replace(/^#/, "").match(/^roster=([A-Za-z0-9_-]+)$/);
  if (!m) return null;
  try {
    const data = JSON.parse(fromB64Url(m[1])) as { n: string; k: [string, string, string, number, number?][] };
    const kids: Kid[] = data.k.map(([id, name, grade, placedAt, er = -1]) => ({ id, name, grade: grade || undefined, placedAt: placedAt || undefined, earlyReader: er === -1 ? undefined : er === 1 }));
    return { ...EMPTY_CLUB, name: data.n, kids, ladder: kids.map((k) => k.id) };
  } catch {
    return null;
  }
}
