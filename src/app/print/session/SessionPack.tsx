"use client";

// Everything to print for one session, from its saved plan: a cover (agenda,
// groups, warm-up, helper setup), station cards, worksheets with names filled
// in, answer keys, game cards, a check-off sheet and (optional) name tents.

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getStep } from "@/content/curriculum";
import { getWarmup } from "@/content/warmups";
import type { Lesson } from "@/content/types";
import { GameCard, PageBox, Sheet } from "@/components/print/Sheets";
import { CheckOffSheet, NameTent, StationCard } from "@/components/print/Cards";
import { Qr } from "@/components/ui/Qr";
import { useClub } from "@/lib/club/store";
import { today, type Kid } from "@/lib/club/model";
import { computePlan, usePlans } from "@/lib/club/planStore";
import { stationFor } from "@/lib/club/stations";
import { stationFragment } from "@/lib/station";
import { rosterFragment } from "@/lib/club/share";
import { isEarlyReader } from "@/lib/young";
import { passCodeFor } from "@/lib/passcode";
import { appUrl, useOrigin } from "@/lib/useOrigin";

const PARTS = [
  { key: "cover", label: "Cover & agenda", on: true },
  { key: "stations", label: "Station cards", on: true },
  { key: "sheets", label: "Worksheets", on: true },
  { key: "keys", label: "Answer keys", on: true },
  { key: "games", label: "Game cards", on: true },
  { key: "checkoff", label: "Check-off sheet", on: true },
  { key: "tents", label: "Name tents", on: false },
] as const;

function chunk<T>(list: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < list.length; i += n) out.push(list.slice(i, i + n));
  return out;
}

