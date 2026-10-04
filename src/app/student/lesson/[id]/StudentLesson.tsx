"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getLesson, neighbors } from "@/content/curriculum";
import { BigButton, ExerciseScreen } from "@/components/exercise/ExerciseScreen";
import { MiniGameScreen } from "@/components/minigame/MiniGameScreen";
import { HopsGame } from "@/components/minigame/HopsGame";
import { Confetti } from "@/components/ui/Confetti";
import { Qr } from "@/components/ui/Qr";
import { useSettings } from "@/lib/settings";
import { clubStore, myStore, useClub, useWho } from "@/lib/club/store";
import { recordPass, today } from "@/lib/club/model";
import { passCodeFor } from "@/lib/passcode";
import { isEarlyReader } from "@/lib/young";
import { primeSpeechOnFirstTap, speak } from "@/lib/speech";
import { playCue } from "@/lib/sound";
import { useStation } from "@/lib/stationStore";
import type { StationKid } from "@/lib/station";
import { transferFragment } from "@/lib/transfer";
import { withBasePath } from "@/lib/basePath";
import { puzzleExercises } from "@/content/puzzles";
import type { Exercise, ExtraGame } from "@/content/types";

type Phase =
  | { p: "who" }
  | { p: "intro" }
  | { p: "game" }
  | { p: "more"; g: ExtraGame }
  | { p: "extra"; list: Exercise[]; i: number; right: number }
  | { p: "practice"; i: number }
  | { p: "checkIntro" }
  | { p: "check"; i: number; right: number }
  | { p: "result"; right: number };

/** Who is doing this lesson: a roster kid on a club iPad, a kid from today's station card, or nobody ("Just me"). */
interface Player {
  id?: string;
  name?: string;
  animal?: string;
}

