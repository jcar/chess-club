# Chess Club Kit

A free, open-source toolkit for K–12 after-school chess clubs, built for the
teacher or parent volunteer who has to run chess club and may not play much themselves.

- **Ready-to-run lessons.** Each lesson has a word-for-word script, demo boards,
  a game for the tables, practice and a pass check. Kids move up by **skill,
  not grade**, through a 9-step ladder.
- **Present mode.** One big board and one talking point at a time, for a projector or TV.
- **iPad or paper.** The same practice and pass check runs as tap-to-solve
  screens on an iPad (with read-aloud for non-readers) or prints as a worksheet
  with an answer key.
- **Roster & progress.** Attendance, who passed what, certificates. Kids on an
  anonymous iPad get a pass code to show the teacher.
- **Plan today.** Mark who's here and get groups by level, a timed agenda and a print list.
- **Club games.** Ladder, round robin and Swiss pairings.

No accounts, no server, no ads. Everything is stored in the browser on your
device, and it works offline after the first visit.

## Curriculum

| Step | | Status |
|---|---|---|
| 1 | Meet the Pieces | ✅ 7 lessons |
| 2 | Capture & Count | ✅ 4 lessons |
| 3 | Check & Checkmate | ✅ 3 lessons |
| 4 | Special Rules & Draws | ✅ 4 lessons |
| 5 | Finish the Game | ✅ 3 lessons |
| 6 | Tactics I + CCA | planned |
| 7 | Starting Well | planned |
| 8 | Club Player | planned |
| 9 | Advanced Track | planned |

The topic order draws on well-known beginner books (see `references/README.md`);
all lesson text is original.

## Develop

```bash
npm install
npm run dev          # http://localhost:3000
npm run validate     # checks every exercise against the rules of chess
npm test             # unit tests
npm run test:e2e     # Playwright: desktop, iPad (both orientations), iPhone
npm run test:e2e:pages  # same, served under /chess-club/ like GitHub Pages
```

## Deploy

Push to `main`. `.github/workflows/deploy.yml` builds the static export and
publishes it to GitHub Pages (Settings → Pages → Source: GitHub Actions).

## Adding a lesson

Add it to `src/content/lessons/step-N.ts` (see `src/content/types.ts`), build
positions with `board({...})` or `after("e4 e5")`, and run `npm run validate`.
