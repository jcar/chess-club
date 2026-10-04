"use client";

import Link from "next/link";
import { useState } from "react";
import { STEPS, getLesson } from "@/content/curriculum";
import { StepDot } from "@/components/ui/ui";
import { settingsStore, useSettings } from "@/lib/settings";
import { clubStore, useClub, useMyProgress, useWho, whoStore } from "@/lib/club/store";
import { currentStep, hasPassed } from "@/lib/club/model";
import { passCodeFor } from "@/lib/passcode";
import { isEarlyReader } from "@/lib/young";
import { updateKid } from "@/lib/club/model";
import { useStation } from "@/lib/stationStore";

export function StudentHome() {
  const club = useClub();
  const me = useMyProgress();
  const who = useWho();
  const settings = useSettings();
  const station = useStation();
  // A station iPad (set up from today's card) asks who's playing in each lesson instead.
  const kids = station ? [] : club.kids.filter((k) => !k.archived);
  const kid = kids.find((k) => k.id === who.kidId) ?? null;
  const [pickingName, setPickingName] = useState(false);
  const [openStep, setOpenStep] = useState<number | null>(null);
  const young = station ? station.easy : isEarlyReader(kid, settings.young);

  const passed = (lessonId: string, step: number) => (kid ? hasPassed(club, kid, lessonId, step) : Boolean(me.passed[lessonId]));
  const activeStep = openStep ?? (kid ? currentStep(club, kid) : 1);

  if (settings.lockedLesson) {
    const l = getLesson(settings.lockedLesson);
    return <Locked lessonId={settings.lockedLesson} title={l ? (young ? (l.kidTitle ?? l.title) : l.title) : "Today's lesson"} pin={settings.pin} />;
  }

  const showNames = kids.length > 0 && (!kid || pickingName);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6">
      <header className="flex flex-wrap items-center gap-3">
        {!station && (
          <Link href="/" className="grid min-h-[60px] place-items-center rounded-2xl px-4 text-ink-soft ring-1 ring-line" aria-label="Home">
            ← Home
          </Link>
        )}
        <h1 className="flex-1 text-3xl font-bold">{kid ? `Hi, ${kid.name}! ${kid.animal ?? "👋"}` : station ? station.club : "Let's play chess!"}</h1>
        {kid && (
          <button type="button" onClick={() => setPickingName(true)} className="min-h-[60px] rounded-2xl bg-card px-5 text-lg ring-1 ring-line">
            Not {kid.name}?
          </button>
        )}
      </header>

      {showNames && (
        <section aria-label="Who is playing?" className="rounded-3xl bg-card p-5 ring-1 ring-line">
          <h2 className="mb-3 text-2xl font-bold">Who&apos;s playing?</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {kids.map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => {
                  whoStore.set({ kidId: k.id });
                  setPickingName(false);
                  setOpenStep(null);
                }}
                className="min-h-16 rounded-2xl bg-primary-soft px-3 text-xl font-semibold ring-1 ring-line active:scale-95"
              >
                <span className="mr-2" aria-hidden>
                  {k.animal}
                </span>
                {k.name}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                whoStore.set({ kidId: null });
                setPickingName(false);
              }}
              className="min-h-16 rounded-2xl bg-sunk px-3 text-lg ring-1 ring-line active:scale-95"
            >
              Just me
            </button>
          </div>
        </section>
      )}

      <section aria-label="Steps">
        <div className="flex flex-wrap gap-3">
          {STEPS.map((s) => (
            <button
              key={s.n}
              type="button"
              disabled={s.comingSoon}
              onClick={() => setOpenStep(s.n)}
              aria-pressed={activeStep === s.n}
              className={`flex min-h-[60px] items-center gap-2 rounded-full py-1.5 pr-4 pl-2 text-lg font-semibold ring-2 transition disabled:opacity-35 ${activeStep === s.n ? "bg-card ring-ink shadow" : "bg-card/60 ring-line"}`}
            >
              <StepDot n={s.n} />
              <span className="hidden sm:inline">{s.kidTitle}</span>
            </button>
          ))}
        </div>
      </section>

      <StepLessons step={activeStep} young={young} passed={passed} />

      {!station && (
        <section className="flex flex-wrap items-center gap-3 rounded-2xl bg-sunk p-4 text-lg">
          <button
            type="button"
            role="switch"
            aria-checked={young}
            onClick={() => {
              const on = !young;
              // Signed in: remember it for this kid. Otherwise: for this device.
              if (kid) clubStore.update((c) => updateKid(c, kid.id, { earlyReader: on }));
              else settingsStore.update((s) => ({ ...s, young: on }));
            }}
            className={`flex min-h-16 items-center gap-3 rounded-2xl px-5 text-xl font-semibold ring-2 ${young ? "bg-primary text-primary-ink ring-primary" : "bg-card ring-line"}`}
            data-testid="easy-reading"
          >
            <span aria-hidden>{young ? "🔊 ✓" : "🔊"}</span>
            Easy reading {young ? "on" : "off"}
          </button>
          <span className="text-base text-ink-soft">Simpler words, and questions and answers are read out loud.</span>
          {!kid && Object.keys(me.passed).length > 0 && <MyCodes passed={Object.keys(me.passed)} />}
        </section>
      )}
    </main>
  );
}