export function SessionPack() {
  const params = useSearchParams();
  const router = useRouter();
  const club = useClub();
  const plans = usePlans();
  const origin = useOrigin();
  const date = params.get("date") || today();
  const saved = plans[date];
  const on = (k: string) => {
    const v = params.get(k);
    return v === null ? PARTS.find((p) => p.key === k)!.on : v === "1";
  };
  const toggle = (k: string, value: boolean) => {
    const q = new URLSearchParams(params.toString());
    q.set(k, value ? "1" : "0");
    router.replace(`?${q.toString()}`);
  };

  if (!saved) {
    return (
      <main className="mx-auto max-w-xl p-8">
        <p>
          No plan saved for {date}. <Link href="/teach/plan/" className="text-info underline">Plan the session</Link> first: the pack is built from it.
        </p>
      </main>
    );
  }

  const plan = computePlan(club, saved);
  const warmup = getWarmup(saved.warmup);
  const expectedKids = club.kids.filter((k) => saved.expected.includes(k.id));
  const lessons = [...new Map(plan.groups.flatMap((g) => [g.lesson, ...g.kids.map((k) => k.own).filter(Boolean)] as Lesson[]).map((l) => [l.id, l])).values()];
  const groupLabel = (g: (typeof plan.groups)[number]) => (g.whole ? "Early readers" : `Step ${g.step}`);
  // Worksheets: every kid without an iPad gets their own lesson's sheets, named.
  const paper = plan.groups.flatMap((g) => g.kids.slice(g.ipads).map(({ kid, own }) => ({ kid, lesson: own ?? g.lesson, young: g.whole || isEarlyReader(kid, false) })));
  const stations = plan.groups.filter((g) => g.ipads > 0).map((g) => ({ g, station: stationFor(club, g, { date, lock: saved.lock, pin: saved.pin }) }));
  const rosterUrl = origin ? `${appUrl(origin, "/teach/devices/")}#${rosterFragment(club)}` : "";

  return (
    <div className="bg-neutral-200 print:bg-white">
      <div className="no-print sticky top-0 z-10 flex flex-wrap items-center gap-3 bg-paper px-4 py-3 shadow">
        <Link href="/teach/plan/" className="rounded-xl px-3 py-2 ring-1 ring-line">
          ← Plan
        </Link>
        {PARTS.map((p) => (
          <label key={p.key} className="flex items-center gap-2">
            <input type="checkbox" checked={on(p.key)} onChange={(e) => toggle(p.key, e.target.checked)} /> {p.label}
          </label>
        ))}
        <button type="button" onClick={() => window.print()} className="ml-auto rounded-xl bg-primary px-5 py-2 font-semibold text-primary-ink">
          🖨 Print
        </button>
      </div>

      <div className="mx-auto flex max-w-[8.5in] flex-col gap-6 py-6 print:gap-0 print:py-0" data-testid="session-pack">
        {on("cover") && (
          <PageBox>
            <header className="border-b-2 border-black pb-2">
              <p className="text-[11px] tracking-wide uppercase">Session pack</p>
              <h1 className="text-3xl font-bold">
                {club.name} · {date}
              </h1>
              <p className="text-sm">
                {saved.minutes} minutes · {expectedKids.length} kids · adults: {saved.adults.join(", ")} · {saved.ipads} iPads
              </p>
            </header>
            <h2 className="mt-3 text-lg font-bold">Agenda</h2>
            <table className="w-full text-sm">
              <tbody>
                {plan.agenda.map((a, i) => (
                  <tr key={i} className="border-b border-neutral-300 align-top">
                    <td className="w-24 py-1 font-mono">
                      {a.start}–{a.start + a.minutes}
                    </td>
                    <td className="py-1">
                      <b>{a.title}</b> <span className="text-neutral-600">{a.detail}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h2 className="mt-3 text-lg font-bold">Groups</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {plan.groups.map((g) => (
                <div key={g.key} className="avoid-break flex gap-2 rounded border border-neutral-400 p-2">
                  <div className="flex-1">
                    <p className="font-bold">
                      {groupLabel(g)}: {g.lesson.title}
                    </p>
                    <p>
                      👤 {g.adult ?? "no adult"} · {g.medium === "ipad" ? "iPads" : g.medium === "mixed" ? `${g.ipads} iPads + paper` : "paper"} · code {passCodeFor(g.lesson)}
                    </p>
                    <p className="mt-1">{g.kids.map(({ kid, own }) => `${kid.animal ?? ""} ${kid.name}${own ? ` (${own.title})` : ""}`).join(", ")}</p>
                  </div>
                  {origin && (
                    <div className="text-center text-[10px]">
                      <Qr text={appUrl(origin, `/teach/lesson/${g.lesson.id}/`)} size={78} label={`Script for ${g.lesson.title}`} />
                      script
                    </div>
                  )}
                </div>
              ))}
            </div>
            {warmup && (
              <div className="avoid-break mt-3 rounded border border-neutral-400 p-2 text-sm">
                <p className="font-bold">
                  Warm-up: {warmup.title} ({warmup.minutes} min) · {warmup.materials.join(", ")}
                </p>
                <ol className="list-decimal pl-5">
                  {warmup.steps.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
                {warmup.older && <p className="mt-1">Older kids: {warmup.older}</p>}
              </div>
            )}
            <div className="avoid-break mt-3 flex gap-3 rounded border border-neutral-400 p-2 text-sm">
              {rosterUrl && <Qr text={rosterUrl} size={140} label="Roster for helpers" />}
              <div>
                <p className="font-bold">Helpers&apos; phones</p>
                <p>Scan this to load the roster (first names only, kept on your phone). At the end, open Coach → Wrap-up, tick your group&apos;s passes, then “Show my code” for the club keeper to scan.</p>
                <p className="mt-1">Kids on iPads show a pass code when they pass: scan it in Wrap-up.</p>
              </div>
            </div>
          </PageBox>
        )}

        {on("stations") &&
          chunk(stations, 2).map((pair, i) => (
            <PageBox key={`st-${i}`}>
              <div className="flex flex-col gap-[0.3in]">
                {pair.map(({ g, station }) => (
                  <StationCard key={g.key} station={station} lesson={g.lesson} label={groupLabel(g)} url={origin ? `${appUrl(origin, "/student/go/")}#${stationFragment(station)}` : ""} />
                ))}
              </div>
            </PageBox>
          ))}

        {on("sheets") &&
          paper.flatMap(({ kid, lesson, young }) => sheetsFor(kid, lesson, young, date))}

        {on("keys") &&
          lessons.map((l) => (
            <Sheet key={`key-${l.id}`} lesson={l} stepTitle={getStep(l.step)!.title} title={l.title} heading="Pass check (answer key)" items={l.check} young={false} answerKey footer={<p>Passing score: <b>{l.passMark} of {l.check.length}</b>. Pass code <b className="font-mono">{passCodeFor(l)}</b>.</p>} />
          ))}

        {on("games") && lessons.map((l) => <GameCard key={`game-${l.id}`} lesson={l} />)}

        {on("checkoff") && (
          <PageBox>
            <CheckOffSheet title={`${club.name}: check-off`} kids={expectedKids} lessons={lessons} date={date} />
          </PageBox>
        )}

        {on("tents") &&
          chunk(expectedKids, 2).map((pair, i) => (
            <PageBox key={`tent-${i}`}>
              <div className="flex flex-col gap-[0.2in]">
                {pair.map((k) => (
                  <NameTent key={k.id} kid={k} club={club.name} />
                ))}
              </div>
            </PageBox>
          ))}
      </div>
    </div>
  );
}

function sheetsFor(kid: Kid, lesson: Lesson, young: boolean, date: string) {
  const step = getStep(lesson.step)!;
  const title = young ? (lesson.kidTitle ?? lesson.title) : lesson.title;
  return [
    <Sheet key={`${kid.id}-p`} lesson={lesson} stepTitle={step.title} title={title} heading="Practice" items={lesson.practice} young={young} answerKey={false} name={`${kid.animal ?? ""} ${kid.name}`} date={date} />,
    <Sheet
      key={`${kid.id}-c`}
      lesson={lesson}
      stepTitle={step.title}
      title={title}
      heading={`Pass check: get ${lesson.passMark} of ${lesson.check.length} right`}
      items={lesson.check}
      young={young}
      answerKey={false}
      name={`${kid.animal ?? ""} ${kid.name}`}
      date={date}
      footer={<p>For the teacher: ___ of {lesson.check.length} right. &nbsp;☐ Passed</p>}
    />,
  ];
}