export function StudentLesson({ id }: { id: string }) {
  const lesson = getLesson(id)!;
  const router = useRouter();
  const settings = useSettings();
  const club = useClub();
  const who = useWho();
  const station = useStation();
  const rosterKid = club.kids.find((k) => k.id === who.kidId) ?? null;
  // On a station iPad, kids pick themselves at the start of every lesson.
  const stationKids = station?.kids ?? [];
  const [picked, setPicked] = useState<StationKid | null | undefined>(undefined);
  const player: Player | null = station ? (picked ?? null) : rosterKid ? { id: rosterKid.id, name: rosterKid.name, animal: rosterKid.animal } : null;
  const young = station ? station.easy : isEarlyReader(rosterKid, settings.young);
  const readAloud = settings.readAloud;
  const [phase, setPhase] = useState<Phase>(stationKids.length ? { p: "who" } : { p: "intro" });
  const title = young ? (lesson.kidTitle ?? lesson.title) : lesson.title;
  const total = lesson.check.length;
  const locked = settings.lockedLesson === lesson.id;
  const next = locked ? undefined : neighbors(id).next;

  // The station loads after the first render (it's in localStorage).
  const [askedWho, setAskedWho] = useState(false);
  if (!askedWho && stationKids.length && phase.p === "intro" && picked === undefined) {
    setAskedWho(true);
    setPhase({ p: "who" });
  }

  useEffect(() => primeSpeechOnFirstTap(), []);
  useEffect(() => {
    if (!(readAloud && young)) return;
    if (phase.p === "who") speak("Who's playing? Tap your animal.");
    if (phase.p === "intro") speak(`${title}. Tap Start.`);
    if (phase.p === "checkIntro") speak(`Challenge time! Get ${lesson.passMark} right to win a star! Tap Go.`);
  }, [phase.p, readAloud, young, title, lesson.passMark]);

  const finish = (right: number) => {
    const passed = right >= lesson.passMark;
    if (passed) {
      const stars = right === total ? 3 : 2;
      if (!station && rosterKid) clubStore.update((c) => recordPass(c, rosterKid.id, lesson.id, "ipad"));
      else if (!station) myStore.update((m) => (m.passed[lesson.id] && m.passed[lesson.id].stars >= stars ? m : { passed: { ...m.passed, [lesson.id]: { date: today(), stars } } }));
    }
    setPhase({ p: "result", right });
    if (passed) playCue("pass");
    if (readAloud && young) speak(passed ? "You passed! Amazing! Show a grown-up your screen." : "Almost! Let's practice some more.");
  };

  const inProgress = phase.p === "practice" || phase.p === "check";
  const nextKid = () => {
    setPicked(undefined);
    setPhase({ p: "who" });
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-4 px-4 py-4">
      <header className="flex items-center gap-3">
        <Link
          href="/student/"
          onClick={(e) => {
            if (inProgress && !confirm("Leave this lesson? Your answers so far won't count.")) e.preventDefault();
          }}
          className="grid min-h-[60px] min-w-[60px] place-items-center rounded-2xl text-2xl text-ink-soft ring-1 ring-line"
          aria-label="Back to lessons"
        >
          ←
        </Link>
        <span className="h-4 w-4 rounded-full" style={{ background: `var(--step-${lesson.step})` }} aria-hidden />
        <h1 className="flex-1 truncate text-xl font-bold sm:text-2xl">{title}</h1>
        {player?.name && (
          <span className="flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-lg font-semibold" data-testid="player">
            <span className="text-2xl" aria-hidden>
              {player.animal}
            </span>
            {player.name}
          </span>
        )}
        {(phase.p === "practice" || phase.p === "check" || (phase.p === "extra" && phase.i < phase.list.length)) && (
          <Progress
            label={phase.p === "practice" ? "Practice" : phase.p === "extra" ? "Puzzles" : "Challenge"}
            at={phase.i}
            total={phase.p === "practice" ? lesson.practice.length : phase.p === "extra" ? phase.list.length : total}
          />
        )}
      </header>

      {phase.p === "who" && (
        <WhoPicker
          kids={stationKids}
          onPick={(k) => {
            setPicked(k);
            setPhase({ p: "intro" });
            if (readAloud && young) speak(k ? `Hi ${k.name}!` : "Let's go!");
          }}
        />
      )}

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
          {lesson.moreGames?.map((g) => (
            <BigButton key={g.id} tone="soft" onClick={() => setPhase({ p: "more", g })} testId={`game-${g.id}`}>
              {g.hops ? "⭐" : "🎮"} {young ? (g.kidTitle ?? g.title) : g.title}
            </BigButton>
          ))}
          {lesson.extra && !young && (
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
          {!young && (
            <button type="button" className="min-h-[60px] text-lg text-ink-soft underline" onClick={() => setPhase({ p: "checkIntro" })}>
              Skip to the challenge
            </button>
          )}
        </section>
      )}

      {phase.p === "more" &&
        (phase.g.hops ? (
          <HopsGame game={phase.g} young={young} readAloud={readAloud} onExit={() => setPhase({ p: "intro" })} />
        ) : phase.g.fen && phase.g.game ? (
          <MiniGameScreen activity={phase.g} young={young} readAloud={readAloud} onExit={() => setPhase({ p: "intro" })} />
        ) : null)}

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
          lessonId={lesson.id}
          right={phase.right}
          total={total}
          passMark={lesson.passMark}
          code={passCodeFor(lesson)}
          player={player}
          savedHere={!station && Boolean(rosterKid)}
          young={young}
          onRetry={() => setPhase({ p: "practice", i: 0 })}
          onNextKid={station ? nextKid : undefined}
          onNextLesson={next ? () => router.push(`/student/lesson/${next.id}/`) : undefined}
        />
      )}
    </main>
  );
}

