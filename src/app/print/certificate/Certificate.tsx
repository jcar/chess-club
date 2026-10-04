"use client";

// Step certificates: one kid (?kid=&step=) or everyone who has finished the
// step (?step=), one per landscape page. Picture-first for kids who can't read yet.

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getStep } from "@/content/curriculum";
import { useClub } from "@/lib/club/store";
import { hasPassed, type Club, type Kid } from "@/lib/club/model";
import type { Step } from "@/content/types";

export function Certificate() {
  const params = useSearchParams();
  const club = useClub();
  const step = getStep(Number(params.get("step")));
  const kidId = params.get("kid");
  if (!step) return <p className="p-8">Certificate not found. Open it from the roster.</p>;
  const done = (k: Kid) => step.lessons.every((l) => hasPassed(club, k, l.id, step.n));
  const kids = kidId ? club.kids.filter((k) => k.id === kidId) : club.kids.filter((k) => !k.archived && done(k));
  const back = kidId ? `/teach/roster/?kid=${kidId}` : "/teach/roster/";

  return (
    <div className="min-h-dvh bg-neutral-200 print:bg-white">
      <div className="no-print flex items-center gap-3 bg-paper px-4 py-3 shadow">
        <Link href={back} className="rounded-xl px-3 py-2 ring-1 ring-line">
          ← Roster
        </Link>
        {!kidId && (
          <span>
            {kids.length} kid{kids.length === 1 ? "" : "s"} finished Step {step.n}
          </span>
        )}
        <button type="button" onClick={() => window.print()} className="ml-auto rounded-xl bg-primary px-5 py-2 font-semibold text-primary-ink">
          🖨 Print
        </button>
      </div>
      <style>{"@media print { @page { size: letter landscape; margin: 0.4in; } }"}</style>
      {kids.length === 0 && <p className="p-8">Nobody has finished Step {step.n} yet.</p>}
      {kids.map((kid) => (
        <One key={kid.id} kid={kid} step={step} club={club} />
      ))}
    </div>
  );
}

function One({ kid, step, club }: { kid: Kid; step: Step; club: Club }) {
  const dates = step.lessons.map((l) => club.passes[kid.id]?.[l.id]?.date).filter(Boolean) as string[];
  const date = dates.sort().at(-1) ?? "";
  return (
    <section
      className="print-page mx-auto my-6 flex aspect-[11/8.5] max-w-[10in] flex-col items-center justify-center gap-3 bg-white p-10 text-center shadow print:my-0 print:shadow-none"
      style={{ border: `14px solid var(--step-${step.n})` }}
      data-testid="certificate"
    >
      <p className="text-7xl" aria-hidden>
        {kid.animal ?? "♞"} ♞
      </p>
      <p className="text-xl tracking-[0.3em] uppercase">Certificate of Achievement</p>
      <p className="font-display text-6xl font-bold">{kid.name}</p>
      <p className="text-lg">finished</p>
      <p className="font-display text-4xl font-bold" style={{ color: `var(--step-${step.n})` }}>
        Step {step.n}: {step.kidTitle}
      </p>
      <p className="text-5xl" aria-hidden>
        {"⭐".repeat(Math.min(step.lessons.length, 8))}
      </p>
      <p className="max-w-xl text-neutral-600">{step.summary}</p>
      <div className="mt-4 flex w-full max-w-2xl justify-between text-sm">
        <span className="border-t border-black px-8 pt-1">{club.name}</span>
        <span className="border-t border-black px-8 pt-1">{date}</span>
        <span className="border-t border-black px-8 pt-1">Coach</span>
      </div>
    </section>
  );
}
