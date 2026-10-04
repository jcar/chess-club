"use client";

// Club-wide printables: a wall sticker chart, lesson stamps for today's
// passes, name tents, score sheets and the ladder chart.

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { STEPS, getLesson } from "@/content/curriculum";
import { PageBox } from "@/components/print/Sheets";
import { NameTent, lessonPicture } from "@/components/print/Cards";
import { useClub } from "@/lib/club/store";
import { hasPassed, today } from "@/lib/club/model";

const WHAT = [
  { key: "chart", label: "Wall sticker chart" },
  { key: "stamps", label: "Lesson stamps" },
  { key: "tents", label: "Name tents" },
  { key: "score", label: "Score sheets" },
  { key: "ladder", label: "Ladder chart" },
  { key: "captain", label: "Table captain cards" },
] as const;

/** Tips for older kids coaching a younger pair. Kept short enough to read at a glance. */
const CAPTAIN = [
  "Check the board: light square on the right, queen on her own color.",
  "Let them move. Ask “Is that piece safe?” instead of telling them.",
  "Point, don't touch: their pieces, their moves.",
  "Remind them: Checks, Captures, Attacks.",
  "Say something nice every game: “Great move!” “Good thinking!”",
  "Stuck or arguing? Raise your hand for a grown-up.",
];

function chunk<T>(list: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < list.length; i += n) out.push(list.slice(i, i + n));
  return out;
}

