"use client";

// The interactive (iPad) renderer for one exercise. Practice mode lets a kid
// retry with hints and a "show me"; check mode (the pass check) takes the
// first answer. The parent must key this component by exercise id so state
// resets between exercises.

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChoiceExercise, Exercise, MoveExercise, ReachExercise, Square, StarsExercise, TapExercise, Words } from "@/content/types";
import { Board } from "@/components/board/Board";
import { answerFor } from "@/lib/exercise/answers";
import { destinations, load, matchesAnswer, play, turnOf } from "@/lib/chess/rules";
import { speak } from "@/lib/speech";

export type Mode = "practice" | "check";

interface Props {
  ex: Exercise;
  mode: Mode;
  young: boolean;
  readAloud: boolean;
  /** Called when the kid taps Next. `firstTry` = right on the first attempt. */
  onNext: (firstTry: boolean) => void;
}

type Status = { state: "playing" } | { state: "right"; firstTry: boolean; note?: string } | { state: "wrong"; note: string; final: boolean };

export function words(w: Words | undefined, young: boolean): string {
  if (!w) return "";
  return young ? (w.kid ?? w.text) : w.text;
}

export function ExerciseScreen({ ex, mode, young, readAloud, onNext }: Props) {
  const prompt = words(ex.prompt, young);
  const [status, setStatus] = useState<Status>({ state: "playing" });
  const [misses, setMisses] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (readAloud && young) speak(prompt);
  }, [prompt, readAloud, young]);

  const right = useCallback(
    (note?: string) => {
      setStatus({ state: "right", firstTry: misses === 0, note });
      if (readAloud && young) speak(note ?? "Great job!");
    },
    [misses, readAloud, young],
  );
  const wrong = useCallback(
    (note: string) => {
      const final = mode === "check";
      setMisses((m) => m + 1);
      setShowHint(true);
      setStatus({ state: "wrong", note, final });
      if (readAloud && young) speak(note);
    },
    [mode, readAloud, young],
  );
  const retry = () => setStatus({ state: "playing" });

  const done = status.state === "right" || (status.state === "wrong" && status.final) || revealed;
  const firstTry = status.state === "right" && status.firstTry;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex w-full max-w-3xl items-start gap-3">
        <p className="flex-1 font-display text-2xl leading-snug font-semibold sm:text-3xl" data-testid="prompt">
          {prompt}
        </p>
        <button
          type="button"
          onClick={() => speak(prompt)}
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-card text-2xl shadow ring-1 ring-line"
          aria-label="Read it to me"
        >
          🔊
        </button>
      </div>

      <Body ex={ex} young={young} status={status} revealed={revealed} onRight={right} onWrong={wrong} />

      <div className="flex min-h-16 w-full max-w-3xl flex-wrap items-center justify-center gap-3" aria-live="polite">
        {status.state === "right" && (
          <p className="pop font-display text-2xl font-semibold text-good" data-testid="feedback-right">
            {status.note ?? (young ? "Yes! 🎉" : "Correct! 🎉")}
          </p>
        )}
        {status.state === "wrong" && (
          <p className="shake text-xl font-semibold text-oops" data-testid="feedback-wrong">
            {status.note}
          </p>
        )}
        {showHint && ex.hint && !done && <p className="w-full text-center text-lg text-ink-soft">💡 {words(ex.hint, young)}</p>}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {status.state === "wrong" && !status.final && !revealed && (
          <BigButton onClick={retry} tone="soft">
            Try again
          </BigButton>
        )}
        {mode === "practice" && misses >= 2 && !done && (
          <BigButton onClick={() => setRevealed(true)} tone="soft">
            Show me
          </BigButton>
        )}
        {done && (
          <BigButton onClick={() => onNext(firstTry)} testId="next">
            Next →
          </BigButton>
        )}
      </div>
    </div>
  );
}

export function BigButton({ children, onClick, tone = "primary", testId, disabled }: { children: React.ReactNode; onClick: () => void; tone?: "primary" | "soft"; testId?: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      data-testid={testId}
      disabled={disabled}
      onClick={onClick}
      className={`min-h-16 min-w-40 rounded-2xl px-8 font-display text-2xl font-semibold shadow-md transition active:scale-95 disabled:opacity-40 ${
        tone === "primary" ? "bg-primary text-primary-ink" : "bg-card text-ink ring-2 ring-line"
      }`}
    >
      {children}
    </button>
  );
}

interface BodyProps {
  young: boolean;
  status: Status;
  revealed: boolean;
  onRight: (note?: string) => void;
  onWrong: (note: string) => void;
}

