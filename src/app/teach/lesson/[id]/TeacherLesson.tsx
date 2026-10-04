"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { getLesson, getStep, neighbors } from "@/content/curriculum";
import type { Demo, Exercise, Lesson } from "@/content/types";
import { Board } from "@/components/board/Board";
import { ExercisePrint, printPrompt } from "@/components/exercise/ExercisePrint";
import { Card, LinkButton, StepDot } from "@/components/ui/ui";
import { destinations, play } from "@/lib/chess/rules";
import { answerFor } from "@/lib/exercise/answers";
import { passCodeFor } from "@/lib/passcode";
import { puzzleExercises } from "@/content/puzzles";
import { OPENINGLAB_URL } from "@/content/links";

export function TeacherLesson({ id }: { id: string }) {
  const lesson = getLesson(id)!;
  const step = getStep(lesson.step)!;
  const { prev, next } = neighbors(id);
  // Present mode keeps its place in the URL (#present=3), so a refresh or a
  // shared projector laptop picks up where the teacher was.
  const [presenting, setPresenting] = useState<number | null>(null);
  useEffect(() => {
    const m = window.location.hash.match(/^#present=(\d+)$/);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (m) setPresenting(Number(m[1]));
  }, []);
  const exit = useCallback(() => {
    setPresenting(null);
    history.replaceState(null, "", window.location.pathname + window.location.search);
    if (document.fullscreenElement) void document.exitFullscreen?.();
  }, []);

  if (presenting !== null) return <Present lesson={lesson} start={presenting} onExit={exit} />;

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-5 px-4 py-4">
      <header className="flex flex-wrap items-center gap-3">
        <Link href="/teach/" className="rounded-xl px-3 py-2 text-ink-soft ring-1 ring-line">
          ← Lessons
        </Link>
        <StepDot n={step.n} />
        <div className="flex-1">
          <p className="text-sm text-ink-soft">
            Step {step.n}: {step.title} · about {lesson.minutes + lesson.activity.minutes} min
          </p>
          <h1 className="text-3xl font-bold">{lesson.title}</h1>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setPresenting(0)} className="rounded-xl bg-primary px-5 py-3 text-lg font-semibold text-primary-ink shadow" data-testid="present">
          ▶ Present
        </button>
        <LinkButton href={`/print/lesson/${lesson.id}/`} tone="soft" className="py-3">
          🖨 Worksheet
        </LinkButton>
        <LinkButton href={`/print/lesson/${lesson.id}/?key=1`} tone="soft" className="py-3">
          🔑 Answer key
        </LinkButton>
        <LinkButton href={`/print/lesson/${lesson.id}/?young=1`} tone="soft" className="py-3">
          🖨 Easy-reading worksheet
        </LinkButton>
      </div>

      <Card>
        <p className="text-lg">
          <b>Goal:</b> {lesson.goal}
        </p>
        <p className="mt-2 text-ink-soft">
          <b>You need:</b> {lesson.materials.join(" · ")}
        </p>
        {lesson.readingHeavy && (
          <p className="mt-2 rounded-lg bg-sunk px-3 py-2" data-testid="reading-heavy">
            📖 <b>Early readers:</b> {lesson.readingHeavy}
          </p>
        )}
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-bold">1 · Teach it ({lesson.minutes} min)</h2>
        <p className="text-ink-soft">Read these out loud, or put them in your own words. Show each board on screen or set it up on a demo board.</p>
        <ol className="flex flex-col gap-3">
          {lesson.script.map((b, i) => (
            <li key={i}>
              <Card className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1">
                  <p className="text-lg leading-relaxed">
                    <span className="mr-2 font-bold text-ink-soft">{i + 1}.</span>“{b.say}”
                  </p>
                  {b.do && <p className="mt-2 text-sm text-info italic">👉 {b.do}</p>}
                </div>
                {b.demo && (
                  <div className="w-full sm:w-56">
                    <Board fen={b.demo.fen} size="sm" arrows={b.demo.arrows} highlight={b.demo.highlight} orientation={b.demo.orientation} showCoords={false} />
                  </div>
                )}
              </Card>
            </li>
          ))}
        </ol>
        {lesson.k2Tip && (
          <Card className="bg-primary-soft">
            <b>With younger kids:</b> {lesson.k2Tip}
          </Card>
        )}
        {lesson.commonMistakes && (
          <Card>
            <b>Watch for:</b>
            <ul className="mt-1 list-disc pl-6">
              {lesson.commonMistakes.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </Card>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-bold">
          2 · Play it: {lesson.activity.title} ({lesson.activity.minutes} min)
        </h2>
        <Card>
          <p>
            <b>Set up:</b> {lesson.activity.setup}
          </p>
          <ol className="mt-2 list-decimal pl-6">
            {lesson.activity.rules.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ol>
          {lesson.activity.game && <p className="mt-2 text-sm text-ink-soft">🎮 Kids with an iPad can also play this against the computer in student mode.</p>}
          {lesson.moreGames?.length ? (
            <p className="mt-2 text-sm text-ink-soft">
              🎮 Also on the iPad: {lesson.moreGames.map((g) => `${g.title} (${g.rules.join(" ")})`).join("; ")}
            </p>
          ) : null}
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-bold">3 · Practice and pass check</h2>
        <p className="text-ink-soft">
          On iPads, kids open <b>Student → Step {step.n} → {lesson.kidTitle ?? lesson.title}</b>. On paper, print the worksheet. A kid passes by getting{" "}
          <b>
            {lesson.passMark} of {lesson.check.length}
          </b>{" "}
          on the pass check. The pass code for this lesson is <b className="font-mono">{passCodeFor(lesson)}</b>.
        </p>
        {lesson.extra && (
          <p className="text-ink-soft">
            🧩 <b>Extra puzzles:</b> {puzzleExercises(lesson.extra).length} real puzzles from lichess.org for kids who finish early: the <b>Extra puzzles</b> button in student mode, or tick <b>Extra puzzles</b> on the worksheet page (8 per set).
          </p>
        )}
        {lesson.openingLab && (
          <p className="text-ink-soft">
            🏠 <b>Practice at home:</b> older kids can drill the {lesson.openingLab} in{" "}
            <a className="font-semibold text-primary underline" href={OPENINGLAB_URL} target="_blank" rel="noopener noreferrer">
              OpeningLab
            </a>
            , our free sister site (works offline too).
          </p>
        )}
        <ExerciseGrid title="Practice" items={lesson.practice} />
        <ExerciseGrid title="Pass check" items={lesson.check} />
      </section>

      <p className="text-sm text-ink-soft">Topic order based on: {lesson.sources.join("; ")}. All wording is original.</p>

      <nav className="flex justify-between gap-3 pb-8">
        {prev ? <LinkButton href={`/teach/lesson/${prev.id}/`} tone="soft">← {prev.title}</LinkButton> : <span />}
        {next && <LinkButton href={`/teach/lesson/${next.id}/`} tone="soft">{next.title} →</LinkButton>}
      </nav>
    </main>
  );
}

function ExerciseGrid({ title, items }: { title: string; items: Exercise[] }) {
  return (
    <details className="rounded-2xl bg-card p-4 ring-1 ring-line">
      <summary className="cursor-pointer text-lg font-semibold">
        {title} ({items.length}) with answers
      </summary>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((ex, i) => (
          <ExercisePrint key={ex.id} ex={ex} n={i + 1} young={false} answerKey />
        ))}
      </div>
    </details>
  );
}

/** Full-screen, one beat at a time, for a projector or TV. The board is live: tap pieces to move them. */
function Present({ lesson, start, onExit }: { lesson: Lesson; start: number; onExit: () => void }) {
  const beats: { say: string; do?: string; demo?: Demo; ex?: Exercise }[] = [
    ...lesson.script,
    ...lesson.practice.slice(0, 3).map((ex) => ({ say: `Let's try one together: ${printPrompt(ex, false).replace("Draw a dot on", "Point to")}`, demo: ex.fen ? { fen: ex.fen, orientation: ex.orientation } : undefined, ex })),
  ];
  const [i, setI] = useState(() => Math.min(Math.max(0, start), beats.length - 1));
  const [reveal, setReveal] = useState(false);
  const beat = beats[i];
  const swipe = useRef<number | null>(null);
  useEffect(() => {
    history.replaceState(null, "", `${window.location.pathname}${window.location.search}#present=${i}`);
  }, [i]);
  const canFullscreen = typeof document !== "undefined" && Boolean(document.documentElement.requestFullscreen);
  const go = useCallback((d: number) => {
    setI((x) => Math.min(beats.length - 1, Math.max(0, x + d)));
    setReveal(false);
  }, [beats.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") go(1);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "Escape") onExit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onExit]);

  return (
    <main className="flex min-h-dvh flex-col gap-4 p-4 lg:flex-row lg:items-center lg:gap-10 lg:p-10" data-testid="present-mode">
      {canFullscreen && (
        <button
          type="button"
          onClick={() => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen())}
          className="fixed top-3 right-3 z-10 rounded-xl bg-card px-3 py-2 text-sm ring-1 ring-line"
          aria-label="Full screen"
        >
          ⛶
        </button>
      )}
      <div className="flex flex-1 justify-center">
        {beat.demo ? <LiveBoard key={i} demo={beat.demo} ex={beat.ex} reveal={reveal} /> : <div className="text-8xl">♟</div>}
      </div>
      <div
        className="flex flex-col gap-6 lg:w-[38%]"
        onTouchStart={(e) => (swipe.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          // Swipe the text side (not the board, which uses touches for moves).
          if (swipe.current === null) return;
          const dx = e.changedTouches[0].clientX - swipe.current;
          swipe.current = null;
          if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
        }}
      >
        <p className="text-sm font-semibold text-ink-soft">
          {lesson.title} · {i + 1} / {beats.length}
        </p>
        <p className="font-display text-3xl leading-snug font-semibold lg:text-4xl">{beat.say}</p>
        {beat.do && <p className="text-lg text-info italic">👉 {beat.do}</p>}
        {beat.ex && (
          <button type="button" className="self-start rounded-xl bg-card px-4 py-2 ring-1 ring-line" onClick={() => setReveal((r) => !r)}>
            {reveal ? "Hide answer" : "Show answer"}
          </button>
        )}
        <div className="sticky bottom-0 flex gap-3 bg-paper py-2 lg:static lg:bg-transparent lg:py-0">
          <button type="button" onClick={() => go(-1)} disabled={i === 0} className="rounded-xl bg-card px-5 py-3 text-lg ring-1 ring-line disabled:opacity-40">
            ← Back
          </button>
          <button type="button" onClick={() => go(1)} disabled={i === beats.length - 1} className="rounded-xl bg-primary px-6 py-3 text-lg font-semibold text-primary-ink disabled:opacity-40" data-testid="present-next">
            Next →
          </button>
          <button type="button" onClick={onExit} className="ml-auto rounded-xl px-4 py-3 text-ink-soft ring-1 ring-line">
            Exit
          </button>
        </div>
      </div>
    </main>
  );
}

function LiveBoard({ demo, ex, reveal }: { demo: Demo; ex?: Exercise; reveal: boolean }) {
  const [fen, setFen] = useState(demo.fen);
  const getMoves = useCallback((sq: string) => destinations(fen, sq), [fen]);
  const a = ex && reveal ? answerFor(ex) : null;
  const pieceSquare = ex?.kind === "reach" || ex?.kind === "stars" ? [ex.square] : [];
  return (
    <div className="w-full">
      <Board
        fen={fen}
        size="lg"
        orientation={demo.orientation}
        getMoves={getMoves}
        onMove={(from, to) => {
          const p = play(fen, from, to);
          if (p) setFen(p.fen);
        }}
        arrows={a?.kind === "moves" ? a.moves.map((m) => ({ from: m.slice(0, 2), to: m.slice(2, 4), color: "#1f8a4c" })) : demo.arrows}
        highlight={demo.highlight ?? pieceSquare}
        goodSquares={a?.kind === "squares" ? a.squares : undefined}
        stars={ex?.kind === "stars" ? ex.stars : undefined}
      />
      {fen !== demo.fen && (
        <div className="mt-2 text-center">
          <button type="button" className="text-ink-soft underline" onClick={() => setFen(demo.fen)}>
            Reset board
          </button>
        </div>
      )}
    </div>
  );
}
