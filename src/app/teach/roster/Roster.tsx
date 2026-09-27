"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { STEPS } from "@/content/curriculum";
import { Button, Card, PageHeader, StepDot } from "@/components/ui/ui";
import { clubStore, useClub } from "@/lib/club/store";
import { addKid, currentStep, hasPassed, recordPass, removePass, stepProgress, today, toggleAttendance, updateKid, type Club, type Kid } from "@/lib/club/model";
import { lessonForCode } from "@/lib/passcode";
import { isEarlyReader } from "@/lib/young";

export const GRADES = ["K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

export function Roster() {
  const club = useClub();
  const params = useSearchParams();
  const kidId = params.get("kid");
  const kid = club.kids.find((k) => k.id === kidId);
  if (kid) return <KidDetail club={club} kid={kid} />;
  return <RosterList club={club} />;
}

function RosterList({ club }: { club: Club }) {
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const date = today();
  const present = new Set(club.attendance[date] ?? []);
  const kids = club.kids.filter((k) => showArchived || !k.archived).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-5 pb-10">
      <PageHeader title="Roster & progress" back="/teach/" backLabel="Coach" />
      <div className="flex flex-col gap-5 px-4">
        <Card>
          <form
            className="flex flex-wrap items-end gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim()) return;
              clubStore.update((c) => addKid(c, name, grade || undefined));
              setName("");
            }}
          >
            <label className="flex flex-1 flex-col text-sm">
              First name or nickname
              <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 rounded-lg px-3 py-2 text-base ring-1 ring-line" placeholder="e.g. Maya R." data-testid="kid-name" />
            </label>
            <label className="flex flex-col text-sm">
              Grade
              <select value={grade} onChange={(e) => setGrade(e.target.value)} className="mt-1 rounded-lg px-3 py-2 text-base ring-1 ring-line">
                <option value="">–</option>
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </label>
            <Button type="submit">Add kid</Button>
          </form>
          <p className="mt-2 text-xs text-ink-soft">Use first names or nicknames only. The roster is saved in this browser and never sent anywhere.</p>
        </Card>

        <PassCodeBox club={club} />

        {kids.length === 0 ? (
          <p className="text-ink-soft">No kids yet. Add your club above.</p>
        ) : (
          <Card className="overflow-x-auto p-0">
            <table className="w-full text-left">
              <thead className="text-sm text-ink-soft">
                <tr className="border-b border-line">
                  <th className="p-3">Here today</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Grade</th>
                  <th className="p-3">Working on</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {kids.map((k) => {
                  const s = currentStep(club, k);
                  const p = stepProgress(club, k, s);
                  return (
                    <tr key={k.id} className={`border-b border-line last:border-0 ${k.archived ? "opacity-50" : ""}`}>
                      <td className="p-3">
                        <input type="checkbox" className="h-5 w-5 accent-[var(--primary)]" checked={present.has(k.id)} onChange={() => clubStore.update((c) => toggleAttendance(c, date, k.id))} aria-label={`${k.name} is here`} />
                      </td>
                      <td className="p-3 font-semibold">{k.name}</td>
                      <td className="p-3">{k.grade ?? "–"}</td>
                      <td className="p-3">
                        <span className="flex items-center gap-2">
                          <StepDot n={s} size="sm" />
                          {p.total ? `${p.done}/${p.total} lessons` : "Coming soon"}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <Link href={`/teach/roster/?kid=${k.id}`} className="text-info underline">
                          Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}
        {club.kids.some((k) => k.archived) && (
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} /> Show archived kids
          </label>
        )}
      </div>
    </main>
  );
}

function PassCodeBox({ club }: { club: Club }) {
  const [kidId, setKidId] = useState("");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const kids = club.kids.filter((k) => !k.archived);
  if (!kids.length) return null;
  return (
    <Card>
      <h2 className="text-lg font-bold">Enter a pass code</h2>
      <p className="text-sm text-ink-soft">When a kid passes on an iPad that isn&apos;t signed in, they get a code like S1-L2-7F.</p>
      <form
        className="mt-2 flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          const lesson = lessonForCode(code);
          const kid = kids.find((k) => k.id === kidId);
          if (!kid) return setMsg({ ok: false, text: "Pick a kid first." });
          if (!lesson) return setMsg({ ok: false, text: "That code doesn't look right. Check it and try again." });
          clubStore.update((c) => recordPass(c, kid.id, lesson.id, "code"));
          setMsg({ ok: true, text: `✓ ${kid.name} passed “${lesson.title}”.` });
          setCode("");
        }}
      >
        <select value={kidId} onChange={(e) => setKidId(e.target.value)} className="rounded-lg px-3 py-2 ring-1 ring-line" aria-label="Kid">
          <option value="">Kid…</option>
          {kids.map((k) => (
            <option key={k.id} value={k.id}>
              {k.name}
            </option>
          ))}
        </select>
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="S1-L2-7F" className="w-36 rounded-lg px-3 py-2 font-mono uppercase ring-1 ring-line" aria-label="Pass code" data-testid="pass-code-input" />
        <Button type="submit">Record</Button>
      </form>
      {msg && <p className={`mt-2 font-semibold ${msg.ok ? "text-good" : "text-oops"}`}>{msg.text}</p>}
    </Card>
  );
}

