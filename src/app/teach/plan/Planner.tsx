"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Card, PageHeader, StepDot } from "@/components/ui/ui";
import { clubStore, useClub } from "@/lib/club/store";
import { today, toggleAttendance } from "@/lib/club/model";
import { planSession } from "@/lib/club/planner";

export function Planner() {
  const club = useClub();
  const date = today();
  const [minutes, setMinutes] = useState<45 | 60>(45);
  const [ipads, setIpads] = useState(0);
  const kids = club.kids.filter((k) => !k.archived).sort((a, b) => a.name.localeCompare(b.name));
  const present = club.attendance[date] ?? [];
  const plan = planSession(club, present, { minutes, ipads });

  if (!kids.length) {
    return (
      <main className="mx-auto max-w-4xl">
        <PageHeader title="Plan today" back="/teach/" backLabel="Coach" />
        <p className="px-4">
          Add your kids on the <Link href="/teach/roster/" className="text-info underline">Roster</Link> page first. Or just open a lesson from the Coach page and teach everyone together.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-5 pb-10">
      <PageHeader title="Plan today" back="/teach/" backLabel="Coach">
        <Button tone="soft" onClick={() => window.print()} className="no-print">
          🖨 Print plan
        </Button>
      </PageHeader>
      <div className="flex flex-col gap-5 px-4">
        <Card className="no-print">
          <h2 className="text-lg font-bold">Who&apos;s here? ({present.length})</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {kids.map((k) => {
              const on = present.includes(k.id);
              return (
                <button
                  key={k.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => clubStore.update((c) => toggleAttendance(c, date, k.id))}
                  className={`rounded-full px-4 py-2 font-semibold ring-1 ${on ? "bg-primary text-primary-ink ring-primary" : "bg-card ring-line"}`}
                >
                  {on ? "✓ " : ""}
                  {k.name}
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex gap-3 text-sm">
            <button type="button" className="underline" onClick={() => clubStore.update((c) => ({ ...c, attendance: { ...c.attendance, [date]: kids.map((k) => k.id) } }))}>
              Everyone
            </button>
            <button type="button" className="underline" onClick={() => clubStore.update((c) => ({ ...c, attendance: { ...c.attendance, [date]: [] } }))}>
              Nobody
            </button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-5">
            <label className="flex items-center gap-2">
              Session length
              <select value={minutes} onChange={(e) => setMinutes(Number(e.target.value) as 45 | 60)} className="rounded-lg px-2 py-1 ring-1 ring-line">
                <option value={45}>45 min</option>
                <option value={60}>60 min</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              iPads available
              <input type="number" min={0} max={60} value={ipads} onChange={(e) => setIpads(Math.max(0, Number(e.target.value) || 0))} className="w-20 rounded-lg px-2 py-1 ring-1 ring-line" />
            </label>
          </div>
        </Card>

        <h2 className="print-only text-2xl font-bold">
          {club.name} · {date}
        </h2>

        {plan.groups.length > 0 && (
          <section className="grid gap-3 md:grid-cols-2">
            {plan.groups.map((g) => (
              <Card key={g.step} className="avoid-break">
                <div className="flex items-center gap-3">
                  <StepDot n={g.step} />
                  <div className="flex-1">
                    <p className="text-sm text-ink-soft">
                      Step {g.step} · {g.kids.length} kid{g.kids.length === 1 ? "" : "s"} · {g.medium === "ipad" ? "📱 iPads" : "📄 Worksheets"}
                    </p>
                    <Link href={`/teach/lesson/${g.lesson.id}/`} className="text-lg font-bold hover:underline">
                      {g.lesson.title}
                    </Link>
                  </div>
                </div>
                {!g.taught && <p className="mt-2 rounded-lg bg-sunk px-3 py-1 text-sm">No teacher time today: they practice their own lessons and play the game.</p>}
                <ul className="mt-2 flex flex-wrap gap-2 text-sm">
                  {g.kids.map(({ kid, own }) => (
                    <li key={kid.id} className="rounded-full bg-sunk px-3 py-1">
                      {kid.name}
                      {own && <span className="text-ink-soft"> → {own.title}</span>}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </section>
        )}
        {plan.finished.length > 0 && (
          <p className="text-ink-soft">
            {plan.finished.map((k) => k.name).join(", ")} finished every lesson written so far. Give them club games or the ladder!
          </p>
        )}

        <Card className="avoid-break">
          <h2 className="text-xl font-bold">Agenda ({minutes} minutes)</h2>
          <ol className="mt-2 divide-y divide-line">
            {plan.agenda.map((a, i) => (
              <li key={i} className="flex gap-4 py-2">
                <span className="w-24 shrink-0 font-mono text-sm text-ink-soft">
                  {a.start}–{a.start + a.minutes} min
                </span>
                <div>
                  <p className="font-semibold">{a.title}</p>
                  <p className="text-sm text-ink-soft">{a.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>

        {plan.printList.length > 0 && (
          <Card className="avoid-break">
            <h2 className="text-xl font-bold">Print before club</h2>
            <ul className="mt-2 flex flex-col gap-1">
              {plan.printList.map(({ lesson, copies }) => (
                <li key={lesson.id} className="flex items-center gap-3">
                  <span className="w-10 text-right font-bold">{copies}×</span>
                  <Link href={`/print/lesson/${lesson.id}/`} className="text-info underline">
                    {lesson.title} worksheet
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </main>
  );
}
