"use client";

import { useCallback, useRef, useState } from "react";
import type { Activity, Square } from "@/content/types";
import { Board } from "@/components/board/Board";
import { BigButton } from "@/components/exercise/ExerciseScreen";
import { Confetti } from "@/components/ui/Confetti";
import { destinations, load, turnOf } from "@/lib/chess/rules";
import { botMove, outcome, type Winner } from "@/lib/chess/minibot";
import { speak } from "@/lib/speech";

interface Props {
  activity: Activity;
  young: boolean;
  readAloud: boolean;
  onExit: () => void;
}

/** Play a lesson's mini-game against the rule-based bot. */
export function MiniGameScreen({ activity, young, readAloud, onExit }: Props) {
  const game = activity.game!;
  const start = activity.fen!;
  const you = game.youPlay === "white" ? "w" : "b";
  const [fen, setFen] = useState(start);
  const [last, setLast] = useState<{ from: Square; to: Square } | undefined>();
  const [winner, setWinner] = useState<Winner | null>(null);
  const [thinking, setThinking] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const announce = useCallback(
    (w: Winner) => {
      setWinner(w);
      const text = w === "draw" ? "It's a draw!" : w === game.youPlay ? "You win!" : "The computer wins this time.";
      if (readAloud && young) speak(text);
    },
    [game.youPlay, readAloud, young],
  );

  const getMoves = useCallback(
    (sq: Square) => {
      if (winner || thinking || turnOf(fen) !== you) return [];
      const p = load(fen).get(sq as never);
      return p && p.color === you ? destinations(fen, sq) : [];
    },
    [fen, winner, thinking, you],
  );

  const onMove = (from: Square, to: Square) => {
    const g = load(fen);
    const m = g.move({ from, to, promotion: "q" });
    const after = g.fen();
    setFen(after);
    setLast({ from, to });
    const w = outcome(after, m, game);
    if (w) return announce(w);
    setThinking(true);
    timer.current = setTimeout(() => {
      const reply = botMove(after, Math.random, young ? 0.4 : 0.15);
      setThinking(false);
      if (!reply) return announce("draw");
      const g2 = load(after);
      const m2 = g2.move({ from: reply.slice(0, 2), to: reply.slice(2, 4), promotion: "q" });
      setFen(g2.fen());
      setLast({ from: m2.from, to: m2.to });
      const w2 = outcome(g2.fen(), m2, game);
      if (w2) announce(w2);
    }, 550);
  };

  const reset = () => {
    if (timer.current) clearTimeout(timer.current);
    setFen(start);
    setLast(undefined);
    setWinner(null);
    setThinking(false);
  };

  return (
    <section className="flex flex-col items-center gap-4" data-testid="minigame">
      <div className="w-full max-w-3xl text-center">
        <h2 className="text-3xl font-bold">{young ? (activity.kidTitle ?? activity.title) : activity.title}</h2>
        <p className="mt-1 text-lg text-ink-soft">{activity.rules[1] ?? activity.rules[0]}</p>
      </div>
      {winner === game.youPlay && <Confetti />}
      <Board fen={fen} orientation={game.youPlay} size="lg" getMoves={getMoves} onMove={onMove} lastMove={last} />
      <p className="min-h-10 font-display text-2xl font-semibold" aria-live="polite" data-testid="game-status">
        {winner ? (winner === "draw" ? "Draw! 🤝" : winner === game.youPlay ? "You win! 🎉" : "Computer wins. Try again!") : thinking ? "Thinking…" : "Your move"}
      </p>
      <div className="flex gap-3">
        <BigButton tone="soft" onClick={reset}>
          ↺ New game
        </BigButton>
        <BigButton onClick={onExit}>Done</BigButton>
      </div>
    </section>
  );
}