function KidDetail({ club, kid }: { club: Club; kid: Kid }) {
  const router = useRouter();
  const [name, setName] = useState(kid.name);
  const passes = club.passes[kid.id] ?? {};
  const attended = Object.values(club.attendance).filter((ids) => ids.includes(kid.id)).length;
  const upd = (patch: Partial<Kid>) => clubStore.update((c) => updateKid(c, kid.id, patch));

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-5 pb-10">
      <PageHeader title={kid.name} back="/teach/roster/" backLabel="Roster" />
      <div className="flex flex-col gap-5 px-4">
        <Card className="flex flex-wrap items-end gap-4">
          <label className="flex flex-col text-sm">
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} onBlur={() => name.trim() && upd({ name: name.trim() })} className="mt-1 rounded-lg px-3 py-2 text-base ring-1 ring-line" />
          </label>
          <label className="flex flex-col text-sm">
            Grade
            <select value={kid.grade ?? ""} onChange={(e) => upd({ grade: e.target.value || undefined })} className="mt-1 rounded-lg px-3 py-2 text-base ring-1 ring-line">
              <option value="">–</option>
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col text-sm">
            Already knows up to…
            <select value={kid.placedAt ?? ""} onChange={(e) => upd({ placedAt: e.target.value ? Number(e.target.value) : undefined })} className="mt-1 rounded-lg px-3 py-2 text-base ring-1 ring-line">
              <option value="">Start at Step 1</option>
              {STEPS.slice(1).map((s) => (
                <option key={s.n} value={s.n}>
                  Start at Step {s.n}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="h-5 w-5 accent-[var(--primary)]" checked={isEarlyReader(kid, false)} onChange={(e) => upd({ earlyReader: e.target.checked })} />
            Easy reading on the iPad (simpler words, read aloud)
          </label>
          <p className="text-sm text-ink-soft">Came to {attended} session{attended === 1 ? "" : "s"}</p>
          <Button
            tone="soft"
            className="ml-auto"
            onClick={() => {
              upd({ archived: !kid.archived });
              if (!kid.archived) router.push("/teach/roster/");
            }}
          >
            {kid.archived ? "Unarchive" : "Archive"}
          </Button>
        </Card>

        {STEPS.filter((s) => !s.comingSoon).map((s) => {
          const p = stepProgress(club, kid, s.n);
          const complete = p.done === p.total && p.total > 0;
          return (
            <Card key={s.n}>
              <div className="flex flex-wrap items-center gap-3">
                <StepDot n={s.n} />
                <h2 className="flex-1 text-xl font-bold">
                  Step {s.n}: {s.title}{" "}
                  <span className="text-base font-normal text-ink-soft">
                    ({p.done}/{p.total})
                  </span>
                </h2>
                {complete && (
                  <Link href={`/print/certificate/?kid=${kid.id}&step=${s.n}`} className="rounded-xl bg-star px-4 py-2 font-semibold text-ink shadow-sm">
                    🏅 Certificate
                  </Link>
                )}
              </div>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {s.lessons.map((l) => {
                  const done = hasPassed(club, kid, l.id, s.n);
                  const pass = passes[l.id];
                  const placed = !pass && done;
                  return (
                    <li key={l.id}>
                      <label className="flex items-center gap-3 rounded-xl bg-sunk px-3 py-2">
                        <input
                          type="checkbox"
                          className="h-5 w-5 accent-[var(--primary)]"
                          checked={done}
                          disabled={placed}
                          onChange={(e) => clubStore.update((c) => (e.target.checked ? recordPass(c, kid.id, l.id, "teacher") : removePass(c, kid.id, l.id)))}
                        />
                        <span className="flex-1 font-semibold">{l.title}</span>
                        <span className="text-xs text-ink-soft">{pass ? `${pass.date} · ${pass.via}` : placed ? "placed" : ""}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
