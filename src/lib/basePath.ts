// The deploy base path (e.g. "/chess-club" on GitHub Pages, "" locally).
// Next auto-prefixes <Link>, next/font, and statically-imported assets, but NOT
// hand-built absolute URL strings (like a Web Worker path), so use this for those.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefix an absolute, app-root-relative path with the deploy base path. */
export function withBasePath(path: string): string {
  return `${BASE_PATH}${path}`;
}