function StepLessons({ step, young, passed }: { step: number; young: boolean; passed: (id: string, step: number) => boolean }) {
  const s = STEPS.find((x) => x.n === step)!;
  if (s.comingSoon) return <p className="text-xl text-ink-soft">Step {s.n} is coming soon!</p>;
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {s.lessons.map((l, i) => {
        const done = passed(l.id, s.n);
        return (
          <Link
            key={l.id}
            href={`/student/lesson/${l.id}/`}
            className="flex min-h-28 items-center gap-4 rounded-3xl bg-card p-5 shadow-sm ring-2 ring-line transition active:scale-[.98]"
            data-testid={`lesson-${l.id}`}
          >
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-2xl font-bold text-white" style={{ background: `var(--step-${s.n})` }}>
              {done ? "⭐" : i + 1}
            </span>
            <span className="text-xl leading-tight font-semibold">{young ? (l.kidTitle ?? l.title) : l.title}</span>
          </Link>
        );
      })}
    </section>
  );
}

function MyCodes({ passed }: { passed: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="w-full">
      <button type="button" className="underline" onClick={() => setOpen((o) => !o)}>
        {open ? "Hide" : "Show"} my pass codes ({passed.length})
      </button>
      {open && (
        <ul className="mt-2 grid gap-1 sm:grid-cols-2">
          {passed.map((id) => {
            const l = getLesson(id);
            return l ? (
              <li key={id} className="flex justify-between gap-3 rounded-lg bg-card px-3 py-1">
                <span>{l.title}</span>
                <b className="font-mono tracking-wider">{passCodeFor(l)}</b>
              </li>
            ) : null;
          })}
        </ul>
      )}
    </div>
  );
}

function Locked({ lessonId, title, pin }: { lessonId: string; title: string; pin: string | null }) {
  const [entry, setEntry] = useState("");
  const [asking, setAsking] = useState(false);
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="text-xl text-ink-soft">Today&apos;s lesson</p>
      <Link href={`/student/lesson/${lessonId}/`} className="w-full rounded-3xl bg-primary px-8 py-10 font-display text-4xl font-bold text-primary-ink shadow-lg">
        {title} →
      </Link>
      {asking ? (
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!pin || entry === pin) settingsStore.update((s) => ({ ...s, lockedLesson: null }));
            setEntry("");
          }}
        >
          <input value={entry} onChange={(e) => setEntry(e.target.value)} inputMode="numeric" placeholder="Teacher PIN" className="rounded-xl px-3 py-2 ring-1 ring-line" aria-label="Teacher PIN" />
          <button type="submit" className="rounded-xl bg-card px-4 py-2 ring-1 ring-line">
            Unlock
          </button>
        </form>
      ) : (
        <button type="button" onClick={() => setAsking(true)} className="text-sm text-ink-soft underline">
          Teacher
        </button>
      )}
    </main>
  );
}