function Body(props: BodyProps & { ex: Exercise }) {
  const { ex } = props;
  switch (ex.kind) {
    case "reach":
      return <Reach {...props} ex={ex} />;
    case "stars":
      return <Stars {...props} ex={ex} />;
    case "move":
      return <MoveIt {...props} ex={ex} />;
    case "tap":
      return <Tap {...props} ex={ex} />;
    case "choice":
      return <Choice {...props} ex={ex} />;
  }
}

function Reach({ ex, status, revealed, young, onRight, onWrong }: BodyProps & { ex: ReachExercise }) {
  const answer = useMemo(() => new Set(destinations(ex.fen, ex.square)), [ex]);
  const [picked, setPicked] = useState<Set<Square>>(new Set());
  const playing = status.state === "playing" && !revealed;
  const judged = status.state !== "playing" || revealed;

  const toggle = (sq: Square) => {
    if (!playing || sq === ex.square) return;
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(sq)) next.delete(sq);
      else next.add(sq);
      return next;
    });
  };

  const check = () => {
    const found = [...picked].filter((s) => answer.has(s)).length;
    const extra = [...picked].filter((s) => !answer.has(s));
    if (found === answer.size && extra.length === 0) return onRight(young ? "You found them all! 🎉" : `All ${answer.size} squares! 🎉`);
    if (extra.length) {
      // Drop the wrong picks so "Try again" starts from what was right.
      setPicked((prev) => new Set([...prev].filter((s) => answer.has(s))));
      return onWrong(young ? "Oops! Some of those squares don't work." : `${extra.length} of your squares can't be reached.`);
    }
    onWrong(young ? `You found ${found}. There are more!` : `You found ${found} of ${answer.size}. Keep looking!`);
  };

  const pickedList = [...picked];
  return (
    <>
      <Board
        fen={ex.fen}
        orientation={ex.orientation}
        size="lg"
        onSquareTap={toggle}
        highlight={[ex.square]}
        dots={judged ? [] : pickedList}
        goodSquares={judged ? (revealed || status.state === "right" || (status.state === "wrong" && status.final) ? [...answer] : pickedList.filter((s) => answer.has(s))) : []}
        badSquares={[]}
      />
      {playing && (
        <BigButton onClick={check} disabled={picked.size === 0} testId="check">
          ✓ Done
        </BigButton>
      )}
    </>
  );
}

function Stars({ ex, status, revealed, young, onRight, onWrong }: BodyProps & { ex: StarsExercise }) {
  const fewest = (answerFor(ex) as { moves: number }).moves;
  const [pos, setPos] = useState({ fen: ex.fen, at: ex.square, got: [] as Square[], moves: 0 });
  const playing = status.state === "playing" && !revealed;
  const left = ex.stars.filter((s) => !pos.got.includes(s));

  const getMoves = useCallback((sq: Square) => (playing && sq === pos.at ? destinations(pos.fen, pos.at) : []), [playing, pos]);
  const onMove = (from: Square, to: Square) => {
    const p = play(pos.fen, from, to, { keepTurn: true });
    if (!p) return;
    const got = ex.stars.includes(to) && !pos.got.includes(to) ? [...pos.got, to] : pos.got;
    const next = { fen: p.fen, at: to, got, moves: pos.moves + 1 };
    setPos(next);
    if (got.length === ex.stars.length) {
      if (next.moves <= fewest) onRight(young ? "You got it! ⭐" : `Perfect: ${next.moves} move${next.moves === 1 ? "" : "s"}! ⭐`);
      else onWrong(`You made it in ${next.moves} moves. Can you do it in ${fewest}?`);
    }
  };
  const reset = () => setPos({ fen: ex.fen, at: ex.square, got: [], moves: 0 });

  // "Try again" (status back to playing) should also put the piece back.
  const [lastStatus, setLastStatus] = useState(status.state);
  if (lastStatus !== status.state) {
    setLastStatus(status.state);
    if (status.state === "playing") reset();
  }

  return (
    <>
      <Board fen={pos.fen} orientation={ex.orientation} size="lg" getMoves={getMoves} onMove={onMove} stars={left} highlight={playing ? [pos.at] : []} />
      <div className="flex items-center gap-4 text-xl">
        <span data-testid="move-count">
          Moves: <b>{pos.moves}</b>
        </span>
        {revealed && <span className="font-semibold text-good">It can be done in {fewest}.</span>}
        {playing && pos.moves > 0 && (
          <button type="button" onClick={reset} className="rounded-xl bg-card px-4 py-2 ring-2 ring-line">
            ↺ Start over
          </button>
        )}
      </div>
    </>
  );
}

