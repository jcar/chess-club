"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getStep } from "@/content/curriculum";
import { useClub } from "@/lib/club/store";

export function Certificate() {
  const params = useSearchParams();
  const club = useClub();
  const kid = club.kids.find((k) => k.id === params.get("kid"));
  const step = getStep(Number(params.get("step")));
  if (!kid || !step) return <p className="p-8">Certificate not found. Open it from the roster.</p>;
  const dates = step.lessons.map((l) => club.passes[kid.id]?.[l.id]?.date).filter(Boolean) as string[];
  const date = dates.sort().at(-1) ?? "";

  return (
    <div className="min-h-dvh bg-neutral-200 print:bg-white">
      <div className="no-print flex gap-3 bg-paper px-4 py-3 shadow">
        <Link href={`/teach/roster/?kid=${kid.id}`} className="rounded-xl px-3 py-2 ring-1 ring-line">
          ← {kid.name}
        </Link>
        <button type="button" onClick={() => window.print()} className="ml-auto rounded-xl bg-primary px-5 py-2 font-semibold text-primary-ink">
          🖨 Print
        </button>
      </div>
      <style>{"@media print { @page { size: letter landscape; margin: 0.4in; } }"}</style>
      <section className="mx-auto my-6 flex aspect-[11/8.5] max-w-[10in] flex-col items-center justify-center gap-4 bg-white p-10 text-center shadow print:my-0 print:shadow-none" style={{ border: `14px solid var(--step-${step.n})` }}>
        <p className="text-6xl" aria-hidden>
          ♞
        </p>
        <p className="text-xl tracking-[0.3em] uppercase">Certificate of Achievement</p>
        <p className="text-lg">This certifies that</p>
        <p className="font-display text-6xl font-bold">{kid.name}</p>
        <p className="text-lg">has completed</p>
        <p className="font-display text-4xl font-bold" style={{ color: `var(--step-${step.n})` }}>
          Step {step.n}: {step.title}
        </p>
        <p className="max-w-xl text-ink-soft">{step.summary}</p>
        <div className="mt-6 flex w-full max-w-2xl justify-between text-sm">
          <span className="border-t border-black px-8 pt-1">{club.name}</span>
          <span className="border-t border-black px-8 pt-1">{date}</span>
          <span className="border-t border-black px-8 pt-1">Coach</span>
        </div>
      </section>
    </div>
  );
}
