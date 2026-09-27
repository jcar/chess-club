# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

Chess Club Kit: a free, open-source "coach-in-a-box" for K–12 after-school chess
clubs run by a teacher or parent who may not play. Teacher toolkit (scripted
lessons, present mode, printable worksheets, roster, session planner, club games)
plus an iPad **student mode**. Every lesson works on paper or on an iPad. Static
site on GitHub Pages: no backend, no accounts, no data leaves the device. The full
design is in `~/.claude/plans/i-want-to-build-unified-newell.md`. Sibling project:
`../chess-openings` (OpeningLab), which this copies patterns from.

## Architecture (content → answers → three renderers)

- `src/content/types.ts`: the model. `Lesson` (script, activity, `practice`,
  `check`, `passMark`) and the `Exercise` union: `reach` | `stars` | `move` | `tap` | `choice`.
- `src/content/lessons/step-N.ts`: hand-written lessons. `src/content/curriculum.ts`
  registers steps (`comingSoon` for unwritten ones) and exports `ALL_LESSONS`.
- `src/content/authoring.ts`: `board({ R: "d4", p: ["d7"] })` builds FENs from
  placement; `after("e4 e5")` from moves. Never hand-type FENs.
- `src/lib/chess/rules.ts`: chess.js with `skipValidation`, because Step 1 uses
  kingless "sandbox" positions. `destinations`, `play` (`keepTurn` for drills),
  `movesMeeting(goal)`, `fewestMovesToStars`.
- `src/lib/exercise/answers.ts`: `answerFor(ex)`, the ONE source of truth for
  answers, used by the iPad grader, the worksheet answer key and the validator.
- `src/lib/exercise/validate.ts`: every move answer legal and meeting its goal;
  answer keys complete (all captures/checks/mates/escapes) unless `strict`;
  check/mate need both kings; stars reachable.
- Renderers: `components/exercise/ExerciseScreen.tsx` (iPad, practice vs check mode),
  `ExercisePrint.tsx` (worksheet + key), present mode in `app/teach/lesson/[id]/TeacherLesson.tsx`.
- `src/lib/club/`: `model.ts` (pure: roster, passes, attendance, `mergeClub`,
  `currentStep`), `store.ts` (localStorage stores), `pairing.ts` (round robin,
  Swiss, ladder), `planner.ts` (groups by step + agenda that always sums to the
  session length), `share.ts` (roster-only link in the URL fragment).
- `src/lib/chess/tactics.ts`: small alpha-beta material search. Powers the `win`
  move goal: the validator proves each answer wins ≥2 points against best defence
  and that the key lists every such move. Slow (~25 s for all content), fine offline.
- `src/content/puzzles.ts` + `src/content/puzzles/*.json`: Lichess puzzles (CC0),
  built by `npm run build:puzzles` from `scripts/.cache/lichess_db_puzzle.csv.zst`
  (300 MB, gitignored; download command is in `scripts/build-puzzles.ts`). A lesson's
  `extra` theme adds them as extra practice (iPad button + worksheet sets of 8).
- `src/lib/passcode.ts`: `S<step>-L<lesson>-<checksum>` codes carry passes from
  an anonymous iPad (or paper) to the teacher's roster.
- `src/lib/chess/minibot.ts`: rule-based bot for the mini-games (pawn races, piece
  vs. pawns, and a lone king that runs for the centre in the Step 4–5 mating games).
  `outcome()` handles promote / captureAll / mate (stalemate = draw).

## Static hosting rules (GitHub Pages; hard requirement)

- `output: "export"`, base path from `NEXT_PUBLIC_BASE_PATH` (set by
  `.github/workflows/deploy.yml`). No API routes, server actions, middleware or
  runtime secrets.
- `<Link>` is auto-prefixed; any hand-built URL (fetch, manifest, SW) must use
  `withBasePath()` from `src/lib/basePath.ts`.
- Dynamic routes only for content (`generateStaticParams` over `ALL_LESSONS`).
  Anything keyed by browser-only data (kid ids) is a fixed route + query param,
  e.g. `/teach/roster/?kid=…`, wrapped in `<Suspense>` for `useSearchParams`.
- `scripts/precache.ts` (postbuild) lists the export; `public/sw.js` caches it
  all on install, so the site works offline after one visit. Bump `VERSION` in
  `sw.js` if its caching logic changes.

## Conventions

- **Copyright:** `references/` holds the user's books and is gitignored; never
  commit it or paste from it. Books decide topic order only. All prose,
  positions-as-exercises and scripts are original; chess facts are fine. Cite
  sources in `Lesson.sources` by title/chapter only.
- **Privacy:** kids are first names/nicknames, stored only in localStorage. No
  analytics, no external requests at runtime.
- Never read localStorage during render: use `createLocalStore` + `useLocalStore`.
- Kid-facing text: short, concrete; give easy-reading wording in `Words.kid`.
  Easy reading is about reading ability, not age or chess level (`lib/young.ts`,
  per-kid `earlyReader`). Never label content or steps by grade: a new 6th grader
  starts at Step 1. Big targets
  (≥60px) in student mode; tap-to-move first.
- New content: run `npm run validate`; it will tell you about missing answers.

## Checks before claiming done

`npm run typecheck && npm run lint && npm test && npm run validate && npm run test:e2e && npm run test:e2e:pages`