export function ClubPrint() {
  const params = useSearchParams();
  const router = useRouter();
  const club = useClub();
  const what = params.get("what") ?? "chart";
  const stepN = Number(params.get("step")) || 1;
  const date = params.get("date") || today();
  const kids = club.kids.filter((k) => !k.archived).sort((a, b) => a.name.localeCompare(b.name));
  const set = (k: string, v: string) => {
    const q = new URLSearchParams(params.toString());
    q.set(k, v);
    router.replace(`?${q.toString()}`);
  };
  const step = STEPS.find((s) => s.n === stepN)!;
  const stamps = kids.flatMap((k) =>
    Object.entries(club.passes[k.id] ?? {})
      .filter(([, p]) => p.date === date)
      .map(([lessonId]) => ({ kid: k, lesson: getLesson(lessonId)! }))
      .filter((x) => x.lesson),
  );
  const ladder = club.ladder.map((id) => club.kids.find((k) => k.id === id)).filter((k) => k && !k.archived);

  return (
    <div className="bg-neutral-200 print:bg-white">
      <div className="no-print sticky top-0 z-10 flex flex-wrap items-center gap-3 bg-paper px-4 py-3 shadow">
        <Link href="/teach/" className="rounded-xl px-3 py-2 ring-1 ring-line">
          ← Coach
        </Link>
        <select value={what} onChange={(e) => set("what", e.target.value)} className="rounded-lg px-2 py-1 ring-1 ring-line" aria-label="What to print">
          {WHAT.map((w) => (
            <option key={w.key} value={w.key}>
              {w.label}
            </option>
          ))}
        </select>
        {what === "chart" && (
          <select value={stepN} onChange={(e) => set("step", e.target.value)} className="rounded-lg px-2 py-1 ring-1 ring-line" aria-label="Step">
            {STEPS.map((s) => (
              <option key={s.n} value={s.n}>
                Step {s.n}: {s.title}
              </option>
            ))}
          </select>
        )}
        {what === "stamps" && <input type="date" value={date} onChange={(e) => e.target.value && set("date", e.target.value)} className="rounded-lg px-2 py-1 ring-1 ring-line" aria-label="Date" />}
        <button type="button" onClick={() => window.print()} className="ml-auto rounded-xl bg-primary px-5 py-2 font-semibold text-primary-ink">
          🖨 Print
        </button>
      </div>
      {what === "chart" && <style>{"@media print { @page { size: letter landscape; margin: 0.4in; } }"}</style>}

      <div className="mx-auto flex max-w-[11in] flex-col gap-6 py-6 print:gap-0 print:py-0" data-testid="club-print">
        {what === "chart" && (
          <PageBox>
            <h1 className="text-3xl font-bold">
              {club.name} · Step {step.n}: {step.kidTitle}
            </h1>
            <p className="text-sm">Add a sticker when you pass a lesson! (★ = already passed)</p>
            <table className="mt-3 w-full border-collapse" data-testid="sticker-chart">
              <thead>
                <tr>
                  <th className="border-2 border-black p-2 text-left">Name</th>
                  {step.lessons.map((l) => (
                    <th key={l.id} className="border-2 border-black p-1 text-center text-xs">
                      <span className="block text-3xl" aria-hidden>
                        {lessonPicture(l)}
                      </span>
                      {l.kidTitle ?? l.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {kids.map((k) => (
                  <tr key={k.id}>
                    <td className="border-2 border-black p-2 text-xl font-bold whitespace-nowrap">
                      {k.animal} {k.name}
                    </td>
                    {step.lessons.map((l) => (
                      <td key={l.id} className="h-14 border-2 border-black text-center text-3xl">
                        {hasPassed(club, k, l.id, step.n) ? "★" : ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </PageBox>
        )}

        {what === "stamps" &&
          (stamps.length === 0 ? (
            <p className="p-8">No passes recorded on {date}. Tick them in Wrap-up first.</p>
          ) : (
            chunk(stamps, 2).map((pair, i) => (
              <PageBox key={i}>
                <div className="flex flex-col gap-[0.3in]">
                  {pair.map(({ kid, lesson }) => (
                    <div key={kid.id + lesson.id} className="avoid-break flex h-[4.6in] flex-col items-center justify-center gap-2 rounded-3xl border-4 border-dashed border-black text-center" data-testid="stamp">
                      <p className="text-8xl" aria-hidden>
                        {lessonPicture(lesson)}
                      </p>
                      <p className="text-xl">
                        {kid.animal} <b className="text-3xl">{kid.name}</b> learned
                      </p>
                      <p className="font-display text-4xl font-bold">{lesson.kidTitle ?? lesson.title}</p>
                      <p className="text-4xl" aria-hidden>
                        ⭐ ⭐ ⭐
                      </p>
                      <p className="text-sm">
                        {club.name} · {date} · Color me in!
                      </p>
                    </div>
                  ))}
                </div>
              </PageBox>
            ))
          ))}

        {what === "tents" &&
          chunk(kids, 2).map((pair, i) => (
            <PageBox key={i}>
              <div className="flex flex-col gap-[0.2in]">
                {pair.map((k) => (
                  <NameTent key={k.id} kid={k} club={club.name} />
                ))}
              </div>
            </PageBox>
          ))}

        {what === "score" &&
          [0, 1].map((n) => (
            <PageBox key={n}>
              <div className="flex flex-col gap-[0.25in]">
                {[0, 1].map((half) => (
                  <div key={half} className="avoid-break rounded border-2 border-black p-3" data-testid="score-sheet">
                    <div className="flex justify-between text-sm">
                      <span>White: ____________________</span>
                      <span>Black: ____________________</span>
                      <span>Date: __________</span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-x-6 text-sm">
                      {[0, 1].map((col) => (
                        <table key={col} className="w-full border-collapse">
                          <thead>
                            <tr>
                              <th className="w-8 border border-black">#</th>
                              <th className="border border-black">White</th>
                              <th className="border border-black">Black</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Array.from({ length: 15 }, (_, i) => col * 15 + i + 1).map((m) => (
                              <tr key={m}>
                                <td className="border border-black text-center">{m}</td>
                                <td className="h-5 border border-black" />
                                <td className="h-5 border border-black" />
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ))}
                    </div>
                    <p className="mt-2 text-sm">Result (circle one): &nbsp; White won (1–0) &nbsp; · &nbsp; Draw (½–½) &nbsp; · &nbsp; Black won (0–1)</p>
                  </div>
                ))}
              </div>
            </PageBox>
          ))}

        {what === "captain" && (
          <PageBox>
            <div className="flex flex-col gap-[0.3in]">
              {[0, 1].map((i) => (
                <div key={i} className="avoid-break flex h-[4.6in] flex-col justify-center rounded-3xl border-4 border-dashed border-black p-6" data-testid="captain-card">
                  <p className="text-5xl" aria-hidden>
                    ⭐ ♞
                  </p>
                  <h1 className="mt-1 font-display text-4xl font-bold">Table Captain</h1>
                  <p className="text-sm">You help a younger pair play. A captain is kind, patient and fair.</p>
                  <ol className="mt-3 list-decimal space-y-1 pl-7 text-lg">
                    {CAPTAIN.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </PageBox>
        )}

        {what === "ladder" && (
          <PageBox>
            <h1 className="text-3xl font-bold">{club.name} · Club Ladder</h1>
            <p className="text-sm">Challenge the kid just above you. Win, and you swap places!</p>
            <table className="mt-3 w-full border-collapse" data-testid="ladder-chart">
              <thead>
                <tr>
                  <th className="w-14 border-2 border-black p-2">Rung</th>
                  <th className="border-2 border-black p-2 text-left">Name</th>
                  <th className="w-1/2 border-2 border-black p-2 text-left">Games this term</th>
                </tr>
              </thead>
              <tbody>
                {ladder.map((k, i) => (
                  <tr key={k!.id}>
                    <td className="border-2 border-black p-2 text-center text-2xl font-bold">{i + 1}</td>
                    <td className="border-2 border-black p-2 text-xl font-bold">
                      {k!.animal} {k!.name}
                    </td>
                    <td className="border-2 border-black" />
                  </tr>
                ))}
              </tbody>
            </table>
          </PageBox>
        )}
      </div>
    </div>
  );
}