function MoveIt({ ex, status, revealed, young, onRight, onWrong }: BodyProps & { ex: MoveExercise }) {
  const [shown, setShown] = useState<{ fen: string; last?: { from: Square; to: Square }; bad?: Square }>({ fen: ex.fen });
  const playing = status.state === "playing" && !revealed;
  const turn = turnOf(ex.fen);

  const getMoves = useCallback(
    (sq: Square) => {
      if (!playing) return [];
      const piece = load(ex.fen).get(sq as never);
      return piece && piece.color === turn ? destinations(ex.fen, sq) : [];
    },
    [playing, ex.fen, turn],
  );

  const onMove = (from: Square, to: Square) => {
    const p = play(ex.fen, from, to);
    if (!p) return;
    if (matchesAnswer(p.uci, ex.answers)) {
      setShown({ fen: p.fen, last: { from, to } });
      onRight(p.mate ? (young ? "Checkmate! 🎉" : `${p.san}, checkmate! 🎉`) : undefined);
    } else {
      setShown({ fen: ex.fen, bad: to });
      const why =
        ex.goal === "capture" && !p.captured ? "That doesn't capture anything." : ex.goal === "check" && !p.check ? "That isn't check." : ex.goal === "mate" && !p.mate ? (p.check ? "Check, but the king can escape!" : "That isn't checkmate.") : "Not that one.";
      onWrong(young ? "Not quite! Try another move." : why);
    }
  };

  const answer = ex.answers[0];
  return (
    <Board
      fen={shown.fen}
      orientation={ex.orientation ?? (turn === "b" ? "black" : "white")}
      size="lg"
      getMoves={getMoves}
      onMove={onMove}
      lastMove={shown.last}
      badSquares={status.state === "wrong" && shown.bad ? [shown.bad] : []}
      arrows={revealed || (status.state === "wrong" && status.final) ? [{ from: answer.slice(0, 2), to: answer.slice(2, 4), color: "#1f8a4c" }] : []}
      stars={young ? ex.kidMarks : undefined}
    />
  );
}

function Tap({ ex, status, revealed, young, onRight, onWrong }: BodyProps & { ex: TapExercise }) {
  const [bad, setBad] = useState<Square | null>(null);
  const [good, setGood] = useState<Square | null>(null);
  const playing = status.state === "playing" && !revealed;
  const onTap = (sq: Square) => {
    if (!playing) return;
    if (ex.answers.includes(sq)) {
      setGood(sq);
      setBad(null);
      onRight();
    } else {
      setBad(sq);
      onWrong(young ? "Not that one. Try again!" : "Not that square.");
    }
  };
  const showAnswer = revealed || (status.state === "wrong" && status.final);
  return (
    <Board
      fen={ex.fen}
      orientation={ex.orientation}
      size="lg"
      onSquareTap={onTap}
      goodSquares={good ? [good] : showAnswer ? ex.answers : []}
      badSquares={status.state === "wrong" && bad ? [bad] : []}
      stars={young ? ex.kidMarks : undefined}
    />
  );
}

function Choice({ ex, status, revealed, young, onRight, onWrong }: BodyProps & { ex: ChoiceExercise }) {
  const [picked, setPicked] = useState<number | null>(null);
  const playing = status.state === "playing" && !revealed;
  const pick = (i: number) => {
    if (!playing) return;
    setPicked(i);
    if (i === ex.answer) onRight();
    else onWrong(young ? "Not quite!" : "Not quite.");
  };
  const showAnswer = status.state === "right" || revealed || (status.state === "wrong" && status.final);
  return (
    <>
      {ex.fen && <Board fen={ex.fen} orientation={ex.orientation} size="md" />}
      <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-2">
        {ex.options.map((o, i) => {
          const isAnswer = showAnswer && i === ex.answer;
          const isBad = status.state === "wrong" && picked === i;
          return (
            <button
              key={i}
              type="button"
              data-testid={`option-${i}`}
              onClick={() => pick(i)}
              className={`min-h-20 rounded-2xl px-6 text-2xl font-semibold shadow-sm ring-2 transition active:scale-95 ${
                isAnswer ? "bg-good text-white ring-good" : isBad ? "bg-oops/15 ring-oops" : "bg-card ring-line"
              }`}
            >
              {words(o, young)}
            </button>
          );
        })}
      </div>
    </>
  );
}
