"use client";

// Interactive board: a wrapper around react-chessboard v5, adapted from
// OpeningLab's Board. Tap-to-move is the main input (tap a piece, its squares
// light up, tap one), because young kids on iPads find it far easier than
// dragging. Dragging still works.

import { useMemo, useState } from "react";
import { Chessboard } from "react-chessboard";
import type { Orientation, Square } from "@/content/types";

export type BoardSize = "lg" | "md" | "sm";

export interface BoardProps {
  fen: string;
  orientation?: Orientation;
  size?: BoardSize;
  /** Legal destinations for tap-to-move. With `onMove`, enables moving. */
  getMoves?: (square: Square) => Square[];
  onMove?: (from: Square, to: Square) => void;
  /** Raw square taps (reach/tap exercises). Takes precedence over tap-to-move. */
  onSquareTap?: (square: Square) => void;
  /** Allow dragging pieces (tap-to-move always works). */
  draggable?: boolean;
  stars?: Square[];
  /** Small dots, e.g. squares a kid picked in a "reach" exercise. */
  dots?: Square[];
  goodSquares?: Square[];
  badSquares?: Square[];
  highlight?: Square[];
  arrows?: { from: Square; to: Square; color?: string }[];
  lastMove?: { from: Square; to: Square };
  showCoords?: boolean;
}

const STAR_SVG =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%23f2b705' stroke='%239a6f00' stroke-width='1' d='M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7-6.3-3.9-6.3 3.9 1.7-7L2 9.5l7.1-.6z'/></svg>\")";

const STYLE = {
  star: { backgroundImage: STAR_SVG, backgroundSize: "70%", backgroundRepeat: "no-repeat", backgroundPosition: "center" },
  dest: { background: "radial-gradient(circle, rgba(31,42,55,0.35) 22%, transparent 24%)" },
  capture: { background: "radial-gradient(circle, transparent 60%, rgba(31,42,55,0.4) 62%)" },
  dot: { background: "radial-gradient(circle, rgba(44,110,203,0.85) 26%, transparent 28%)" },
  selected: { background: "rgba(242,183,5,0.55)" },
  highlight: { boxShadow: "inset 0 0 0 4px rgba(44,110,203,0.9)", background: "rgba(44,110,203,0.25)" },
  good: { background: "radial-gradient(circle, rgba(31,138,76,0.9) 26%, transparent 28%), rgba(31,138,76,0.25)" },
  bad: { background: "radial-gradient(circle, rgba(214,69,69,0.9) 26%, transparent 28%), rgba(214,69,69,0.2)" },
  last: { background: "rgba(242,183,5,0.35)" },
} satisfies Record<string, React.CSSProperties>;

const SIZE: Record<BoardSize, string> = {
  // lg: student iPad and projector; fills most of the short side of the screen.
  lg: "max-w-[min(94vw,760px,74svh)]",
  md: "max-w-[min(92vw,520px,62svh)]",
  sm: "max-w-[260px]",
};

function occupied(fen: string): Set<string> {
  const out = new Set<string>();
  fen
    .split(" ")[0]
    .split("/")
    .forEach((row, r) => {
      let f = 0;
      for (const ch of row) {
        if (/\d/.test(ch)) f += Number(ch);
        else out.add("abcdefgh"[f++] + (8 - r));
      }
    });
  return out;
}

export function Board({
  fen,
  orientation = "white",
  size = "md",
  getMoves,
  onMove,
  onSquareTap,
  draggable = true,
  stars,
  dots,
  goodSquares,
  badSquares,
  highlight,
  arrows,
  lastMove,
  showCoords = true,
}: BoardProps) {
  const canMove = Boolean(getMoves && onMove);
  // The selection belongs to the position it was made on, so it clears itself
  // when the FEN changes instead of needing an effect.
  const [sel, setSel] = useState<{ square: Square; fen: string } | null>(null);
  const selected = sel && sel.fen === fen ? sel.square : null;
  const dests = useMemo(() => (selected && getMoves ? getMoves(selected) : []), [selected, getMoves]);

  const squareStyles = useMemo(() => {
    const s: Record<string, React.CSSProperties> = {};
    const add = (sq: Square, style: React.CSSProperties) => (s[sq] = { ...s[sq], ...style });
    if (lastMove) [lastMove.from, lastMove.to].forEach((q) => add(q, STYLE.last));
    stars?.forEach((q) => add(q, STYLE.star));
    highlight?.forEach((q) => add(q, STYLE.highlight));
    const occ = dests.length ? occupied(fen) : null;
    dests.forEach((q) => add(q, occ?.has(q) ? STYLE.capture : STYLE.dest));
    if (selected) add(selected, STYLE.selected);
    dots?.forEach((q) => add(q, STYLE.dot));
    goodSquares?.forEach((q) => add(q, STYLE.good));
    badSquares?.forEach((q) => add(q, STYLE.bad));
    return s;
  }, [fen, lastMove, stars, highlight, dests, selected, dots, goodSquares, badSquares]);

  function tap(square: Square) {
    if (onSquareTap) return onSquareTap(square);
    if (!canMove) return;
    if (selected && dests.includes(square)) {
      setSel(null);
      onMove!(selected, square);
      return;
    }
    const d = getMoves!(square);
    setSel(d.length ? { square, fen } : null);
  }

  const files = orientation === "white" ? FILES : [...FILES].reverse();
  const ranks = orientation === "white" ? RANKS : [...RANKS].reverse();

  return (
    <div data-board className={`board-frame mx-auto w-full touch-none select-none ${SIZE[size]}`}>
      <div className={showCoords ? "board-grid" : undefined}>
        {showCoords && (
          <div className="board-ranks" aria-hidden>
            {ranks.map((r) => (
              <span key={r}>{r}</span>
            ))}
          </div>
        )}
        <div className="board-inner">
          <Chessboard
            options={{
              position: fen,
              boardOrientation: orientation,
              allowDragging: draggable && canMove,
              showAnimations: true,
              animationDurationInMs: 180,
              showNotation: false,
              squareStyles,
              arrows: (arrows ?? []).map((a) => ({ startSquare: a.from, endSquare: a.to, color: a.color ?? "#2c6ecb" })),
              darkSquareStyle: { backgroundColor: "var(--board-dark)" },
              lightSquareStyle: { backgroundColor: "var(--board-light)" },
              onSquareClick: ({ square }) => tap(square),
              canDragPiece: ({ square }) => Boolean(square && getMoves?.(square).length),
              onPieceDrop: ({ sourceSquare, targetSquare }) => {
                if (!canMove || !targetSquare || !getMoves!(sourceSquare).includes(targetSquare)) return false;
                setSel(null);
                onMove!(sourceSquare, targetSquare);
                return true;
              },
            }}
          />
        </div>
        {showCoords && (
          <div className="board-files" aria-hidden>
            {files.map((f) => (
              <span key={f}>{f}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"];
