"use client";

// Hops: one piece, one star at a time. Hop to the star in as few moves as you
// can; each star is a little further away. No opponent, no reading needed.

import { useEffect, useState } from "react";
import type { ExtraGame, Square } from "@/content/types";
import { board } from "@/content/authoring";
import { Board } from "@/components/board/Board";
import { BigButton } from "@/components/exercise/ExerciseScreen";
import { Confetti } from "@/components/ui/Confetti";
import { destinations, fewestMovesToStars, play } from "@/lib/chess/rules";
import { speak } from "@/lib/speech";
import { playCue } from "@/lib/sound";

const ROUNDS = 5;
const SQUARES = Array.from({ length: 64 }, (_, i) => `${"abcdefgh"[i % 8]}${Math.floor(i / 8) + 1}`);

/** A star `want` hops away from `from` (or as close as possible). */
function nextStar(piece: string, from: Square, want: number): { star: Square; best: number } {
  const fen = board({ [piece]: from });
  const options = SQUARES.filter((sq) => sq !== from)
    .map((sq) => ({ star: sq, best: fewestMovesToStars(fen, from, [sq]) ?? 99 }))
    .filter((o) => o.best < 99);
  const exact = options.filter((o) => o.best === want);
  const pool = exact.length ? exact : options.filter((o) => o.best === Math.max(...options.map((x) => x.best).filter((b) => b <= want)));
  return pool[Math.floor(Math.random() * pool.length)];
}

export function HopsGame({ game, young, readAloud, onExit }: { game: ExtraGame; young: boolean; readAloud: boolean; onExit: () => void }) {
  const piece = game.hops ?? "N";
  const [state, setState] = useState(() => {
    const at = "b1";
    return { at, round: 1, hops: 0, perfect: 0, ...nextStar(piece, at, 1) };
  });
  const [last, setLast] = useState<{ from: Square; to: Square } | undefined>();
  const done = state.round > ROUNDS;
  const fen = board({ [piece]: state.at });

  useEffect(() => {
    if (readAloud && young && state.round === 1 && state.hops === 0) speak(`${game.kidTitle ?? game.title}. ${game.rules.join(" ")}`);
  }, [readAloud, young, game, state.round, state.hops]);

  const onMove = (from: Square, to: Square) => {
    const p = play(fen, from, to, { keepTurn: true });
    if (!p) return;
    setLast({ from, to });
    const hops = state.hops + 1;
    if (to !== state.star) return setState({ ...state, at: to, hops });
    const perfect = hops <= state.best;
    playCue(perfect ? "star" : "right");
    if (readAloud && young) speak(perfect ? "Perfect!" : "You got it!");
    const round = state.round + 1;
    if (round > ROUNDS) {
      playCue("win");
      return setState({ ...state, at: to, hops: 0, round, perfect: state.perfect + (perfect ? 1 : 0) });
    }
    setState({ at: to, round, hops: 0, perfect: state.perfect + (perfect ? 1 : 0), ...nextStar(piece, to, Math.min(round, 4)) });
  };

  return (
    <section className="flex flex-col items-center gap-4" data-testid="hops">
      <div className="w-full max-w-3xl text-center">
        <h2 className="text-3xl font-bold">{young ? (game.kidTitle ?? game.title) : game.title}</h2>
        <p className="mt-1 text-lg text-ink-soft">{game.rules.join(" ")}</p>
      </div>
      {done && <Confetti />}
      <Board fen={fen} size="lg" getMoves={(sq) => (!done && sq === state.at ? destinations(fen, sq) : [])} onMove={onMove} stars={done ? [] : [state.star]} highlight={[state.at]} lastMove={last} />
      <p className="font-display text-2xl font-semibold" aria-live="polite" data-testid="hops-status">
        {done ? `All ${ROUNDS} stars! ${state.perfect} perfect ⭐` : `Star ${state.round} of ${ROUNDS} · hops: ${state.hops} (🐾 ${state.best})`}
      </p>
      <div className="flex gap-3">
        {done && (
          <BigButton tone="soft" onClick={() => setState({ at: "b1", round: 1, hops: 0, perfect: 0, ...nextStar(piece, "b1", 1) })}>
            ↺ Again
          </BigButton>
        )}
        <BigButton onClick={onExit}>Done</BigButton>
      </div>
    </section>
  );
}
