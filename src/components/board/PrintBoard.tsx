// A static board diagram for worksheets. Plain HTML/SVG (no canvas, no
// interactivity) so it prints crisply on any printer. Dark squares are a light
// grey rather than green to save ink and stay readable in black and white.

import { defaultPieces } from "react-chessboard";
import type { Orientation, Square } from "@/content/types";

interface Props {
  fen: string;
  orientation?: Orientation;
  stars?: Square[];
  /** Answer-key dots. */
  dots?: Square[];
  /** Answer-key ring (e.g. the square to tap). */
  rings?: Square[];
  arrows?: { from: Square; to: Square }[];
  showCoords?: boolean;
  /** Width in CSS units, e.g. "2.6in". */
  width?: string;
}

const FILES = "abcdefgh";

function parse(fen: string): Map<Square, string> {
  const out = new Map<Square, string>();
  fen
    .split(" ")[0]
    .split("/")
    .forEach((row, r) => {
      let f = 0;
      for (const ch of row) {
        if (/\d/.test(ch)) f += Number(ch);
        else out.set(FILES[f++] + (8 - r), ch);
      }
    });
  return out;
}

function pieceKey(ch: string): string {
  return (ch === ch.toUpperCase() ? "w" : "b") + ch.toUpperCase();
}

export function PrintBoard({ fen, orientation = "white", stars = [], dots = [], rings = [], arrows = [], showCoords = true, width = "2.6in" }: Props) {
  const pieces = parse(fen);
  const files = orientation === "white" ? [...FILES] : [...FILES].reverse();
  const ranks = orientation === "white" ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8];
  // Centre of a square in a 0..8 coordinate space, for arrows.
  const centre = (sq: Square) => ({ x: files.indexOf(sq[0]) + 0.5, y: ranks.indexOf(Number(sq[1])) + 0.5 });

  return (
    <div className="inline-block" style={{ width }}>
      <div className="relative grid aspect-square grid-cols-8 grid-rows-8 border-2 border-black">
        {ranks.map((rank) =>
          files.map((file) => {
            const sq = file + rank;
            const dark = (FILES.indexOf(file) + rank) % 2 === 1; // a1 is dark
            const p = pieces.get(sq);
            const Piece = p ? defaultPieces[pieceKey(p)] : null;
            return (
              <div key={sq} className="relative aspect-square min-h-0 overflow-hidden [&>svg]:absolute [&>svg]:inset-0 [&>svg]:h-full [&>svg]:w-full" style={{ background: dark ? "#c9c9c9" : "#ffffff" }}>
                {Piece && <Piece />}
                {stars.includes(sq) && <span className="absolute inset-0 grid place-items-center text-[1.6em] leading-none">★</span>}
                {dots.includes(sq) && <span className="absolute left-1/2 top-1/2 h-[34%] w-[34%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black" />}
                {rings.includes(sq) && <span className="absolute inset-[8%] rounded-full border-[3px] border-black" />}
              </div>
            );
          }),
        )}
        {arrows.length > 0 && (
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 8 8">
            <defs>
              <marker id="ah" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto">
                <path d="M0 0L10 5L0 10z" fill="black" />
              </marker>
            </defs>
            {arrows.map((a, i) => {
              const s = centre(a.from);
              const e = centre(a.to);
              return <line key={i} x1={s.x} y1={s.y} x2={e.x} y2={e.y} stroke="black" strokeWidth={0.14} markerEnd="url(#ah)" opacity={0.8} />;
            })}
          </svg>
        )}
      </div>
      {showCoords && (
        <div className="grid grid-cols-8 text-center text-[9px] font-semibold text-neutral-600">
          {files.map((f) => (
            <span key={f}>{f}</span>
          ))}
        </div>
      )}
    </div>
  );
}
