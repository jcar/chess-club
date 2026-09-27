"use client";

import Link from "next/link";
import { useState } from "react";
import { getLesson } from "@/content/curriculum";
import { BigButton, ExerciseScreen } from "@/components/exercise/ExerciseScreen";
import { MiniGameScreen } from "@/components/minigame/MiniGameScreen";
import { Confetti } from "@/components/ui/Confetti";
import { useSettings } from "@/lib/settings";
import { clubStore, myStore, useClub, useWho } from "@/lib/club/store";
import { recordPass, today } from "@/lib/club/model";
import { passCodeFor } from "@/lib/passcode";
import { isYoungGrade } from "@/lib/young";
import { speak } from "@/lib/speech";
import { puzzleExercises } from "@/content/puzzles";
import type { Exercise } from "@/content/types";

type Phase = { p: "intro" } | { p: "game" } | { p: "extra"; list: Exercise[]; i: number; right: number } | { p: "practice"; i: number } | { p: "checkIntro" } | { p: "check"; i: number; right: number } | { p: "result"; right: number };

export function StudentLesson({ id }: { id: string }) {
  const lesson = getLesson(id)!;
  const settings = useSettings();
  const club = useClub();
  const who = useWho();
  const kid = club.kids.find((k) => k.id === who.kidId) ?? null;
  const young = kid ? (isYoungGrade(kid.grade) ?? settings.young) : settings.young;
  const readAloud = settings.readAloud;
  const [phase, setPhase] = useState<Phase>({ p: "intro" });
  const title = young ? (lesson.kidTitle ?? lesson.title) : lesson.title;
  const total = lesson.check.length;

  const finish = (right: number) => {
    const passed = right >= lesson.passMark;
    if (passed) {
      const stars = right === total ? 3 : 2;
      if (kid) clubStore.update((c) => recordPass(c, kid.id, lesson.id, "ipad"));
      else myStore.update((m) => (m.passed[lesson.id] && m.passed[lesson.id].stars >= stars ? m : { passed: { ...m.passed, [lesson.id]: { date: today(), stars } } }));
    }
    setPhase({ p: "result", right });
    if (readAloud && young) speak(passed ? "You passed! Amazing!" : "Almost! Let's practice some more.");
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-4 px-4 py-4">
      <header className="flex items-center gap-3">
        <Link href="/student/" className="rounded-xl px-3 py-2 text-ink-soft ring-1 ring-line" aria-label="Back to lessons">
          ←
        </Link>
        <span className="h-4 w-4 rounded-full" style={{ background: `var(--step-${lesson.step})` }} aria-hidden />
        <h1 className="flex-1 truncate text-xl font-bold sm:text-2xl">{title}</h1>
        {(phase.p === "practice" || phase.p === "check" || (phase.p === "extra" && phase.i < phase.list.length)) && (
          <Progress
            label={phase.p === "practice" ? "Practice" : phase.p === "extra" ? "Puzzles" : "Challenge"}
            at={phase.i}
            total={phase.p === "practice" ? lesson.practice.length : phase.p === "extra" ? phase.list.length : total}
          />
        )}
      </header>

      {phase.p === "intro" && (
        <section className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <p className="text-2xl text-ink-soft">{young ? "Ready?" : lesson.goal}</p>
          <BigButton onClick={() => setPhase({ p: "practice", i: 0 })} testId="start">
            Start ▶
          </BigButton>
          {lesson.activity.game && lesson.activity.fen && (
            <BigButton tone="soft" onClick={() => setPhase({ p: "game" })} testId="play-game">
              🎮 Play {lesson.activity.kidTitle ?? lesson.activity.title}
            </BigButton>
          )}
          {lesson.extra && (
            <BigButton
              tone="soft"
              testId="extra"
              onClick={() => {
                // A fresh random handful each time, so repeat visits feel new.
                const all = puzzleExercises(lesson.extra!);
                const list = [...all].sort(() => Math.random() - 0.5).slice(0, 8);
                setPhase({ p: "extra", list, i: 0, right: 0 });
              }}
            >
              🧩 Extra puzzles
            </BigButton>
          )}
          <button type="button" className="text-lg text-ink-soft underline" onClick={() => setPhase({ p: "checkIntro" })}>
            Skip to the challenge
          </button>
        </section>
      )}

      {phase.p === "game" && lesson.activity.fen && lesson.activity.game && (
        <MiniGameScreen activity={lesson.activity} young={young} readAloud={readAloud} onExit={() => setPhase({ p: "intro" })} />
      )}

      {phase.p === "practice" && (
        <ExerciseScreen
          key={`p-${phase.i}`}
          ex={lesson.practice[phase.i]}
          mode="practice"
          young={young}
          readAloud={readAloud}
          onNext={() => setPhase(phase.i + 1 < lesson.practice.length ? { p: "practice", i: phase.i + 1 } : { p: "checkIntro" })}
        />
      )}

      {phase.p === "extra" &&
        (phase.i < phase.list.length ? (
          <ExerciseScreen
            key={`x-${phase.list[phase.i].id}`}
            ex={phase.list[phase.i]}
            mode="practice"
            young={young}
            readAloud={readAloud}
            onNext={(ok) => setPhase({ ...phase, i: phase.i + 1, right: phase.right + (ok ? 1 : 0) })}
          />
        ) : (
          <section className="flex flex-1 flex-col items-center justify-center gap-5 text-center" data-testid="extra-done">
            <p className="text-6xl" aria-hidden>
              🧩
            </p>
            <h2 className="text-4xl font-bold">Nice work!</h2>
            <p className="text-2xl text-ink-soft">
              {phase.right} of {phase.list.length} on the first try.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <BigButton onClick={() => setPhase({ p: "intro" })}>Done</BigButton>
            </div>
            <p className="text-sm text-ink-soft">Puzzles from lichess.org</p>
          </section>
        ))}

      {phase.p === "checkIntro" && (
        <section className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <p className="text-6xl" aria-hidden>
            🏆
          </p>
          <h2 className="text-4xl font-bold">{young ? "Challenge time!" : "Pass check"}</h2>
          <p className="text-2xl text-ink-soft">
            {young ? `Get ${lesson.passMark} right to win a star!` : `Get ${lesson.passMark} of ${total} right on the first try to pass.`}
          </p>
          <BigButton onClick={() => setPhase({ p: "check", i: 0, right: 0 })} testId="start-check">
            Go! ▶
          </BigButton>
        </section>
      )}

      {phase.p === "check" && (
        <ExerciseScreen
          key={`c-${phase.i}`}
          ex={lesson.check[phase.i]}
          mode="check"
          young={young}
          readAloud={readAloud}
          onNext={(ok) => {
            const right = phase.right + (ok ? 1 : 0);
            if (phase.i + 1 < total) setPhase({ p: "check", i: phase.i + 1, right });
            else finish(right);
          }}
        />
      )}

      {phase.p === "result" && (
        <Result
          right={phase.right}
          total={total}
          passMark={lesson.passMark}
          code={passCodeFor(lesson)}
          kidName={kid?.name}
          young={young}
          onRetry={() => setPhase({ p: "practice", i: 0 })}
        />
      )}
    </main>
  );
}

