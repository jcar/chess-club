// The worksheet renderer for one exercise: diagram, instruction, and a place to
// answer. With `answerKey`, it shows the solution instead, drawn from the same
// answer logic the iPad uses, so paper and screen can never disagree.

import type { Exercise, Words } from "@/content/types";
import { PrintBoard } from "@/components/board/PrintBoard";
import { answerFor, answerLabel } from "@/lib/exercise/answers";

interface Props {
  ex: Exercise;
  n: number;
  young: boolean;
  answerKey?: boolean;
}

function w(words: Words, young: boolean) {
  return young ? (words.kid ?? words.text) : words.text;
}

/** Paper needs different verbs than a touch screen ("tap" → "draw a dot on"). */
export function printPrompt(ex: Exercise, young: boolean): string {
  switch (ex.kind) {
    case "reach":
      return young ? "Draw a dot on every square this piece can go to." : "Draw a dot on every square the highlighted piece can move to.";
    case "stars":
      return young ? "Draw the path to the ★. How many moves?" : "Draw the fastest path to the ★ (moving only this piece). How many moves?";
    case "move":
      return w(ex.prompt, young).replace(/^Tap/, "Circle").concat(young ? " Draw an arrow." : " Draw an arrow or write the move.");
    case "tap":
      return w(ex.prompt, young).replace(/^Tap/, "Circle");
    case "choice":
      return w(ex.prompt, young);
  }
}

export function ExercisePrint({ ex, n, young, answerKey = false }: Props) {
  const a = answerFor(ex);
  const fen = ex.fen;
  const stars = ex.kind === "stars" ? ex.stars : young ? ex.kidMarks : undefined;
  const rings = ex.kind === "reach" || ex.kind === "stars" ? [ex.square] : answerKey && ex.kind === "tap" ? ex.answers : [];
  const dots = answerKey && ex.kind === "reach" && a.kind === "squares" ? a.squares : [];
  const arrows = answerKey && a.kind === "moves" ? a.moves.map((m) => ({ from: m.slice(0, 2), to: m.slice(2, 4) })) : [];

  return (
    <div className="avoid-break flex flex-col gap-2 rounded-lg border border-neutral-300 p-3" data-testid="print-exercise">
      <p className="text-[13px] leading-snug">
        <b className="mr-1">{n}.</b>
        {printPrompt(ex, young)}
      </p>
      {fen && (
        <div className="flex justify-center">
          <PrintBoard fen={fen} orientation={ex.orientation} stars={stars} rings={rings} dots={dots} arrows={arrows} width={young ? "2.9in" : "2.5in"} />
        </div>
      )}
      {ex.kind === "choice" && (
        <ul className="grid gap-1 text-[13px]">
          {ex.options.map((o, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className={`inline-grid h-4 w-4 place-items-center rounded-full border border-black text-[10px] ${answerKey && i === ex.answer ? "bg-black text-white" : ""}`}>
                {answerKey && i === ex.answer ? "✓" : ""}
              </span>
              {o.pic && <span className={young ? "text-2xl" : "text-base"}>{o.pic}</span>}
              {w(o, young)}
            </li>
          ))}
        </ul>
      )}
      {ex.kind === "stars" && <p className="text-[13px]">Moves: {answerKey ? <b>{answerLabel(ex)}</b> : "______"}</p>}
      {ex.kind === "move" && !young && <p className="text-[13px]">Move: {answerKey ? <b>{answerLabel(ex)}</b> : "__________"}</p>}
      {answerKey && ex.kind === "reach" && <p className="text-[13px]">Answer: <b>{answerLabel(ex)}</b></p>}
      {answerKey && ex.kind === "tap" && <p className="text-[13px]">Answer: <b>{answerLabel(ex)}</b></p>}
    </div>
  );
}