function WhoPicker({ kids, onPick }: { kids: StationKid[]; onPick: (k: StationKid | null) => void }) {
  return (
    <section aria-label="Who is playing?" className="flex flex-1 flex-col items-center gap-5 py-4" data-testid="who">
      <h2 className="text-4xl font-bold">Who&apos;s playing?</h2>
      <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {kids.map((k) => (
          <button
            key={k.id}
            type="button"
            onClick={() => onPick(k)}
            className="flex min-h-28 flex-col items-center justify-center gap-1 rounded-3xl bg-card px-3 py-3 text-2xl font-semibold shadow-sm ring-2 ring-line active:scale-95"
            data-testid={`who-${k.name}`}
          >
            <span className="text-5xl" aria-hidden>
              {k.animal}
            </span>
            {k.name}
          </button>
        ))}
        <button type="button" onClick={() => onPick(null)} className="min-h-28 rounded-3xl bg-sunk px-3 text-xl ring-2 ring-line active:scale-95">
          I&apos;m not on the list
        </button>
      </div>
    </section>
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

interface ResultProps {
  lessonId: string;
  right: number;
  total: number;
  passMark: number;
  code: string;
  player: Player | null;
  /** The pass was saved in this iPad's own roster. */
  savedHere: boolean;
  young: boolean;
  onRetry: () => void;
  onNextKid?: () => void;
  onNextLesson?: () => void;
}

function Result({ lessonId, right, total, passMark, code, player, savedHere, young, onRetry, onNextKid, onNextLesson }: ResultProps) {
  const passed = right >= passMark;
  const stars = passed ? (right === total ? 3 : 2) : 0;
  // The pass, as a QR code an adult scans in Wrap-up (or opens with the phone camera).
  const qrUrl = useMemo(() => {
    if (!passed || typeof window === "undefined") return null;
    const frag = transferFragment({ kind: "pass", date: today(), lesson: lessonId, kidId: player?.id, name: player?.name, animal: player?.animal, stars });
    return `${window.location.origin}${withBasePath("/teach/wrapup/")}#${frag}`;
  }, [passed, lessonId, player, stars]);
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-5 text-center" data-testid="result">
      {passed && <Confetti />}
      <p className="text-6xl tracking-widest" aria-label={`${stars} stars`}>
        {passed ? "⭐".repeat(stars) + "☆".repeat(3 - stars) : "💪"}
      </p>
      <h2 className="text-4xl font-bold">
        {passed ? (young ? "You did it!" : "Passed!") : "Almost!"}
        {passed && player?.name ? ` ${player.animal ?? ""} ${player.name}` : ""}
      </h2>
      <p className="text-2xl text-ink-soft">
        {right} of {total} right{passed ? "" : `. You need ${passMark}.`}
      </p>
      {passed && qrUrl && (
        <div className="flex flex-col items-center gap-2 rounded-3xl bg-card px-6 py-5 shadow ring-2 ring-star" data-testid="pass-qr">
          <p className="text-xl font-semibold">{savedHere ? "Saved! A grown-up can also scan this:" : "Show a grown-up! 📷"}</p>
          <Qr text={qrUrl} size={220} label="Pass code to scan" />
          <p className="text-sm text-ink-soft">
            Or type this code: <b className="font-mono tracking-wider" data-testid="pass-code">{code}</b>
          </p>
        </div>
      )}
      <div className="flex flex-wrap justify-center gap-3">
        {!passed && <BigButton onClick={onRetry}>Practice again</BigButton>}
        {onNextKid ? (
          <BigButton onClick={onNextKid} testId="next-kid">
            Next kid 👋
          </BigButton>
        ) : passed && onNextLesson ? (
          <BigButton onClick={onNextLesson} testId="next-lesson">
            Next lesson →
          </BigButton>
        ) : (
          <Link href="/student/" className="grid min-h-16 min-w-40 place-items-center rounded-2xl bg-card px-8 font-display text-2xl font-semibold shadow-md ring-2 ring-line">
            {passed ? "All lessons" : "Back"}
          </Link>
        )}
      </div>
    </section>
  );
}
