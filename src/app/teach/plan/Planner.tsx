"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Card, LinkButton, PageHeader, StepDot } from "@/components/ui/ui";
import { useClub } from "@/lib/club/store";
import { today } from "@/lib/club/model";
import { MAX_MINUTES, MIN_MINUTES } from "@/lib/club/planner";
import { computePlan, defaultPlan, savePlan, usePlans, type SavedPlan } from "@/lib/club/planStore";
import { STEPS, getLesson } from "@/content/curriculum";
import { WARMUPS } from "@/content/warmups";

const LENGTHS = Array.from({ length: (MAX_MINUTES - MIN_MINUTES) / 5 + 1 }, (_, i) => MIN_MINUTES + i * 5);

export function Planner() {
  const club = useClub();
  const plans = usePlans();
  const [date, setDate] = useState(today());
  const kids = club.kids.filter((k) => !k.archived).sort((a, b) => a.name.localeCompare(b.name));
  const saved: SavedPlan = plans[date] ?? defaultPlan(club, date);
  const set = (patch: Partial<SavedPlan>) => savePlan({ ...saved, ...patch });
  const plan = computePlan(club, saved);
  const expected = saved.expected.filter((id) => kids.some((k) => k.id === id));
  const [newAdult, setNewAdult] = useState("");

  if (!kids.length) {
    return (
      <main className="mx-auto max-w-4xl">
        <PageHeader title="Plan a session" back="/teach/" backLabel="Coach" />
        <p className="px-4">
          Add your kids on the <Link href="/teach/roster/" className="text-info underline">Roster</Link> page first. Or just open a lesson from the Coach page and teach everyone together.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-5 pb-10">
      <PageHeader title="Plan a session" back="/teach/" backLabel="Coach">
        <div className="no-print flex flex-wrap gap-2">
          <LinkButton href={`/print/session/?date=${date}`}>🖨 Session pack</LinkButton>
          <LinkButton href={`/teach/wrapup/?date=${date}`} tone="soft">
            ✅ Wrap-up
          </LinkButton>
          <Button tone="soft" onClick={() => window.print()}>
            Print this page
          </Button>
        </div>
      </PageHeader>
      <div className="flex flex-col gap-5 px-4">
        <Card className="no-print">
          <div className="flex flex-wrap items-center gap-5">
            <label className="flex items-center gap-2 font-semibold">
              Date
              <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className="rounded-lg px-2 py-1 font-normal ring-1 ring-line" data-testid="plan-date" />
            </label>
            <label className="flex items-center gap-2">
              Length
              <select value={saved.minutes} onChange={(e) => set({ minutes: Number(e.target.value) })} className="rounded-lg px-2 py-1 ring-1 ring-line" data-testid="plan-minutes">
                {LENGTHS.map((m) => (
                  <option key={m} value={m}>
                    {m} min
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2">
              iPads
              <input type="number" min={0} max={60} value={saved.ipads} onChange={(e) => set({ ipads: Math.max(0, Number(e.target.value) || 0) })} className="w-20 rounded-lg px-2 py-1 ring-1 ring-line" data-testid="plan-ipads" />
            </label>
            <label className="flex items-center gap-2">
              <Link href="/teach/warmups/" className="text-info underline">
                Warm-up
              </Link>
              <select value={saved.warmup ?? ""} onChange={(e) => set({ warmup: e.target.value || undefined })} className="rounded-lg px-2 py-1 ring-1 ring-line">
                <option value="">(none)</option>
                {WARMUPS.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.title}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <h2 className="mt-4 text-lg font-bold">Who&apos;s coming? ({expected.length})</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {kids.map((k) => {
              const on = expected.includes(k.id);
              return (
                <button
                  key={k.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => set({ expected: on ? expected.filter((id) => id !== k.id) : [...expected, k.id] })}
                  className={`rounded-full px-4 py-2 font-semibold ring-1 ${on ? "bg-primary text-primary-ink ring-primary" : "bg-card ring-line"}`}
                >
                  {k.animal} {k.name}
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex gap-3 text-sm">
            <button type="button" className="underline" onClick={() => set({ expected: kids.map((k) => k.id) })}>
              Everyone
            </button>
            <button type="button" className="underline" onClick={() => set({ expected: [] })}>
              Nobody
            </button>
          </div>

          <h2 className="mt-4 text-lg font-bold">Adults ({saved.adults.length})</h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {saved.adults.map((a, i) => (
              <span key={`${a}-${i}`} className="flex items-center gap-1 rounded-full bg-sunk py-1 pr-1 pl-3">
                {a}
                {saved.adults.length > 1 && (
                  <button type="button" className="rounded-full px-2 text-ink-soft" aria-label={`Remove ${a}`} onClick={() => set({ adults: saved.adults.filter((_, j) => j !== i) })}>
                    ✕
                  </button>
                )}
              </span>
            ))}
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (newAdult.trim()) set({ adults: [...saved.adults, newAdult.trim()] });
                setNewAdult("");
              }}
            >
              <input value={newAdult} onChange={(e) => setNewAdult(e.target.value)} placeholder="Add an adult" className="w-40 rounded-lg px-2 py-1 ring-1 ring-line" aria-label="Adult name" />
              <Button type="submit" tone="soft">
                Add
              </Button>
            </form>
          </div>

          <div className="mt-4 flex flex-wrap gap-5">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="h-5 w-5" checked={saved.wholeGroup} onChange={(e) => set({ wholeGroup: e.target.checked })} data-testid="plan-whole" />
              Early readers learn together as one group
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="h-5 w-5" checked={saved.lock} onChange={(e) => set({ lock: e.target.checked })} />
              Station cards lock iPads to the lesson
            </label>
            {saved.lock && (
              <label className="flex items-center gap-2">
                PIN
                <input
                  value={saved.pin ?? ""}
                  onChange={(e) => set({ pin: e.target.value.replace(/\D/g, "").slice(0, 6) || undefined })}
                  inputMode="numeric"
                  placeholder="optional"
                  className="w-28 rounded-lg px-2 py-1 ring-1 ring-line"
                  aria-label="Unlock PIN"
                />
              </label>
            )}
          </div>
        </Card>

        <h2 className="print-only text-2xl font-bold">
          {club.name} · {date}
        </h2>

        {plan.groups.length > 0 && (
          <section className="grid gap-3 md:grid-cols-2" data-testid="plan-groups">
            {plan.groups.map((g) => (
              <Card key={g.key} className="avoid-break">
                <div className="flex items-center gap-3">
                  <StepDot n={g.step} />
                  <div className="flex-1">
                    <p className="text-sm text-ink-soft">
                      {g.whole ? "Early readers, together" : `Step ${g.step}`} · {g.kids.length} kid{g.kids.length === 1 ? "" : "s"} ·{" "}
                      {g.medium === "ipad" ? "📱 iPads" : g.medium === "mixed" ? `📱 ${g.ipads} iPads + 📄 worksheets` : "📄 Worksheets"}
                      {g.adult && ` · 👤 ${g.adult}`}
                    </p>
                    <Link href={`/teach/lesson/${g.lesson.id}/`} className="text-lg font-bold hover:underline">
                      {g.lesson.title}
                    </Link>
                  </div>
                </div>
                <label className="no-print mt-2 flex items-center gap-2 text-sm">
                  Teach instead:
                  <select
                    value={saved.overrides[g.key] ?? ""}
                    onChange={(e) => {
                      const overrides = { ...saved.overrides };
                      if (e.target.value) overrides[g.key] = e.target.value;
                      else delete overrides[g.key];
                      set({ overrides });
                    }}
                    className="max-w-full rounded-lg px-2 py-1 ring-1 ring-line"
                  >
                    <option value="">(suggested)</option>
                    {STEPS.map((s) => (
                      <optgroup key={s.n} label={`Step ${s.n}: ${s.title}`}>
                        {s.lessons.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.title}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </label>
                {g.lesson.readingHeavy && <p className="mt-2 rounded-lg bg-sunk px-3 py-1 text-sm">📖 {g.lesson.readingHeavy}</p>}
                {!g.taught && <p className="mt-2 rounded-lg bg-sunk px-3 py-1 text-sm">No adult free for this group: they practice their own lessons and play the game. Add an adult to fix this.</p>}
                <ul className="mt-2 flex flex-wrap gap-2 text-sm">
                  {g.kids.map(({ kid, own }) => (
                    <li key={kid.id} className="rounded-full bg-sunk px-3 py-1">
                      {kid.animal} {kid.name}
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
            {plan.finished.map((k) => k.name).join(", ")} finished every lesson. Give them club games, the ladder, or make them table captains!
          </p>
        )}

        <Card className="avoid-break">
          <h2 className="text-xl font-bold">Agenda ({saved.minutes} minutes)</h2>
          <ol className="mt-2 divide-y divide-line" data-testid="agenda">
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
            <p className="text-sm text-ink-soft">
              The <Link href={`/print/session/?date=${date}`} className="text-info underline">session pack</Link> has all of these, plus station cards, answer keys, game cards and a check-off sheet.
            </p>
            <ul className="mt-2 flex flex-col gap-1">
              {plan.printList.map(({ lesson, copies }) => (
                <li key={lesson.id} className="flex items-center gap-3">
                  <span className="w-10 text-right font-bold">{copies}×</span>
                  <Link href={`/print/lesson/${lesson.id}/`} className="text-info underline">
                    {getLesson(lesson.id)?.title} worksheet
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
