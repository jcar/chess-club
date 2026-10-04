// Printable building blocks shared by the lesson worksheet and the session
// pack: a letter page, a practice/check sheet, and a table game card.

import type { Exercise, Lesson } from "@/content/types";
import { ExercisePrint } from "@/components/exercise/ExercisePrint";

export function PageBox({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`print-page mx-auto w-full bg-white p-[0.4in] text-black shadow print:p-0 print:shadow-none ${className}`}>{children}</section>;
}

export function Sheet({
  lesson,
  stepTitle,
  title,
  heading,
  items,
  young,
  answerKey,
  footer,
  start = 0,
  name,
  date,
}: {
  lesson: Lesson;
  stepTitle: string;
  title: string;
  heading: string;
  items: Exercise[];
  young: boolean;
  answerKey: boolean;
  footer?: React.ReactNode;
  start?: number;
  /** Pre-filled kid name (session pack). */
  name?: string;
  date?: string;
}) {
  return (
    <PageBox>
      <header className="mb-3 flex items-end justify-between gap-4 border-b-2 border-black pb-2">
        <div>
          <p className="text-[11px] tracking-wide uppercase">
            Chess Club · Step {lesson.step}: {stepTitle}
          </p>
          <h1 className="text-2xl font-bold text-black">{title}</h1>
          <p className="text-sm font-semibold">{heading}</p>
        </div>
        {!answerKey && (
          <div className="text-right text-sm whitespace-nowrap">
            <p>Name: {name ? <b className="text-lg">{name}</b> : "____________________"}</p>
            <p>Date: {date ?? "__________"}</p>
          </div>
        )}
      </header>
      <div className="grid grid-cols-2 gap-3">
        {items.map((ex, i) => (
          <ExercisePrint key={ex.id} ex={ex} n={start + i + 1} young={young} answerKey={answerKey} />
        ))}
      </div>
      {footer && <footer className="mt-4 border-t border-black pt-2 text-sm">{footer}</footer>}
    </PageBox>
  );
}

export function GameCard({ lesson }: { lesson: Lesson }) {
  const a = lesson.activity;
  return (
    <PageBox>
      <p className="text-[11px] tracking-wide uppercase">Game card · put one on each table</p>
      <h1 className="mt-1 text-4xl font-bold text-black">{a.kidTitle ?? a.title}</h1>
      <p className="mt-4 text-xl">
        <b>Set up:</b> {a.setup}
      </p>
      <ol className="mt-4 list-decimal space-y-2 pl-8 text-xl">
        {a.rules.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ol>
    </PageBox>
  );
}
