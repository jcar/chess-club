"use client";

// A helper's phone: their group's lesson script, their kids, and a check-off.
// At the end, "Send to the club keeper" shows a batch code to scan in Wrap-up.

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, PageHeader } from "@/components/ui/ui";
import { Qr } from "@/components/ui/Qr";
import { Scanner } from "@/components/teach/Scanner";
import { getLesson } from "@/content/curriculum";
import { createLocalStore, useLocalStore } from "@/lib/store";
import { parseGroupFragment, type GroupLink } from "@/lib/groupLink";
import { parseTransfer, transferFragment, type PassTransfer } from "@/lib/transfer";
import { appUrl, useOrigin } from "@/lib/useOrigin";

interface Check {
  /** The group link this check-off belongs to (one at a time). */
  link: GroupLink | null;
  present: string[];
  passed: string[];
}
const checkStore = createLocalStore<Check>("chessclub:groupcheck", { link: null, present: [], passed: [] });

const same = (a: GroupLink, b: GroupLink) => a.date === b.date && a.lesson === b.lesson && a.label === b.label && a.club === b.club;

export function GroupView() {
  const check = useLocalStore(checkStore);
  const origin = useOrigin();
  const [bad, setBad] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [sending, setSending] = useState(false);
  const [unknown, setUnknown] = useState<PassTransfer[]>([]);
  const [note, setNote] = useState("");

  // Arriving from the QR: keep ticks if it's the same group, otherwise start fresh.
  useEffect(() => {
    if (!window.location.hash) return;
    const link = parseGroupFragment(window.location.hash);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!link) return setBad(true);
    const cur = checkStore.getSnapshot();
    if (!cur.link || !same(cur.link, link)) checkStore.set({ link, present: [], passed: [] });
    else checkStore.set({ ...cur, link });
  }, []);

  const g = check.link;
  const lesson = g ? getLesson(g.lesson) : undefined;
  const toggle = (list: "present" | "passed", id: string) =>
    checkStore.update((c) => {
      const has = c[list].includes(id);
      const next = { ...c, [list]: has ? c[list].filter((x) => x !== id) : [...c[list], id] };
      // Passing implies being here.
      if (list === "passed" && !has && !next.present.includes(id)) next.present = [...next.present, id];
      return next;
    });

  const handle = useCallback(
    (text: string) => {
      const t = parseTransfer(text);
      const cur = checkStore.getSnapshot();
      if (!t || t.kind !== "pass" || !cur.link) return setNote("That isn't a pass code.");
      if (t.lesson !== cur.link.lesson) return setNote(`That pass is for “${getLesson(t.lesson)?.title}”, not your group's lesson.`);
      const kid = cur.link.kids.find((k) => k.id === t.kidId);
      if (!kid) {
        setUnknown((u) => [...u, t]);
        return setNote("Who was that? Pick them below.");
      }
      checkStore.update((c) => ({ ...c, present: [...new Set([...c.present, kid.id])], passed: [...new Set([...c.passed, kid.id])] }));
      setNote(`✓ ${kid.animal} ${kid.name} passed`);
    },
    [],
  );

  const batchUrl = useMemo(() => {
    if (!sending || !g || !origin) return "";
    const frag = transferFragment({ kind: "batch", date: g.date, present: check.present, passes: check.passed.map((id) => [id, g.lesson] as [string, string]), from: g.adult ?? g.label });
    return `${appUrl(origin, "/teach/wrapup/")}#${frag}`;
  }, [sending, g, origin, check.present, check.passed]);

  if (bad && !g) return <p className="p-8">This group code didn&apos;t scan right. Scan it again from the session pack.</p>;
  if (!g || !lesson) return <p className="p-8">Scan your group&apos;s code on the session pack cover to open it here.</p>;

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 pb-12">
      <PageHeader title={`${g.label}: ${lesson.title}`}>
        <Button onClick={() => setScanning(true)}>📷 Scan</Button>
      </PageHeader>
      <div className="flex flex-col gap-4 px-4">
        <p className="text-ink-soft">
          {g.club} · {g.date}
          {g.adult ? ` · ${g.adult}` : ""} · pass mark {lesson.passMark} of {lesson.check.length}
        </p>
        {note && (
          <p className="font-semibold" aria-live="polite" data-testid="group-note">
            {note}
          </p>
        )}

        {unknown.map((t, i) => (
          <Card key={i}>
            <p className="font-semibold">Who passed{t.name ? ` (says “${t.name}”)` : ""}?</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {g.kids.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  className="rounded-full bg-card px-4 py-2 font-semibold ring-1 ring-line"
                  onClick={() => {
                    checkStore.update((c) => ({ ...c, present: [...new Set([...c.present, k.id])], passed: [...new Set([...c.passed, k.id])] }));
                    setUnknown((u) => u.filter((_, j) => j !== i));
                  }}
                >
                  {k.animal} {k.name}
                </button>
              ))}
            </div>
          </Card>
        ))}

        <Card>
          <h2 className="text-lg font-bold">Your kids</h2>
          <ul className="mt-2 flex flex-col divide-y divide-line" data-testid="group-kids">
            {g.kids.map((k) => {
              const here = check.present.includes(k.id);
              const passed = check.passed.includes(k.id);
              return (
                <li key={k.id} className="flex items-center gap-3 py-2">
                  <span className="flex-1 text-lg font-semibold">
                    {k.animal} {k.name}
                  </span>
                  <button type="button" aria-pressed={here} onClick={() => toggle("present", k.id)} className={`min-h-12 rounded-xl px-4 ring-1 ${here ? "bg-primary text-primary-ink ring-primary" : "bg-card ring-line"}`}>
                    {here ? "✓ Here" : "Here?"}
                  </button>
                  <button
                    type="button"
                    aria-pressed={passed}
                    aria-label={`${k.name} passed`}
                    onClick={() => toggle("passed", k.id)}
                    className={`min-h-12 rounded-xl px-4 ring-1 ${passed ? "bg-good text-white ring-good" : "bg-card ring-line"}`}
                  >
                    {passed ? "⭐ Passed" : "Passed?"}
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card>
          <h2 className="text-lg font-bold">Teach it ({lesson.minutes} min)</h2>
          {lesson.readingHeavy && <p className="mt-1 rounded-lg bg-sunk px-3 py-1 text-sm">📖 {lesson.readingHeavy}</p>}
          <ol className="mt-2 list-decimal space-y-2 pl-6">
            {lesson.script.map((b, i) => (
              <li key={i}>
                “{b.say}”{b.do && <span className="block text-sm text-info italic">👉 {b.do}</span>}
              </li>
            ))}
          </ol>
          {lesson.k2Tip && <p className="mt-2 text-sm">With younger kids: {lesson.k2Tip}</p>}
          <Link href={`/teach/lesson/${lesson.id}/`} className="mt-2 inline-block text-info underline">
            Open the full lesson (demo boards, Present mode, answers)
          </Link>
        </Card>

        <Card>
          <h2 className="text-lg font-bold">Table game: {lesson.activity.kidTitle ?? lesson.activity.title}</h2>
          <p className="text-sm">{lesson.activity.setup}</p>
          <ol className="mt-1 list-decimal pl-6 text-sm">
            {lesson.activity.rules.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ol>
          {lesson.commonMistakes?.length ? <p className="mt-2 text-sm">Watch for: {lesson.commonMistakes.join(" ")}</p> : null}
        </Card>

        <Card>
          <h2 className="text-lg font-bold">Send to the club keeper</h2>
          <p className="text-sm text-ink-soft">At the end, show this code. They tap “Scan codes” in Wrap-up.</p>
          {!sending ? (
            <Button className="mt-2" onClick={() => setSending(true)}>
              Show my code
            </Button>
          ) : (
            batchUrl && (
              <div className="mt-2 flex flex-col items-start gap-1" data-testid="group-batch">
                <Qr text={batchUrl} size={260} label="Group results to scan" />
                <p className="text-sm text-ink-soft">
                  {check.present.length} here · {check.passed.length} passed
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
