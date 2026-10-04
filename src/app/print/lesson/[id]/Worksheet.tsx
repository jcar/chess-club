"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getLesson, getStep } from "@/content/curriculum";
import { GameCard, Sheet } from "@/components/print/Sheets";
import { passCodeFor } from "@/lib/passcode";
import { PUZZLE_CREDIT, puzzleExercises } from "@/content/puzzles";

export function Worksheet({ id }: { id: string }) {
  const lesson = getLesson(id)!;
  const step = getStep(lesson.step)!;
  const params = useSearchParams();
  const router = useRouter();
  const answerKey = params.get("key") === "1";
  const young = params.get("young") === "1";
  // The table game card: on by default with the answer key, or on its own.
  const games = params.get("game") === "1" || (answerKey && params.get("game") !== "0");
  const title = young ? (lesson.kidTitle ?? lesson.title) : lesson.title;
  const extraAll = lesson.extra ? puzzleExercises(lesson.extra) : [];
  const sets = Math.floor(extraAll.length / PER_SET);
  const set = Math.min(sets, Math.max(1, Number(params.get("set")) || 1));
  const extra = params.get("extra") === "1" ? extraAll.slice((set - 1) * PER_SET, set * PER_SET) : [];

  const setParam = (k: string, on: boolean, value = "1") => {
    const q = new URLSearchParams(params.toString());
    if (on) q.set(k, value);
    else q.delete(k);
    const s = q.toString();
    router.replace(s ? `?${s}` : "?");
  };

  return (
    <div className="bg-neutral-200 print:bg-white">
      <div className="no-print sticky top-0 z-10 flex flex-wrap items-center gap-3 bg-paper px-4 py-3 shadow">
        <Link href={`/teach/lesson/${lesson.id}/`} className="rounded-xl px-3 py-2 ring-1 ring-line">
          ← Lesson
        </Link>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={answerKey} onChange={(e) => setParam("key", e.target.checked)} /> Answer key
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={games} onChange={(e) => setParam("game", true, e.target.checked ? "1" : "0")} /> Game card
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={young} onChange={(e) => setParam("young", e.target.checked)} /> Easy reading (short sentences, bigger boards)
        </label>
        {sets > 0 && (
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={extra.length > 0} onChange={(e) => setParam("extra", e.target.checked)} data-testid="extra-toggle" /> Extra puzzles
            {extra.length > 0 && (
              <select value={set} onChange={(e) => setParam("set", true, e.target.value)} className="rounded px-1 ring-1 ring-line" aria-label="Puzzle set">
                {Array.from({ length: sets }, (_, i) => (
                  <option key={i} value={i + 1}>
                    Set {i + 1}
                  </option>
                ))}
              </select>
            )}
          </label>
        )}
        <button type="button" onClick={() => window.print()} className="ml-auto rounded-xl bg-primary px-5 py-2 font-semibold text-primary-ink" data-testid="print">
          🖨 Print
        </button>
      </div>

      <div className="mx-auto flex max-w-[8.5in] flex-col gap-6 py-6 print:gap-0 print:py-0">
        <Sheet lesson={lesson} stepTitle={step.title} title={title} heading={answerKey ? "Practice (answer key)" : "Practice"} items={lesson.practice} young={young} answerKey={answerKey} />
        <Sheet
          lesson={lesson}
          stepTitle={step.title}
          title={title}
          heading={answerKey ? "Pass check (answer key)" : `Pass check: get ${lesson.passMark} of ${lesson.check.length} right`}
          items={lesson.check}
          young={young}
          answerKey={answerKey}
          footer={
            answerKey ? (
              <p>
                Passing score: <b>{lesson.passMark} of {lesson.check.length}</b>. Record it in the roster, or type the pass code <b className="font-mono">{passCodeFor(lesson)}</b>.
              </p>
            ) : (
              <p>
                For the teacher: ___ of {lesson.check.length} right. &nbsp;☐ Passed
              </p>
            )
          }
        />
        {[0, 1].map((half) =>
          extra.length > half * 4 ? (
            <Sheet
              key={half}
              lesson={lesson}
              stepTitle={step.title}
              title={title}
              heading={`Extra puzzles · set ${set}${half ? " (continued)" : ""}${answerKey ? " (answer key)" : ""}`}
              items={extra.slice(half * 4, half * 4 + 4)}
              start={half * 4}
              young={young}
              answerKey={answerKey}
              footer={<p className="text-xs">{PUZZLE_CREDIT}</p>}
            />
          ) : null,
        )}
        {games && <GameCard lesson={lesson} />}
      </div>
    </div>
  );
}

const PER_SET = 8;
