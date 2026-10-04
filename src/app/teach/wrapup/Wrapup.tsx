"use client";

// End of session, on the adult's phone that keeps the club: who came, and who
// passed what. One tap per pass, or scan the pass codes on the iPads and the
// helpers' codes. A helper's phone uses the same page to send its ticks.

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, PageHeader } from "@/components/ui/ui";
import { Qr } from "@/components/ui/Qr";
import { Scanner } from "@/components/teach/Scanner";
import { ALL_LESSONS, getLesson } from "@/content/curriculum";
import { clubStore, useClub } from "@/lib/club/store";
import { applyTransfer, recordPass, removePass, toggleAttendance, today, type Kid } from "@/lib/club/model";
import { computePlan, usePlans } from "@/lib/club/planStore";
import { parseTransfer, transferFragment, type PassTransfer } from "@/lib/transfer";
import { withBasePath } from "@/lib/basePath";

export function Wrapup() {
  const club = useClub();
  const plans = usePlans();
  const params = useSearchParams();
  const [date, setDate] = useState(params.get("date") || today());
  const [scanning, setScanning] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [unknown, setUnknown] = useState<PassTransfer[]>([]);
  const [extraLessons, setExtraLessons] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const kids = club.kids.filter((k) => !k.archived).sort((a, b) => a.name.localeCompare(b.name));
  const present = useMemo(() => club.attendance[date] ?? [], [club.attendance, date]);
  const saved = plans[date];
  const plan = useMemo(() => (saved ? computePlan(club, saved) : null), [club, saved]);

  const note = (s: string) => setLog((l) => [s, ...l].slice(0, 8));

  const handle = useCallback(
    (text: string) => {
      const t = parseTransfer(text);
      if (!t) return note("That code isn't a Chess Club pass code.");
      const c = clubStore.getSnapshot();
      if (t.kind === "pass") {
        const lesson = getLesson(t.lesson);
        if (!lesson) return note("That pass is for a lesson this version doesn't have.");
        if (!t.kidId || !c.kids.some((k) => k.id === t.kidId)) {
          setUnknown((u) => [...u, t]);
          return note(`Who passed “${lesson.title}”? Pick them below.`);
        }
        const { club: next, applied } = applyTransfer(c, t);
        clubStore.set(next);
        setDate(t.date);
        const kid = c.kids.find((k) => k.id === t.kidId)!;
        return note(applied.passes ? `✓ ${kid.animal ?? ""} ${kid.name} passed “${lesson.title}”` : `${kid.name} already had “${lesson.title}”.`);
      }
      const { club: next, applied } = applyTransfer(c, t);
      clubStore.set(next);
      setDate(t.date);
      note(`✓ ${t.from ? `From ${t.from}: ` : ""}${applied.passes} pass${applied.passes === 1 ? "" : "es"}, ${applied.present} more here.`);
    },
    [],
  );

  // Opened from a phone camera: the code is in the URL fragment.
  useEffect(() => {
    const take = () => {
      if (!window.location.hash.includes("q=")) return;
      handle(window.location.hash);
      history.replaceState(null, "", window.location.pathname + window.location.search);
    };
    take();
    // A second code opened while this page is up only changes the fragment.
    window.addEventListener("hashchange", take);
    return () => window.removeEventListener("hashchange", take);
  }, [handle]);

  // Columns: the lessons planned for this date, plus any passed that day, plus any added here.
  const lessonIds = useMemo(() => {
    const ids = new Set<string>();
    plan?.groups.forEach((g) => {
      ids.add(g.lesson.id);
      g.kids.forEach(({ own }) => own && ids.add(own.id));
    });
    for (const byLesson of Object.values(club.passes)) for (const [id, p] of Object.entries(byLesson)) if (p.date === date) ids.add(id);
    extraLessons.forEach((id) => ids.add(id));
    return ALL_LESSONS.map((l) => l.id).filter((id) => ids.has(id));
  }, [plan, club.passes, date, extraLessons]);

  // Rows: kids here today first, then everyone else expected.
  const expected = new Set(saved?.expected ?? []);
  const rows: Kid[] = [...kids.filter((k) => present.includes(k.id)), ...kids.filter((k) => !present.includes(k.id) && (expected.has(k.id) || !saved))];

  const batchUrl = useMemo(() => {
    if (!sending || typeof window === "undefined") return null;
    const passes: [string, string][] = [];
    for (const [kidId, byLesson] of Object.entries(club.passes)) for (const [lessonId, p] of Object.entries(byLesson)) if (p.date === date) passes.push([kidId, lessonId]);
    const frag = transferFragment({ kind: "batch", date, present, passes, from: saved?.adults[0] });
    return { url: `${window.location.origin}${withBasePath("/teach/wrapup/")}#${frag}`, n: passes.length };
  }, [sending, club.passes, date, present, saved]);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-4 pb-10">
      <PageHeader title="Wrap-up" back="/teach/" backLabel="Coach">
        <Button onClick={() => setScanning(true)}>📷 Scan codes</Button>
      </PageHeader>
      <div className="flex flex-col gap-4 px-4">
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 font-semibold">
            Date
            <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className="rounded-lg px-2 py-1 font-normal ring-1 ring-line" />
          </label>
          {!saved && (
            <span className="text-sm text-ink-soft">
              No plan for this date. <Link href="/teach/plan/" className="text-info underline">Plan one</Link>, or add lessons below.
            </span>
          )}
        </div>

        {log.length > 0 && (
          <Card>
            <ul className="flex flex-col gap-1" aria-live="polite" data-testid="wrapup-log">
              {log.map((l, i) => (
                <li key={i} className={i === 0 ? "font-semibold" : "text-ink-soft"}>
                  {l}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {unknown.map((t, i) => (
          <Card key={i} className="ring-star">
            <p className="font-semibold" data-testid="who-passed">
              Who passed “{getLesson(t.lesson)?.title}”{t.name ? ` (says “${t.name}”)` : ""}?
            </p>
            <div className="mt-2 flex flex-wrap gap-2" data-testid="who-passed-kids">
              {(present.length ? kids.filter((k) => present.includes(k.id)) : kids).map((k) => (
                <button
                  key={k.id}
                  type="button"
                  className="rounded-full bg-card px-4 py-2 font-semibold ring-1 ring-line"
                  onClick={() => {
                    clubStore.update((c) => applyTransfer(c, t, k.id).club);
                    setUnknown((u) => u.filter((_, j) => j !== i));
                    note(`✓ ${k.animal ?? ""} ${k.name} passed “${getLesson(t.lesson)?.title}”`);
                  }}
                >
                  {k.animal} {k.name}
                </button>
              ))}
              <button type="button" className="px-3 text-ink-soft underline" onClick={() => setUnknown((u) => u.filter((_, j) => j !== i))}>
                Skip
              </button>
            </div>
          </Card>
        ))}

        <Card>
          <h2 className="text-lg font-bold">Here today ({present.length})</h2>
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
                  {k.animal} {k.name}
                </button>
              );
            })}
          </div>
        </Card>

        <Card>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="flex-1 text-lg font-bold">Who passed? Tap to tick.</h2>
            <select
              value=""
              onChange={(e) => e.target.value && setExtraLessons((x) => [...x, e.target.value])}
              className="rounded-lg px-2 py-1 ring-1 ring-line"
              aria-label="Add a lesson column"
            >
              <option value="">+ Add a lesson</option>
              {ALL_LESSONS.filter((l) => !lessonIds.includes(l.id)).map((l) => (
                <option key={l.id} value={l.id}>
                  Step {l.step}: {l.title}
                </option>
              ))}
            </select>
          </div>
          {lessonIds.length === 0 ? (
            <p className="mt-2 text-ink-soft">Add the lesson(s) you taught today.</p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full border-collapse text-left" data-testid="wrapup-grid">
                <thead>
                  <tr>
                    <th className="p-2" />
                    {lessonIds.map((id) => (
                      <th key={id} className="p-2 text-sm font-semibold">
                        S{getLesson(id)!.step}: {getLesson(id)!.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((k) => (
                    <tr key={k.id} className="border-t border-line">
                      <th className="p-2 font-semibold whitespace-nowrap">
                        {k.animal} {k.name}
                      </th>
                      {lessonIds.map((id) => {
                        const p = club.passes[k.id]?.[id];
                        const earlier = p && p.date !== date;
                        return (
                          <td key={id} className="p-1 text-center">
                            <button
                              type="button"
                              aria-pressed={Boolean(p)}
                              aria-label={`${k.name} passed ${getLesson(id)!.title}`}
                              disabled={earlier}
                              onClick={() => clubStore.update((c) => (p ? removePass(c, k.id, id) : recordPass(c, k.id, id, "teacher", date)))}
                              className={`h-12 w-12 rounded-xl text-2xl ring-1 ${p ? "bg-good text-white ring-good" : "bg-card ring-line"} disabled:opacity-50`}
                              title={earlier ? `Passed ${p.date}` : undefined}
                            >
                              {p ? "✓" : ""}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <p className="flex flex-wrap gap-3 text-sm">
          🎉 Celebrate:
          <Link href={`/print/club/?what=stamps&date=${date}`} className="text-info underline">
            print lesson stamps for today&apos;s passes
          </Link>
          <Link href="/print/club/?what=chart" className="text-info underline">
            wall sticker chart
          </Link>
          <Link href="/teach/roster/" className="text-info underline">
            step certificates
          </Link>
        </p>

        <Card>
          <h2 className="text-lg font-bold">Helping today? Send your ticks to the club keeper</h2>
          <p className="text-ink-soft">If someone else keeps the club on their phone, show them this code and they tap “Scan codes”.</p>
          {!sending ? (
            <Button tone="soft" className="mt-2" onClick={() => setSending(true)}>
              Show my code
            </Button>
          ) : (
            batchUrl && (
              <div className="mt-3 flex flex-col items-start gap-2" data-testid="batch-qr">
                <Qr text={batchUrl.url} size={260} label="Helper code to scan" />
                <p className="text-sm text-ink-soft">
                  {present.length} here, {batchUrl.n} pass{batchUrl.n === 1 ? "" : "es"} on {date}.
                </p>
              </div>
            )
          )}
        </Card>
      </div>
      {scanning && <Scanner onText={handle} onClose={() => setScanning(false)} />}
    </main>
  );
}