function Progress({ label, at, total }: { label: string; at: number; total: number }) {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-ink-soft" aria-label={`${label} ${at + 1} of ${total}`}>
      <span className="hidden sm:inline">{label}</span>
      <div className="flex gap-1">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`h-3 w-3 rounded-full ${i < at ? "bg-good" : i === at ? "bg-ink" : "bg-line"}`} />
        ))}
      </div>
    </div>
  );
}

function Result({ right, total, passMark, code, kidName, young, onRetry }: { right: number; total: number; passMark: number; code: string; kidName?: string; young: boolean; onRetry: () => void }) {
  const passed = right >= passMark;
  const stars = passed ? (right === total ? 3 : 2) : 0;
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-5 text-center" data-testid="result">
      {passed && <Confetti />}
      <p className="text-6xl tracking-widest" aria-label={`${stars} stars`}>
        {passed ? "⭐".repeat(stars) + "☆".repeat(3 - stars) : "💪"}
      </p>
      <h2 className="text-4xl font-bold">{passed ? (young ? "You did it!" : "Passed!") : "Almost!"}</h2>
      <p className="text-2xl text-ink-soft">
        {right} of {total} right{passed ? "" : `. You need ${passMark}.`}
      </p>
      {passed && !kidName && (
        <div className="rounded-3xl bg-card px-8 py-5 shadow ring-2 ring-star">
          <p className="text-lg text-ink-soft">Show your teacher this code:</p>
          <p className="font-mono text-5xl font-bold tracking-[0.2em]" data-testid="pass-code">
            {code}
          </p>
        </div>
      )}
      {passed && kidName && <p className="text-xl">Saved for {kidName}. Your teacher will see it! ✅</p>}
      <div className="flex flex-wrap justify-center gap-3">
        {!passed && <BigButton onClick={onRetry}>Practice again</BigButton>}
        <Link href="/student/" className="grid min-h-16 min-w-40 place-items-center rounded-2xl bg-card px-8 font-display text-2xl font-semibold shadow-md ring-2 ring-line">
          {passed ? "Next lesson →" : "Back"}
        </Link>
      </div>
    </section>
  );
}
